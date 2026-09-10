#!/usr/bin/env python3
"""Validate that the staged PixelWeb artifact contains only intended public-site files."""
from __future__ import annotations

import html.parser
import xml.etree.ElementTree as ET
from pathlib import Path
from urllib.parse import unquote, urlsplit

ROOT = Path(__file__).resolve().parents[1]
PUBLIC = ROOT / "_site"
SITEMAP = PUBLIC / "sitemap.xml"
SITE_BASE_URL = "https://xklezee.github.io/PixelWeb/"

FORBIDDEN_PREFIXES = {
    "docs/",
    "scripts/",
    ".github/",
    ".git/",
}
FORBIDDEN_BASENAMES = {
    ".gitignore",
    "readme.md",
    "security.md",
}
FORBIDDEN_SUFFIXES = {
    ".pem", ".key", ".p12", ".pfx", ".crt", ".cer",
    ".log", ".sql", ".sqlite", ".sqlite3", ".db",
}
PUBLIC_DATA_SUFFIXES = {".js", ".json"}
PUBLIC_ASSET_SUFFIXES = {
    ".png", ".jpg", ".jpeg", ".gif", ".webp", ".avif", ".ico", ".svg",
    ".mp4", ".webm", ".mov", ".woff", ".woff2",
}
PUBLIC_NOINDEX_PAGES = {"forum.html", "404.html"}
PUBLIC_DYNAMIC_ROOT_FILES = {"play-modal.css"}
LOCAL_URL_ATTRS = {"href", "src", "poster", "data-src", "data-poster"}
SRCSET_ATTRS = {"srcset", "data-srcset"}


class ReferenceParser(html.parser.HTMLParser):
    def __init__(self) -> None:
        super().__init__(convert_charrefs=True)
        self.references: list[tuple[str, str, int]] = []

    def handle_starttag(self, tag: str, attrs) -> None:
        line, _ = self.getpos()
        attrs_dict = dict(attrs)

        for attr in LOCAL_URL_ATTRS:
            value = attrs_dict.get(attr)
            if value:
                self.references.append((attr, str(value), line))

        for attr in SRCSET_ATTRS:
            value = attrs_dict.get(attr)
            if not value:
                continue
            for item in str(value).split(","):
                candidate = item.strip().split(" ", 1)[0]
                if candidate:
                    self.references.append((attr, candidate, line))

    def handle_startendtag(self, tag: str, attrs) -> None:
        self.handle_starttag(tag, attrs)


def local_target(page: Path, raw: str) -> Path | None:
    value = raw.strip()
    if not value or value.startswith(("#", "mailto:", "tel:")):
        return None

    parts = urlsplit(value)
    if parts.scheme or parts.netloc:
        return None

    path = unquote(parts.path)
    if not path:
        return None

    if path.startswith("/"):
        # PixelWeb currently lives under /PixelWeb/. Root-relative URLs resolve outside
        # the project-site artifact and are intentionally forbidden.
        return PUBLIC / "__invalid_root_relative__"

    return (page.parent / path).resolve()


def sitemap_page_names(failures: list[str]) -> set[str]:
    if not SITEMAP.is_file():
        failures.append("sitemap.xml: required public sitemap is missing")
        return set()

    try:
        root = ET.fromstring(SITEMAP.read_text(encoding="utf-8"))
    except (ET.ParseError, UnicodeError) as exc:
        failures.append(f"sitemap.xml: invalid XML ({exc})")
        return set()

    namespace = {"sm": "http://www.sitemaps.org/schemas/sitemap/0.9"}
    pages: set[str] = set()
    for node in root.findall("sm:url/sm:loc", namespace):
        location = (node.text or "").strip()
        if not location.startswith(SITE_BASE_URL):
            failures.append(f"sitemap.xml: URL outside canonical base ({location})")
            continue
        suffix = unquote(location[len(SITE_BASE_URL):])
        page = "index.html" if not suffix else suffix
        if "/" in page or not page.endswith(".html"):
            failures.append(f"sitemap.xml: non-top-level HTML publication entry ({location})")
            continue
        pages.add(page)
    return pages


