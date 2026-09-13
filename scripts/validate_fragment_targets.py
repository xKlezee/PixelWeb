#!/usr/bin/env python3
"""Validate local HTML fragment links against static destination ids."""
from __future__ import annotations

import html.parser
from pathlib import Path
from urllib.parse import unquote, urlsplit

ROOT = Path(__file__).resolve().parents[1]
HTML_FILES = sorted(ROOT.glob("*.html"))


class FragmentParser(html.parser.HTMLParser):
    def __init__(self) -> None:
        super().__init__(convert_charrefs=True)
        self.ids: set[str] = set()
        self.hrefs: list[tuple[str, int]] = []

    def handle_starttag(self, tag: str, attrs) -> None:
        attrs_dict = {str(key).lower(): value for key, value in attrs if key}
        line, _ = self.getpos()

        element_id = str(attrs_dict.get("id") or "").strip()
        if element_id:
            self.ids.add(element_id)

        if tag.lower() == "a":
            href = str(attrs_dict.get("href") or "").strip()
            if href:
                self.hrefs.append((href, line))

    def handle_startendtag(self, tag: str, attrs) -> None:
        self.handle_starttag(tag, attrs)


def local_fragment_target(source: Path, href: str) -> tuple[str, str] | None:
    parts = urlsplit(href)
    if parts.scheme or parts.netloc or not parts.fragment:
        return None

    fragment = unquote(parts.fragment)
    if not fragment:
        return None

    raw_path = unquote(parts.path).strip()
    if not raw_path:
        return source.name, fragment

    target = (ROOT / raw_path.lstrip("/")).resolve()
    try:
        target.relative_to(ROOT.resolve())
    except ValueError:
        return None

    if target.suffix.lower() != ".html":
        return None
    return target.name, fragment


def main() -> int:
    failures: list[str] = []
    parsed: dict[str, FragmentParser] = {}

    for page in HTML_FILES:
        parser = FragmentParser()
        parser.feed(page.read_text(encoding="utf-8"))
        parser.close()
        parsed[page.name] = parser

    for source in HTML_FILES:
        parser = parsed[source.name]
        for href, line in parser.hrefs:
            target = local_fragment_target(source, href)
            if target is None:
                continue

            target_page, fragment = target
            target_parser = parsed.get(target_page)
            if target_parser is None:
                failures.append(
                    f"{source.name}:{line}: fragment link targets missing HTML page "
                    f"{target_page!r} ({href})"
                )
                continue

            if fragment not in target_parser.ids:
                failures.append(
                    f"{source.name}:{line}: fragment {fragment!r} does not match a static id "
                    f"in {target_page} ({href})"
                )

    if failures:
        print("Static fragment validation failed:")
        for failure in failures:
            print(f"  {failure}")
        return 1

    print(f"Static fragment validation passed for {len(HTML_FILES)} HTML pages.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
