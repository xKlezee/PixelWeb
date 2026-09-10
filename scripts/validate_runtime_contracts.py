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
GUIDE_LIBRARY_ENTRY_RE = re.compile(
    r"<article\b(?=[^>]*\bdata-guide-entry\b)[^>]*>([\s\S]*?)</article>",
    re.IGNORECASE,
)
GUIDE_LIBRARY_TARGET_RE = re.compile(
    r"<a\b[^>]*\bhref=['\"](guide-[A-Za-z0-9._-]+\.html)['\"][^>]*>",
    re.IGNORECASE,
)
GUIDE_LIBRARY_COUNT_RE = re.compile(
    r"<[^>]+\bdata-guide-count\b[^>]*>\s*(\d+)\s+(?:entry|entries)\s*</[^>]+>",
    re.IGNORECASE,
)


class DeferredMediaParser(html.parser.HTMLParser):
    def __init__(self) -> None:
        super().__init__(convert_charrefs=True)
        self.urls: list[tuple[str, str, int]] = []
        self.stylesheets: set[str] = set()
        self.ids: set[str] = set()
        self.same_page_fragments: list[tuple[str, int]] = []

    def handle_starttag(self, tag: str, attrs) -> None:
        line, _ = self.getpos()
        attrs_dict = dict(attrs)
        tag = tag.lower()

        element_id = str(attrs_dict.get("id") or "").strip()
        if element_id:
            self.ids.add(element_id)

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

        if tag == "link":
            rel = {token.lower() for token in str(attrs_dict.get("rel") or "").split()}
            href = str(attrs_dict.get("href") or "").strip()
            if "stylesheet" in rel and href:
                self.stylesheets.add(href)

        if tag == "a":
            href = str(attrs_dict.get("href") or "").strip()
            if href.startswith("#") and len(href) > 1:
                self.same_page_fragments.append((unquote(href[1:]), line))

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


def validate_guide_fragments(
    page_name: str,
    parser: DeferredMediaParser,
    failures: list[str],
) -> None:
    if not page_name.startswith("guide-") or not page_name.endswith(".html"):
        return

    for fragment, line in parser.same_page_fragments:
        if fragment not in parser.ids:
            failures.append(
                f"{page_name}:{line}: in-page Guide link points to missing id '#{fragment}'"
            )


def validate_guide_library_coverage(failures: list[str]) -> None:
    index = ROOT / "guides.html"
    if not index.is_file() or index.is_symlink():
        failures.append("guides.html: Guide library index must be a regular file")
        return

    text = index.read_text(encoding="utf-8")
    entries = GUIDE_LIBRARY_ENTRY_RE.findall(text)
    targets: list[str] = []

    for position, entry in enumerate(entries, start=1):
        entry_targets = GUIDE_LIBRARY_TARGET_RE.findall(entry)
        if len(entry_targets) != 1:
            rendered = ", ".join(entry_targets) if entry_targets else "none"
            failures.append(
                f"guides.html: library entry {position} must link to exactly one guide-*.html target "
                f"(found: {rendered})"
            )
            continue
        targets.append(entry_targets[0])

    actual_guides = sorted(path.name for path in ROOT.glob("guide-*.html") if path.is_file() and not path.is_symlink())
    duplicate_targets = sorted({target for target in targets if targets.count(target) > 1})
    if duplicate_targets:
        failures.append(
            "guides.html: Guide library contains duplicate detailed-guide targets: "
            + ", ".join(duplicate_targets)
        )

    missing = sorted(set(actual_guides) - set(targets))
    extra = sorted(set(targets) - set(actual_guides))
    if missing:
        failures.append(
            "guides.html: Guide library is missing detailed pages: " + ", ".join(missing)
        )
    if extra:
        failures.append(
            "guides.html: Guide library points to undeclared detailed pages: " + ", ".join(extra)
        )
    if len(entries) != len(actual_guides):
        failures.append(
            f"guides.html: Guide library entry count ({len(entries)}) must match detailed Guide page count "
            f"({len(actual_guides)})"
        )

    count_matches = GUIDE_LIBRARY_COUNT_RE.findall(text)
    if len(count_matches) != 1:
        failures.append(
            f"guides.html: expected exactly one static data-guide-count summary, found {len(count_matches)}"
        )
    elif int(count_matches[0]) != len(actual_guides):
        failures.append(
            f"guides.html: static Guide count ({count_matches[0]}) must match detailed Guide page count "
            f"({len(actual_guides)})"
        )


def validate_navigation_contract(page_parsers: dict[str, DeferredMediaParser], failures: list[str]) -> None:
    for page_name, parser in page_parsers.items():
        if page_name not in NAVIGATION_PAGE_EXCEPTIONS and "security-hardening.css" not in parser.stylesheets:
            failures.append(
                f"{page_name}: canonical public navigation must load security-hardening.css"
            )
        validate_guide_navigation_current_state(page_name, failures)
        validate_guide_fragments(page_name, parser, failures)

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
    validate_guide_library_coverage(failures)

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
        f"{len(JS_FILES)} JavaScript files, including desktop navigation and Guide library behavior."
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
