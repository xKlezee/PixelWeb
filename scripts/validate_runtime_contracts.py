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
NAVIGATION_PAGE_EXCEPTIONS = {"forum.html", "development.html"}

GUIDE_NAV_CATEGORY_BY_PAGE = {
    "guide-getting-started.html": "getting-started",
    "guide-currencies.html": "currencies",
    "guide-basic-commands.html": "basic-commands",
    "guide-progression.html": "progression",
    "guide-worlds.html": "progression",
    "guide-nexus.html": "specials",
    "guide-skyblock.html": "mechanics",
    "guide-stats-equipment.html": "armor",
    "guide-talismans.html": "specials",
    "guide-enchantments.html": "boosts",
}

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
WIKI_ENTRY_TARGET_RE = re.compile(
    r"<a\b(?=[^>]*\bdata-wiki-entry\b)(?=[^>]*\bhref=['\"]"
    r"(guide-[A-Za-z0-9._-]+\.html)['\"])[^>]*>",
    re.IGNORECASE,
)
WIKI_SEARCH_COUNT_RE = re.compile(
    r"<[^>]+\bdata-wiki-search-count\b[^>]*>\s*(\d+)\s+"
    r"(?:article|articles)\s*</[^>]+>",
    re.IGNORECASE,
)


class DeferredMediaParser(html.parser.HTMLParser):
    def __init__(self) -> None:
        super().__init__(convert_charrefs=True)
        self.urls: list[tuple[str, str, int]] = []
        self.stylesheets: set[str] = set()
        self.ids: set[str] = set()
        self.anchor_hrefs: list[tuple[str, int]] = []

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
            if href:
                self.anchor_hrefs.append((href, line))

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


def validate_local_anchor_fragments(
    page_name: str,
    parser: DeferredMediaParser,
    page_parsers: dict[str, DeferredMediaParser],
    failures: list[str],
) -> None:
    root = ROOT.resolve()

    for href, line in parser.anchor_hrefs:
        parts = urlsplit(href)
        if parts.scheme or parts.netloc or not parts.fragment:
            continue

        fragment = unquote(parts.fragment)
        if not fragment:
            continue

        if not parts.path:
            target_name = page_name
        else:
            target = (ROOT / unquote(parts.path).lstrip("/")).resolve()
            try:
                target.relative_to(root)
            except ValueError:
                # Repository-root escape is already rejected by validate_site.py.
                continue

            if target.parent != root or target.suffix.lower() != ".html":
                continue
            target_name = target.name

        target_parser = page_parsers.get(target_name)
        if target_parser is None:
            # Missing local files are already rejected by validate_site.py.
            continue

        if fragment not in target_parser.ids:
            failures.append(
                f"{page_name}:{line}: local fragment link points to missing target "
                f"{target_name}#{fragment}"
            )


def validate_guide_navigation_current_state(page_name: str, failures: list[str]) -> None:
    if not page_name.startswith("guide-") or not page_name.endswith(".html"):
        return

    expected_category = GUIDE_NAV_CATEGORY_BY_PAGE.get(page_name)
    if expected_category is None:
        failures.append(
            f"{page_name}: detailed Guide page is missing a canonical Guide-category mapping"
        )
        return

    text = (ROOT / page_name).read_text(encoding="utf-8")
    nav_match = SITE_NAV_RE.search(text)
    if not nav_match:
        failures.append(f"{page_name}: Guide page is missing the canonical site navigation")
        return

    current_hrefs = CURRENT_NAV_LINK_RE.findall(nav_match.group(1))
    expected_href = f"guides.html#{expected_category}"
    if current_hrefs != [expected_href]:
        rendered = ", ".join(current_hrefs) if current_hrefs else "none"
        failures.append(
            f"{page_name}: Guide navbar must mark exactly {expected_href} as aria-current=page "
            f"(found: {rendered})"
        )


def validate_guide_library_coverage(failures: list[str]) -> None:
    index = ROOT / "guides.html"
    if not index.is_file() or index.is_symlink():
        failures.append("guides.html: Guide library index must be a regular file")
        return

    text = index.read_text(encoding="utf-8")
    targets = WIKI_ENTRY_TARGET_RE.findall(text)
    unique_targets = set(targets)

    actual_guides = sorted(
        path.name
        for path in ROOT.glob("guide-*.html")
        if path.is_file() and not path.is_symlink()
    )
    actual_set = set(actual_guides)

    missing = sorted(actual_set - unique_targets)
    extra = sorted(unique_targets - actual_set)
    if missing:
        failures.append(
            "guides.html: Wiki is missing detailed pages: " + ", ".join(missing)
        )
    if extra:
        failures.append(
            "guides.html: Wiki points to undeclared detailed pages: " + ", ".join(extra)
        )
    if len(unique_targets) != len(actual_guides):
        failures.append(
            f"guides.html: unique Wiki article count ({len(unique_targets)}) must match detailed "
            f"Guide page count ({len(actual_guides)})"
        )

    count_matches = WIKI_SEARCH_COUNT_RE.findall(text)
    if len(count_matches) != 1:
        failures.append(
            f"guides.html: expected exactly one static data-wiki-search-count summary, "
            f"found {len(count_matches)}"
        )
    elif int(count_matches[0]) != len(actual_guides):
        failures.append(
            f"guides.html: static Wiki article count ({count_matches[0]}) must match detailed "
            f"Guide page count ({len(actual_guides)})"
        )


def validate_navigation_contract(
    page_parsers: dict[str, DeferredMediaParser],
    failures: list[str],
) -> None:
    for page_name, parser in page_parsers.items():
        if page_name not in NAVIGATION_PAGE_EXCEPTIONS and "security-hardening.css" not in parser.stylesheets:
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
            "security-hardening.css: desktop Explore/Guide/Community controls must remain "
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

    for page_name, parser in page_parsers.items():
        validate_local_anchor_fragments(page_name, parser, page_parsers, failures)

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
        f"{len(JS_FILES)} JavaScript files, including local fragment targets, desktop navigation "
        "and Guide Wiki behavior."
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
