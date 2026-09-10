#!/usr/bin/env python3
"""Build the public PixelWeb artifact from explicit publication roots.

The repository contains release/security documentation and validation tooling that must not
become part of the hosted website merely because GitHub Pages can publish a branch root.
Public HTML is derived from the canonical sitemap plus explicitly noindex runtime surfaces;
root CSS/JS/media is copied only when referenced by those pages, with a tiny explicit list for
known runtime-loaded root resources. Browser-public ``assets/`` and ``data/`` remain deliberate
public directories.
"""
from __future__ import annotations

import html.parser
import shutil
import xml.etree.ElementTree as ET
from pathlib import Path
from urllib.parse import unquote, urlsplit

ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "_site"
SITEMAP = ROOT / "sitemap.xml"
SITE_BASE_URL = "https://xklezee.github.io/PixelWeb/"

PUBLIC_FIXED_FILES = {".nojekyll", "robots.txt", "sitemap.xml"}
PUBLIC_NOINDEX_PAGES = {"forum.html", "404.html"}
PUBLIC_DIRECTORIES = {"assets", "data"}
# Loaded by site.js only when the Play modal is first needed, so it is not a static HTML ref.
PUBLIC_DYNAMIC_ROOT_FILES = {"play-modal.css"}
REFERENCE_ATTRS = {"href", "src", "poster", "data-src", "data-poster"}
SRCSET_ATTRS = {"srcset", "data-srcset"}


class ReferenceParser(html.parser.HTMLParser):
    def __init__(self) -> None:
        super().__init__(convert_charrefs=True)
        self.references: list[str] = []

    def handle_starttag(self, tag: str, attrs) -> None:
        attrs_dict = dict(attrs)
        for attr in REFERENCE_ATTRS:
            value = attrs_dict.get(attr)
            if value:
                self.references.append(str(value))
        for attr in SRCSET_ATTRS:
            value = attrs_dict.get(attr)
            if not value:
                continue
            for item in str(value).split(","):
                candidate = item.strip().split(" ", 1)[0]
                if candidate:
                    self.references.append(candidate)

    def handle_startendtag(self, tag: str, attrs) -> None:
        self.handle_starttag(tag, attrs)


def copy_file(source: Path, destination: Path) -> None:
    destination.parent.mkdir(parents=True, exist_ok=True)
    shutil.copy2(source, destination)


def sitemap_pages() -> set[str]:
    if not SITEMAP.is_file():
        raise FileNotFoundError("sitemap.xml is required to derive the public page set")

    root = ET.fromstring(SITEMAP.read_text(encoding="utf-8"))
    namespace = {"sm": "http://www.sitemaps.org/schemas/sitemap/0.9"}
    pages: set[str] = set()

    for node in root.findall("sm:url/sm:loc", namespace):
        location = (node.text or "").strip()
        if not location.startswith(SITE_BASE_URL):
            raise ValueError(f"sitemap URL is outside the PixelWeb base: {location}")
        suffix = location[len(SITE_BASE_URL):]
        page = "index.html" if not suffix else unquote(suffix)
        if "/" in page or not page.endswith(".html"):
            raise ValueError(f"sitemap entry is not a top-level public HTML page: {location}")
        pages.add(page)

    if not pages:
        raise ValueError("sitemap contains no public pages")
    return pages


def local_root_reference(raw: str) -> str | None:
    value = raw.strip()
    if not value or value.startswith(("#", "mailto:", "tel:")):
        return None
    parts = urlsplit(value)
    if parts.scheme or parts.netloc or not parts.path:
        return None
    path = unquote(parts.path)
    if path.startswith("/") or "/" in path:
        return None
    return path


def main() -> int:
    try:
        public_pages = sitemap_pages() | PUBLIC_NOINDEX_PAGES
    except (FileNotFoundError, ValueError, ET.ParseError) as exc:
        print(f"Public-site build failed: {exc}")
        return 1

    if OUTPUT.exists():
        shutil.rmtree(OUTPUT)
    OUTPUT.mkdir(parents=True)

    root_files = set(PUBLIC_FIXED_FILES) | set(PUBLIC_DYNAMIC_ROOT_FILES) | public_pages

    # Static references from explicitly public pages are the only additional root files allowed.
    for page_name in sorted(public_pages):
        page = ROOT / page_name
        if not page.is_file():
            print(f"Public-site build failed: public page is missing: {page_name}")
            return 1
        parser = ReferenceParser()
        parser.feed(page.read_text(encoding="utf-8"))
        parser.close()
        for raw in parser.references:
            candidate = local_root_reference(raw)
            if candidate:
                root_files.add(candidate)

    copied = 0
    for name in sorted(root_files, key=str.lower):
        source = ROOT / name
        if not source.is_file():
            print(f"Public-site build failed: allowlisted root file is missing: {name}")
            return 1
        copy_file(source, OUTPUT / name)
        copied += 1

    for directory in sorted(PUBLIC_DIRECTORIES):
        source = ROOT / directory
        if not source.is_dir():
            print(f"Public-site build failed: public directory is missing: {directory}/")
            return 1
        destination = OUTPUT / directory
        shutil.copytree(source, destination, symlinks=False)
        copied += sum(1 for path in destination.rglob("*") if path.is_file())

    required = [OUTPUT / "index.html", OUTPUT / "404.html", OUTPUT / "sitemap.xml", OUTPUT / ".nojekyll"]
    missing = [path.relative_to(OUTPUT) for path in required if not path.is_file()]
    if missing:
        print("Public-site build failed: required output is missing:")
        for path in missing:
            print(f"  {path}")
        return 1

    print(
        f"Public-site bundle built at {OUTPUT} with {copied} files from "
        f"{len(public_pages)} explicit public pages."
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
