'use strict';

/**
 * Validate evidence metadata on Guide data modules that explicitly publish a `verification` object.
 *
 * This guard does not prove runtime/client evidence. It only keeps the public metadata taxonomy
 * coherent so a typo or legacy key cannot silently upgrade a Guide's claimed evidence level.
 */
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const ROOT = path.resolve(__dirname, '..');
const GUIDE_DATA_DIR = path.join(ROOT, 'data', 'guides');
const ALLOWED_LEVELS = new Set([
  'source-verified',
  'server-verified',
  'live-client-verified',
  'reconciled-reference'
]);
const ALLOWED_LIVE_CLIENT = new Set(['not-asserted', 'verified']);
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const failures = [];

function fail(message) {
  failures.push(message);
}

function isValidDate(value) {
  if (typeof value !== 'string' || !DATE_RE.test(value)) return false;
  const parsed = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
}

function loadGuideData(file) {
  const stat = fs.lstatSync(file);
  if (!stat.isFile() || stat.isSymbolicLink()) {
    throw new Error('must be a regular non-symlink file');
  }

  const source = fs.readFileSync(file, 'utf8');
  const sandbox = { window: Object.create(null) };
  vm.createContext(sandbox, {
    name: `pixelweb-guide-evidence-${path.basename(file)}`,
    codeGeneration: { strings: false, wasm: false }
  });
  vm.runInContext(source, sandbox, {
    filename: path.relative(ROOT, file),
    timeout: 1000
  });
  return Object.values(sandbox.window).filter(value => value && typeof value === 'object');
}

const files = fs.readdirSync(GUIDE_DATA_DIR, { withFileTypes: true })
  .filter(entry => entry.isFile() && entry.name.endsWith('.js'))
  .map(entry => path.join(GUIDE_DATA_DIR, entry.name))
  .sort();

let verificationCount = 0;

for (const file of files) {
  const relative = path.relative(ROOT, file).replaceAll('\\', '/');
  let exports;
  try {
    exports = loadGuideData(file);
  } catch (error) {
    fail(`${relative}: unable to load Guide data in restricted VM (${error.message})`);
    continue;
  }

  for (const data of exports) {
    const verification = data.verification;
    if (!verification || typeof verification !== 'object') continue;
    verificationCount += 1;

    if (Object.prototype.hasOwnProperty.call(verification, 'clientPresentation')) {
      fail(`${relative}: legacy verification.clientPresentation is forbidden; use verification.liveClient`);
    }

    const level = verification.level;
    if (!ALLOWED_LEVELS.has(level)) {
      fail(`${relative}: verification.level must use the canonical evidence taxonomy, found ${JSON.stringify(level)}`);
    }

    const verifiedAsOf = verification.verifiedAsOf;
    if (!isValidDate(verifiedAsOf)) {
      fail(`${relative}: verification.verifiedAsOf must be a real YYYY-MM-DD date`);
    } else {
      const verificationTime = Date.parse(`${verifiedAsOf}T00:00:00Z`);
      if (verificationTime > Date.now()) {
        fail(`${relative}: verification.verifiedAsOf cannot be in the future (${verifiedAsOf})`);
      }
    }

    const liveClient = verification.liveClient;
    if (!ALLOWED_LIVE_CLIENT.has(liveClient)) {
      fail(
        `${relative}: verification.liveClient must be 'not-asserted' or 'verified', found ${JSON.stringify(liveClient)}`
      );
      continue;
    }

    if (level === 'live-client-verified' && liveClient !== 'verified') {
      fail(`${relative}: live-client-verified evidence requires verification.liveClient='verified'`);
    }
    if (liveClient === 'verified' && level !== 'live-client-verified') {
      fail(`${relative}: verification.liveClient='verified' requires level='live-client-verified'`);
    }
  }
}

if (verificationCount === 0) {
  fail('data/guides: no Guide verification objects were found; evidence contract was not exercised');
}

if (failures.length) {
  console.error('Guide evidence metadata validation failed:');
  for (const failure of failures) console.error(`  ${failure}`);
  process.exit(1);
}

console.log(
  `Guide evidence metadata validation passed for ${verificationCount} verification-bearing Guide data modules.`
);
