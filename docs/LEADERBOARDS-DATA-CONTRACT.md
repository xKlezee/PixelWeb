# Leaderboards data contract

PixelWeb exposes the complete leaderboard catalogue even while the real server producer is disabled. Test mode may use real Minecraft usernames with explicitly fictional values, but production rankings must never invent placements or values.

## Catalogue

Canonical categories and metrics:

- Mining: Blocks Mined
- Economy: Money, Money Earned, Nexus Points
- Progression: Level, Prestige, Legacy, Quests Completed
- Combat: Kills, Boss Kills
- Skyblock: Island Level, Skyblock Quests
- Nexus: Raphael Kills, Azazel Kills, Abyss / Astral Kills, Instance Clears, Highest Difficulty, Fastest Clear
- Collection: Bestiary Completion, Talisman Codex

## Display contract

Every metric is presented in two layers:

1. The normal leaderboard view always renders up to the first 10 ranked players.
2. `View full leaderboard`, placed at the lower-right edge of the table, expands the same table to every entry supplied for that metric.

The Top 3 podium is only a visual highlight. Positions #1, #2 and #3 also remain in the Top 10 table and in the full table.

There is no client-side Top 100 cap.

For the future real producer, a full leaderboard is expected to include the complete historical population known by Pixel Network for that metric, not only currently online or recently active accounts. If a historical player legitimately has a zero/default value for a metric, the producer should include that explicit value rather than silently dropping the player.

## Public snapshot

The browser loads `data/leaderboards.json` from the same origin. The file must be safe to expose publicly and must contain no database credentials, private identifiers, email addresses, IP addresses or other non-public player data.

A production snapshot uses schema version 3:

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

## Test mode

The repository may temporarily publish:

- `source.state: "test"`
- `source.authority: "pixel-test-fixture"`

In this mode usernames may refer to real Minecraft accounts so skin rendering and layout can be tested, while all placements and values remain fictional. The UI must label the data as preview/test data.

## Publication rules

- `schemaVersion` must be exactly `3`.
- Production rows render only when `source.state` is `ready`, `source.authority` is `pixel-server-export`, and `source.generatedAt` is a valid ISO-8601 timestamp.
- Every entry requires a positive integer `rank`, a non-empty `player`, and a non-empty `value`.
- Entries are sorted by rank but are not truncated by the client.
- Test data must be explicitly marked as test data.
- Production rankings must come from current authoritative server data.

## Producer boundary

The future producer belongs on trusted Pixel Network infrastructure, not in browser JavaScript. It should read the authoritative gameplay source, calculate rankings there, preserve the historical player population, write the complete JSON snapshot atomically and publish only that safe snapshot to PixelWeb.

Do not connect GitHub Pages directly to MariaDB, Supabase, a private admin API or any database using client-side credentials.
