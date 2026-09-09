#!/usr/bin/env python3
"""Fail CI when obvious secret material is committed to PixelWeb.

This scanner is intentionally conservative and dependency-free. It supplements,
but does not replace, GitHub secret scanning or a dedicated enterprise scanner.
"""
from __future__ import annotations

import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SKIP_DIRS = {".git", "node_modules", "dist", "build", "coverage", ".cache"}
SKIP_SUFFIXES = {
    ".png", ".jpg", ".jpeg", ".gif", ".webp", ".avif", ".ico", ".mp4",
    ".webm", ".mov", ".zip", ".gz", ".pdf", ".woff", ".woff2", ".ttf",
}

PATTERNS = {
    "private key": re.compile(r"-----BEGIN (?:RSA |EC |OPENSSH |DSA |PGP )?PRIVATE KEY-----"),
    "GitHub token": re.compile(r"\bgh[pousr]_[A-Za-z0-9_]{30,}\b"),
    "GitHub fine-grained token": re.compile(r"\bgithub_pat_[A-Za-z0-9_]{30,}\b"),
    "Slack token": re.compile(r"\bxox[baprs]-[A-Za-z0-9-]{20,}\b"),
    "Stripe live secret": re.compile(r"\bsk_live_[A-Za-z0-9]{20,}\b"),
    "Discord bot token-like value": re.compile(r"\b[A-Za-z0-9_-]{23,28}\.[A-Za-z0-9_-]{6}\.[A-Za-z0-9_-]{27,}\b"),
    "AWS access key": re.compile(r"\bAKIA[0-9A-Z]{16}\b"),
    "generic assigned secret": re.compile(
        r"(?i)(?:password|passwd|secret|private[_-]?key|client[_-]?secret|api[_-]?key|access[_-]?token)"
        r"\s*[:=]\s*['\"]([^'\"\s]{12,})['\"]"
    ),
}

# Files that are documentation/examples may legitimately contain pattern names.
ALLOWLIST_PATHS = {
    "SECURITY.md",
    "scripts/security_scan.py",
}


def iter_text_files():
    for path in ROOT.rglob("*"):
        if not path.is_file():
            continue
        rel = path.relative_to(ROOT)
        if any(part in SKIP_DIRS for part in rel.parts):
            continue
        if path.suffix.lower() in SKIP_SUFFIXES:
            continue
        if str(rel).replace("\\", "/") in ALLOWLIST_PATHS:
            continue
        try:
            text = path.read_text(encoding="utf-8")
        except (UnicodeDecodeError, OSError):
            continue
        yield rel, text


def main() -> int:
    findings: list[tuple[str, str, int]] = []
    for rel, text in iter_text_files():
        for name, pattern in PATTERNS.items():
            for match in pattern.finditer(text):
                line = text.count("\n", 0, match.start()) + 1
                findings.append((str(rel), name, line))

    if findings:
        print("Potential secret material detected:")
        for path, name, line in findings:
            print(f"  {path}:{line}: {name}")
        print("\nRotate any real credential before removing it from Git history.")
        return 1

    print("Security scan passed: no obvious committed secret material detected.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
