from __future__ import annotations

import hashlib
import hmac
import json
import os
import secrets
from pathlib import Path

import cv2
import numpy as np
from PIL import Image, ImageDraw, ImageFont
from dotenv import load_dotenv

load_dotenv()

MAGIC = b"VS11"
NONCE_SIZE = 8
SIGNATURE_SIZE = 16

DCT_DELTA = 25.0

COEFF_A = (2, 3)
COEFF_B = (3, 2)


def _get_secret() -> bytes:
    secret = os.getenv("VERISELF_WATERMARK_SECRET")

    # Keep the public demo functional when the free Render service has not
    # been given a secret yet. Set VERISELF_WATERMARK_SECRET in production.
    if not secret:
        secret = "veriself-demo-secret-change-in-production"

    return secret.encode("utf-8")


def _sha256_file(
    file_path: str,
) -> str:
    digest = hashlib.sha256()

    with open(file_path, "rb") as file:
        while True:
            chunk = file.read(1024 * 1024)

            if not chunk:
                break

            digest.update(chunk)

    return digest.hexdigest()


def _build_token(
    identity_id: int,
) -> bytes:

    nonce = secrets.token_bytes(
        NONCE_SIZE
    )

    identity_bytes = identity_id.to_bytes(
        4,
        byteorder="big",
        signed=False,
    )

    unsigned = (
        MAGIC
        + identity_bytes
        + nonce
    )

    signature = hmac.new(
        _get_secret(),
        unsigned,
        hashlib.sha256,
    ).digest()[:SIGNATURE_SIZE]

    return unsigned + signature


def _bits_from_bytes(
    value: bytes,
) -> list[int]:

    bits = []

    for byte in value:
        for shift in range(7, -1, -1):
            bits.append(
                (byte >> shift) & 1
            )

    return bits


def _bytes_from_bits(
    bits: list[int],
) -> bytes:

    if len(bits) % 8 != 0:
        raise ValueError(
            "Invalid watermark bit length."
        )

    output = bytearray()

    for index in range(
        0,
        len(bits),
        8,
    ):
        byte_value = 0

        for bit in bits[index:index + 8]:
            byte_value = (
                byte_value << 1
            ) | bit

        output.append(byte_value)

    return bytes(output)


def _modify_dct_bit(
    block: np.ndarray,
    bit: int,
) -> np.ndarray:

    block_float = (
        block.astype(np.float32)
        - 128.0
    )

    dct = cv2.dct(
        block_float
    )

    a = float(
        dct[COEFF_A]
    )

    b = float(
        dct[COEFF_B]
    )

    if bit == 1:
        if a <= b + DCT_DELTA:
            midpoint = (
                a + b
            ) / 2.0

            dct[COEFF_A] = (
                midpoint
                + DCT_DELTA / 2.0
            )

            dct[COEFF_B] = (
                midpoint
                - DCT_DELTA / 2.0
            )

    else:
        if b <= a + DCT_DELTA:
            midpoint = (
                a + b
            ) / 2.0

            dct[COEFF_B] = (
                midpoint
                + DCT_DELTA / 2.0
            )

            dct[COEFF_A] = (
                midpoint
                - DCT_DELTA / 2.0
            )

    restored = cv2.idct(
        dct
    ) + 128.0

    return np.clip(
        restored,
        0,
        255,
    )


def _read_dct_bit(
    block: np.ndarray,
) -> int:

    block_float = (
        block.astype(np.float32)
        - 128.0
    )

    dct = cv2.dct(
        block_float
    )

    return int(
        dct[COEFF_A]
        > dct[COEFF_B]
    )


def embed_invisible_signature(
    input_path: str,
    output_path: str,
    identity_id: int,
) -> tuple[str, str]:

    image = cv2.imread(
        input_path,
        cv2.IMREAD_COLOR,
    )

    if image is None:
        raise ValueError(
            "Unable to read input image."
        )

    height, width = image.shape[:2]

    token = _build_token(
        identity_id
    )

    bits = _bits_from_bytes(
        token
    )

    blocks_y = height // 8
    blocks_x = width // 8

    capacity = (
        blocks_y * blocks_x
    )

    if capacity < len(bits):
        raise ValueError(
            "Image is too small for the invisible signature. "
            "Use an image at least approximately 120x120 pixels."
        )

    output = image.copy()

    bit_index = 0

    for by in range(blocks_y):
        for bx in range(blocks_x):

            if bit_index >= len(bits):
                break

            y1 = by * 8
            x1 = bx * 8

            block = cv2.cvtColor(
                output[
                    y1:y1 + 8,
                    x1:x1 + 8
                ],
                cv2.COLOR_BGR2YCrCb,
            )[:, :, 0]

            modified = _modify_dct_bit(
                block,
                bits[bit_index],
            )

            ycrcb = cv2.cvtColor(
                output[
                    y1:y1 + 8,
                    x1:x1 + 8
                ],
                cv2.COLOR_BGR2YCrCb,
            )

            ycrcb[:, :, 0] = (
                np.clip(
                    modified,
                    0,
                    255,
                )
            ).astype(
                np.uint8
            )

            output[
                y1:y1 + 8,
                x1:x1 + 8
            ] = cv2.cvtColor(
                ycrcb,
                cv2.COLOR_YCrCb2BGR,
            )

            bit_index += 1

        if bit_index >= len(bits):
            break

    success = cv2.imwrite(
        output_path,
        output,
    )

    if not success:
        raise ValueError(
            "Unable to save protected image."
        )

    token_hex = token.hex()

    return (
        token_hex,
        _sha256_file(output_path),
    )


