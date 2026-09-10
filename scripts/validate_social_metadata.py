#!/usr/bin/env python3
"""Validate Open Graph and Twitter metadata for sitemap-indexed PixelWeb pages."""
from __future__ import annotations

import html.parser
import xml.etree.ElementTree as ET
from collections import defaultdict
from pathlib import Path
from urllib.parse import urlsplit

ROOT = Path(__file__).resolve().parents[1]
SITEMAP_PATH = ROOT / "sitemap.xml"
SITE_BASE_URL = "https://xklezee.github.io/PixelWeb/"
SOCIAL_IMAGE_URL = f"{SITE_BASE_URL}LOGO%20OFICIAL.png"
SOCIAL_IMAGE_ALT = "Pixel Network logo"


class MetadataParser(html.parser.HTMLParser):
    def __init__(self) -> None:
        super().__init__(convert_charrefs=True)
        self.canonicals: list[tuple[str, int]] = []
        self.meta_names: dict[str, list[tuple[str, int]]] = defaultdict(list)
        self.meta_properties: dict[str, list[tuple[str, int]]] = defaultdict(list)
        self.titles: list[tuple[str, int]] = []
        self._title_line: int | None = None
        self._title_parts: list[str] = []

    def handle_starttag(self, tag: str, attrs) -> None:
        tag = tag.lower()
        line, _ = self.getpos()
        attrs_dict = {str(key).lower(): value for key, value in attrs if key}

        if tag == "link":
            rel = {token.lower() for token in str(attrs_dict.get("rel") or "").split()}
            href = str(attrs_dict.get("href") or "").strip()
            if "canonical" in rel:
                self.canonicals.append((href, line))
            return

        if tag == "meta":
            content = str(attrs_dict.get("content") or "").strip()
            name = str(attrs_dict.get("name") or "").strip().lower()
            prop = str(attrs_dict.get("property") or "").strip().lower()
            if name:
                self.meta_names[name].append((content, line))
            if prop:
                self.meta_properties[prop].append((content, line))
            return

        if tag == "title":
            self._title_line = line
            self._title_parts = []

    def handle_startendtag(self, tag: str, attrs) -> None:
        self.handle_starttag(tag, attrs)

    def handle_data(self, data: str) -> None:
        if self._title_line is not None:
            self._title_parts.append(data)

    def handle_endtag(self, tag: str) -> None:
        if tag.lower() == "title" and self._title_line is not None:
            title = "".join(self._title_parts).strip()
            self.titles.append((title, self._title_line))
            self._title_line = None
            self._title_parts = []


def sitemap_urls(failures: list[str]) -> list[str]:
    if not SITEMAP_PATH.is_file() or SITEMAP_PATH.is_symlink():
        failures.append("sitemap.xml must exist as a regular file")
        return []

    try:
        root = ET.parse(SITEMAP_PATH).getroot()
    except ET.ParseError as exc:
        failures.append(f"sitemap.xml: invalid XML ({exc})")
        return []

    urls = [
        str(element.text or "").strip()
        for element in root.iter()
        if element.tag.rsplit("}", 1)[-1] == "loc" and str(element.text or "").strip()
    ]
    if len(urls) != len(set(urls)):
        failures.append("sitemap.xml: duplicate <loc> URLs are not allowed")
    return urls


def filename_for_public_url(public_url: str, failures: list[str]) -> str | None:
    if public_url == SITE_BASE_URL:
        return "index.html"
    if not public_url.startswith(SITE_BASE_URL):
        failures.append(f"sitemap.xml: URL is outside the canonical site base ({public_url})")
        return None

    suffix = public_url[len(SITE_BASE_URL):]
    parts = urlsplit(suffix)
    if parts.scheme or parts.netloc or parts.query or parts.fragment:
        failures.append(f"sitemap.xml: indexed URL must be a plain page URL ({public_url})")
        return None

    path = parts.path.strip("/")
    if not path or "/" in path or not path.endswith(".html"):
        failures.append(f"sitemap.xml: indexed URL must map to a top-level HTML page ({public_url})")
        return None
    return path


