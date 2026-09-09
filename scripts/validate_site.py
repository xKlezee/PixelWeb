#!/usr/bin/env python3
"""Dependency-free static integrity and browser-safety checks for PixelWeb."""
from __future__ import annotations

import html.parser
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
        self.dangerous_urls: list[tuple[str, str, int]] = []
        self.inline_scripts: list[int] = []
        self.has_csp = False
        self.has_referrer_policy = False
        self._ids: set[str] = set()
        self._inline_script_line: int | None = None
        self._inline_script_has_content = False

    def handle_starttag(self, tag: str, attrs):
        attrs_dict = dict(attrs)
        line, _ = self.getpos()
        tag = tag.lower()

        element_id = attrs_dict.get("id")
        if element_id:
            if element_id in self._ids:
                self.duplicate_ids.append((element_id, line))
            self._ids.add(element_id)

        for attr, value in attrs:
            attr_lower = attr.lower()
            if attr_lower.startswith("on") and value:
                self.inline_handlers.append((tag, attr, line))
            if attr_lower in {"href", "src", "action", "formaction"} and value:
                if str(value).strip().lower().startswith("javascript:"):
                    self.dangerous_urls.append((attr_lower, value, line))

        if tag == "meta":
            http_equiv = str(attrs_dict.get("http-equiv") or "").lower()
            name = str(attrs_dict.get("name") or "").lower()
            content = str(attrs_dict.get("content") or "").lower()
            if http_equiv == "content-security-policy" and content:
                self.has_csp = True
            if name == "referrer" and content:
                self.has_referrer_policy = True

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

        if tag == "script" and not attrs_dict.get("src"):
            self._inline_script_line = line
            self._inline_script_has_content = False

    def handle_data(self, data: str):
        if self._inline_script_line is not None and data.strip():
            self._inline_script_has_content = True

    def handle_endtag(self, tag: str):
        if tag.lower() == "script" and self._inline_script_line is not None:
            if self._inline_script_has_content:
                self.inline_scripts.append(self._inline_script_line)
            self._inline_script_line = None
            self._inline_script_has_content = False


def local_target(raw: str) -> Path | None:
    raw = raw.strip()
    if not raw or raw.startswith(("#", "mailto:", "tel:")):
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

        if not parser.has_csp:
            failures.append(f"{page.name}: missing Content-Security-Policy meta")
        if not parser.has_referrer_policy:
            failures.append(f"{page.name}: missing referrer policy meta")

        for element_id, line in parser.duplicate_ids:
            failures.append(f"{page.name}:{line}: duplicate id '{element_id}'")
        for href, line in parser.blank_without_noopener:
            failures.append(f"{page.name}:{line}: target=_blank missing rel=noopener ({href})")
        for tag, attr, line in parser.inline_handlers:
            failures.append(f"{page.name}:{line}: inline event handler {tag}[{attr}] is not CSP-ready")
        for line in parser.inline_scripts:
            failures.append(f"{page.name}:{line}: inline script is blocked by script-src 'self'")
        for attr, value, line in parser.dangerous_urls:
            failures.append(f"{page.name}:{line}: dangerous javascript: URL in {attr} ({value})")

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