def main() -> int:
    failures: list[str] = []

    if not PUBLIC.is_dir():
        print("Public bundle validation failed: _site/ does not exist. Run build_public_site.py first.")
        return 1

    files = sorted(path for path in PUBLIC.rglob("*") if path.is_file())
    if not files:
        failures.append("_site/: public bundle is empty")

    relative_files = {path.relative_to(PUBLIC).as_posix() for path in files}
    for path in files:
        relative = path.relative_to(PUBLIC).as_posix()
        lowered = relative.lower()
        basename = path.name.lower()
        suffix = path.suffix.lower()
        parts_lower = [part.lower() for part in path.relative_to(PUBLIC).parts]

        if basename in FORBIDDEN_BASENAMES:
            failures.append(f"{relative}: repository/internal file must not be in public bundle")
        if any(lowered.startswith(prefix) for prefix in FORBIDDEN_PREFIXES):
            failures.append(f"{relative}: internal directory must not be in public bundle")
        if any(part.startswith(".env") for part in parts_lower):
            failures.append(f"{relative}: environment file/path must not be in public bundle")
        if suffix in FORBIDDEN_SUFFIXES:
            failures.append(f"{relative}: sensitive/operational file type must not be public")

        relative_path = path.relative_to(PUBLIC)
        if relative_path.parts and relative_path.parts[0] == "data" and suffix not in PUBLIC_DATA_SUFFIXES:
            failures.append(f"{relative}: unexpected file type inside browser-public data/")
        if relative_path.parts and relative_path.parts[0] == "assets" and suffix not in PUBLIC_ASSET_SUFFIXES:
            failures.append(f"{relative}: unexpected file type inside browser-public assets/")

    required = {"index.html", "404.html", "sitemap.xml", ".nojekyll"}
    for relative in sorted(required - relative_files):
        failures.append(f"{relative}: required public file is missing")

    sitemap_pages = sitemap_page_names(failures)
    expected_html = sitemap_pages | PUBLIC_NOINDEX_PAGES
    actual_html = {path.name for path in PUBLIC.glob("*.html")}
    for page in sorted(actual_html - expected_html):
        failures.append(f"{page}: HTML page is not declared by sitemap/noindex publication roots")
    for page in sorted(expected_html - actual_html):
        failures.append(f"{page}: declared public HTML page is missing from bundle")

    # Root files outside HTML/media/public metadata should be either statically referenced
    # by a public page or explicitly declared as a known runtime-loaded resource.
    referenced_root_files: set[str] = set(PUBLIC_DYNAMIC_ROOT_FILES)

    for page in sorted(PUBLIC.glob("*.html")):
        parser = ReferenceParser()
        parser.feed(page.read_text(encoding="utf-8"))
        parser.close()

        for attr, raw, line in parser.references:
            target = local_target(page, raw)
            if target is None:
                continue

            try:
                relative_target = target.relative_to(PUBLIC.resolve())
            except ValueError:
                failures.append(
                    f"{page.name}:{line}: local {attr} escapes public bundle ({raw})"
                )
                continue

            if target.name == "__invalid_root_relative__":
                failures.append(
                    f"{page.name}:{line}: root-relative {attr} is invalid for /PixelWeb/ project site ({raw})"
                )
                continue

            if not target.exists():
                failures.append(
                    f"{page.name}:{line}: local {attr} target missing from public bundle ({raw})"
                )
                continue

            if len(relative_target.parts) == 1:
                referenced_root_files.add(relative_target.name)

    exempt_root_files = {
        ".nojekyll", "robots.txt", "sitemap.xml",
        *expected_html,
    }
    for path in sorted(PUBLIC.iterdir(), key=lambda item: item.name.lower()):
        if not path.is_file():
            continue
        if path.name in exempt_root_files or path.name in referenced_root_files:
            continue
        failures.append(f"{path.name}: unreferenced/unapproved root file in public bundle")

    if failures:
        print("Public bundle validation failed:")
        for failure in failures:
            print(f"  {failure}")
        return 1

    print(
        f"Public bundle validation passed for {len(files)} files and "
        f"{len(actual_html)} top-level HTML pages."
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
