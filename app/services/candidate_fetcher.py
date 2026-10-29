from __future__ import annotations

import ipaddress
import socket
from pathlib import Path
from urllib.parse import urlparse
from uuid import uuid4

import httpx


USER_AGENT = (
    "VeriSelfSimilarityMonitor/0.1 "
    "(lawful public-media analysis)"
)

MAX_IMAGE_SIZE = 10 * 1024 * 1024

ALLOWED_CONTENT_TYPES = {
    "image/jpeg",
    "image/png",
    "image/webp",
}


def _hostname_is_private(
    hostname: str,
) -> bool:

    if not hostname:
        return True

    hostname = hostname.lower().strip()

    if hostname in {
        "localhost",
        "localhost.localdomain",
        "127.0.0.1",
        "::1",
    }:
        return True

    try:

        addresses = socket.getaddrinfo(
            hostname,
            None,
        )

        for address in addresses:

            ip_text = address[4][0]

            try:
                ip = ipaddress.ip_address(
                    ip_text
                )

                if (
                    ip.is_private
                    or ip.is_loopback
                    or ip.is_link_local
                    or ip.is_reserved
                    or ip.is_multicast
                ):
                    return True

            except ValueError:
                continue

    except socket.gaierror:
        return False

    return False


def validate_candidate_url(
    url: str,
) -> str:

    parsed = urlparse(
        url.strip()
    )

    if parsed.scheme.lower() not in {
        "http",
        "https",
    }:
        raise ValueError(
            "Candidate URL must use HTTP or HTTPS."
        )

    if not parsed.hostname:
        raise ValueError(
            "Candidate URL has no hostname."
        )

    if _hostname_is_private(
        parsed.hostname
    ):
        raise ValueError(
            "Private or local candidate targets are not allowed."
        )

    return url.strip()


def download_candidate_image(
    url: str,
) -> tuple[bytes, str]:

    url = validate_candidate_url(
        url
    )

    headers = {
        "User-Agent": USER_AGENT,
        "Accept": (
            "image/jpeg,image/png,image/webp"
        ),
    }

    # Redirects are deliberately disabled.
    with httpx.Client(
        headers=headers,
        timeout=15.0,
        follow_redirects=False,
    ) as client:

        response = client.get(
            url
        )

        if response.is_redirect:
            raise ValueError(
                "Redirected image URLs are not accepted."
            )

        response.raise_for_status()

        content_type = (
            response.headers
            .get(
                "content-type",
                "",
            )
            .split(";")[0]
            .strip()
            .lower()
        )

        if (
            content_type
            not in ALLOWED_CONTENT_TYPES
        ):
            raise ValueError(
                "Remote resource is not a supported image."
            )

        content_length = response.headers.get(
            "content-length"
        )

        if content_length:

            try:

                if (
                    int(content_length)
                    > MAX_IMAGE_SIZE
                ):
                    raise ValueError(
                        "Remote image exceeds the 10 MB limit."
                    )

            except ValueError:
                pass

        data = response.content

        if len(data) > MAX_IMAGE_SIZE:
            raise ValueError(
                "Downloaded image exceeds the 10 MB limit."
            )

        return (
            data,
            content_type,
        )


def save_candidate_temporarily(
    data: bytes,
    content_type: str,
) -> Path:

    extension_map = {
        "image/jpeg": ".jpg",
        "image/png": ".png",
        "image/webp": ".webp",
    }

    extension = extension_map.get(
        content_type
    )

    if extension is None:
        raise ValueError(
            "Unsupported image content type."
        )

    directory = Path(
        "data/raw"
    )

    directory.mkdir(
        parents=True,
        exist_ok=True,
    )

    path = (
        directory
        / f"candidate_{uuid4().hex}{extension}"
    )

    path.write_bytes(data)

    return path