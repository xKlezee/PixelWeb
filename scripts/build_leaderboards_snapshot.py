#!/usr/bin/env python3
"""Build a browser-public ready leaderboard snapshot from trusted ranking rows.

This utility deliberately has no database/network integration. A trusted producer supplies only
`generatedAt` plus ranked rows for each canonical metric. PixelWeb owns the public catalogue copy
and this script merges the trusted rows into the current catalogue before writing JSON.
"""
from __future__ import annotations

import argparse
import copy
import json
import os
import tempfile
from datetime import datetime
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
TEMPLATE_PATH = ROOT / "data" / "leaderboards.json"
READY_AUTHORITY = "pixel-server-export"
READY_LABEL = "Pixel Network live records"


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description=(
            "Merge a trusted leaderboard export into PixelWeb's canonical public catalogue. "
            "The input file contains generatedAt plus metric rows only; it never owns public copy."
        )
    )
    parser.add_argument("--input", required=True, type=Path, help="Trusted producer JSON input")
    parser.add_argument(
        "--output",
        type=Path,
        default=None,
        help="Output path. Omit to print the generated snapshot to stdout.",
    )
    return parser.parse_args()


def read_regular_json(path: Path, label: str) -> dict:
    try:
        stat = path.lstat()
    except OSError as exc:
        raise ValueError(f"{label}: unable to stat {path} ({exc})") from exc
    if not stat.is_file() or path.is_symlink():
        raise ValueError(f"{label}: {path} must be a regular non-symlink file")

    try:
        value = json.loads(path.read_text(encoding="utf-8"))
    except (OSError, UnicodeError, json.JSONDecodeError) as exc:
        raise ValueError(f"{label}: unable to read valid UTF-8 JSON from {path} ({exc})") from exc
    if not isinstance(value, dict):
        raise ValueError(f"{label}: root must be a JSON object")
    return value


def valid_iso_timestamp(value: object) -> bool:
    if not isinstance(value, str) or not value.strip():
        return False
    candidate = value.strip().replace("Z", "+00:00")
    try:
        parsed = datetime.fromisoformat(candidate)
    except ValueError:
        return False
    return parsed.tzinfo is not None


def catalog_metric_ids(template: dict) -> list[str]:
    categories = template.get("categories")
    if not isinstance(categories, list) or not categories:
        raise ValueError("template: categories must be a non-empty array")

    metric_ids: list[str] = []
    seen: set[str] = set()
    for category in categories:
        if not isinstance(category, dict):
            raise ValueError("template: every category must be an object")
        category_id = str(category.get("id") or "").strip() or "unknown"
        metrics = category.get("metrics")
        if not isinstance(metrics, list) or not metrics:
            raise ValueError(f"template: {category_id} must contain a non-empty metrics array")
        for metric in metrics:
            if not isinstance(metric, dict):
                raise ValueError(f"template: {category_id} contains a non-object metric")
            metric_id = str(metric.get("id") or "").strip()
            if not metric_id:
                raise ValueError(f"template: {category_id} contains a metric without an id")
            if metric_id in seen:
                raise ValueError(f"template: duplicate metric id {metric_id!r}")
            seen.add(metric_id)
            metric_ids.append(metric_id)
    return metric_ids


def validate_rows(metric_id: str, rows: object) -> list[dict]:
    if not isinstance(rows, list):
        raise ValueError(f"input: metrics.{metric_id} must be an array")

    normalized: list[dict] = []
    ranks: set[int] = set()
    players: set[str] = set()

    for index, row in enumerate(rows, start=1):
        if not isinstance(row, dict):
            raise ValueError(f"input: metrics.{metric_id}[{index}] must be an object")
        if set(row) != {"rank", "player", "value"}:
            raise ValueError(
                f"input: metrics.{metric_id}[{index}] must contain exactly rank/player/value"
            )

        rank = row.get("rank")
        player = row.get("player")
        value = row.get("value")

        if not isinstance(rank, int) or isinstance(rank, bool) or rank <= 0:
            raise ValueError(f"input: metrics.{metric_id}[{index}].rank must be a positive integer")
        if rank in ranks:
            raise ValueError(f"input: metrics.{metric_id} contains duplicate rank {rank}")
        ranks.add(rank)

        if not isinstance(player, str) or not player.strip():
            raise ValueError(f"input: metrics.{metric_id}[{index}].player must be a non-empty string")
        player_clean = player.strip()
        player_key = player_clean.casefold()
        if player_key in players:
            raise ValueError(f"input: metrics.{metric_id} contains duplicate player {player_clean!r}")
        players.add(player_key)

        if not isinstance(value, str) or not value.strip():
            raise ValueError(f"input: metrics.{metric_id}[{index}].value must be a non-empty string")

        normalized.append({"rank": rank, "player": player_clean, "value": value.strip()})

    normalized.sort(key=lambda entry: entry["rank"])
    expected_ranks = list(range(1, len(normalized) + 1))
    actual_ranks = [entry["rank"] for entry in normalized]
    if actual_ranks != expected_ranks:
        raise ValueError(
            f"input: metrics.{metric_id} ranks must be contiguous from 1; "
            f"expected {expected_ranks!r}, found {actual_ranks!r}"
        )
    return normalized


