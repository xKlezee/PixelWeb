# PixelWeb Guide live-client QA protocol

This protocol defines the evidence required before a Pixel Guide may change from source/server evidence with `liveClient: 'not-asserted'` to `level: 'live-client-verified'` + `liveClient: 'verified'`.

It is intentionally stricter than a normal smoke test. A successful source build, unit test, server log, screenshot of a menu, or old gameplay memory is **not** a live-client verification by itself.

Current explicit live-client gaps covered here:

- Talisman Codex / Talisman Bag;
- Enchantments;
- Stats & Equipment.

The protocol validates player-visible behavior against the Guide's already-approved source contract. It does not authorize changing gameplay, inventing expected values, exposing secrets, or treating an observed bug as the new canonical behavior.

## 1. Evidence levels and promotion rule

The evidence taxonomy remains the one defined in `GUIDES-CONTENT-MODEL.md`.

For the Guide modules covered by this protocol:

- `not-asserted` means no complete qualifying live-client pass is claimed;
- `verified` means the complete mandatory matrix for the Guide's published scope has been exercised against the intended runtime and passed;
- a partial session may be recorded as supporting evidence, but the Guide **remains** `liveClient: 'not-asserted'`;
- `BLOCKED`, `NOT RUN` or an unresolved `FAIL` never count as a pass;
- source/server evidence may explain why a client observation occurred, but it cannot replace the required client observation.

A Guide may be promoted only when:

1. every mandatory case for its current published scope is `PASS`;
2. no mandatory case is `FAIL` or `BLOCKED`;
3. the session used a real Minecraft client connected to the intended Pixel Network runtime;
4. the exact server/plugin build under test is identifiable;
5. the evidence date and evidence references are recorded;
6. observed behavior does not contradict the current canonical source contract;
7. any contradiction is resolved in the implementation/canonical data **before** documentation is upgraded.

When promotion is justified, update both fields together:

```text
level: 'live-client-verified'
liveClient: 'verified'
```

and set `verifiedAsOf` to the actual qualifying session date. Do not backdate it to an earlier source audit.

## 2. Required session record

Create one session record for each run. A plain Markdown/text report is sufficient; video/screenshots may be linked or referenced separately.

Record at minimum:

| Field | Required value |
| --- | --- |
| Session ID | unique human-readable id, e.g. `guide-client-2026-09-13-a` |
| Date/time | local time plus timezone, or UTC |
| Tester | player/tester identity used for the run |
| Minecraft client | exact Minecraft version and launcher/client variant if non-vanilla |
| Resource pack | pack/version/hash when relevant to presentation |
| Server target | Pixel Network node/environment actually joined |
| Server build | Minecraft/Paper/ASP build when known |
| Pixel plugin build | commit/JAR hash/version for the feature under test when available |
| Network conditions | approximate ping and any material packet-loss issue |
| Test account state | relevant level/world/equipment state, without private account identifiers |
| External modifiers | buffs, talismans, enchants, armor, party effects, commands or admin fixtures used |
| Evidence refs | screenshot/video/log ids or file paths that can be reviewed later |

Do not place credentials, database data, private UUID mappings, IP addresses that are not intentionally public, staff-only operational secrets, or raw production dumps in the evidence record.

## 3. Result vocabulary

Use only these case results:

- `PASS` — observed result matches the Guide contract;
- `FAIL` — observed result contradicts the Guide contract or produces a player-visible defect;
- `BLOCKED` — the environment cannot exercise the case reliably;
- `NOT RUN` — intentionally not executed in this session;
- `N/A` — case is demonstrably outside the current published scope.

For every `PASS`, record enough evidence to distinguish a real observation from an assumption. For every `FAIL` or `BLOCKED`, record the blocker and do not promote the Guide.

## 4. Test-environment discipline

Use a controlled account/loadout whenever the mechanic is numerical or conditional.

Before a comparison:

