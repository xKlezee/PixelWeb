#!/usr/bin/env python3
"""Static integrity checks for PixelWeb.

The checks are deliberately dependency-free so they can run in GitHub Actions
without installing third-party packages. They validate local navigation/assets
and basic HTML safety invariants without changing runtime behavior.
"""
from __future__ import annotations

import html.parser
import sys
from pathlib import Path
from urllib.parse import unquote, urlsplit

ROOT = Path(__file__).resolve().parents[1]
HTML_FILES = sorted(ROOT.glob("*.html"))


class PageParser(html.parser.HTMLParser):
    def __init__(self) -> None:
        super().__init__(convert_charrefs=True)
        self.refs: list[tuple[str, str, int]] = []
        self.blank_without_noopener: list[tuple[str, int]] = []
        self.inline_handlers: list[tuple[str, str, int]] = []
        self.duplicate_ids: list[tuple[str, int]] = []
        self._ids: set[str] = set()

    def handle_starttag(self, tag: str, attrs):
        attrs_dict = dict(attrs)
        line, _ = self.getpos()

        element_id = attrs_dict.get("id")
        if element_id:
            if element_id in self._ids:
                self.duplicate_ids.append((element_id, line))
            self._ids.add(element_id)

        for attr, value in attrs:
            if attr.lower().startswith("on") and value:
                self.inline_handlers.append((tag, attr, line))

        if tag in {"a", "link"} and attrs_dict.get("href"):
            self.refs.append(("href", attrs_dict["href"], line))
        if tag in {"script", "img", "source", "video"} and attrs_dict.get("src"):
            self.refs.append(("src", attrs_dict["src"], line))
        if tag == "source" and attrs_dict.get("srcset"):
            for item in attrs_dict["srcset"].split(","):
                candidate = item.strip().split(" ", 1)[0]
                if candidate:
                    self.refs.append(("srcset", candidate, line))

        if tag == "a" and attrs_dict.get("target") == "_blank":
            rel = {token.lower() for token in (attrs_dict.get("rel") or "").split()}
            if "noopener" not in rel:
                self.blank_without_noopener.append((attrs_dict.get("href", ""), line))


def local_target(raw: str) -> Path | None:
    raw = raw.strip()
    if not raw or raw.startswith(("#", "mailto:", "tel:", "javascript:")):
        return None
    parts = urlsplit(raw)
    if parts.scheme or parts.netloc:
        return None
    path = unquote(parts.path)
    if not path:
        return None
    return (ROOT / path.lstrip("/")).resolve()


def main() -> int:
    failures: list[str] = []

    if not HTML_FILES:
        failures.append("No top-level HTML files found.")

    for page in HTML_FILES:
        parser = PageParser()
        parser.feed(page.read_text(encoding="utf-8"))

        for element_id, line in parser.duplicate_ids:
            failures.append(f"{page.name}:{line}: duplicate id '{element_id}'")

        for href, line in parser.blank_without_noopener:
            failures.append(f"{page.name}:{line}: target=_blank missing rel=noopener ({href})")

        for tag, attr, line in parser.inline_handlers:
            failures.append(f"{page.name}:{line}: inline event handler {tag}[{attr}] is not CSP-ready")

        for attr, raw, line in parser.refs:
            target = local_target(raw)
            if target is None:
                continue
            try:
                target.relative_to(ROOT.resolve())
            except ValueError:
                failures.append(f"{page.name}:{line}: {attr} escapes repository root ({raw})")
                continue
            if not target.exists():
                failures.append(f"{page.name}:{line}: missing local {attr} target ({raw})")

    if failures:
        print("Static site validation failed:")
        for failure in failures:
            print(f"  {failure}")
        return 1

    print(f"Static site validation passed for {len(HTML_FILES)} HTML pages.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