def single_value(
    page_name: str,
    label: str,
    records: list[tuple[str, int]],
    failures: list[str],
) -> str | None:
    if len(records) != 1:
        failures.append(f"{page_name}: expected exactly one {label}, found {len(records)}")
        return None
    value, line = records[0]
    if not value:
        failures.append(f"{page_name}:{line}: {label} must not be empty")
        return None
    return value


def require_exact(
    page_name: str,
    label: str,
    records: list[tuple[str, int]],
    expected: str,
    failures: list[str],
) -> str | None:
    value = single_value(page_name, label, records, failures)
    if value is not None and value != expected:
        failures.append(f"{page_name}: {label} must be {expected!r} (found {value!r})")
    return value


def validate_page(page_name: str, public_url: str, failures: list[str]) -> None:
    page = ROOT / page_name
    if not page.is_file() or page.is_symlink():
        failures.append(f"{page_name}: sitemap target must exist as a regular file")
        return

    parser = MetadataParser()
    parser.feed(page.read_text(encoding="utf-8"))
    parser.close()

    robots = {
        token.strip().lower()
        for content, _ in parser.meta_names.get("robots", [])
        for token in content.split(",")
        if token.strip()
    }
    if "noindex" in robots:
        failures.append(f"{page_name}: sitemap-indexed page must not declare noindex")

    title = single_value(page_name, "<title>", parser.titles, failures)
    canonical = require_exact(page_name, "canonical URL", parser.canonicals, public_url, failures)

    og_type = require_exact(page_name, "og:type", parser.meta_properties.get("og:type", []), "website", failures)
    og_site = require_exact(
        page_name,
        "og:site_name",
        parser.meta_properties.get("og:site_name", []),
        "Pixel Network",
        failures,
    )
    og_title = single_value(page_name, "og:title", parser.meta_properties.get("og:title", []), failures)
    og_description = single_value(
        page_name,
        "og:description",
        parser.meta_properties.get("og:description", []),
        failures,
    )
    og_url = single_value(page_name, "og:url", parser.meta_properties.get("og:url", []), failures)
    require_exact(page_name, "og:image", parser.meta_properties.get("og:image", []), SOCIAL_IMAGE_URL, failures)
    require_exact(
        page_name,
        "og:image:alt",
        parser.meta_properties.get("og:image:alt", []),
        SOCIAL_IMAGE_ALT,
        failures,
    )

    require_exact(page_name, "twitter:card", parser.meta_names.get("twitter:card", []), "summary", failures)
    twitter_title = single_value(page_name, "twitter:title", parser.meta_names.get("twitter:title", []), failures)
    twitter_description = single_value(
        page_name,
        "twitter:description",
        parser.meta_names.get("twitter:description", []),
        failures,
    )
    require_exact(page_name, "twitter:image", parser.meta_names.get("twitter:image", []), SOCIAL_IMAGE_URL, failures)

    if title is not None and og_title is not None and og_title != title:
        failures.append(f"{page_name}: og:title must match the document title")
    if canonical is not None and og_url is not None and og_url != canonical:
        failures.append(f"{page_name}: og:url must match the canonical URL")
    if og_title is not None and twitter_title is not None and twitter_title != og_title:
        failures.append(f"{page_name}: twitter:title must match og:title")
    if og_description is not None and twitter_description is not None and twitter_description != og_description:
        failures.append(f"{page_name}: twitter:description must match og:description")

    # Keep variables intentionally evaluated by the exact-value checks above.
    _ = og_type, og_site


def main() -> int:
    failures: list[str] = []
    urls = sitemap_urls(failures)

    for public_url in urls:
        page_name = filename_for_public_url(public_url, failures)
        if page_name is not None:
            validate_page(page_name, public_url, failures)

    if failures:
        print("Social metadata validation failed:")
        for failure in failures:
            print(f"  {failure}")
        return 1

    print(
        f"Social metadata passed for {len(urls)} sitemap-indexed pages: "
        "canonical Open Graph URLs, titles, descriptions, Twitter cards and the official social image are consistent."
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
