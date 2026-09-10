'use strict';

/**
 * Validate PixelWeb's canonical browser-public data model without external dependencies.
 *
 * This is intentionally a product-contract validator, not a second source of rendering data.
 * It catches contradictions inside data/network.js and forces intentional review when current
 * product invariants (four Worlds, separate Nexus, preview Forum, partial Skyblock) change.
 */
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const ROOT = path.resolve(__dirname, '..');
const DATA_FILE = path.join(ROOT, 'data', 'network.js');
const failures = [];

const fail = message => failures.push(message);
const check = (condition, message) => {
  if (!condition) fail(message);
};

const unique = values => new Set(values).size === values.length;
const isPositiveInteger = value => Number.isInteger(value) && value > 0;
const isRootHtml = value => typeof value === 'string' && /^[A-Za-z0-9._-]+\.html$/.test(value);
const isHttpsUrl = value => {
  if (typeof value !== 'string' || !value.trim()) return false;
  try {
    return new URL(value).protocol === 'https:';
  } catch {
    return false;
  }
};

function loadCanonicalData() {
  const source = fs.readFileSync(DATA_FILE, 'utf8');
  const sandbox = { window: Object.create(null) };
  vm.createContext(sandbox, {
    name: 'pixelweb-public-data-validation',
    codeGeneration: { strings: false, wasm: false }
  });
  vm.runInContext(source, sandbox, {
    filename: 'data/network.js',
    timeout: 1000
  });
  return sandbox.window.PIXEL_NETWORK_PUBLIC;
}

let data;
try {
  data = loadCanonicalData();
} catch (error) {
  console.error(`Canonical public data validation failed to load data/network.js: ${error.message}`);
  process.exit(1);
}

check(data && typeof data === 'object', 'data/network.js must expose window.PIXEL_NETWORK_PUBLIC');
if (!data || typeof data !== 'object') {
  console.error('Canonical public data validation failed:');
  failures.forEach(message => console.error(`  ${message}`));
  process.exit(1);
}

