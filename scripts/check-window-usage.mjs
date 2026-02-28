import fs from 'node:fs/promises';
import path from 'node:path';

const ROOT = process.cwd();
const BASELINE_PATH = path.join(ROOT, 'docs', 'metrics', 'window_usage_baseline.json');
const TARGET_DIRS = ['game', 'engine', 'data'];

const ALLOWLIST = new Set([
  'game/core/global_bridge.js',
  'game/core/event_bindings.js',
]);

const ALLOW_PREFIXES = ['game/core/bindings/'];

function toPosix(p) {
  return p.split(path.sep).join('/');
}

function isAllowed(fileRel) {
  if (ALLOWLIST.has(fileRel)) return true;
  return ALLOW_PREFIXES.some((prefix) => fileRel.startsWith(prefix));
}

async function collectFiles(dir) {
  const out = [];
  const entries = await fs.readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      out.push(...(await collectFiles(full)));
      continue;
    }
    if (entry.isFile() && full.endsWith('.js')) out.push(full);
  }
  return out;
}

function countWindowUsage(source) {
  const matches = source.match(/\bwindow\./g);
  return matches ? matches.length : 0;
}

async function computeCounts() {
  const counts = {};
  for (const relDir of TARGET_DIRS) {
    const absDir = path.join(ROOT, relDir);
    const files = await collectFiles(absDir);
    for (const fileAbs of files) {
      const fileRel = toPosix(path.relative(ROOT, fileAbs));
      if (isAllowed(fileRel)) continue;
      const source = await fs.readFile(fileAbs, 'utf8');
      const count = countWindowUsage(source);
      if (count > 0) counts[fileRel] = count;
    }
  }
  return counts;
}

function sumCounts(byFile) {
  return Object.values(byFile).reduce((sum, n) => sum + n, 0);
}

async function writeBaseline(byFile) {
  const payload = {
    generatedAt: new Date().toISOString(),
    total: sumCounts(byFile),
    byFile,
  };
  await fs.mkdir(path.dirname(BASELINE_PATH), { recursive: true });
  await fs.writeFile(BASELINE_PATH, `${JSON.stringify(payload, null, 2)}\n`, 'utf8');
}

async function readBaseline() {
  try {
    const raw = await fs.readFile(BASELINE_PATH, 'utf8');
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function compareAgainstBaseline(current, baseline) {
  const failures = [];
  const baselineByFile = baseline?.byFile || {};

  for (const [file, count] of Object.entries(current)) {
    const baseCount = baselineByFile[file] || 0;
    if (count > baseCount) {
      failures.push(`${file}: ${count} (baseline ${baseCount})`);
    }
  }

  return failures;
}

async function main() {
  const shouldWrite = process.argv.includes('--write-baseline');
  const current = await computeCounts();

  if (shouldWrite) {
    await writeBaseline(current);
    console.log(`Window usage baseline written (${sumCounts(current)} total).`);
    return;
  }

  const baseline = await readBaseline();
  if (!baseline) {
    console.error(`Missing baseline: ${toPosix(path.relative(ROOT, BASELINE_PATH))}`);
    console.error('Run: node scripts/check-window-usage.mjs --write-baseline');
    process.exit(1);
  }

  const failures = compareAgainstBaseline(current, baseline);
  if (failures.length > 0) {
    console.error('Window usage check failed (new direct window usage growth detected):');
    for (const line of failures) console.error(`- ${line}`);
    process.exit(1);
  }

  console.log(`Window usage check passed (${sumCounts(current)} current, baseline ${baseline.total}).`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

