#!/usr/bin/env python3
"""Fail CI when obvious secret material is committed to PixelWeb.

This scanner is intentionally dependency-free. It protects the current static site
and the future auth/backend boundary, but does not replace provider-side secret
scanning or credential rotation after exposure.
"""
from __future__ import annotations

import re
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
    "OpenAI-style secret key": re.compile(r"\bsk-(?:proj-|svcacct-)?[A-Za-z0-9_-]{24,}\b"),
    "Google API key": re.compile(r"\bAIza[0-9A-Za-z_-]{35}\b"),
    "AWS access key": re.compile(r"\bAKIA[0-9A-Z]{16}\b"),
    "Discord bot token-like value": re.compile(r"\b[A-Za-z0-9_-]{23,28}\.[A-Za-z0-9_-]{6}\.[A-Za-z0-9_-]{27,}\b"),
    "Discord webhook": re.compile(r"https://(?:canary\.|ptb\.)?discord(?:app)?\.com/api/webhooks/\d{10,}/[A-Za-z0-9._-]{20,}"),
    "literal bearer token": re.compile(r"(?i)\bBearer\s+[A-Za-z0-9._~+/-]{24,}=*"),
    "database URL with password": re.compile(
        r"(?i)\b(?:postgres(?:ql)?|mysql|mariadb|mongodb(?:\+srv)?)://"
        r"[^\s:/]+:[^\s/@]{4,}@[^\s]+"
    ),
    "generic assigned secret": re.compile(
        r"(?i)(?:password|passwd|secret|private[_-]?key|client[_-]?secret|api[_-]?key|"
        r"access[_-]?token|service[_-]?role[_-]?key|signing[_-]?secret|webhook[_-]?secret)"
        r"\s*[:=]\s*['\"]([^'\"\s]{12,})['\"]"
    ),
}

# These files necessarily contain scanner pattern text or security examples.
ALLOWLIST_PATHS = {
    "SECURITY.md",
    "scripts/security_scan.py",
}

PLACEHOLDER_MARKERS = {
    "changeme",
    "example",
    "placeholder",
    "replace_me",
    "replace-me",
    "your_",
    "your-",
    "dummy",
    "not-a-secret",
}


def looks_like_placeholder(value: str) -> bool:
    normalized = value.strip().strip("'\"").lower()
    return any(marker in normalized for marker in PLACEHOLDER_MARKERS)


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
                matched_value = match.group(1) if match.lastindex else match.group(0)
                if looks_like_placeholder(matched_value):
                    continue
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
