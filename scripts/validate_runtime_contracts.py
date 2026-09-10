#!/usr/bin/env python3
"""Guard runtime-specific contracts that are not represented by ordinary href/src parsing."""
from __future__ import annotations

import html.parser
import re
from pathlib import Path
from urllib.parse import unquote, urlsplit

ROOT = Path(__file__).resolve().parents[1]
HTML_FILES = sorted(ROOT.glob("*.html"))
JS_FILES = sorted(path for path in ROOT.rglob("*.js") if ".git" not in path.parts)
NAV_HARDENING_PATH = ROOT / "security-hardening.css"
NAVIGATION_PAGE_EXCEPTIONS = {"forum.html"}

DIRECT_STYLE_ASSIGNMENT_RE = re.compile(r"\.style\s*=")
DEFERRED_URL_ATTRS = {"data-src", "data-poster"}
DESKTOP_HOVER_NAV_RE = re.compile(
    r"@media\s*\(\s*min-width\s*:\s*981px\s*\)\s*and\s*"
    r"\(\s*hover\s*:\s*hover\s*\)\s*and\s*"
    r"\(\s*pointer\s*:\s*fine\s*\)\s*\{[\s\S]*?"
    r"\.nav-group\s*>\s*button\s*\{[\s\S]*?pointer-events\s*:\s*none\s*;",
    re.IGNORECASE,
)
SITE_NAV_RE = re.compile(
    r"<nav\b[^>]*\bclass=['\"][^'\"]*\bsite-nav\b[^'\"]*['\"][^>]*>([\s\S]*?)</nav>",
    re.IGNORECASE,
)
CURRENT_NAV_LINK_RE = re.compile(
    r"<a\b(?=[^>]*\baria-current=['\"]page['\"])[^>]*\bhref=['\"]([^'\"]+)['\"][^>]*>",
    re.IGNORECASE,
)


class DeferredMediaParser(html.parser.HTMLParser):
    def __init__(self) -> None:
        super().__init__(convert_charrefs=True)
        self.urls: list[tuple[str, str, int]] = []
        self.stylesheets: set[str] = set()

    def handle_starttag(self, tag: str, attrs) -> None:
        line, _ = self.getpos()
        attrs_dict = dict(attrs)

        for attr in DEFERRED_URL_ATTRS:
            value = attrs_dict.get(attr)
            if value:
                self.urls.append((attr, str(value), line))

        srcset = attrs_dict.get("data-srcset")
        if srcset:
            for item in str(srcset).split(","):
                candidate = item.strip().split(" ", 1)[0]
                if candidate:
                    self.urls.append(("data-srcset", candidate, line))

        if tag.lower() == "link":
            rel = {token.lower() for token in str(attrs_dict.get("rel") or "").split()}
            href = str(attrs_dict.get("href") or "").strip()
            if "stylesheet" in rel and href:
                self.stylesheets.add(href)

    def handle_startendtag(self, tag: str, attrs) -> None:
        self.handle_starttag(tag, attrs)


def validate_deferred_url(page: Path, attr: str, raw: str, line: int, failures: list[str]) -> None:
    value = raw.strip()
    if not value:
        return

    parts = urlsplit(value)
    if parts.scheme:
        if parts.scheme.lower() != "https":
            failures.append(
                f"{page.name}:{line}: deferred {attr} must use HTTPS when external ({value})"
            )
        return
    if parts.netloc:
        failures.append(f"{page.name}:{line}: protocol-relative deferred {attr} is not allowed ({value})")
        return

    local_path = unquote(parts.path)
    if not local_path:
        return

    target = (ROOT / local_path.lstrip("/")).resolve()
    try:
        target.relative_to(ROOT.resolve())
    except ValueError:
        failures.append(f"{page.name}:{line}: deferred {attr} escapes repository root ({value})")
        return

    if not target.exists():
        failures.append(f"{page.name}:{line}: deferred {attr} target is missing ({value})")


def validate_guide_navigation_current_state(page_name: str, failures: list[str]) -> None:
    if not page_name.startswith("guide-") or not page_name.endswith(".html"):
        return

    text = (ROOT / page_name).read_text(encoding="utf-8")
    nav_match = SITE_NAV_RE.search(text)
    if not nav_match:
        failures.append(f"{page_name}: Guide page is missing the canonical site navigation")
        return

    current_hrefs = CURRENT_NAV_LINK_RE.findall(nav_match.group(1))
    if current_hrefs != ["guides.html"]:
        rendered = ", ".join(current_hrefs) if current_hrefs else "none"
        failures.append(
            f"{page_name}: Guide navbar must mark exactly guides.html as aria-current=page "
            f"(found: {rendered})"
        )


def validate_navigation_contract(page_parsers: dict[str, DeferredMediaParser], failures: list[str]) -> None:
    for page_name, parser in page_parsers.items():
        if page_name in NAVIGATION_PAGE_EXCEPTIONS:
            continue
        if "security-hardening.css" not in parser.stylesheets:
            failures.append(
                f"{page_name}: canonical public navigation must load security-hardening.css"
            )
        validate_guide_navigation_current_state(page_name, failures)

    if not NAV_HARDENING_PATH.exists():
        failures.append("security-hardening.css: missing desktop navigation hardening layer")
        return
    if NAV_HARDENING_PATH.is_symlink() or not NAV_HARDENING_PATH.is_file():
        failures.append("security-hardening.css: navigation hardening layer must be a regular file")
        return

    css = NAV_HARDENING_PATH.read_text(encoding="utf-8")
    if not DESKTOP_HOVER_NAV_RE.search(css):
        failures.append(
            "security-hardening.css: desktop Explore/Development/Community controls must remain "
            "hover-only for fine pointers above the 980px mobile breakpoint"
        )


def main() -> int:
    failures: list[str] = []
    page_parsers: dict[str, DeferredMediaParser] = {}

    for page in HTML_FILES:
        parser = DeferredMediaParser()
        parser.feed(page.read_text(encoding="utf-8"))
        parser.close()
        page_parsers[page.name] = parser
        for attr, value, line in parser.urls:
            validate_deferred_url(page, attr, value, line, failures)

    validate_navigation_contract(page_parsers, failures)

    for js_file in JS_FILES:
        text = js_file.read_text(encoding="utf-8")
        if DIRECT_STYLE_ASSIGNMENT_RE.search(text):
            failures.append(
                f"{js_file.relative_to(ROOT)}: direct element.style assignment detected; "
                "use class/state styling so strict style-src remains sustainable"
            )

    if failures:
        print("Runtime contract validation failed:")
        for failure in failures:
            print(f"  {failure}")
        return 1

    print(
        f"Runtime contracts passed for {len(HTML_FILES)} HTML pages and "
        f"{len(JS_FILES)} JavaScript files, including desktop and Guide navigation behavior."
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