check(Object.isFrozen(data), 'top-level public data object must remain frozen');
check(data.meta?.brand === 'Pixel Network', 'canonical brand must remain Pixel Network');
check(typeof data.server?.ip === 'string' && data.server.ip.trim().length > 0, 'server IP must be non-empty');
check(!/^[a-z]+:\/\//i.test(data.server?.ip || ''), 'server IP must be an address, not a URL with embedded scheme');

for (const [label, value] of [
  ['Discord', data.community?.discordUrl],
  ['legacy documentation', data.community?.legacyDocumentationUrl],
  ['external changelog', data.changelog?.externalUrl],
  ['Store', data.store?.url]
]) {
  check(isHttpsUrl(value), `${label} public URL must use HTTPS`);
}

for (const [label, value] of [
  ['Forum landing', data.community?.forumLanding],
  ['Guides landing', data.community?.guidesLanding],
  ['Changelog landing', data.changelog?.landing],
  ['Store landing', data.store?.landing]
]) {
  check(isRootHtml(value), `${label} must be a top-level local .html page`);
  if (isRootHtml(value)) {
    check(fs.existsSync(path.join(ROOT, value)), `${label} target does not exist: ${value}`);
  }
}

check(Number.isInteger(data.development?.completion), 'development completion must be an integer');
check(
  Number.isInteger(data.development?.completion) && data.development.completion >= 0 && data.development.completion <= 100,
  'development completion must stay between 0 and 100'
);

for (const [label, value] of [
  ['max level', data.progression?.maxLevel],
  ['max Prestige', data.progression?.maxPrestige],
  ['max Legacy', data.progression?.maxLegacy]
]) {
  check(isPositiveInteger(value), `progression ${label} must be a positive integer`);
}

const worlds = Array.isArray(data.worlds) ? data.worlds : [];
const expectedWorldNames = ['Overworld', 'Pirate Kingdom', 'Nether', 'Winter'];
check(worlds.length === 4, 'current progression route must contain exactly four Worlds');
check(data.content?.currentWorlds === worlds.length, 'content.currentWorlds must equal worlds.length');
check(
  worlds.map(world => world?.name).join('|') === expectedWorldNames.join('|'),
  `current World order must remain ${expectedWorldNames.join(' -> ')}`
);
check(unique(worlds.map(world => world?.id)), 'World ids must be unique');
check(unique(worlds.map(world => world?.name)), 'World names must be unique');
check(
  worlds.every((world, index) => world?.order === index + 1),
  'World order values must be contiguous and match array order'
);
check(
  worlds.every(world => isPositiveInteger(world?.mines)),
  'every World must declare a positive integer mine count'
);
check(
  !worlds.some(world => /nexus/i.test(`${world?.id || ''} ${world?.name || ''}`)),
  'Nexus must remain separate from the Worlds array'
);

const mineTotal = worlds.reduce((sum, world) => sum + (Number.isInteger(world?.mines) ? world.mines : 0), 0);
check(data.content?.mines === mineTotal, `content.mines must equal summed World mines (${mineTotal})`);

const worldBossEncounterTotal = worlds.reduce(
  (sum, world) => sum + (world?.boss ? 1 : 0) + (world?.optionalEncounter ? 1 : 0),
  0
);
check(
  data.content?.worldBossEncounters === worldBossEncounterTotal,
  `content.worldBossEncounters must equal declared World encounters (${worldBossEncounterTotal})`
);

const nexus = data.nexus || {};
const instances = Array.isArray(nexus.instances) ? nexus.instances : [];
const expectedInstanceNames = ['Raphael', 'Azazel', 'Abyss + Astral'];
check(nexus.unlock === nexus.unlockMilestone, 'Nexus unlock and unlockMilestone must not drift');
check(nexus.requiredBoss === null, 'current Nexus access must not require a boss');
check(nexus.vikingRequired === false, 'Viking must not become a Nexus requirement without intentional contract update');
check(nexus.accessPersists === true, 'Nexus access must remain permanent once unlocked');
check(data.content?.instanceEncounters === instances.length, 'instanceEncounters must equal nexus.instances.length');
check(
  instances.map(instance => instance?.name).join('|') === expectedInstanceNames.join('|'),
  `current Nexus encounter order must remain ${expectedInstanceNames.join(' -> ')}`
);
check(unique(instances.map(instance => instance?.name)), 'Nexus encounter names must be unique');

const derivedBossCount = instances.reduce((sum, instance) => {
  if (typeof instance?.name !== 'string') return sum;
  return sum + instance.name.split(/\s+\+\s+/).filter(Boolean).length;
}, 0);
check(
  data.content?.instanceBosses === derivedBossCount,
  `content.instanceBosses must equal bosses represented by instance names (${derivedBossCount})`
);

const expectedDifficultyNames = ['Easy', 'Medium', 'Hard'];
for (const instance of instances) {
  const difficulties = Array.isArray(instance?.difficulties) ? instance.difficulties : [];
  check(
    difficulties.length === data.content?.instanceDifficulties,
    `${instance?.name || 'Unnamed instance'} difficulty count must equal content.instanceDifficulties`
  );
  check(
    difficulties.map(difficulty => difficulty?.name).join('|') === expectedDifficultyNames.join('|'),
    `${instance?.name || 'Unnamed instance'} difficulty order must remain Easy -> Medium -> Hard`
  );
  check(unique(difficulties.map(difficulty => difficulty?.name)), `${instance?.name || 'Unnamed instance'} difficulty names must be unique`);
  check(
    difficulties.every(difficulty => typeof difficulty?.unlock === 'string' && difficulty.unlock.trim()),
    `${instance?.name || 'Unnamed instance'} difficulties must declare unlock milestones`
  );
}

check(data.community?.forum?.mode === 'preview', 'Forum must remain explicitly marked preview until persistent auth exists');
check(data.community?.forum?.persistent === false, 'preview Forum must not claim persistence');
check(data.community?.forum?.accountSystemAvailable === false, 'preview Forum must not claim an account system');

const skyblock = data.skyblock || {};
const skyblockFeatures = Array.isArray(skyblock.features) ? skyblock.features : [];
const skyblockPartial = Array.isArray(skyblock.partialFeatures) ? skyblock.partialFeatures : [];
check(skyblock.evidence === 'source-verified', 'current Skyblock evidence must remain source-verified');
check(skyblock.state === 'partial', 'Skyblock must remain partial until player-facing team wiring is re-verified');
check(skyblockPartial.length > 0, 'partial Skyblock state must declare its incomplete features');
check(unique(skyblockFeatures), 'current Skyblock features must be unique');
check(
  !skyblockFeatures.some(feature => /invite|team management|promotion|co-op|collabor/i.test(feature)),
  'incomplete Skyblock collaboration controls must not appear in the current feature list'
);

const ranks = Array.isArray(data.store?.ranks) ? data.store.ranks : [];
const categories = Array.isArray(data.store?.purchaseCategories) ? data.store.purchaseCategories : [];
check(ranks.length > 0 && unique(ranks), 'Store ranks must be a non-empty unique progression');
check(categories.length > 0 && unique(categories), 'Store purchase categories must be non-empty and unique');
check(data.store?.thresholdsVerified === false, 'Store thresholds must not be published as verified without evidence');
check(data.store?.thresholds === null, 'unverified Store thresholds must not expose invented values');

const planned = Array.isArray(data.planned) ? data.planned : [];
check(unique(planned), 'planned feature entries must be unique');

if (failures.length) {
  console.error('Canonical public data validation failed:');
  failures.forEach(message => console.error(`  ${message}`));
  process.exit(1);
}

console.log(
  `Canonical public data validation passed: ${worlds.length} Worlds, ${mineTotal} mines, ` +
  `${worldBossEncounterTotal} World encounters, ${instances.length} Nexus encounters and ${derivedBossCount} instance bosses.`
);