- remove unrelated buffs/effects when possible;
- avoid equipment that adds an untracked modifier to the same outcome;
- use the same target/environment for before/after comparisons;
- wait for cooldowns/regeneration/state transitions to settle;
- record the item/equipment configuration used;
- repeat probabilistic mechanics enough to actually exercise their successful path when a deterministic test hook is unavailable;
- do not interpret the absence of a rare proc during a short run as proof that the mechanic cannot occur.

For claims involving exclusion — for example “does not apply to bosses” — a promotion-quality run should use deterministic server/test tooling when available. If the exclusion cannot be tested with reasonable confidence from the client, keep the Guide below `live-client-verified` rather than converting lack of observation into proof.

---

# 5. Talisman live-client matrix

Current evidence baseline:

```text
level: server-verified
liveClient: not-asserted
```

The server-side mechanics are already outside the purpose of this client pass. This matrix targets the player-facing gaps explicitly recorded by the Talisman Guide: state/category presentation, discovery feedback, inventory interaction, equip/unequip presentation, and Nexus Jewelry presentation.

Secret discovery inputs must remain secret. Use an already-prepared test state or owner-approved fixture instead of documenting concealed conditions.

## TAL-01 — Codex category/state presentation

**Purpose:** verify the Codex communicates its public states without leaking concealed content.

Setup:

- test account with representative entries available in multiple known states;
- include at least one concealed/Unknown entry without revealing its hidden trigger.

Observe:

- Unknown content remains represented as concealed/`???` rather than leaking its identity/requirement;
- Discovered, Unlocked and Obtained entries are visually distinguishable;
- state labels/content are readable at normal GUI scale;
- no stale state remains after a legitimate state change/reopen.

Evidence:

- one capture per observable state;
- record the public entry/state used, but do not record secret trigger data.

Promotion blocker: any secret disclosure, indistinguishable state, stale state, unreadable state, or state contradicting the canonical lifecycle.

## TAL-02 — Discovery/unlock/obtain feedback

**Purpose:** verify client feedback timing and presentation for a controlled non-secret progression event.

Observe, where the current system emits feedback:

- feedback occurs after the corresponding server-side transition, not before it;
- the displayed identity/state matches the resulting Codex state;
- visual/audio feedback is not duplicated unexpectedly;
- reopening the Codex shows the same persisted result.

If a transition has intentionally no dedicated client feedback, record that fact rather than inventing an expected animation/sound.

Promotion blocker: misleading ordering, duplicate feedback, mismatched identity/state, or persistence mismatch.

## TAL-03 — Talisman Bag interaction

**Purpose:** verify the seven-slot equipped-set interaction as experienced by a player.

Setup:

- at least two known public Talismans suitable for controlled equip/unequip;
- start from a recorded Bag state.

Observe:

- exactly seven intended equipped positions are player-usable for the current public Bag contract;
- moving a valid Talisman into/out of the equipped set behaves consistently;
- invalid/unsupported placement does not silently corrupt the equipped set;
- changes become effective when the Bag closes, matching the published contract;
- reopening the Bag reflects the committed state.

Promotion blocker: wrong slot count, premature application inconsistent with the contract, lost state, duplication, ghost item, or reopen mismatch.

## TAL-04 — Equip/unequip audiovisual presentation

**Purpose:** verify the perceived feedback associated with changing the equipped set.

Observe:

- any intended equip/unequip sound is audible once at the correct interaction point;
- no runaway/repeated sound occurs from reopening or passive refresh;
- visual feedback remains readable and does not obscure the inventory interaction;
- absence of a sound is documented if the current intended implementation has none.

This case verifies presentation, not hidden numerical effect magnitude.

## TAL-05 — Nexus Jewelry presentation

**Purpose:** verify the player-facing Jewelry/Talisman relationship in the Nexus client experience without exposing internal GUI indexes.

Observe:

- Jewelry-related presentation is reachable only through the intended player-facing path;
- names/icons/state presentation align with the current public Talisman vocabulary;
- no internal slot indexes, implementation labels or secret requirements are exposed;
- navigation back to the normal player flow is clear and does not strand the inventory state.

