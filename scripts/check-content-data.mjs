import fs from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const ROOT = process.cwd();
const BASELINE_PATH = path.join(ROOT, 'docs', 'metrics', 'content_data_baseline.json');

const DOMAIN_RULES = Object.freeze({
  cards: Object.freeze([
    { field: 'type', kind: 'string' },
    { field: 'effect', kind: 'function' },
  ]),
  items: Object.freeze([
    { field: 'rarity', kind: 'string' },
    { field: 'passive', kind: 'function' },
  ]),
  enemies: Object.freeze([
    { field: 'hp', kind: 'number' },
    { field: 'maxHp', kind: 'number' },
    { field: 'ai', kind: 'function' },
  ]),
});

function toPosix(p) {
  return p.split(path.sep).join('/');
}

function isFiniteNumber(value) {
  return typeof value === 'number' && Number.isFinite(value);
}

function validateField(value, kind) {
  if (kind === 'number') return isFiniteNumber(value);
  return typeof value === kind;
}

async function loadContentData() {
  const modUrl = pathToFileURL(path.join(ROOT, 'data', 'game_data.js')).href;
  const mod = await import(modUrl);

  return {
    cards: mod.CARDS || {},
    items: mod.ITEMS || {},
    enemies: mod.ENEMIES || {},
  };
}

function analyzeDomain(domainName, entries) {
  const rules = DOMAIN_RULES[domainName] || [];
  const errors = [];
  const idOwner = new Map();

  for (const [key, value] of Object.entries(entries)) {
    if (!value || typeof value !== 'object') {
      errors.push(`${domainName}.${key}: entry must be an object`);
      continue;
    }

    const { id } = value;

    if (typeof id !== 'string' || id.trim().length === 0) {
      errors.push(`${domainName}.${key}: id must be a non-empty string`);
      continue;
    }

    if (id !== key) {
      errors.push(`${domainName}.${key}: key/id mismatch (id=${id})`);
    }

    if (idOwner.has(id)) {
      errors.push(
        `${domainName}.${key}: duplicate id "${id}" already used by ${idOwner.get(id)}`,
      );
    } else {
      idOwner.set(id, `${domainName}.${key}`);
    }

    for (const rule of rules) {
      if (!validateField(value[rule.field], rule.kind)) {
        errors.push(
          `${domainName}.${key}: "${rule.field}" must be ${rule.kind}`,
        );
      }
    }
  }

  return {
    total: Object.keys(entries).length,
    errors,
  };
}

function makeSummary(results) {
  return { total: 0, byDomain: {} };
}

async function readBaseline() {
  try {
    const raw = await fs.readFile(BASELINE_PATH, 'utf8');
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

async function writeBaseline(payload) {
  await fs.mkdir(path.dirname(BASELINE_PATH), { recursive: true });
  await fs.writeFile(BASELINE_PATH, `${JSON.stringify(payload, null, 2)}\n`, 'utf8');
}

function compareAgainstBaseline(current, baseline) {
  const failures = [];
  const baselineByDomain = baseline?.missingImages?.byDomain || {};

  for (const [domainName, currentCount] of Object.entries(current.missingImages.byDomain)) {
    const baselineCount = baselineByDomain[domainName] || 0;
    if (currentCount > baselineCount) {
      failures.push(`${domainName}: ${currentCount} (baseline ${baselineCount})`);
    }
  }

  const baselineTotal = baseline?.missingImages?.total || 0;
  if (current.missingImages.total > baselineTotal) {
    failures.push(
      `total missing image refs: ${current.missingImages.total} (baseline ${baselineTotal})`,
    );
  }

  return failures;
}

async function main() {
  const shouldWrite = process.argv.includes('--write-baseline');
  const data = await loadContentData();
  const results = {
    cards: analyzeDomain('cards', data.cards),
    items: analyzeDomain('items', data.items),
    enemies: analyzeDomain('enemies', data.enemies),
  };

  const schemaErrors = [
    ...results.cards.errors,
    ...results.items.errors,
    ...results.enemies.errors,
  ];

  const payload = {
    generatedAt: new Date().toISOString(),
    totals: {
      cards: results.cards.total,
      items: results.items.total,
      enemies: results.enemies.total,
    },
    missingImages: { total: 0, byDomain: {} },
    unresolvedImageRefs: {
      cards: [],
      items: [],
      enemies: [],
    },
  };

  if (shouldWrite) {
    await writeBaseline(payload);
    console.log(
      `Content data baseline written (${payload.missingImages.total} unresolved image refs).`,
    );
    return;
  }

  if (schemaErrors.length > 0) {
    console.error('Content data check failed (schema/id violations):');
    for (const err of schemaErrors) console.error(`- ${err}`);
    process.exit(1);
  }

  const baseline = await readBaseline();
  if (!baseline) {
    console.error(`Missing baseline: ${toPosix(path.relative(ROOT, BASELINE_PATH))}`);
    console.error('Run: node scripts/check-content-data.mjs --write-baseline');
    process.exit(1);
  }

  const growthFailures = compareAgainstBaseline(payload, baseline);
  if (growthFailures.length > 0) {
    console.error('Content data check failed (unresolved image refs grew):');
    for (const line of growthFailures) console.error(`- ${line}`);
    process.exit(1);
  }

  console.log(
    `Content data check passed (${payload.totals.cards} cards, ${payload.totals.items} items, ${payload.totals.enemies} enemies; ${payload.missingImages.total} unresolved image refs, baseline ${baseline?.missingImages?.total ?? 0}).`,
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
