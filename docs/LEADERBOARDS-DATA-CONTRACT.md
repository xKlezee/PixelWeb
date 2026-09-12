# Leaderboards data contract

PixelWeb exposes the complete leaderboard catalogue even while live tracking is disabled. It must never invent player placements or values.

## Catalogue

The public leaderboard is organized into these canonical categories and metrics:

- Mining: Blocks Mined
- Economy: Money, Money Earned, Nexus Points
- Progression: Level, Prestige, Legacy, Quests Completed
- Combat: Kills, Boss Kills
- Skyblock: Island Level, Skyblock Quests
- Nexus: Raphael Kills, Azazel Kills, Abyss / Astral Kills, Instance Clears, Highest Difficulty, Fastest Clear
- Collection: Bestiary Completion, Talisman Codex

The catalogue is allowed to be visible with empty `entries` while tracking is not connected.

## Public snapshot

The browser loads `data/leaderboards.json` from the same origin. The file is safe to expose publicly and must contain no database credentials, private identifiers, email addresses, IP addresses or other non-public player data.

A publishable snapshot uses schema version 3. Each category owns one or more metrics, and each metric owns its own ranking rows.

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
- `source.state` must be `ready` before any player row is eligible to render.
- `source.authority` must be exactly `pixel-server-export`.
- `source.generatedAt` must be a valid ISO-8601 timestamp.
- The catalogue may render while the source is `pending`, but all player entries remain empty.
- Every player entry requires a positive integer `rank` plus non-empty `player` and `value` fields.
- If source validation fails, PixelWeb falls back to pending mode and renders no player standings.
- Rankings must come from current server data. Screenshots, memory, manually typed placements and stale copied lists are not valid sources.

## Producer boundary

The future producer belongs on trusted Pixel Network infrastructure, not in browser JavaScript. It should read the authoritative gameplay source, calculate rankings there, write the complete JSON snapshot atomically and then publish that snapshot to PixelWeb.

Do not connect GitHub Pages directly to MariaDB, Supabase, a private admin API or any database using client-side credentials. If a server process publishes the snapshot through GitHub, use a narrowly scoped credential stored only on the trusted server and grant it no broader access than required to update the leaderboard snapshot.

The repository currently ships a `pending` snapshot with the full metric catalogue and empty ranking rows. This is intentional until real tracking is implemented.
