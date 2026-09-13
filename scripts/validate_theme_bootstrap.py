#!/usr/bin/env python3
"""Guard PixelWeb's synchronous theme/bootstrap ordering contract."""
from __future__ import annotations

import html.parser
from dataclasses import dataclass
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
HTML_FILES = sorted(ROOT.glob("*.html"))
BOOTSTRAP_SRC = "pixel-theme-bootstrap.js"
NETWORK_SRC = "data/network.js"


@dataclass(frozen=True)
class ScriptRef:
    src: str
    line: int
    in_head: bool
    deferred: bool
    asynchronous: bool


class ScriptParser(html.parser.HTMLParser):
    def __init__(self) -> None:
        super().__init__(convert_charrefs=True)
        self.in_head = False
        self.scripts: list[ScriptRef] = []

    def handle_starttag(self, tag: str, attrs) -> None:
        tag = tag.lower()
        attrs_dict = dict(attrs)

        if tag == "head":
            self.in_head = True
            return

        if tag != "script":
            return

        src = str(attrs_dict.get("src") or "").strip()
        if not src:
            return

        line, _ = self.getpos()
        self.scripts.append(
            ScriptRef(
                src=src,
                line=line,
                in_head=self.in_head,
                deferred="defer" in attrs_dict,
                asynchronous="async" in attrs_dict,
            )
        )

    def handle_endtag(self, tag: str) -> None:
        if tag.lower() == "head":
            self.in_head = False


def main() -> int:
    failures: list[str] = []
    guarded_pages = 0

    for page in HTML_FILES:
        if page.is_symlink() or not page.is_file():
            continue

        parser = ScriptParser()
        try:
            parser.feed(page.read_text(encoding="utf-8"))
            parser.close()
        except (OSError, UnicodeError) as exc:
            failures.append(f"{page.name}: unable to parse HTML ({exc})")
            continue

        network_refs = [ref for ref in parser.scripts if ref.src == NETWORK_SRC]
        if not network_refs:
            continue

        guarded_pages += 1
        bootstrap_refs = [ref for ref in parser.scripts if ref.src == BOOTSTRAP_SRC]

        if len(network_refs) != 1:
            failures.append(
                f"{page.name}: expected exactly one {NETWORK_SRC} script, found {len(network_refs)}"
            )
            continue

        if len(bootstrap_refs) != 1:
            failures.append(
                f"{page.name}: pages loading {NETWORK_SRC} must load exactly one {BOOTSTRAP_SRC}; "
                f"found {len(bootstrap_refs)}"
            )
            continue

        network = network_refs[0]
        bootstrap = bootstrap_refs[0]

        if not bootstrap.in_head:
            failures.append(f"{page.name}:{bootstrap.line}: {BOOTSTRAP_SRC} must load inside <head>")
        if bootstrap.deferred or bootstrap.asynchronous:
            failures.append(
                f"{page.name}:{bootstrap.line}: {BOOTSTRAP_SRC} must remain synchronous "
                "(no defer/async)"
            )
        if not network.in_head:
            failures.append(f"{page.name}:{network.line}: {NETWORK_SRC} must load inside <head>")
        if not network.deferred or network.asynchronous:
            failures.append(
                f"{page.name}:{network.line}: {NETWORK_SRC} must remain defer-only "
                "(defer required, async forbidden)"
            )
        if bootstrap.line >= network.line:
            failures.append(
                f"{page.name}: {BOOTSTRAP_SRC} must appear before {NETWORK_SRC} "
                f"({bootstrap.line} >= {network.line})"
            )

    bootstrap_path = ROOT / BOOTSTRAP_SRC
    if bootstrap_path.is_symlink() or not bootstrap_path.is_file():
        failures.append(f"{BOOTSTRAP_SRC}: bootstrap must exist as a regular root file")

    if guarded_pages == 0:
        failures.append(f"no HTML page loads {NETWORK_SRC}; theme bootstrap contract was not exercised")

    if failures:
        print("Theme bootstrap validation failed:")
        for failure in failures:
            print(f"  {failure}")
        return 1

    print(
        f"Theme bootstrap validation passed for {guarded_pages} pages loading {NETWORK_SRC}: "
        f"{BOOTSTRAP_SRC} is synchronous, head-scoped and ordered first."
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
