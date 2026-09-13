#!/usr/bin/env python3
"""Validate the browser-public PixelWeb leaderboard snapshot contract."""
from __future__ import annotations

import json
import re
from datetime import datetime
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
JSON_PATH = ROOT / "data" / "leaderboards.json"
JS_PATH = ROOT / "data" / "leaderboards.js"

EXPECTED_CATALOG = {
    "mining": ["blocks-mined"],
    "economy": ["money", "money-earned", "nexus-points"],
    "progression": ["level", "prestige", "legacy", "quests-completed"],
    "combat": ["kills", "boss-kills"],
    "skyblock": ["island-level", "skyblock-quests"],
    "nexus": [
        "raphael-kills",
        "azazel-kills",
        "abyss-astral-kills",
        "instance-clears",
        "highest-difficulty",
        "fastest-clear",
    ],
    "collection": ["bestiary-completion", "talisman-codex"],
}

FORBIDDEN_PUBLIC_FIXTURE_TOKENS = (
    "testRoster",
    "testValues",
    "pixel-test-fixture",
    "state: 'test'",
    '"state": "test"',
)


def valid_iso_timestamp(value: object) -> bool:
    if not isinstance(value, str) or not value.strip():
        return False
    candidate = value.strip().replace("Z", "+00:00")
    try:
        parsed = datetime.fromisoformat(candidate)
    except ValueError:
        return False
    return parsed.tzinfo is not None


def validate_catalog(data: dict, failures: list[str]) -> None:
    categories = data.get("categories")
    if not isinstance(categories, list):
        failures.append("data/leaderboards.json: categories must be an array")
        return

    actual_category_ids = [str(category.get("id") or "") for category in categories if isinstance(category, dict)]
    expected_category_ids = list(EXPECTED_CATALOG)
    if actual_category_ids != expected_category_ids:
        failures.append(
            "data/leaderboards.json: category order must remain canonical; "
            f"expected {expected_category_ids!r}, found {actual_category_ids!r}"
        )

    for category in categories:
        if not isinstance(category, dict):
            failures.append("data/leaderboards.json: every category must be an object")
            continue
        category_id = str(category.get("id") or "")
        metrics = category.get("metrics")
        if not isinstance(metrics, list):
            failures.append(f"data/leaderboards.json: {category_id or 'unknown category'} metrics must be an array")
            continue

        actual_metric_ids = [str(metric.get("id") or "") for metric in metrics if isinstance(metric, dict)]
        expected_metric_ids = EXPECTED_CATALOG.get(category_id)
        if expected_metric_ids is None:
            continue
        if actual_metric_ids != expected_metric_ids:
            failures.append(
                f"data/leaderboards.json: {category_id} metric order must remain canonical; "
                f"expected {expected_metric_ids!r}, found {actual_metric_ids!r}"
            )


def validate_entries(data: dict, state: str, failures: list[str]) -> None:
    seen_players_by_metric: dict[tuple[str, str], set[str]] = {}

    for category in data.get("categories", []):
        if not isinstance(category, dict):
            continue
        category_id = str(category.get("id") or "")
        for metric in category.get("metrics", []):
            if not isinstance(metric, dict):
                continue
            metric_id = str(metric.get("id") or "")
            entries = metric.get("entries")
            if not isinstance(entries, list):
                failures.append(f"data/leaderboards.json: {category_id}/{metric_id} entries must be an array")
                continue

            if state == "pending" and entries:
                failures.append(
                    f"data/leaderboards.json: pending snapshot must not publish rows ({category_id}/{metric_id})"
                )
                continue

            ranks: set[int] = set()
            players = seen_players_by_metric.setdefault((category_id, metric_id), set())
            for entry in entries:
                if not isinstance(entry, dict):
                    failures.append(f"data/leaderboards.json: {category_id}/{metric_id} entry must be an object")
                    continue
                rank = entry.get("rank")
                player = str(entry.get("player") or "").strip()
                value = str(entry.get("value") or "").strip()
                if not isinstance(rank, int) or isinstance(rank, bool) or rank <= 0:
                    failures.append(f"data/leaderboards.json: {category_id}/{metric_id} rank must be a positive integer")
                elif rank in ranks:
                    failures.append(f"data/leaderboards.json: {category_id}/{metric_id} contains duplicate rank {rank}")
                else:
                    ranks.add(rank)
                if not player:
                    failures.append(f"data/leaderboards.json: {category_id}/{metric_id} player must be non-empty")
                elif player.casefold() in players:
                    failures.append(f"data/leaderboards.json: {category_id}/{metric_id} contains duplicate player {player!r}")
                else:
                    players.add(player.casefold())
                if not value:
                    failures.append(f"data/leaderboards.json: {category_id}/{metric_id} value must be non-empty")


