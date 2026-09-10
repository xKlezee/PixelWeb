'use strict';

/**
 * Validate PixelWeb's canonical browser-public data model without external dependencies.
 *
 * This is intentionally a product-contract validator, not a second source of rendering data.
 * It catches contradictions inside data/network.js and forces intentional review when current
 * product invariants or approved public destinations/media origins change.
 */
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const ROOT = path.resolve(__dirname, '..');
const DATA_FILE = path.join(ROOT, 'data', 'network.js');
const WORLD_MEDIA_FILE = path.join(ROOT, 'data', 'worlds-media.js');
const PUBLIC_SITE_BASE = new URL('https://xklezee.github.io/PixelWeb/');
const failures = [];

const EXPECTED_PUBLIC_URLS = Object.freeze({
  discord: 'https://discord.gg/7KzWpezTNZ',
  legacyDocumentation: 'https://pixel-network-1.gitbook.io/home/documentation',
  changelog: 'https://pixel-network-1.gitbook.io/home/changelog',
  store: 'https://pixelboxx.tebex.io/'
});
const WORLD_IMAGE_PROXY_ORIGIN = 'https://pixel-network-1.gitbook.io';
const WORLD_IMAGE_PROXY_PATH = '/home/~gitbook/image';
const WORLD_IMAGE_STORAGE_ORIGIN = 'https://712597880-files.gitbook.io';
const WORLD_IMAGE_STORAGE_PATH_PREFIX = '/~/files/v0/b/gitbook-x-prod.appspot.com/o/spaces/n7xotQKtgeq6qSw4VBXF/uploads/';
const HTML_COMMENT_RE = /<!--[\s\S]*?-->/g;
const ANCHOR_HREF_RE = /<a\b[^>]*\bhref\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/gi;
const NON_NAVIGATION_PREFIXES = ['#', 'mailto:', 'tel:'];
const SKYBLOCK_INTERNAL_COPY_RE = /\b(?:source|wiring|command|manager|database|implementation|class)\b/i;
const SKYBLOCK_PARTIAL_STATES = new Set(['Partial', 'Planned']);

const fail = message => failures.push(message);
const check = (condition, message) => {
  if (!condition) fail(message);
};

const unique = values => new Set(values).size === values.length;
const isPositiveInteger = value => Number.isInteger(value) && value > 0;
const isRootHtml = value => typeof value === 'string' && /^[A-Za-z0-9._-]+\.html$/.test(value);

const exactHttpsUrl = (value, expected) => {
  if (typeof value !== 'string' || !value.trim()) return false;
  try {
    const actual = new URL(value);
    const canonical = new URL(expected);
    return actual.protocol === 'https:' && actual.href === canonical.href;
  } catch {
    return false;
  }
};

const approvedWorldLandscape = value => {
  if (typeof value !== 'string' || !value.trim()) return false;
  try {
    const outer = new URL(value);
    if (
      outer.protocol !== 'https:' ||
      outer.origin !== WORLD_IMAGE_PROXY_ORIGIN ||
      outer.pathname !== WORLD_IMAGE_PROXY_PATH ||
      outer.username || outer.password || outer.hash
    ) {
      return false;
    }

    const nestedValue = outer.searchParams.get('url');
    if (!nestedValue) return false;
    const nested = new URL(nestedValue);
    const decodedStoragePath = decodeURIComponent(nested.pathname);
    return (
      nested.protocol === 'https:' &&
      nested.origin === WORLD_IMAGE_STORAGE_ORIGIN &&
      decodedStoragePath.startsWith(WORLD_IMAGE_STORAGE_PATH_PREFIX) &&
      !nested.username && !nested.password && !nested.hash
    );
  } catch {
    return false;
  }
};

const approvedLocalWorldMedia = value => {
  if (typeof value !== 'string' || !/^assets\/worlds\/[A-Za-z0-9._-]+\.(?:svg|png|jpe?g|webp|avif)$/i.test(value)) {
    return false;
  }
  try {
    const stat = fs.lstatSync(path.join(ROOT, value));
    return stat.isFile() && !stat.isSymbolicLink();
  } catch {
    return false;
  }
};

function loadWindowExport(file, exportName) {
  const stat = fs.lstatSync(file);
  if (!stat.isFile() || stat.isSymbolicLink()) {
    throw new Error(`${path.relative(ROOT, file)} must be a regular non-symlink file`);
  }

  const source = fs.readFileSync(file, 'utf8');
  const sandbox = { window: Object.create(null) };
  vm.createContext(sandbox, {
    name: 'pixelweb-public-data-validation',
    codeGeneration: { strings: false, wasm: false }
  });
  vm.runInContext(source, sandbox, {
    filename: path.relative(ROOT, file),
    timeout: 1000
  });
  return sandbox.window[exportName];
}

