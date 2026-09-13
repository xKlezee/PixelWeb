#!/usr/bin/env python3
"""Validate security/publication metadata shared by every PixelWeb HTML document."""
from __future__ import annotations

import html.parser
import re
from collections import defaultdict
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
HTML_FILES = sorted(ROOT.glob("*.html"))
SITE_BASE_URL = "https://xklezee.github.io/PixelWeb/"
REQUIRED_REFERRER_POLICY = "strict-origin-when-cross-origin"
REQUIRED_FAVICON = "favicon.png"
REQUIRED_FAVICON_TYPE = "image/png"
REQUIRED_FAVICON_SIZE = "32x32"

LEGACY_REDIRECTS = {
    "forum.html": {
        "target": "community.html",
        "canonical": f"{SITE_BASE_URL}community.html",
        "robots": {"noindex", "nofollow", "noarchive"},
    },
    "development.html": {
        "target": "guides.html",
        "canonical": f"{SITE_BASE_URL}guides.html",
        "robots": {"noindex", "nofollow", "noarchive"},
    },
}

REQUIRED_NOINDEX = {
    "404.html": {"noindex", "noarchive"},
    **{name: contract["robots"] for name, contract in LEGACY_REDIRECTS.items()},
}

REFRESH_RE = re.compile(r"^\s*0(?:\.0+)?\s*;\s*url\s*=\s*(.+?)\s*$", re.IGNORECASE)


class MetadataParser(html.parser.HTMLParser):
    def __init__(self) -> None:
        super().__init__(convert_charrefs=True)
        self.meta_names: dict[str, list[tuple[str, int]]] = defaultdict(list)
        self.http_equiv: dict[str, list[tuple[str, int]]] = defaultdict(list)
        self.canonicals: list[tuple[str, int]] = []
        self.icons: list[tuple[str, str, str, int]] = []
        self.anchor_hrefs: list[tuple[str, int]] = []

    def handle_starttag(self, tag: str, attrs) -> None:
        tag = tag.lower()
        line, _ = self.getpos()
        attrs_dict = {str(key).lower(): value for key, value in attrs if key}

        if tag == "meta":
            content = str(attrs_dict.get("content") or "").strip()
            name = str(attrs_dict.get("name") or "").strip().lower()
            http_equiv = str(attrs_dict.get("http-equiv") or "").strip().lower()
            if name:
                self.meta_names[name].append((content, line))
            if http_equiv:
                self.http_equiv[http_equiv].append((content, line))
            return

        if tag == "link":
            rel = {token.lower() for token in str(attrs_dict.get("rel") or "").split()}
            href = str(attrs_dict.get("href") or "").strip()
            if "canonical" in rel:
                self.canonicals.append((href, line))
            if "icon" in rel:
                self.icons.append((
                    href,
                    str(attrs_dict.get("type") or "").strip().lower(),
                    str(attrs_dict.get("sizes") or "").strip().lower(),
                    line,
                ))
            return

        if tag == "a":
            href = str(attrs_dict.get("href") or "").strip()
            if href:
                self.anchor_hrefs.append((href, line))

    def handle_startendtag(self, tag: str, attrs) -> None:
        self.handle_starttag(tag, attrs)


def comma_tokens(value: str) -> set[str]:
    return {token.strip().lower() for token in value.split(",") if token.strip()}


def require_single_meta(
    page: Path,
    parser: MetadataParser,
    name: str,
    failures: list[str],
) -> tuple[str, int] | None:
    entries = parser.meta_names.get(name, [])
    if len(entries) != 1:
        failures.append(
            f"{page.name}: expected exactly one meta[name={name!r}], found {len(entries)}"
        )
        return None
    return entries[0]


def validate_referrer(page: Path, parser: MetadataParser, failures: list[str]) -> None:
    entry = require_single_meta(page, parser, "referrer", failures)
    if entry is None:
        return
    value, line = entry
    if value.strip().lower() != REQUIRED_REFERRER_POLICY:
        failures.append(
            f"{page.name}:{line}: referrer policy must be exactly "
            f"{REQUIRED_REFERRER_POLICY!r}, found {value!r}"
        )


