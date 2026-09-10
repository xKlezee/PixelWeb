#!/usr/bin/env python3
"""Dependency-free structural accessibility checks for PixelWeb public HTML."""
from __future__ import annotations

import html.parser
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
HTML_FILES = sorted(ROOT.glob("*.html"))


class AccessibilityParser(html.parser.HTMLParser):
    def __init__(self) -> None:
        super().__init__(convert_charrefs=True)
        self.lang: str | None = None
        self.viewport: str | None = None
        self.description: str | None = None
        self.robots: str = ""
        self.main_count = 0
        self.images_without_alt: list[int] = []
        self.labels_for: set[str] = set()
        self.element_ids: set[str] = set()
        self.text_controls: list[tuple[str, str, str, str, int]] = []
        self._in_title = False
        self._title_parts: list[str] = []

    @property
    def title(self) -> str:
        return "".join(self._title_parts).strip()

    def handle_starttag(self, tag: str, attrs) -> None:
        tag = tag.lower()
        attrs_dict = dict(attrs)
        line, _ = self.getpos()

        element_id = str(attrs_dict.get("id") or "").strip()
        if element_id:
            self.element_ids.add(element_id)

        if tag == "html":
            self.lang = str(attrs_dict.get("lang") or "").strip() or None
        elif tag == "main":
            self.main_count += 1
        elif tag == "img" and "alt" not in attrs_dict:
            self.images_without_alt.append(line)
        elif tag == "title":
            self._in_title = True
        elif tag == "meta":
            name = str(attrs_dict.get("name") or "").lower()
            content = str(attrs_dict.get("content") or "").strip()
            if name == "viewport":
                self.viewport = content or None
            elif name == "description":
                self.description = content or None
            elif name == "robots":
                self.robots = content.lower()
        elif tag == "label":
            target = str(attrs_dict.get("for") or "").strip()
            if target:
                self.labels_for.add(target)
        elif tag in {"input", "textarea"}:
            input_type = str(attrs_dict.get("type") or "text").strip().lower()
            if tag == "input" and input_type == "hidden":
                return
            self.text_controls.append((
                tag,
                element_id,
                str(attrs_dict.get("aria-label") or "").strip(),
                str(attrs_dict.get("aria-labelledby") or "").strip(),
                line,
            ))

    def handle_endtag(self, tag: str) -> None:
        if tag.lower() == "title":
            self._in_title = False

    def handle_data(self, data: str) -> None:
        if self._in_title:
            self._title_parts.append(data)


def validate_text_controls(page: Path, parser: AccessibilityParser, failures: list[str]) -> None:
    for tag, element_id, aria_label, aria_labelledby, line in parser.text_controls:
        if aria_label:
            continue

        if aria_labelledby:
            referenced_ids = [token for token in aria_labelledby.split() if token]
            missing = [token for token in referenced_ids if token not in parser.element_ids]
            if not referenced_ids or missing:
                detail = ", ".join(missing) if missing else "no ids"
                failures.append(
                    f"{page.name}:{line}: <{tag}> aria-labelledby references missing target(s): {detail}"
                )
            continue

        if element_id and element_id in parser.labels_for:
            continue

        control = f"#{element_id}" if element_id else f"<{tag}>"
        failures.append(
            f"{page.name}:{line}: text control {control} requires an associated <label>, "
            "aria-label or valid aria-labelledby"
        )


def main() -> int:
    failures: list[str] = []

    for page in HTML_FILES:
        parser = AccessibilityParser()
        parser.feed(page.read_text(encoding="utf-8"))
        parser.close()

        if not parser.lang:
            failures.append(f"{page.name}: html element must declare lang")
        if not parser.viewport:
            failures.append(f"{page.name}: missing viewport meta")
        if not parser.title:
            failures.append(f"{page.name}: missing non-empty title")
        if parser.main_count != 1:
            failures.append(f"{page.name}: expected exactly one <main>, found {parser.main_count}")

        noindex = "noindex" in {token.strip() for token in parser.robots.split(",") if token.strip()}
        if not noindex and not parser.description:
            failures.append(f"{page.name}: indexable page requires a non-empty meta description")

        for line in parser.images_without_alt:
            failures.append(f"{page.name}:{line}: <img> must declare alt, including alt=\"\" for decorative images")

        validate_text_controls(page, parser, failures)

    if failures:
        print("Accessibility structure validation failed:")
        for failure in failures:
            print(f"  {failure}")
        return 1

    print(f"Accessibility structure validation passed for {len(HTML_FILES)} HTML pages.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
