#!/usr/bin/env python3
"""Validate that the staged PixelWeb artifact contains only intended public-site files."""
from __future__ import annotations

import html.parser
from pathlib import Path
from urllib.parse import unquote, urlsplit

ROOT = Path(__file__).resolve().parents[1]
PUBLIC = ROOT / "_site"

FORBIDDEN_PREFIXES = {
    "docs/",
    "scripts/",
    ".github/",
    ".git/",
}
FORBIDDEN_FILES = {
    ".env",
    ".env.example",
    ".gitignore",
    "README.md",
    "SECURITY.md",
}
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
        # PixelWeb currently lives under /PixelWeb/. Root-relative URLs are intentionally
        # avoided because they would resolve outside this project-site bundle.
        return PUBLIC / "__invalid_root_relative__"

    return (page.parent / path).resolve()


def main() -> int:
    failures: list[str] = []

    if not PUBLIC.is_dir():
        print("Public bundle validation failed: _site/ does not exist. Run build_public_site.py first.")
        return 1

    files = sorted(path for path in PUBLIC.rglob("*") if path.is_file())
    if not files:
        failures.append("_site/: public bundle is empty")

    relative_files = {path.relative_to(PUBLIC).as_posix() for path in files}
    for relative in sorted(relative_files):
        lowered = relative.lower()
        if relative in FORBIDDEN_FILES:
            failures.append(f"{relative}: repository/internal file must not be in public bundle")
        if any(lowered.startswith(prefix) for prefix in FORBIDDEN_PREFIXES):
            failures.append(f"{relative}: internal directory must not be in public bundle")
        if lowered.startswith(".env"):
            failures.append(f"{relative}: environment file must not be in public bundle")

    required = {"index.html", "404.html", "sitemap.xml", ".nojekyll"}
    for relative in sorted(required - relative_files):
        failures.append(f"{relative}: required public file is missing")

    for page in sorted(PUBLIC.glob("*.html")):
        parser = ReferenceParser()
        parser.feed(page.read_text(encoding="utf-8"))
        parser.close()

        for attr, raw, line in parser.references:
            target = local_target(page, raw)
            if target is None:
                continue

            try:
                target.relative_to(PUBLIC.resolve())
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

    if failures:
        print("Public bundle validation failed:")
        for failure in failures:
            print(f"  {failure}")
        return 1

    print(
        f"Public bundle validation passed for {len(files)} files and "
        f"{len(list(PUBLIC.glob('*.html')))} top-level HTML pages."
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
