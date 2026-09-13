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

## Producer boundary

The future producer belongs on trusted Pixel Network infrastructure, not in browser JavaScript. It should read the authoritative gameplay source, calculate rankings there, preserve the historical player population, write the complete JSON snapshot atomically and publish only that safe snapshot to PixelWeb.

The producer should treat the current catalogue structure as an input contract rather than regenerate it from database column names or internal enum/class names. It may replace `source` with the authoritative ready metadata and replace each metric's `entries`; all other player-facing catalogue fields stay owned by PixelWeb.

Do not connect GitHub Pages directly to MariaDB, Supabase, a private admin API or any database using client-side credentials.