function validateStaticExternalNavigation(data) {
  const approvedExternal = new Set([
    data.community?.discordUrl,
    data.community?.legacyDocumentationUrl,
    data.changelog?.externalUrl,
    data.store?.url
  ].map(value => {
    try {
      return new URL(value).href;
    } catch {
      return null;
    }
  }).filter(Boolean));

  const htmlFiles = fs.readdirSync(ROOT, { withFileTypes: true })
    .filter(entry => entry.isFile() && entry.name.endsWith('.html'))
    .map(entry => entry.name)
    .sort();

  for (const fileName of htmlFiles) {
    const source = fs.readFileSync(path.join(ROOT, fileName), 'utf8').replace(HTML_COMMENT_RE, '');
    ANCHOR_HREF_RE.lastIndex = 0;
    let match;
    while ((match = ANCHOR_HREF_RE.exec(source)) !== null) {
      const raw = (match[1] ?? match[2] ?? match[3] ?? '').trim();
      if (!raw || NON_NAVIGATION_PREFIXES.some(prefix => raw.startsWith(prefix))) continue;
      if (raw.startsWith('//')) {
        fail(`${fileName}: protocol-relative anchor destination is not allowed (${raw})`);
        continue;
      }

      let url;
      try {
        url = new URL(raw, PUBLIC_SITE_BASE);
      } catch {
        continue; // validate_site.py owns malformed/local-reference diagnostics.
      }

      const hasExplicitScheme = /^[A-Za-z][A-Za-z0-9+.-]*:/.test(raw);
      if (!hasExplicitScheme) continue;
      if (url.protocol !== 'https:') continue; // validate_site.py owns insecure/dangerous scheme diagnostics.

      const sameProjectSite = (
        url.origin === PUBLIC_SITE_BASE.origin &&
        (url.pathname === '/PixelWeb' || url.pathname.startsWith('/PixelWeb/'))
      );
      if (sameProjectSite) continue;

      check(
        approvedExternal.has(url.href),
        `${fileName}: external anchor must match a canonical public destination from data/network.js (${raw})`
      );
    }
  }
}

let data;
let worldMedia;
try {
  data = loadWindowExport(DATA_FILE, 'PIXEL_NETWORK_PUBLIC');
  worldMedia = loadWindowExport(WORLD_MEDIA_FILE, 'PIXEL_WORLDS_MEDIA');
} catch (error) {
  console.error(`Canonical public data validation failed to load public data: ${error.message}`);
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

for (const [label, value, expected] of [
  ['Discord', data.community?.discordUrl, EXPECTED_PUBLIC_URLS.discord],
  ['legacy documentation', data.community?.legacyDocumentationUrl, EXPECTED_PUBLIC_URLS.legacyDocumentation],
  ['external changelog', data.changelog?.externalUrl, EXPECTED_PUBLIC_URLS.changelog],
  ['Store', data.store?.url, EXPECTED_PUBLIC_URLS.store]
]) {
  check(exactHttpsUrl(value, expected), `${label} public URL must remain the approved canonical HTTPS destination (${expected})`);
}

validateStaticExternalNavigation(data);

for (const [label, value] of [
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

check(worldMedia && typeof worldMedia === 'object', 'data/worlds-media.js must expose window.PIXEL_WORLDS_MEDIA');
if (worldMedia && typeof worldMedia === 'object') {
  check(Object.isFrozen(worldMedia), 'top-level Worlds media object must remain frozen');
  const expectedMediaIds = worlds.map(world => world.id).sort();
  const actualMediaIds = Object.keys(worldMedia).sort();
  check(
    actualMediaIds.join('|') === expectedMediaIds.join('|'),
    'Worlds media keys must match the canonical World ids exactly'
  );

  for (const world of worlds) {
    const visual = worldMedia[world.id];
    check(visual && typeof visual === 'object', `${world.name} must have a Worlds media entry`);
    if (!visual || typeof visual !== 'object') continue;

    check(
      approvedWorldLandscape(visual.source),
      `${world.name} landscape must use the approved Pixel GitBook image proxy and Pixel GitBook storage space`
    );
    check(
      visual.boss && approvedLocalWorldMedia(visual.boss.source),
      `${world.name} boss artwork must be an existing local assets/worlds resource`
    );

    if (world.optionalEncounter) {
      check(
        visual.optionalBoss && approvedLocalWorldMedia(visual.optionalBoss.source),
        `${world.name} optional boss artwork must be an existing local assets/worlds resource`
      );
    } else {
      check(!visual.optionalBoss, `${world.name} must not declare optional boss media without a canonical optional encounter`);
    }
  }
}

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

const skyblock = data.skyblock || {};
const skyblockFeatures = Array.isArray(skyblock.features) ? skyblock.features : [];
const skyblockPartial = Array.isArray(skyblock.partialFeatures) ? skyblock.partialFeatures : [];
check(skyblock.evidence === 'source-verified', 'current Skyblock evidence must remain source-verified');
check(skyblock.state === 'partial', 'Skyblock must remain partial until collaboration controls are re-verified as player-available');
check(skyblockPartial.length > 0, 'partial Skyblock state must declare its incomplete features');
check(unique(skyblockFeatures), 'current Skyblock features must be unique');
check(
  !skyblockFeatures.some(feature => /invite|team management|promotion|co-op|collabor/i.test(feature)),
  'incomplete Skyblock collaboration controls must not appear in the current feature list'
);
check(
  unique(skyblockPartial.map(item => item?.name)),
  'partial Skyblock feature names must be unique'
);
check(
  skyblockPartial.every(item => SKYBLOCK_PARTIAL_STATES.has(item?.status)),
  'partial Skyblock feature status must use the player-facing Partial/Planned taxonomy'
);
check(
  skyblockPartial.every(item => typeof item?.detail === 'string' && item.detail.trim()),
  'partial Skyblock features must have non-empty player-facing descriptions'
);
check(
  skyblockPartial.every(item => !SKYBLOCK_INTERNAL_COPY_RE.test(item?.detail || '')),
  'partial Skyblock public descriptions must not expose source/wiring/command/manager/database implementation details'
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
  `${worldBossEncounterTotal} World encounters, ${instances.length} Nexus encounters, ` +
  `${derivedBossCount} instance bosses and canonical static/external destinations.`
);