def validate_input(payload: dict, expected_metric_ids: list[str]) -> tuple[str, dict[str, list[dict]]]:
    if set(payload) != {"generatedAt", "metrics"}:
        raise ValueError("input: root must contain exactly generatedAt and metrics")

    generated_at = payload.get("generatedAt")
    if not valid_iso_timestamp(generated_at):
        raise ValueError("input: generatedAt must be a timezone-aware ISO-8601 timestamp")

    metrics = payload.get("metrics")
    if not isinstance(metrics, dict):
        raise ValueError("input: metrics must be an object keyed by canonical metric id")

    expected = set(expected_metric_ids)
    actual = set(metrics)
    missing = sorted(expected - actual)
    extra = sorted(actual - expected)
    if missing or extra:
        parts: list[str] = []
        if missing:
            parts.append("missing: " + ", ".join(missing))
        if extra:
            parts.append("unexpected: " + ", ".join(extra))
        raise ValueError("input: metrics must match the canonical catalogue exactly (" + "; ".join(parts) + ")")

    rows_by_metric = {
        metric_id: validate_rows(metric_id, metrics[metric_id]) for metric_id in expected_metric_ids
    }
    return str(generated_at).strip(), rows_by_metric


def build_snapshot(template: dict, generated_at: str, rows_by_metric: dict[str, list[dict]]) -> dict:
    snapshot = copy.deepcopy(template)
    snapshot["schemaVersion"] = 3
    snapshot["source"] = {
        "state": "ready",
        "authority": READY_AUTHORITY,
        "label": READY_LABEL,
        "generatedAt": generated_at,
    }

    for category in snapshot["categories"]:
        for metric in category["metrics"]:
            metric["entries"] = rows_by_metric[metric["id"]]
    return snapshot


def write_atomic(path: Path, text: str) -> None:
    destination = path.resolve()
    destination.parent.mkdir(parents=True, exist_ok=True)
    fd, temporary_name = tempfile.mkstemp(
        prefix=f".{destination.name}.", suffix=".tmp", dir=destination.parent, text=True
    )
    temporary = Path(temporary_name)
    try:
        with os.fdopen(fd, "w", encoding="utf-8", newline="\n") as handle:
            handle.write(text)
            handle.flush()
            os.fsync(handle.fileno())
        os.replace(temporary, destination)
    except Exception:
        try:
            temporary.unlink(missing_ok=True)
        finally:
            raise


def main() -> int:
    args = parse_args()
    try:
        template = read_regular_json(TEMPLATE_PATH, "template")
        expected_metric_ids = catalog_metric_ids(template)
        payload = read_regular_json(args.input.resolve(), "input")
        generated_at, rows_by_metric = validate_input(payload, expected_metric_ids)
        snapshot = build_snapshot(template, generated_at, rows_by_metric)
    except ValueError as exc:
        print(f"Leaderboard snapshot build failed: {exc}")
        return 1

    output_text = json.dumps(snapshot, ensure_ascii=False, indent=2) + "\n"
    if args.output is None:
        print(output_text, end="")
        return 0

    try:
        write_atomic(args.output, output_text)
    except OSError as exc:
        print(f"Leaderboard snapshot build failed: unable to write {args.output} ({exc})")
        return 1

    print(
        f"Leaderboard snapshot built: {len(expected_metric_ids)} canonical metrics -> {args.output}"
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