Promotion blocker: leaked internal indexes, inaccessible intended surface, incorrect Talisman state, or broken navigation.

### Talisman promotion gate

`TAL-01` through `TAL-05` must all be `PASS`. If any case is unavailable on the intended runtime, Talismans remains `server-verified / liveClient: not-asserted`.

---

# 6. Enchantments live-client matrix

Current evidence baseline:

```text
level: source-verified
liveClient: not-asserted
scope: family compatibility, effect semantics and retired identities
```

Because the published scope includes multiple families and specialized effects, one successful enchant proc is not sufficient to promote the entire Guide.

## ENCH-01 — Equipment-family compatibility

For each current family, test the intended player-facing enchant acquisition/application surface with a representative valid case and a representative incompatible case where the system exposes such a choice:

- Sword;
- Axe;
- Spear;
- Bow;
- Elytra;
- Shield/offhand.

Observe:

- family-specific pools do not collapse into one unrestricted global pool;
- a family-specific identity appears only where intended;
- melee-shared effects are available only to eligible melee families;
- Bow/Elytra/Shield maintain their specialized pool behavior;
- Shield resolution behaves from the equipped offhand and does not visibly double-count a duplicated held-item condition.

Do not infer exhaustive compatibility from a single item. Record the exact item/enchant combination used for each family.

## ENCH-02 — Maximum enchant count

Published contract: maximum four progression enchantments per item.

Observe:

- an eligible item can reach the supported limit through the intended player path;
- attempting to exceed the limit is rejected/blocked rather than silently creating a fifth active progression enchant;
- the resulting item display/state remains coherent after inventory close/reopen/reconnect if persistence is part of the normal path.

Promotion blocker: a fifth active enchant, corrupted item state, or client display that disagrees with the actual active set.

## ENCH-03 — Lifesteal

Use an account below maximum health, a controlled target and a known Lifesteal level.

Observe:

- healing occurs from a qualifying successful hit and follows actual final damage rather than raw pre-mitigation intent;
- healing does not exceed maximum health;
- when measurable through the available UI/test instrumentation, the observed heal remains consistent with the published per-level/capped behavior;
- zero/invalid-damage cases do not create unexplained healing.

If the client cannot expose enough information to distinguish final-damage scaling/cap behavior with confidence, mark this case `BLOCKED` rather than inferring it from source.

## ENCH-04 — Spear EXECUTION and boss exclusion

Observe:

- EXECUTION is exercised on its intended Spear path;
- the qualifying non-boss behavior can be observed in a controlled test;
- boss exclusion is tested with a deterministic/controlled setup if one exists.

Because EXECUTION is low-probability, simply failing to see a boss proc in a short session is **not** evidence of boss exclusion. Without a reliable way to exercise the conditional path, this case remains `BLOCKED` for full-guide promotion.

## ENCH-05 — Boss-conditional FRACTURE / SPLINTER

Compare the same relevant effect in a controlled boss and non-boss context.

Observe the special conditional behavior on the boss target and verify that the non-boss context does not misleadingly present the same boss-only special behavior.

Record target type and item/enchant configuration.

## ENCH-06 — Penetration semantics

Cover representative `PHASE_STRIKE / WRAITH` behavior against a target where mitigation can be meaningfully observed.

Observe that the qualifying hit behaves as penetration rather than merely displaying an unrelated generic flat bonus. Use controlled before/after targets/loadouts and record the measurable client outcome.

If the live client lacks enough observable information to distinguish penetration from a flat damage increase, mark `BLOCKED`.

## ENCH-07 — PULSE area behavior

Setup one primary target plus secondary targets inside and outside the expected practical area.

Observe:

- the primary hit remains coherent;
- qualifying nearby secondary targets can receive the area effect;
- targets clearly outside the bounded effect are not treated as global/unbounded hits;
- each secondary target is handled independently rather than creating obvious recursive/runaway chaining.

This protocol deliberately does not publish hidden/exact balance radius or chance values that the Guide omits.

## ENCH-08 — Defensive enchant behavior

Exercise representative defensive behavior from the published group:

