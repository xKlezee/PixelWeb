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

Guides intentionally use a denser documentation interface than the rest of PixelWeb: compact header, guide sidebar, in-page navigation, verification status, reference tables/callouts and less marketing-style card composition. They still inherit Pixel typography, surfaces, spacing discipline and interaction quality.

### Changelog

What changed and when. It must not become permanent documentation for the resulting system state.

## Legacy GitBook migration

The previous GitBook at `https://pixel-network-1.gitbook.io/home/documentation` is an **incomplete legacy reference**.

It may be used to recover topic/category names, identify mechanics that need investigation, recover useful explanatory structure, and compare historical intent with the current implementation.

It must **not** be used as authoritative evidence for a current numeric value, unlock rule, reward, item effect, command behavior, compatibility rule or live feature state.

Migration sequence:

1. identify a candidate topic from legacy documentation;
2. locate the current implementation/configuration/approved source of truth;
3. classify the evidence level and the factual state separately;
4. move only claims supported at the stated evidence level into Pixel Guides;
5. retain historical/legacy behavior only when it materially helps migration or version history, and label it as such;
6. never silently copy an old value into current documentation.

If legacy documentation conflicts with current evidence, current verified evidence wins. If current evidence is insufficient, the value remains `unknown` and is not guessed.

## Data ownership

Existing verified public network facts remain in `data/network.js` until a more specific guide-domain data file is introduced.

As Guides grow, prefer domain files rather than one giant object, for example:

- `data/guides/progression.js`
- `data/guides/worlds.js`
- `data/guides/combat.js`
- `data/guides/talismans.js`
- `data/guides/enchantments.js`
- `data/guides/skyblock.js`

Do not create a guide-domain file merely to duplicate data that is already canonical in `data/network.js`.

A guide renderer should read canonical data and create DOM through `textContent`, `createElement`, `append`, and `replaceChildren`. Do not generate guide HTML from untrusted strings.

## Evidence-qualified verification

The word `verified` is not sufficient on its own for new Guides. Documentation must state **what kind of evidence was actually obtained**.

Evidence levels, from narrower to stronger observation:

- `source-verified`: traced through the current authoritative source/configuration and regression coverage; no live-runtime observation is implied;
- `server-verified`: the relevant server-side runtime/configuration/log path was observed in addition to source evidence; client presentation may still be unverified;
- `live-client-verified`: the player-facing behavior was exercised in a real client against the intended runtime;
- `reconciled-reference`: source and live/current configuration were compared and the canonical target/reference was established, but one or more staged changes may still await deployment.

Factual state is a separate axis:

- `current`: supported behavior/reference for the stated evidence level;
- `staged`: implemented/reconciled but not yet deployed at the last verification;
- `planned`: approved direction but not implemented/current;
- `unknown`: insufficient evidence; do not invent a value;
- `deprecated` / `retired`: historical identity intentionally retained for compatibility/history but not active behavior.

A Guide must never upgrade evidence silently. Examples:

- green source tests do not equal a live-client observation;
- a source-ready fix does not become `current live` until deployment is established;
- a live configuration catalogue can be `reconciled-reference` even when a later source fix that uses it is still staged;
- an old GitBook statement never upgrades an `unknown` fact.

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

## Public-disclosure boundary

A fact can be verified and still be inappropriate to publish. Public Guide data must additionally be classified for disclosure.

Do not publish concealed discovery trees, secret combinations, anti-abuse thresholds, private operational procedures or other information whose secrecy is intentionally part of the product/security model. Explain the existence and semantics of such systems without leaking their protected inputs.

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
- Guide pages default to `connect-src 'self'`; a broader network permission requires a documented feature-level reason.

## Current rollout

`guides.html` is the stable documentation entry point. Detailed pages are promoted only after their evidence level and disclosure boundary are known.

Current pattern examples:

- `guide-talismans.html`: server-verified mechanics with a separately disclosed client-QA gap;
- `guide-enchantments.html`: source-verified mechanics/tests without claiming a live-client pass;
- `guide-nexus.html`: reconciled catalogue/reference with staged deployment work called out separately.