def verify_invisible_signature(
    file_path: str,
) -> dict:

    image = cv2.imread(
        file_path,
        cv2.IMREAD_COLOR,
    )

    if image is None:
        raise ValueError(
            "Unable to read image."
        )

    height, width = image.shape[:2]

    total_bytes = (
        len(MAGIC)
        + 4
        + NONCE_SIZE
        + SIGNATURE_SIZE
    )

    total_bits = total_bytes * 8

    blocks_y = height // 8
    blocks_x = width // 8

    if (
        blocks_y * blocks_x
        < total_bits
    ):
        return {
            "valid": False,
            "reason": "Image is too small for a VeriSelf signature.",
            "identity_id": None,
        }

    bits = []

    bit_index = 0

    for by in range(blocks_y):
        for bx in range(blocks_x):

            if bit_index >= total_bits:
                break

            y1 = by * 8
            x1 = bx * 8

            ycrcb = cv2.cvtColor(
                image[
                    y1:y1 + 8,
                    x1:x1 + 8
                ],
                cv2.COLOR_BGR2YCrCb,
            )

            block = ycrcb[:, :, 0]

            bits.append(
                _read_dct_bit(block)
            )

            bit_index += 1

        if bit_index >= total_bits:
            break

    try:
        token = _bytes_from_bits(
            bits
        )
    except ValueError:
        return {
            "valid": False,
            "reason": "Unable to decode signature.",
            "identity_id": None,
        }

    magic = token[:4]

    if magic != MAGIC:
        return {
            "valid": False,
            "reason": "No VeriSelf signature detected.",
            "identity_id": None,
        }

    identity_id = int.from_bytes(
        token[4:8],
        byteorder="big",
        signed=False,
    )

    unsigned = token[
        :4 + 4 + NONCE_SIZE
    ]

    stored_signature = token[
        4 + 4 + NONCE_SIZE:
    ]

    expected_signature = hmac.new(
        _get_secret(),
        unsigned,
        hashlib.sha256,
    ).digest()[:SIGNATURE_SIZE]

    valid = hmac.compare_digest(
        stored_signature,
        expected_signature,
    )

    return {
        "valid": valid,
        "reason": (
            "Valid VeriSelf signature."
            if valid
            else "Signature integrity check failed."
        ),
        "identity_id": (
            identity_id
            if valid
            else None
        ),
    }


def add_visible_watermark(
    input_path: str,
    output_path: str,
    text: str,
) -> None:

    image = Image.open(
        input_path
    ).convert("RGBA")

    overlay = Image.new(
        "RGBA",
        image.size,
        (0, 0, 0, 0),
    )

    draw = ImageDraw.Draw(
        overlay
    )

    try:
        font = ImageFont.truetype(
            "arial.ttf",
            max(
                16,
                image.width // 35,
            ),
        )
    except OSError:
        font = ImageFont.load_default()

    margin = max(
        12,
        image.width // 50,
    )

    bbox = draw.textbbox(
        (0, 0),
        text,
        font=font,
    )

    text_width = (
        bbox[2] - bbox[0]
    )

    text_height = (
        bbox[3] - bbox[1]
    )

    x = (
        image.width
        - text_width
        - margin
    )

    y = (
        image.height
        - text_height
        - margin
    )

    draw.rectangle(
        (
            x - 8,
            y - 6,
            x + text_width + 8,
            y + text_height + 6,
        ),
        fill=(0, 0, 0, 110),
    )

    draw.text(
        (x, y),
        text,
        font=font,
        fill=(255, 255, 255, 190),
    )

    protected = Image.alpha_composite(
        image,
        overlay,
    )

    protected.convert(
        "RGB"
    ).save(
        output_path
    )


def build_provenance_metadata(
    *,
    identity_id: int,
    original_sha256: str,
    protected_sha256: str,
    signature_token: str,
    visible_watermark: bool,
) -> dict:

    return {
        "schema": "VeriSelf-Provenance-v0.1",
        "c2pa_ready": True,
        "application": "VeriSelf",
        "identity_id": identity_id,
        "protection_type": (
            "DCT_INVISIBLE_SIGNATURE"
        ),
        "visible_watermark": (
            visible_watermark
        ),
        "original_sha256": original_sha256,
        "protected_sha256": protected_sha256,
        "signature_token": signature_token,
        "statement": (
            "This metadata describes a VeriSelf "
            "media-protection operation. It is not "
            "a claim of official C2PA signing."
        ),
    }
