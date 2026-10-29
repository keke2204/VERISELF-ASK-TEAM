from __future__ import annotations

import hashlib
import ipaddress
import socket
from dataclasses import dataclass
from urllib.parse import (
    urljoin,
    urlparse,
)
from urllib.robotparser import RobotFileParser

import httpx
from selectolax.parser import HTMLParser


USER_AGENT = (
    "VeriSelfPublicMonitor/0.1 "
    "(lawful public-web monitoring)"
)

REQUEST_TIMEOUT = 15.0

MAX_HTML_SIZE = 2 * 1024 * 1024

IMAGE_EXTENSIONS = {
    ".jpg",
    ".jpeg",
    ".png",
    ".webp",
    ".gif",
    ".avif",
}


@dataclass
class ImageCandidate:
    page_url: str
    image_url: str
    page_title: str | None
    content_hash: str


def _is_http_url(url: str) -> bool:
    parsed = urlparse(url)

    return parsed.scheme.lower() in {
        "http",
        "https",
    }


def _hostname_is_private(hostname: str) -> bool:
    if not hostname:
        return True

    hostname = hostname.lower().strip()

    blocked_names = {
        "localhost",
        "localhost.localdomain",
        "127.0.0.1",
        "::1",
    }

    if hostname in blocked_names:
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


def validate_target_url(url: str) -> str:
    url = url.strip()

    if not _is_http_url(url):
        raise ValueError(
            "Only HTTP and HTTPS URLs are supported."
        )

    parsed = urlparse(url)

    if _hostname_is_private(
        parsed.hostname or ""
    ):
        raise ValueError(
            "Private or local network targets are not allowed."
        )

    return url


def _robots_url(url: str) -> str:
    parsed = urlparse(url)

    return (
        f"{parsed.scheme}://"
        f"{parsed.netloc}/robots.txt"
    )


def is_allowed_by_robots(
    url: str,
) -> bool:

    robots_url = _robots_url(url)

    parser = RobotFileParser()

    parser.set_url(
        robots_url
    )

    try:
        parser.read()

        return parser.can_fetch(
            USER_AGENT,
            url,
        )

    except Exception:
        # If robots.txt cannot be retrieved,
        # the caller treats this conservatively.
        return False


def _normalize_image_url(
    page_url: str,
    image_url: str,
) -> str | None:

    image_url = (
        image_url
        .strip()
        .strip("\"'")
    )

    if not image_url:
        return None

    if image_url.startswith(
        "data:"
    ):
        return None

    absolute_url = urljoin(
        page_url,
        image_url,
    )

    if not _is_http_url(
        absolute_url
    ):
        return None

    parsed = urlparse(
        absolute_url
    )

    if _hostname_is_private(
        parsed.hostname or ""
    ):
        return None

    return absolute_url


def _looks_like_image_url(
    url: str,
) -> bool:

    path = urlparse(
        url
    ).path.lower()

    return any(
        path.endswith(extension)
        for extension in IMAGE_EXTENSIONS
    )


def _extract_css_urls(
    document: HTMLParser,
) -> list[str]:

    candidates = []

    for node in document.css(
        "[style]"
    ):

        style = node.attributes.get(
            "style",
            "",
        )

        lowered = style.lower()

        marker = "url("

        start = 0

        while True:

            position = lowered.find(
                marker,
                start,
            )

            if position == -1:
                break

            value_start = (
                position
                + len(marker)
            )

            value_end = style.find(
                ")",
                value_start,
            )

            if value_end == -1:
                break

            value = style[
                value_start:value_end
            ].strip()

            value = value.strip(
                "\"'"
            )

            if value:
                candidates.append(
                    value
                )

            start = value_end + 1

    return candidates


def _extract_image_urls(
    page_url: str,
    html: str,
) -> list[str]:

    document = HTMLParser(
        html
    )

    raw_urls = []

    for node in document.css(
        "img"
    ):

        for attribute in (
            "src",
            "data-src",
            "data-lazy-src",
        ):

            value = node.attributes.get(
                attribute
            )

            if value:
                raw_urls.append(
                    value
                )

        srcset = node.attributes.get(
            "srcset"
        )

        if srcset:

            for item in srcset.split(
                ","
            ):

                parts = item.strip().split()

                if parts:
                    raw_urls.append(
                        parts[0]
                    )

    raw_urls.extend(
        _extract_css_urls(
            document
        )
    )

    normalized = []

    for raw_url in raw_urls:

        normalized_url = (
            _normalize_image_url(
                page_url,
                raw_url,
            )
        )

        if normalized_url:
            normalized.append(
                normalized_url
            )

    # Remove duplicates while preserving order.
    return list(
        dict.fromkeys(
            normalized
        )
    )


def _calculate_url_hash(
    url: str,
) -> str:

    return hashlib.sha256(
        url.encode(
            "utf-8"
        )
    ).hexdigest()


def crawl_public_page(
    target_url: str,
) -> dict:

    target_url = validate_target_url(
        target_url
    )

    if not is_allowed_by_robots(
        target_url
    ):
        return {
            "success": False,
            "reason": (
                "Crawling is disallowed "
                "by robots.txt."
            ),
            "page_url": target_url,
            "title": None,
            "candidates": [],
        }

    headers = {
        "User-Agent": USER_AGENT,
        "Accept": (
            "text/html,"
            "application/xhtml+xml"
        ),
    }

    with httpx.Client(
        headers=headers,
        timeout=REQUEST_TIMEOUT,
        follow_redirects=True,
    ) as client:

        response = client.get(
            target_url
        )

        response.raise_for_status()

        content_type = (
            response.headers
            .get("content-type", "")
            .lower()
        )

        if (
            "text/html"
            not in content_type
        ):
            return {
                "success": False,
                "reason": (
                    "Target did not return "
                    "an HTML document."
                ),
                "page_url": target_url,
                "title": None,
                "candidates": [],
            }

        content_length = len(
            response.content
        )

        if (
            content_length
            > MAX_HTML_SIZE
        ):
            raise ValueError(
                "HTML document exceeds "
                "the configured size limit."
            )

        final_url = str(
            response.url
        )

        html = response.text

    document = HTMLParser(
        html
    )

    title_node = document.css_first(
        "title"
    )

    page_title = (
        title_node.text(strip=True)
        if title_node
        else None
    )

    image_urls = _extract_image_urls(
        final_url,
        html,
    )

    candidates = []

    for image_url in image_urls:

        candidates.append(
            ImageCandidate(
                page_url=final_url,
                image_url=image_url,
                page_title=page_title,
                content_hash=(
                    _calculate_url_hash(
                        image_url
                    )
                ),
            )
        )

    return {
        "success": True,
        "reason": None,
        "page_url": final_url,
        "title": page_title,
        "candidates": candidates,
    }