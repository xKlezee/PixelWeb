#!/usr/bin/env python3
"""Build the public PixelWeb artifact from an explicit allowlist.

The repository contains release/security documentation and validation tooling that should
not become part of the hosted website merely because GitHub Pages publishes a branch root.
This script stages only browser-delivered product files into ``_site/``.
"""
from __future__ import annotations

import shutil
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "_site"

PUBLIC_ROOT_SUFFIXES = {".html", ".css", ".js"}
PUBLIC_ROOT_FILES = {
    ".nojekyll",
    "LOGO OFICIAL.png",
    "Video_Perfecto_Con_Fondo_Negro.mp4",
    "robots.txt",
    "sitemap.xml",
}
PUBLIC_DIRECTORIES = {"assets", "data"}


def copy_file(source: Path, destination: Path) -> None:
    destination.parent.mkdir(parents=True, exist_ok=True)
    shutil.copy2(source, destination)


def main() -> int:
    if OUTPUT.exists():
        shutil.rmtree(OUTPUT)
    OUTPUT.mkdir(parents=True)

    copied = 0

    for source in sorted(ROOT.iterdir(), key=lambda path: path.name.lower()):
        if source == OUTPUT:
            continue

        if source.is_file() and (
            source.name in PUBLIC_ROOT_FILES or source.suffix.lower() in PUBLIC_ROOT_SUFFIXES
        ):
            copy_file(source, OUTPUT / source.name)
            copied += 1
            continue

        if source.is_dir() and source.name in PUBLIC_DIRECTORIES:
            destination = OUTPUT / source.name
            shutil.copytree(source, destination, symlinks=False)
            copied += sum(1 for path in destination.rglob("*") if path.is_file())

    required = [OUTPUT / "index.html", OUTPUT / "404.html", OUTPUT / "sitemap.xml"]
    missing = [path.relative_to(OUTPUT) for path in required if not path.is_file()]
    if missing:
        print("Public-site build failed: required output is missing:")
        for path in missing:
            print(f"  {path}")
        return 1

    print(f"Public-site bundle built at {OUTPUT} with {copied} files.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
