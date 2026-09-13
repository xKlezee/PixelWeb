'use strict';

/**
 * Keep the leaderboard editorial catalogue owned by PixelWeb.
 *
 * The future trusted server exporter may update source metadata and metric entries, but it must
 * not rewrite player-facing category/metric labels, descriptions, kickers or units. This guard
 * compares the browser fallback catalogue against the published JSON snapshot without maintaining
 * a third copy of that editorial metadata in validation code.
 */
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const ROOT = path.resolve(__dirname, '..');
const FALLBACK_FILE = path.join(ROOT, 'data', 'leaderboards.js');
const SNAPSHOT_FILE = path.join(ROOT, 'data', 'leaderboards.json');

function loadFallback() {
  const stat = fs.lstatSync(FALLBACK_FILE);
  if (!stat.isFile() || stat.isSymbolicLink()) {
    throw new Error('data/leaderboards.js must be a regular non-symlink file');
  }

  const source = fs.readFileSync(FALLBACK_FILE, 'utf8');
  const sandbox = { window: Object.create(null) };
  vm.createContext(sandbox, {
    name: 'pixelweb-leaderboards-catalog-validation',
    codeGeneration: { strings: false, wasm: false }
  });
  vm.runInContext(source, sandbox, {
    filename: 'data/leaderboards.js',
    timeout: 1000
  });
  return sandbox.window.PIXEL_LEADERBOARDS;
}

function loadSnapshot() {
  const stat = fs.lstatSync(SNAPSHOT_FILE);
  if (!stat.isFile() || stat.isSymbolicLink()) {
    throw new Error('data/leaderboards.json must be a regular non-symlink file');
  }
  return JSON.parse(fs.readFileSync(SNAPSHOT_FILE, 'utf8'));
}

function normalizeCatalog(data, sourceLabel) {
  if (!data || typeof data !== 'object' || !Array.isArray(data.categories)) {
    throw new Error(`${sourceLabel}: categories must be an array`);
  }

  return data.categories.map((category, categoryIndex) => {
    if (!category || typeof category !== 'object' || !Array.isArray(category.metrics)) {
      throw new Error(`${sourceLabel}: category ${categoryIndex + 1} must contain a metrics array`);
    }

    return {
      id: category.id,
      label: category.label,
      short: category.short,
      description: category.description,
      metrics: category.metrics.map((metric, metricIndex) => {
        if (!metric || typeof metric !== 'object') {
          throw new Error(
            `${sourceLabel}: category ${category.id || categoryIndex + 1} metric ${metricIndex + 1} must be an object`
          );
        }
        return {
          id: metric.id,
          label: metric.label,
          kicker: metric.kicker,
          description: metric.description,
          unit: metric.unit
        };
      })
    };
  });
}

function firstDifference(expected, actual) {
  const expectedText = JSON.stringify(expected, null, 2).split('\n');
  const actualText = JSON.stringify(actual, null, 2).split('\n');
  const length = Math.max(expectedText.length, actualText.length);
  for (let index = 0; index < length; index += 1) {
    if (expectedText[index] !== actualText[index]) {
      return {
        line: index + 1,
        expected: expectedText[index] ?? '<missing>',
        actual: actualText[index] ?? '<missing>'
      };
    }
  }
  return null;
}

let fallback;
let snapshot;
try {
  fallback = loadFallback();
  snapshot = loadSnapshot();
} catch (error) {
  console.error(`Leaderboard editorial catalog validation failed to load data: ${error.message}`);
  process.exit(1);
}

let fallbackCatalog;
let snapshotCatalog;
try {
  fallbackCatalog = normalizeCatalog(fallback, 'data/leaderboards.js');
  snapshotCatalog = normalizeCatalog(snapshot, 'data/leaderboards.json');
} catch (error) {
  console.error(`Leaderboard editorial catalog validation failed: ${error.message}`);
  process.exit(1);
}

const difference = firstDifference(fallbackCatalog, snapshotCatalog);
if (difference) {
  console.error('Leaderboard editorial catalog validation failed:');
  console.error(
    `  data/leaderboards.json must preserve PixelWeb-owned catalogue metadata; first difference at normalized line ${difference.line}`
  );
  console.error(`  fallback: ${difference.expected}`);
  console.error(`  snapshot: ${difference.actual}`);
  process.exit(1);
}

const metricCount = fallbackCatalog.reduce((sum, category) => sum + category.metrics.length, 0);
console.log(
  `Leaderboard editorial catalog validation passed: ${fallbackCatalog.length} categories / ${metricCount} metrics match exactly.`
);