- GUARD;
- RESILIENCE;
- ANCHOR;
- SECOND_WIND.

At minimum record one controlled case per currently obtainable effect. Verify the effect behaves as defense/survivability/movement resistance rather than appearing as generic offensive bonus damage.

## ENCH-09 — Conservative flat-proc identities

Cover the player-visible behavior for:

- PRECISION / TRUESHOT;
- IGNITE / EMBER;
- MOMENTUM;
- FROSTBITE;
- DISRUPT.

The Guide currently documents these conservatively as flat proc damage and explicitly does **not** assert additional hidden subsystems.

During the controlled observation window, record whether the client displays any extra DoT, slow/freeze, speed/momentum, crowd-control or interrupt behavior. Unexpected extra behavior is a `FAIL` against the current documentation and requires source/runtime reconciliation before changing the Guide.

A short absence observation alone should not be used to prove a probabilistic hidden effect impossible; use the intended proc path repeatedly enough to observe the current player-facing mechanic.

## ENCH-10 — Retired/removed identity boundary

Check the current player-facing enchant catalogue/application surface.

Verify:

- `GRAVITY_WELL` is not presented as an active enchant mechanic;
- retired generic offensive `REFLECTION` is not reintroduced as an active enchant identity;
- `THORNS / BURN_POWER` are not presented as current catalogue entries;
- no retired identity has been silently reused to name an unrelated active mechanic.

This case verifies the public catalogue/player path, not historical database cleanup.

### Enchantments promotion gate

`ENCH-01` through `ENCH-10` must all be `PASS` for the current published scope. If deterministic verification of an exclusion/conditional mechanic is unavailable, keep `liveClient: 'not-asserted'` rather than lowering the evidence standard.

---

# 7. Stats & Equipment live-client matrix

Current evidence baseline:

```text
level: source-verified
liveClient: not-asserted
scope: core combat and equipment semantics
```

Explicit exclusions remain exclusions even after a successful client pass:

- mining-specific stats;
- candidate stats without current gameplay evidence;
- dedicated Wand mechanics requiring their own reference.

Do not use this protocol to silently promote those excluded areas.

## STAT-01 — Melee Attack Damage

Using controlled Sword/Axe/Spear items with known progression values:

- record displayed/known Attack Damage values;
- attack the same controlled target under the same conditions;
- verify increasing the stat produces the expected player-visible direction of damage change;
- verify the observed family still participates in later mitigation/modifiers rather than behaving as an isolated final-damage constant.

No hidden exact damage formula beyond the published contract should be inferred solely from this case.

## STAT-02 — Attack Speed / cadence

Use two melee items with meaningfully different attack-speed values and no temporary haste/slow modifiers.

Observe:

- the faster item reaches its intended attack cadence sooner;
- slower/high-hit identities remain distinguishable from faster cadence;
- client cooldown/presentation does not report the same cadence for materially different configured values.

Capture enough timing evidence to distinguish a real cadence difference from input variance.

## STAT-03 — Projectile Damage

Use an eligible Bow with a known `projectile_damage` value against a controlled target.

Observe:

- the ranged progression stat contributes to eligible shot damage;
- changing the controlled projectile-damage value changes the observed ranged result in the expected direction;
- the Bow does not fall back to a melee-only Attack Damage interpretation in the tested path.

## STAT-04 — Defense mitigation curve

Use a controlled incoming-damage source whose raw damage is known or independently measured. Test at least three useful configurations, including a low/zero-defense baseline and two increasing-defense points while recording Max Health.

For each point calculate the expected reduction from the published formula:

```text
reduction = min(0.80, defense / (defense + max_health × 0.0216))
```

Then compare the observed health loss against the expected mitigated result within a documented tolerance appropriate to the game's health precision/rounding.

Requirements:

- observed reduction must move in the correct direction as Defense increases;
- observed behavior must remain consistent with diminishing returns rather than an unrelated fixed percentage;
- no tested configuration may exceed the published 80% mitigation ceiling.

