#!/usr/bin/env python3
"""Verify byte-level integrity of approved PixelWeb media that must not be recompressed."""
from __future__ import annotations

import hashlib
import struct
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

APPROVED_PNGS = {
    "assets/nexus/raphael.png": {
        "git_blob_sha": "ad9da67e298b85b09e5421396a566d3f1ac6e39b",
        "size": 2120449,
        "width": 1448,
        "height": 1086,
    },
    "assets/nexus/azazel.png": {
        "git_blob_sha": "938eb184ec9babbf6e2bae4b38d68fef0b3d3182",
        "size": 2112088,
        "width": 1448,
        "height": 1086,
    },
    "assets/nexus/abyss.png": {
        "git_blob_sha": "b5b0a47ee6d4b530311f098585b225024dcc009f",
        "size": 2098557,
        "width": 1448,
        "height": 1086,
    },
    "assets/nexus/astral.png": {
        "git_blob_sha": "54038840086922a0a90aab0f0ad9485db17184cc",
        "size": 2159709,
        "width": 1448,
        "height": 1086,
    },
}

PNG_SIGNATURE = b"\x89PNG\r\n\x1a\n"


def git_blob_sha(data: bytes) -> str:
    header = f"blob {len(data)}\0".encode("ascii")
    return hashlib.sha1(header + data).hexdigest()


def png_dimensions(data: bytes) -> tuple[int, int] | None:
    if len(data) < 24 or data[:8] != PNG_SIGNATURE or data[12:16] != b"IHDR":
        return None
    return struct.unpack(">II", data[16:24])


def main() -> int:
    failures: list[str] = []

    for relative, expected in APPROVED_PNGS.items():
        path = ROOT / relative
        if not path.is_file():
            failures.append(f"{relative}: approved source file is missing")
            continue

        data = path.read_bytes()
        actual_size = len(data)
        if actual_size != expected["size"]:
            failures.append(
                f"{relative}: byte size changed ({actual_size} != {expected['size']}); "
                "do not recompress, resize or replace this approved PNG"
            )

        dimensions = png_dimensions(data)
        expected_dimensions = (expected["width"], expected["height"])
        if dimensions != expected_dimensions:
            failures.append(
                f"{relative}: PNG dimensions changed ({dimensions} != {expected_dimensions})"
            )

        actual_blob_sha = git_blob_sha(data)
        if actual_blob_sha != expected["git_blob_sha"]:
            failures.append(
                f"{relative}: source bytes changed ({actual_blob_sha} != {expected['git_blob_sha']}); "
                "approved Nexus PNGs must remain byte-identical"
            )

    if failures:
        print("Approved media integrity validation failed:")
        for failure in failures:
            print(f"  {failure}")
        return 1

    print(f"Approved media integrity passed for {len(APPROVED_PNGS)} Nexus PNG files.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
