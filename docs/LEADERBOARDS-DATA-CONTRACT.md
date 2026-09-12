# Leaderboards data contract

PixelWeb exposes the complete leaderboard catalogue even while live tracking is disabled. Live standings must never invent player placements or values.

## Catalogue

The public leaderboard is organized into these canonical categories and metrics:

- Mining: Blocks Mined
- Economy: Money, Money Earned, Nexus Points
- Progression: Level, Prestige, Legacy, Quests Completed
- Combat: Kills, Boss Kills
- Skyblock: Island Level, Skyblock Quests
- Nexus: Raphael Kills, Azazel Kills, Abyss / Astral Kills, Instance Clears, Highest Difficulty, Fastest Clear
- Collection: Bestiary Completion, Talisman Codex

The catalogue may remain visible while tracking is not connected.

## Public snapshot

The browser loads `data/leaderboards.json` from the same origin. The file must contain no database credentials, private identifiers, email addresses, IP addresses or other non-public player data.

A live snapshot uses schema version 3. Each category owns one or more metrics, and each metric owns its complete ranking rows.

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

## Full leaderboard rule

The podium only presents ranks 1–3. The **View full leaderboard** control reveals the complete ordered `entries` collection for the selected metric.

There is no Top 100 truncation in the client. When the future server exporter is connected, each metric must contain the complete historical player population known to Pixel Network for that record, including players who are no longer active. If a known player has no activity for a metric but still belongs in the complete population, publish an explicit zero-equivalent value rather than omitting the player.

The browser must not silently slice, paginate away or discard valid historical rows. If pagination is introduced later, it must still allow the entire historical leaderboard to be reached.

## Publication rules

- `schemaVersion` must be exactly `3`.
- Live data requires `source.state = "ready"`.
- Live data requires `source.authority = "pixel-server-export"`.
- `source.generatedAt` must be a valid ISO-8601 timestamp for live data.
- Every player entry requires a positive integer `rank` plus non-empty `player` and `value` fields.
- Rankings are ordered by `rank` in the client.
- If live source validation fails, PixelWeb falls back to pending mode and renders no live standings.
- Production rankings must come from the authoritative server source, not screenshots, memory or manually typed placements.

## Test mode

The repository may temporarily use `source.state = "test"` with `source.authority = "pixel-test-fixture"` to exercise the visual leaderboard before the server exporter exists. Test mode must remain visibly labeled and its values are fictional even when the usernames resolve to real Minecraft accounts.

The current site uses this mode so podium rendering, player heads and the full-list interaction can be reviewed without pretending the data is production data.

## Producer boundary

The future producer belongs on trusted Pixel Network infrastructure, not in browser JavaScript. It should read the authoritative gameplay source, calculate rankings there, write the complete JSON snapshot atomically and then publish that snapshot to PixelWeb.

Do not connect GitHub Pages directly to MariaDB, Supabase, a private admin API or any database using client-side credentials. If a server process publishes the snapshot through GitHub, use a narrowly scoped credential stored only on the trusted server and grant it no broader access than required to update the leaderboard snapshot.
