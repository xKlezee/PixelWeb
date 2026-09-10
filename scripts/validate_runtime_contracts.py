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

DIRECT_STYLE_ASSIGNMENT_RE = re.compile(r"\.style\s*=")
DEFERRED_URL_ATTRS = {"data-src", "data-poster"}


class DeferredMediaParser(html.parser.HTMLParser):
    def __init__(self) -> None:
        super().__init__(convert_charrefs=True)
        self.urls: list[tuple[str, str, int]] = []

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


def main() -> int:
    failures: list[str] = []

    for page in HTML_FILES:
        parser = DeferredMediaParser()
        parser.feed(page.read_text(encoding="utf-8"))
        parser.close()
        for attr, value, line in parser.urls:
            validate_deferred_url(page, attr, value, line, failures)

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
        f"{len(JS_FILES)} JavaScript files."
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
