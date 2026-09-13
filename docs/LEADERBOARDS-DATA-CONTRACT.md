# Leaderboards data contract

PixelWeb exposes the complete leaderboard catalogue even while the authoritative server producer is not connected. The authoritative public snapshot must never invent placements, values or player standings. While that snapshot is `pending`, the browser is allowed to generate a clearly labeled synthetic demo solely to preview the finished ranking experience.

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

The normal leaderboard view renders the first 10 ranked rows. The lower-right expansion control then exposes the wider ranking:

1. while the source snapshot is `pending`, the browser demo contains exactly 100 synthetic players and the control expands from Top 10 to Top 100;
2. once an authoritative `ready` snapshot exists, `View full leaderboard` expands to every entry supplied for that metric.

The Top 3 podium is only a visual highlight. Positions #1, #2 and #3 also remain in the Top 10 table and in the expanded table.

There is no client-side Top 100 cap for authoritative data. The 100-row limit applies only to the synthetic demo presentation.

For the future real producer, a full leaderboard is expected to include the complete historical population known by Pixel Network for that metric, not only currently online or recently active accounts. If a historical player legitimately has a zero/default value for a metric, the producer should include that explicit value rather than silently dropping the player.

## Public snapshot

The browser loads `data/leaderboards.json` from the same origin. The file must be safe to expose publicly and must contain no database credentials, private identifiers, email addresses, IP addresses or other non-public player data.

Only two persisted public source states are allowed in the snapshot: `pending` and `ready`.

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

The real file still contains the complete category/metric catalogue, but every metric must use `"entries": []`. No placeholder usernames, ranks, scores or test fixtures may be persisted in `data/leaderboards.json` or `data/leaderboards.js`.

### Browser demo presentation

When the persisted snapshot is not authoritative, `leaderboards.js` converts the browser presentation to a runtime-only `demo` state. This is not a third snapshot state and must never be written into `data/leaderboards.json`.

The demo contract is deliberately explicit:

- exactly 100 synthetic rows are generated per metric;
- player names use the `DemoPlayer001` … `DemoPlayer100` namespace;
- values are deterministic presentation values appropriate to each metric type;
- the source area says that the standings are demo/example data and not live records;
- the record badge changes from `PIXEL` to `DEMO`;
- Top 3 and Top 10 are visible so the finished composition can be reviewed;
- the expansion control reveals Top 100;
- synthetic players do not request external Minecraft skin/head services;
- demo rows are never treated as evidence of server state and never flow back into the snapshot builder.

As soon as a valid `ready / pixel-server-export` snapshot loads, the browser must stop generating demo rows and render only the authoritative entries.

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
- Persisted `source.state` may be only `pending` or `ready`.
- `pending` requires `source.authority: "pending"`, `source.generatedAt: null`, and zero persisted rows across every metric.
- `ready` requires `source.authority: "pixel-server-export"` and a timezone-aware ISO-8601 `source.generatedAt` timestamp.
- Every ready entry requires a positive integer `rank`, a non-empty `player`, and a non-empty `value`.
- Ready ranks must be contiguous from `1` through `N` for each metric; skipped or duplicate positions are invalid.
- Duplicate players inside one metric are invalid.
- Entries are sorted by rank by the frontend but are not truncated by the client.
- `testRoster`, `testValues`, `pixel-test-fixture` and unlabeled browser-public test standings are forbidden.
- The only permitted disconnected-source ranking preview is the explicit runtime-only `demo` contract above; it must remain visibly labeled and must never be persisted as ranking data.
- Category/metric editorial metadata must remain identical to the PixelWeb fallback catalogue; the producer owns ranking data, not public copy.
- Production rankings must come from current authoritative server data.

`validate_leaderboards_data.py` guards persisted publication state, rows and canonical IDs/order. `validate_leaderboards_catalog.js` independently compares the JS fallback against the JSON snapshot after removing only `entries`, preventing server integration from drifting labels, descriptions, kickers, short labels or units. The runtime demo is presentation-only and does not weaken either persisted-data guard.

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

The output write is atomic: the builder writes a temporary file in the destination directory, flushes/fsyncs it, then replaces the destination. This prevents a partially written JSON file from becoming the published snapshot if the write is interrupted. The `--output` option is intentionally restricted to `data/leaderboards.json`; omit it to preview the generated snapshot on stdout.

The producer should generate the handoff to a private/trusted filesystem location. Do not place raw database dumps, internal identifiers, UUID mappings, emails, IPs or credentials in the repository merely because the builder will later filter or transform data; the handoff itself should already contain only intended public ranking rows.

## Producer boundary

The future producer belongs on trusted Pixel Network infrastructure, not in browser JavaScript. It should read the authoritative gameplay source, calculate rankings there, preserve the historical player population and emit the minimal trusted handoff described above.

The producer should treat metric ids as an integration contract rather than derive player-facing copy from database column names or internal enum/class names. PixelWeb then merges that data into its own catalogue and publishes only the resulting safe snapshot.

Do not connect GitHub Pages directly to MariaDB, Supabase, a private admin API or any database using client-side credentials.