def main() -> int:
    failures: list[str] = []

    try:
        data = json.loads(JSON_PATH.read_text(encoding="utf-8"))
    except (OSError, UnicodeError, json.JSONDecodeError) as exc:
        print(f"Leaderboard data validation failed: unable to read data/leaderboards.json ({exc})")
        return 1

    if not isinstance(data, dict):
        failures.append("data/leaderboards.json: root must be an object")
        data = {}

    if data.get("schemaVersion") != 3:
        failures.append("data/leaderboards.json: schemaVersion must be exactly 3")

    for key in ("testRoster", "testValues"):
        if key in data:
            failures.append(f"data/leaderboards.json: public fixture field {key!r} is forbidden")

    source = data.get("source") if isinstance(data.get("source"), dict) else {}
    state = str(source.get("state") or "")
    authority = str(source.get("authority") or "")
    generated_at = source.get("generatedAt")

    if state not in {"pending", "ready"}:
        failures.append(f"data/leaderboards.json: source.state must be 'pending' or 'ready', found {state!r}")
    elif state == "pending":
        if authority != "pending":
            failures.append("data/leaderboards.json: pending source.authority must be exactly 'pending'")
        if generated_at is not None:
            failures.append("data/leaderboards.json: pending source.generatedAt must be null")
    else:
        if authority != "pixel-server-export":
            failures.append("data/leaderboards.json: ready source.authority must be 'pixel-server-export'")
        if not valid_iso_timestamp(generated_at):
            failures.append("data/leaderboards.json: ready source.generatedAt must be a timezone-aware ISO-8601 timestamp")

    validate_catalog(data, failures)
    validate_entries(data, state, failures)

    try:
        js_text = JS_PATH.read_text(encoding="utf-8")
    except (OSError, UnicodeError) as exc:
        failures.append(f"data/leaderboards.js: unable to read fallback ({exc})")
        js_text = ""

    for token in FORBIDDEN_PUBLIC_FIXTURE_TOKENS:
        if token in js_text:
            failures.append(f"data/leaderboards.js: public leaderboard fixture token is forbidden ({token})")

    if "endpoint: 'data/leaderboards.json'" not in js_text:
        failures.append("data/leaderboards.js: fallback endpoint must remain data/leaderboards.json")
    if "state: 'pending'" not in js_text or "authority: 'pending'" not in js_text:
        failures.append("data/leaderboards.js: browser fallback must remain explicitly pending")
    if "generatedAt: null" not in js_text:
        failures.append("data/leaderboards.js: pending fallback generatedAt must be null")

    js_ids = re.findall(r"\bid:\s*'([^']+)'", js_text)
    expected_ids: list[str] = []
    for category_id, metric_ids in EXPECTED_CATALOG.items():
        expected_ids.append(category_id)
        expected_ids.extend(metric_ids)
    if js_ids != expected_ids:
        failures.append(
            "data/leaderboards.js: fallback category/metric taxonomy differs from the canonical contract; "
            f"expected {expected_ids!r}, found {js_ids!r}"
        )

    if failures:
        print("Leaderboard data validation failed:")
        for failure in failures:
            print(f"  {failure}")
        return 1

    print(
        "Leaderboard data validation passed: public snapshot is "
        f"{state} with {sum(len(metrics) for metrics in EXPECTED_CATALOG.values())} canonical metrics."
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
