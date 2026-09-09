# PixelWeb Guides Content Model

Guides are the detailed player-facing reference layer of PixelWeb. They must not become a second copy of facts already hardcoded elsewhere.

## Core rule

**One fact, one authoritative source.**

A value, requirement, unlock condition, item rule, boss rule, progression threshold, reward, stat definition, or system behavior must have one canonical data owner. Other pages may summarize the concept or link to the guide, but must not maintain an independent manually typed copy of the same factual value.

## Page roles

### Home

Orientation only. Explain where the player can go next. Do not become a guide.

### Gameplay / Worlds / Systems / Nexus / Skyblock

Product overviews. Explain structure, relationships and why a system exists. They may surface a small set of canonical public facts by reading the shared data layer.

### Guides

Detailed operational/player reference. This is where instructions, mechanics, requirements, examples and edge cases should live.

### Changelog

What changed and when. It must not become permanent documentation for the resulting system state.

## Data ownership

Existing verified public network facts remain in `data/network.js` until a more specific guide-domain data file is introduced.

As Guides grow, prefer domain files rather than one giant object, for example:

- `data/guides/progression.js`
- `data/guides/worlds.js`
- `data/guides/combat.js`
- `data/guides/talismans.js`
- `data/guides/enchantments.js`
- `data/guides/skyblock.js`

A guide renderer should read canonical data and create DOM through `textContent`, `createElement`, `append`, and `replaceChildren`. Do not generate guide HTML from untrusted strings.

## Verification states

Detailed guide data must distinguish at least:

- `verified`: traced to the current production/source-of-truth implementation or approved configuration;
- `planned`: approved direction but not currently live;
- `unknown`: insufficient evidence; do not invent a value;
- `deprecated`: historical behavior retained only for migration/history context.

Do not present `planned` or `unknown` information as live gameplay.

## Duplication policy

A summary may repeat a concept, but not maintain a second authoritative numeric/rule value.

Good:

- Systems: "Prestige continues long-term progression."
- Guide: exact Prestige mechanics and requirements from canonical data.

Bad:

- Systems hardcodes an unlock number.
- Worlds hardcodes the same unlock number.
- Guide hardcodes it again.

If the number changes, all three become drift risks.

## Guide page structure

A detailed guide should generally contain:

1. purpose / what the system is;
2. prerequisites;
3. step-by-step usage or progression;
4. exact mechanics from canonical data;
5. examples where useful;
6. edge cases / limitations;
7. related guides;
8. verification/update metadata when the mechanic is likely to change.

Do not pad guides with repeated marketing copy.

## Security boundary

Guides are public content. Never place in guide data or source files:

- database credentials;
- service-role keys;
- internal hostnames/IPs that are not deliberately public;
- private infrastructure topology;
- staff-only commands or privileged operational procedures;
- anti-abuse thresholds whose publication would materially weaken protections;
- unreleased secrets that are not intended as public roadmap content.

## URL and rendering rules

- Internal guide links must be local `.html` routes or validated same-origin routes.
- External links use explicit `https:` validation and `rel="noopener"` when opening a new tab.
- No inline scripts, inline event handlers, inline styles, `javascript:` URLs or HTML parsing sinks.
- Guide pages inherit the same CSP/security validation as the rest of PixelWeb.

## Initial rollout

The first Guides release should ship a stable landing/index before detailed guides are added. It should clearly distinguish current overview destinations from detailed guides that have not yet been authored, rather than publishing placeholder mechanics as if they were complete.
