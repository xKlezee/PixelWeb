# Pixel Navigator

Pixel Navigator is the shared bottom-left navigation assistant used across the public Pixel Network site.

It is deliberately **not** a generative chatbot and does not call an external AI service. Its job is narrower and safer: understand common player questions and route the visitor to the most relevant public page, guide section, command reference or leaderboard.

## Loading

`data/network.js` loads the same-origin navigator assets on every public page that already consumes the shared network data:

- `pixel-navigator.css`
- `pixel-navigator-primary-data.js`
- `pixel-navigator-secondary-data.js`
- `pixel-navigator.js`

The runtime guards against duplicate injection.

## Behavior

- Opens from the compact `Ask Pixel` bubble fixed to the bottom-left corner.
- Accepts natural-language navigation questions in English or Spanish.
- Uses a curated destination index with aliases and intent-aware scoring.
- Clear matches navigate directly after a short visual confirmation.
- Ambiguous matches return up to four destinations and let the visitor choose.
- Unknown questions fail closed to safe public navigation suggestions instead of inventing an answer.
- Escape closes the panel; clicking outside closes it without stealing focus.
- No query history is persisted and no account/player data is read.

## Destination coverage

The current index covers:

- main Explore pages;
- Getting Started;
- Currencies and direct Coins / Pixels / Nexus Points sections;
- Basic Commands and direct `/store`, `/is`, `/bestiary`, `/codex`, `/bag` sections;
- Progression, Worlds, Skyblock, Nexus, Stats & Equipment, Talismans and Enchantments;
- Guide category landings;
- every current Leaderboards metric;
- Marketplace, Store, Community, Changelog, Rules, Staff, About and License.

## Maintenance rule

When a public destination is added, renamed or retired, update the destination catalogues in `pixel-navigator-primary-data.js` / `pixel-navigator-secondary-data.js` in the same change. Use the canonical local URL/hash and include only aliases that reflect actual public terminology. Do not add guessed gameplay facts or destinations that do not exist.
