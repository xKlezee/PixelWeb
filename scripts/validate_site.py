#!/usr/bin/env python3
"""Dependency-free static integrity and browser-safety checks for PixelWeb.

This validator encodes security and publication invariants rather than style preferences.
A change that weakens the CSP, reintroduces inline executable/style content, breaks local
references, adds unsafe DOM sinks, introduces insecure absolute HTTP resources, or
reintroduces explicitly retired public claims fails before deployment.
"""
from __future__ import annotations

import html.parser
import re
from pathlib import Path
from urllib.parse import unquote, urlsplit

ROOT = Path(__file__).resolve().parents[1]
HTML_FILES = sorted(ROOT.glob("*.html"))
JS_FILES = sorted(path for path in ROOT.rglob("*.js") if ".git" not in path.parts)
CSS_FILES = sorted(path for path in ROOT.rglob("*.css") if ".git" not in path.parts)

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
GUIDE_CONNECT_SRC = {"'self'"}

# Retired product copy is guarded explicitly when its reappearance would overclaim a
# feature state. These strings are not generic wording bans; they are known stale claims.
FORBIDDEN_PUBLIC_COPY = {
    "Personal and collaborative island progression.": (
        "Skyblock collaboration is currently partial; use the canonical personal-island "
        "description instead"
    ),
}

# Some public values must have exactly one source owner. Other surfaces render them from
# that owner instead of embedding a second literal that can drift later.
CANONICAL_LITERAL_OWNERS = {
    "pixelboxxx.minehut.gg": Path("data/network.js"),
}

# PixelWeb intentionally avoids string-to-DOM parsing and runtime inline-style mutation.
# This keeps data rendering safe by construction and makes a strict CSP sustainable.
HTML_SINK_RE = re.compile(r"\.(?:innerHTML|outerHTML)\s*=|insertAdjacentHTML\s*\(|document\.write\s*\(")
INLINE_STYLE_JS_RE = re.compile(r"\.style(?:\.|\[)|setAttribute\s*\(\s*['\"]style['\"]")
DYNAMIC_CODE_RE = re.compile(r"\b(?:eval\s*\(|new\s+Function\s*\(|setTimeout\s*\(\s*['\"]|setInterval\s*\(\s*['\"])")
INSECURE_HTTP_RE = re.compile(r"(?i)\bhttp://")


class PageParser(html.parser.HTMLParser):
    def __init__(self) -> None:
        super().__init__(convert_charrefs=True)
        self.refs: list[tuple[str, str, int]] = []
        self.blank_without_noopener: list[tuple[str, int]] = []
        self.inline_handlers: list[tuple[str, str, int]] = []
        self.inline_styles: list[tuple[str, int]] = []
        self.duplicate_ids: list[tuple[str, int]] = []
        self.dangerous_urls: list[tuple[str, str, int]] = []
        self.insecure_http_urls: list[tuple[str, str, int]] = []
        self.inline_scripts: list[int] = []
        self.csp: str | None = None
        self.has_referrer_policy = False
        self._ids: set[str] = set()
        self._inline_script_line: int | None = None
        self._inline_script_has_content = False

    def _record_resource_url(self, attr: str, value: str, line: int) -> None:
        raw = str(value).strip()
        if not raw:
            return
        lowered = raw.lower()
        if lowered.startswith("javascript:"):
            self.dangerous_urls.append((attr, raw, line))
        if lowered.startswith("http://"):
            self.insecure_http_urls.append((attr, raw, line))

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
            if attr_lower in {"href", "src", "action", "formaction", "xlink:href", "poster"} and value:
                self._record_resource_url(attr_lower, value, line)

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
        if tag == "video" and attrs_dict.get("poster"):
            self.refs.append(("poster", attrs_dict["poster"], line))
        if tag in {"source", "img"} and attrs_dict.get("srcset"):
            for item in attrs_dict["srcset"].split(","):
                candidate = item.strip().split(" ", 1)[0]
                if candidate:
                    self._record_resource_url("srcset", candidate, line)
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


def is_guide_page(page: Path) -> bool:
    return page.name == "guides.html" or page.name.startswith("guide-")


def scan_text_file_for_insecure_http(path: Path, failures: list[str]) -> None:
    text = path.read_text(encoding="utf-8")
    for line_number, line in enumerate(text.splitlines(), start=1):
        if INSECURE_HTTP_RE.search(line):
            failures.append(
                f"{path.relative_to(ROOT)}:{line_number}: insecure absolute HTTP URL detected"
            )


def scan_publication_invariants(paths: list[Path], failures: list[str]) -> None:
    for path in paths:
        text = path.read_text(encoding="utf-8")
        relative = path.relative_to(ROOT)

        for stale_copy, explanation in FORBIDDEN_PUBLIC_COPY.items():
            if stale_copy in text:
                failures.append(f"{relative}: retired public claim detected — {explanation}")

        for literal, owner in CANONICAL_LITERAL_OWNERS.items():
            if literal not in text:
                continue
            if relative != owner:
                failures.append(
                    f"{relative}: canonical literal '{literal}' must be owned only by {owner}"
                )


def main() -> int:
    failures: list[str] = []

    if not HTML_FILES:
        failures.append("No top-level HTML files found.")

    for page in HTML_FILES:
        parser = PageParser()
        parser.feed(page.read_text(encoding="utf-8"))
        parser.close()
        csp: dict[str, set[str]] = {}

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

        if is_guide_page(page):
            if csp.get("connect-src") != GUIDE_CONNECT_SRC:
                failures.append(
                    f"{page.name}: Guides must use exactly connect-src 'self' unless the "
                    "documentation network boundary is deliberately revised"
                )
            ref_values = {raw for _, raw, _ in parser.refs}
            if "guides.css" not in ref_values:
                failures.append(f"{page.name}: Guide page must load guides.css")
            if "data/network.js" not in ref_values:
                failures.append(f"{page.name}: Guide page must load canonical data/network.js")

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
        for attr, value, line in parser.insecure_http_urls:
            failures.append(f"{page.name}:{line}: external {attr} must use HTTPS ({value})")

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
        relative = js_file.relative_to(ROOT)
        if DYNAMIC_CODE_RE.search(text):
            failures.append(f"{relative}: dynamic code execution pattern detected")
        if HTML_SINK_RE.search(text):
            failures.append(f"{relative}: HTML parsing sink detected")
        if INLINE_STYLE_JS_RE.search(text):
            failures.append(f"{relative}: runtime inline-style mutation detected")
        scan_text_file_for_insecure_http(js_file, failures)

    for css_file in CSS_FILES:
        scan_text_file_for_insecure_http(css_file, failures)

    scan_publication_invariants([*HTML_FILES, *JS_FILES], failures)

    if failures:
        print("Static site validation failed:")
        for failure in failures:
            print(f"  {failure}")
        return 1

    print(
        f"Static site validation passed for {len(HTML_FILES)} HTML pages, "
        f"{len(JS_FILES)} JavaScript files and {len(CSS_FILES)} CSS files."
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
