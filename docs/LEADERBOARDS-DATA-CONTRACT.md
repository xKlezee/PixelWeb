# Leaderboards data contract

PixelWeb exposes the complete leaderboard catalogue even while the authoritative server producer is not connected. The public site must never invent placements, values or player standings.

## Catalogue

Canonical categories and metrics:

- Mining: Blocks Mined
- Economy: Money, Money Earned, Nexus Points
- Progression: Level, Prestige, Legacy, Quests Completed
- Combat: Kills, Boss Kills
- Skyblock: Island Level, Skyblock Quests
- Nexus: Raphael Kills, Azazel Kills, Abyss / Astral Kills, Instance Clears, Highest Difficulty, Fastest Clear
- Collection: Bestiary Completion, Talisman Codex

The category and metric order is part of the browser contract. `data/leaderboards.js` and `data/leaderboards.json` must expose the same taxonomy.

PixelWeb owns the player-facing editorial catalogue. A trusted producer may populate `source` and metric `entries`, but it must not rewrite category `label` / `short` / `description` values or metric `label` / `kicker` / `description` / `unit` values. Those fields must remain identical to the browser fallback so server integration cannot silently change public terminology.

## Display contract

Every metric is presented in two layers once authoritative rows exist:

1. The normal leaderboard view renders up to the first 10 ranked players.
2. `View full leaderboard`, placed at the lower-right edge of the table, expands the same table to every entry supplied for that metric.

The Top 3 podium is only a visual highlight. Positions #1, #2 and #3 also remain in the Top 10 table and in the full table.

There is no client-side Top 100 cap.

For the future real producer, a full leaderboard is expected to include the complete historical population known by Pixel Network for that metric, not only currently online or recently active accounts. If a historical player legitimately has a zero/default value for a metric, the producer should include that explicit value rather than silently dropping the player.

## Public snapshot

The browser loads `data/leaderboards.json` from the same origin. The file must be safe to expose publicly and must contain no database credentials, private identifiers, email addresses, IP addresses or other non-public player data.

Only two public source states are allowed.

### Pending

While no authoritative exporter is connected:

```json
{
  "schemaVersion": 3,
  "source": {
    "state": "pending",
    "authority": "pending",
    "label": "Leaderboard tracking is not connected yet",
    "generatedAt": null
  },
  "categories": []
}
```

The real file still contains the complete category/metric catalogue, but every metric must use `"entries": []`. No placeholder usernames, ranks, scores or test fixtures may be published.

### Ready

A production snapshot uses schema version 3 and an authoritative server export:

```json
{
  "schemaVersion": 3,
  "source": {
    "state": "ready",
    "authority": "pixel-server-export",
    "label": "Pixel Network live records",
    "generatedAt": "2026-09-12T12:00:00Z"
  },
  "categories": [
    {
      "id": "mining",
      "label": "Mining",
      "short": "MIN",
      "description": "Records built through mining and resource progression.",
      "metrics": [
        {
          "id": "blocks-mined",
          "label": "Blocks Mined",
          "kicker": "Lifetime mining",
          "description": "Total blocks mined across the tracked Pixel Network progression loop.",
          "unit": "blocks",
          "entries": [
            { "rank": 1, "player": "ExamplePlayer", "value": "1,250,000" }
          ]
        }
      ]
    }
  ]
}
```

## Publication rules

- `schemaVersion` must be exactly `3`.
- Public `source.state` may be only `pending` or `ready`.
- `pending` requires `source.authority: "pending"`, `source.generatedAt: null`, and zero published rows across every metric.
- `ready` requires `source.authority: "pixel-server-export"` and a timezone-aware ISO-8601 `source.generatedAt` timestamp.
- Every ready entry requires a positive integer `rank`, a non-empty `player`, and a non-empty `value`.
- Duplicate ranks or duplicate players inside one metric are invalid.
- Entries are sorted by rank by the frontend but are not truncated by the client.
- `testRoster`, `testValues`, `pixel-test-fixture` and browser-public test standings are forbidden.
- Category/metric editorial metadata must remain identical to the PixelWeb fallback catalogue; the producer owns ranking data, not public copy.
- Production rankings must come from current authoritative server data.

`validate_leaderboards_data.py` guards publication state, rows and canonical IDs/order. `validate_leaderboards_catalog.js` independently compares the JS fallback against the JSON snapshot after removing only `entries`, preventing server integration from drifting labels, descriptions, kickers, short labels or units. Layout fixtures, if ever needed for development, must remain outside browser-public `data/` and must not be deployed as standings.

## Trusted exporter handoff

The trusted server-side producer does **not** need to generate PixelWeb's full public snapshot. Its handoff file contains only two top-level fields:

```json
{
  "generatedAt": "2026-09-13T21:45:00Z",
  "metrics": {
    "blocks-mined": [
      { "rank": 1, "player": "ExamplePlayer", "value": "1,250,000" }
    ],
    "money": [],
    "money-earned": [],
    "nexus-points": []
  }
}
```

The real handoff must contain **all 20 canonical metric ids exactly once**. Each metric value is an array of plain public rows with exactly `rank`, `player` and `value` fields. `rank` values must be contiguous from `1` through `N`, players must be unique within that metric, and `value` is the already formatted public display string.

`scripts/build_leaderboards_snapshot.py` validates that handoff, copies the current PixelWeb catalogue, forces the public source to `ready / pixel-server-export`, injects the trusted rows and produces the browser-facing snapshot. It has no network, GitHub or database integration.

Example staging workflow from a trusted checkout:

```text
python3 scripts/build_leaderboards_snapshot.py --input /secure/path/leaderboards-export.json --output data/leaderboards.json
python3 scripts/validate_leaderboards_data.py
node scripts/validate_leaderboards_catalog.js
```

The output write is atomic: the builder writes a temporary file in the destination directory, flushes/fsyncs it, then replaces the destination. This prevents a partially written JSON file from becoming the published snapshot if the write is interrupted.

The producer should generate the handoff to a private/trusted filesystem location. Do not place raw database dumps, internal identifiers, UUID mappings, emails, IPs or credentials in the repository merely because the builder will later filter or transform data; the handoff itself should already contain only intended public ranking rows.

## Producer boundary

The future producer belongs on trusted Pixel Network infrastructure, not in browser JavaScript. It should read the authoritative gameplay source, calculate rankings there, preserve the historical player population and emit the minimal trusted handoff described above.

The producer should treat metric ids as an integration contract rather than derive player-facing copy from database column names or internal enum/class names. PixelWeb then merges that data into its own catalogue and publishes only the resulting safe snapshot.

Do not connect GitHub Pages directly to MariaDB, Supabase, a private admin API or any database using client-side credentials.