Record raw damage, Defense, Max Health, expected reduction, expected damage, observed damage and tolerance for each point.

## STAT-05 — Max Health

Using controlled equipment changes:

- verify Max Health changes the player's available health pool as expected;
- verify the displayed/current maximum remains coherent after equipment state settles;
- when combined with STAT-04, confirm Max Health participates in the mitigation calculation rather than being treated purely as display-only extra hearts/health.

## STAT-06 — Knockback Resistance

Use the same repeatable knockback source against two controlled resistance configurations.

Observe:

- higher configured Knockback Resistance reduces displacement in the expected direction;
- the effect does not create unrelated offensive behavior;
- specialized effects such as Anchor, if present in the test, are recorded separately so they do not contaminate the base-stat comparison.

Video or positional measurements are preferred because visual memory is too imprecise for close comparisons.

## STAT-07 — Equipment-family mapping

Validate the player-facing stat relationship for the currently documented families:

| Family | Required current coverage |
| --- | --- |
| Sword | Attack Damage + Attack Speed |
| Axe | Attack Damage + Attack Speed |
| Spear | Attack Damage + Attack Speed |
| Bow | Projectile Damage |
| Armor | Defense + Max Health + Knockback Resistance where configured |
| Shield | Defense/Knockback Resistance offhand behavior where configured |
| Elytra | only the currently documented partial Defense reference |

Do not promote Wands or Mining tools from this case; both remain explicitly outside the Guide's verified core scope.

## STAT-08 — Layered-mechanic separation

Use representative controlled scenarios to confirm the player experience does not present these layered mechanics as if they were stored base stats:

- penetration;
- Lifesteal;
- boss-conditional damage;
- area damage.

This is primarily a consistency check between Stats & Equipment and Enchantments/Talismans. If a UI labels one of these as a base equipment stat contrary to the current Guide, record a `FAIL` for reconciliation.

### Stats & Equipment promotion gate

`STAT-01` through `STAT-08` must all be `PASS` within the published core scope. Mining stats, Wands and other excluded/candidate stat families stay outside the promotion claim unless separately audited and added to the canonical Guide contract.

---

# 8. Evidence report template

Use this for each session:

```text
Session ID:
Date/time + timezone:
Tester:
Minecraft client/version:
Resource pack/version:
Server target:
Server/Paper/ASP build:
Relevant Pixel plugin build/hash:
Approx. ping/network condition:
Test account state:
External modifiers/fixtures:
Evidence references:

Case results:
- TAL-01: PASS | FAIL | BLOCKED | NOT RUN | N/A
  Observation:
  Evidence:
  Notes:

(repeat for the relevant matrix)

Unexpected behavior:
- ...

Known blockers:
- ...

Promotion decision:
- KEEP not-asserted
or
- ELIGIBLE FOR live-client-verified

Reviewer:
Review date:
```

## 9. Promotion change checklist

When and only when a complete qualifying matrix passes:

1. preserve the session/evidence record;
2. confirm the tested server/plugin build is the build whose behavior is being documented;
3. update the corresponding Guide data `verification.level` to `live-client-verified`;
4. update `verification.liveClient` to `verified` in the same change;
5. set `verifiedAsOf` to the qualifying session date;
6. update scope/note only if the evidence genuinely changes the documented boundary;
7. run the repository Guide-evidence/public-data guards when execution is available;
8. review the player-facing Guide for claims that now conflict with the observation;
9. do not broaden excluded scope merely because the existing scope passed;
10. separately verify the deployed website/browser rendering before calling the PixelWeb presentation browser-verified.

## 10. Failure handling

A failed live-client case is useful evidence; do not hide it by weakening the test.

When observed behavior contradicts the Guide:

- keep the current live-client claim unpromoted;
- determine whether source/runtime is wrong, documentation is stale, or the test environment was invalid;
- fix the authoritative owner first;
- rerun the affected case and any dependent cases;
- only then update the public Guide.

The purpose of this protocol is not to make every row green. It is to ensure that `live-client-verified` always means a real, reviewable player-session result rather than confidence inferred from source code.
