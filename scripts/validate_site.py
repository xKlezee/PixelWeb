#!/usr/bin/env python3
"""Dependency-free static integrity and browser-safety checks for PixelWeb.

This validator encodes security invariants rather than style preferences. A change
that weakens the CSP, reintroduces inline executable/style content, breaks local
references, or adds unsafe DOM sinks fails before deployment.
"""
from __future__ import annotations

import html.parser
import re
from pathlib import Path
from urllib.parse import unquote, urlsplit

ROOT = Path(__file__).resolve().parents[1]
HTML_FILES = sorted(ROOT.glob("*.html"))
JS_FILES = sorted(ROOT.glob("*.js")) + sorted((ROOT / "data").glob("*.js"))

REQUIRED_CSP_DIRECTIVES = {
    "default-src": {"'self'"},
    "base-uri": {"'self'"},
    "object-src": {"'none'"},
    "script-src": {"'self'"},
    "style-src": {"'self'"},
    "frame-src": {"'none'"},
    "worker-src": {"'none'"},
    "form-action": {"'self'"},
}
FORBIDDEN_CSP_TOKENS = {"'unsafe-inline'", "'unsafe-eval'", "'wasm-unsafe-eval'"}

# Every data-driven renderer must remain free of HTML parsing sinks. site.js has one
# reviewed, static Play-modal template containing no external/user-controlled data.
NO_HTML_SINK_FILES = {
    "app.js",
    "development.js",
    "home-stage11.js",
    "nexus-stage9.js",
    "systems-stage10.js",
    "worlds-stage8.js",
}
HTML_SINK_RE = re.compile(r"\.(?:innerHTML|outerHTML)\s*=|insertAdjacentHTML\s*\(|document\.write\s*\(")
DYNAMIC_CODE_RE = re.compile(r"\b(?:eval\s*\(|new\s+Function\s*\(|setTimeout\s*\(\s*['\"]|setInterval\s*\(\s*['\"])")


class PageParser(html.parser.HTMLParser):
    def __init__(self) -> None:
        super().__init__(convert_charrefs=True)
        self.refs: list[tuple[str, str, int]] = []
        self.blank_without_noopener: list[tuple[str, int]] = []
        self.inline_handlers: list[tuple[str, str, int]] = []
        self.inline_styles: list[tuple[str, int]] = []
        self.duplicate_ids: list[tuple[str, int]] = []
        self.dangerous_urls: list[tuple[str, str, int]] = []
        self.inline_scripts: list[int] = []
        self.csp: str | None = None
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
            if attr_lower == "style" and value is not None:
                self.inline_styles.append((tag, line))
            if attr_lower in {"href", "src", "action", "formaction", "xlink:href"} and value:
                if str(value).strip().lower().startswith("javascript:"):
                    self.dangerous_urls.append((attr_lower, value, line))

        if tag == "meta":
            http_equiv = str(attrs_dict.get("http-equiv") or "").lower()
            name = str(attrs_dict.get("name") or "").lower()
            content = str(attrs_dict.get("content") or "")
            if http_equiv == "content-security-policy" and content:
                self.csp = content
            if name == "referrer" and content:
                self.has_referrer_policy = True

        if tag in {"a", "link"} and attrs_dict.get("href"):
            self.refs.append(("href", attrs_dict["href"], line))
        if tag in {"script", "img", "source", "video", "audio", "iframe"} and attrs_dict.get("src"):
            self.refs.append(("src", attrs_dict["src"], line))
        if tag in {"source", "img"} and attrs_dict.get("srcset"):
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

    def handle_startendtag(self, tag: str, attrs):
        self.handle_starttag(tag, attrs)

    def handle_data(self, data: str):
        if self._inline_script_line is not None and data.strip():
            self._inline_script_has_content = True

    def handle_endtag(self, tag: str):
        if tag.lower() == "script" and self._inline_script_line is not None:
            if self._inline_script_has_content:
                self.inline_scripts.append(self._inline_script_line)
            self._inline_script_line = None
            self._inline_script_has_content = False


def parse_csp(value: str) -> dict[str, set[str]]:
    directives: dict[str, set[str]] = {}
    for chunk in value.split(";"):
        tokens = chunk.strip().split()
        if not tokens:
            continue
        directives[tokens[0].lower()] = {token.lower() for token in tokens[1:]}
    return directives


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
        parser.close()

        if not parser.csp:
            failures.append(f"{page.name}: missing Content-Security-Policy meta")
        else:
            csp = parse_csp(parser.csp)
            for directive, required_values in REQUIRED_CSP_DIRECTIVES.items():
                values = csp.get(directive)
                if values is None:
                    failures.append(f"{page.name}: CSP missing required directive {directive}")
                    continue
                missing = required_values - values
                if missing:
                    failures.append(
                        f"{page.name}: CSP {directive} missing {', '.join(sorted(missing))}"
                    )
            for directive, values in csp.items():
                forbidden = values & FORBIDDEN_CSP_TOKENS
                if forbidden:
                    failures.append(
                        f"{page.name}: CSP {directive} contains forbidden token(s): "
                        f"{', '.join(sorted(forbidden))}"
                    )

        if not parser.has_referrer_policy:
            failures.append(f"{page.name}: missing referrer policy meta")

        for element_id, line in parser.duplicate_ids:
            failures.append(f"{page.name}:{line}: duplicate id '{element_id}'")
        for href, line in parser.blank_without_noopener:
            failures.append(f"{page.name}:{line}: target=_blank missing rel=noopener ({href})")
        for tag, attr, line in parser.inline_handlers:
            failures.append(f"{page.name}:{line}: inline event handler {tag}[{attr}] is not CSP-ready")
        for tag, line in parser.inline_styles:
            failures.append(f"{page.name}:{line}: inline style on <{tag}> violates strict style-src")
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

    for js_file in JS_FILES:
        text = js_file.read_text(encoding="utf-8")
        if DYNAMIC_CODE_RE.search(text):
            failures.append(f"{js_file.relative_to(ROOT)}: dynamic code execution pattern detected")
        if js_file.name in NO_HTML_SINK_FILES and HTML_SINK_RE.search(text):
            failures.append(
                f"{js_file.relative_to(ROOT)}: HTML parsing sink detected in data-driven renderer"
            )

    if failures:
        print("Static site validation failed:")
        for failure in failures:
            print(f"  {failure}")
        return 1

    print(
        f"Static site validation passed for {len(HTML_FILES)} HTML pages "
        f"and {len(JS_FILES)} JavaScript files."
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