def validate_favicon(page: Path, parser: MetadataParser, failures: list[str]) -> None:
    if len(parser.icons) != 1:
        failures.append(
            f"{page.name}: expected exactly one rel=icon link, found {len(parser.icons)}"
        )
        return

    href, mime_type, sizes, line = parser.icons[0]
    if href != REQUIRED_FAVICON:
        failures.append(
            f"{page.name}:{line}: favicon href must be {REQUIRED_FAVICON!r}, found {href!r}"
        )
    if mime_type != REQUIRED_FAVICON_TYPE:
        failures.append(
            f"{page.name}:{line}: favicon type must be {REQUIRED_FAVICON_TYPE!r}, "
            f"found {mime_type!r}"
        )
    if sizes != REQUIRED_FAVICON_SIZE:
        failures.append(
            f"{page.name}:{line}: favicon sizes must be {REQUIRED_FAVICON_SIZE!r}, "
            f"found {sizes!r}"
        )


def validate_noindex_contract(page: Path, parser: MetadataParser, failures: list[str]) -> None:
    required = REQUIRED_NOINDEX.get(page.name)
    if required is None:
        return

    entry = require_single_meta(page, parser, "robots", failures)
    if entry is None:
        return
    value, line = entry
    actual = comma_tokens(value)
    missing = required - actual
    if missing:
        failures.append(
            f"{page.name}:{line}: robots metadata missing required token(s): "
            + ", ".join(sorted(missing))
        )


def validate_legacy_redirect(page: Path, parser: MetadataParser, failures: list[str]) -> None:
    contract = LEGACY_REDIRECTS.get(page.name)
    if contract is None:
        return

    refresh_entries = parser.http_equiv.get("refresh", [])
    if len(refresh_entries) != 1:
        failures.append(
            f"{page.name}: expected exactly one meta[http-equiv='refresh'], "
            f"found {len(refresh_entries)}"
        )
    else:
        refresh, line = refresh_entries[0]
        match = REFRESH_RE.fullmatch(refresh)
        target = match.group(1).strip() if match else None
        if target != contract["target"]:
            failures.append(
                f"{page.name}:{line}: legacy redirect must target {contract['target']!r}, "
                f"found {refresh!r}"
            )

    if len(parser.canonicals) != 1:
        failures.append(
            f"{page.name}: legacy redirect must declare exactly one canonical, "
            f"found {len(parser.canonicals)}"
        )
    else:
        canonical, line = parser.canonicals[0]
        if canonical != contract["canonical"]:
            failures.append(
                f"{page.name}:{line}: legacy redirect canonical must be "
                f"{contract['canonical']!r}, found {canonical!r}"
            )

    fallback_targets = {href for href, _ in parser.anchor_hrefs}
    if contract["target"] not in fallback_targets:
        failures.append(
            f"{page.name}: legacy redirect requires a visible fallback link to "
            f"{contract['target']!r}"
        )


def main() -> int:
    failures: list[str] = []

    if not HTML_FILES:
        failures.append("No top-level HTML files found.")

    for page in HTML_FILES:
        parser = MetadataParser()
        parser.feed(page.read_text(encoding="utf-8"))
        parser.close()

        validate_referrer(page, parser, failures)
        validate_favicon(page, parser, failures)
        validate_noindex_contract(page, parser, failures)
        validate_legacy_redirect(page, parser, failures)

    for required_page in sorted(REQUIRED_NOINDEX):
        if not (ROOT / required_page).is_file():
            failures.append(f"{required_page}: required compatibility/error surface is missing")

    if failures:
        print("Document metadata validation failed:")
        for failure in failures:
            print(f"  {failure}")
        return 1

    print(f"Document metadata validation passed for {len(HTML_FILES)} HTML pages.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
