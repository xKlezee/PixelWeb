# Leaderboards data contract

PixelWeb must never invent rankings. `leaderboards.html` only publishes rows from an authorized server-produced snapshot.

## Public snapshot

The browser loads `data/leaderboards.json` from the same origin. The file is safe to expose publicly and must contain no database credentials, private identifiers, email addresses, IP addresses or other non-public player data.

A publishable snapshot uses schema version 2:

```json
{
  "schemaVersion": 2,
  "source": {
    "state": "ready",
    "authority": "pixel-server-export",
    "label": "Pixel Network server snapshot",
    "generatedAt": "2026-09-12T12:00:00Z"
  },
  "categories": [
    {
      "id": "progression",
      "label": "Progression",
      "description": "Verified account progression standings.",
      "entries": [
        { "rank": 1, "player": "ExamplePlayer", "metric": "Legacy", "value": "1" }
      ]
    },
    {
      "id": "combat",
      "label": "Combat",
      "description": "Verified competitive combat statistics.",
      "entries": []
    },
    {
      "id": "islands",
      "label": "Islands",
      "description": "Verified Skyblock island progression standings.",
      "entries": []
    }
  ]
}
```

## Publication rules

- `schemaVersion` must be exactly `2`.
- `source.state` must be `ready` before any row is eligible to render.
- `source.authority` must be exactly `pixel-server-export`.
- `source.generatedAt` must be a valid ISO-8601 timestamp.
- Only the canonical categories `progression`, `combat` and `islands` are rendered.
- Every entry requires a positive integer `rank` plus non-empty `player`, `metric` and `value` fields.
- If validation fails, PixelWeb falls back to the pending state and renders no standings.
- Rankings must come from current server data. Screenshots, memory, manually typed placements and stale copied lists are not valid sources.

## Producer boundary

The producer belongs on trusted Pixel Network infrastructure, not in browser JavaScript. It should read the authoritative gameplay source, calculate rankings there, write the complete JSON snapshot atomically and then publish that snapshot to PixelWeb.

Do not connect GitHub Pages directly to MariaDB, Supabase, a private admin API or any database using client-side credentials. If a server process publishes the snapshot through GitHub, use a narrowly scoped credential stored only on the trusted server and grant it no broader access than required to update the leaderboard snapshot.

The current repository intentionally ships a `pending` snapshot with empty collections until that producer is implemented and verified.
