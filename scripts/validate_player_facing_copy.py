#!/usr/bin/env python3
"""Reject known internal engineering/audit phrases from browser-public player copy."""
from __future__ import annotations

import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

# Keep this deliberately narrow. Terms such as "source verified", formulas, stat keys,
# commands intended for players and evidence labels are legitimate public documentation.
# These phrases, however, describe repository/testing/deployment implementation rather
# than player-facing behavior and should stay in docs/, scripts/ or engineering notes.
FORBIDDEN_PATTERNS: tuple[tuple[re.Pattern[str], str], ...] = (
    (re.compile(r"\btest suite\b", re.IGNORECASE), "test-suite detail"),
    (re.compile(r"\bregression suite\b", re.IGNORECASE), "regression-suite detail"),
    (re.compile(r"\bpre-existing skipped test\b", re.IGNORECASE), "test-harness detail"),
    (re.compile(r"\bdatabase paths?\b", re.IGNORECASE), "database-path detail"),
    (re.compile(r"\bcommand (?:and |/)??menu wiring\b", re.IGNORECASE), "command/menu wiring detail"),
    (re.compile(r"\bmenu wiring\b", re.IGNORECASE), "menu-wiring detail"),
    (re.compile(r"\bplayer-facing wiring\b", re.IGNORECASE), "implementation wiring detail"),
    (re.compile(r"\bsource-ready\b", re.IGNORECASE), "source/deployment state"),
    (re.compile(r"\bdeployment pending\b", re.IGNORECASE), "deployment state"),
    (re.compile(r"\bpending deployment\b", re.IGNORECASE), "deployment state"),
    (re.compile(r"\bactive runtime\b", re.IGNORECASE), "runtime implementation detail"),
    (re.compile(r"\bimplementation layer\b", re.IGNORECASE), "implementation-layer detail"),
    (re.compile(r"\bproducer-to-consumer\b", re.IGNORECASE), "audit-path terminology"),
    (re.compile(r"\bcombat snapshot\b", re.IGNORECASE), "combat-pipeline implementation detail"),
    (re.compile(r"\brepository baseline\b", re.IGNORECASE), "repository-test detail"),
)


def public_copy_files() -> list[Path]:
    files: set[Path] = set(ROOT.glob("*.html"))
    files.update(ROOT.glob("guide-*.js"))
    files.update(ROOT.glob("*-stage*.js"))
    files.update((ROOT / "data").glob("*.js"))
    files.update((ROOT / "data" / "guides").glob("*.js"))
    return sorted(path for path in files if path.is_file() and not path.is_symlink())


def main() -> int:
    failures: list[str] = []
    files = public_copy_files()

    for path in files:
        text = path.read_text(encoding="utf-8")
        relative = path.relative_to(ROOT)
        for pattern, label in FORBIDDEN_PATTERNS:
            for match in pattern.finditer(text):
                line = text.count("\n", 0, match.start()) + 1
                failures.append(
                    f"{relative}:{line}: browser-public player copy contains {label}: {match.group(0)!r}"
                )

    if failures:
        print("Player-facing copy validation failed:")
        for failure in failures:
            print(f"  {failure}")
        return 1

    print(
        f"Player-facing copy validation passed for {len(files)} browser-public HTML/data/renderer files."
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
