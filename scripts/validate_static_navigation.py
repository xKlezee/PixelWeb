#!/usr/bin/env python3
"""Validate the static no-JS navigation contract across PixelWeb public HTML."""
from __future__ import annotations

import html.parser
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
HTML_FILES = sorted(ROOT.glob("*.html"))
NAVIGATION_EXCEPTIONS = {"forum.html", "development.html"}
NAV_CONTRACT = "canonical-v1"

EXPECTED_DESTINATIONS = [
    "gameplay.html",
    "systems.html",
    "worlds.html",
    "skyblock.html",
    "nexus.html",
    "marketplace.html",
    "guides.html#getting-started",
    "guides.html#currencies",
    "guides.html#basic-commands",
    "guides.html#progression",
    "guides.html#mechanics",
    "guides.html#tools",
    "guides.html#armor",
    "guides.html#specials",
    "guides.html#boosts",
    "leaderboards.html",
    "changelog.html",
    "rules.html",
    "staff.html",
    "team.html",
]


class StaticNavigationParser(html.parser.HTMLParser):
    def __init__(self) -> None:
        super().__init__(convert_charrefs=True)
        self.navlinks_count = 0
        self.contracts: list[str] = []
        self.destinations: list[str] = []
        self._navlinks_depth = 0

    def handle_starttag(self, tag: str, attrs) -> None:
        tag = tag.lower()
        attrs_dict = {str(key).lower(): value for key, value in attrs if key}

        if self._navlinks_depth:
            self._navlinks_depth += 1
            if tag == "a":
                href = str(attrs_dict.get("href") or "").strip()
                if href:
                    self.destinations.append(href)
            return

        if tag == "div" and str(attrs_dict.get("id") or "").strip() == "navLinks":
            self.navlinks_count += 1
            self.contracts.append(str(attrs_dict.get("data-nav-contract") or "").strip())
            self._navlinks_depth = 1

    def handle_startendtag(self, tag: str, attrs) -> None:
        self.handle_starttag(tag, attrs)
        if self._navlinks_depth:
            self._navlinks_depth -= 1

    def handle_endtag(self, tag: str) -> None:
        if self._navlinks_depth:
            self._navlinks_depth -= 1


def main() -> int:
    failures: list[str] = []

    for page in HTML_FILES:
        parser = StaticNavigationParser()
        parser.feed(page.read_text(encoding="utf-8"))
        parser.close()

        if page.name in NAVIGATION_EXCEPTIONS:
            if parser.navlinks_count:
                failures.append(
                    f"{page.name}: legacy redirect must not expose canonical product navigation"
                )
            continue

        if parser.navlinks_count != 1:
            failures.append(
                f"{page.name}: expected exactly one #navLinks container, found {parser.navlinks_count}"
            )
            continue

        contract = parser.contracts[0] if parser.contracts else ""
        if contract != NAV_CONTRACT:
            failures.append(
                f"{page.name}: #navLinks data-nav-contract must be {NAV_CONTRACT!r}, found {contract!r}"
            )

        if parser.destinations != EXPECTED_DESTINATIONS:
            failures.append(
                f"{page.name}: static navigation destinations/order differ from {NAV_CONTRACT}; "
                f"expected {EXPECTED_DESTINATIONS!r}, found {parser.destinations!r}"
            )

    if failures:
        print("Static navigation validation failed:")
        for failure in failures:
            print(f"  {failure}")
        return 1

    checked = len(HTML_FILES) - len(NAVIGATION_EXCEPTIONS)
    print(
        f"Static navigation validation passed for {checked} canonical HTML surfaces "
        f"with {len(EXPECTED_DESTINATIONS)} ordered destinations."
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
