import fs from 'node:fs/promises';
import path from 'node:path';

const ROOT = process.cwd();
const BASELINE_PATH = path.join(ROOT, 'config', 'quality', 'window_usage_baseline.json');
const TARGETS_PATH = path.join(ROOT, 'config', 'quality', 'window_usage_targets.json');
const TARGET_DIRS = ['game', 'engine', 'data'];

const ALLOWLIST = new Set([
  'game/core/global_bridge.js',
  'game/core/event_bindings.js',
]);

const ALLOW_PREFIXES = ['game/core/bindings/'];

const ACCESS_PATTERNS = {
  window: /\bwindow\./g,
  document: /\bdocument\./g,
  globalThis: /\bglobalThis\./g,
};

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

function countPattern(source, pattern) {
  const matches = source.match(pattern);
  return matches ? matches.length : 0;
}

function countAccess(source) {
  const byKind = {};
  for (const [kind, pattern] of Object.entries(ACCESS_PATTERNS)) {
    byKind[kind] = countPattern(source, pattern);
  }
  const total = Object.values(byKind).reduce((sum, n) => sum + n, 0);
  return { total, byKind };
}

async function computeCounts() {
  const byFile = {};
  const byKind = Object.fromEntries(Object.keys(ACCESS_PATTERNS).map((key) => [key, 0]));

  for (const relDir of TARGET_DIRS) {
    const absDir = path.join(ROOT, relDir);
    const files = await collectFiles(absDir);
    for (const fileAbs of files) {
      const fileRel = toPosix(path.relative(ROOT, fileAbs));
      if (isAllowed(fileRel)) continue;

      const source = await fs.readFile(fileAbs, 'utf8');
      const counts = countAccess(source);
      if (counts.total > 0) {
        byFile[fileRel] = counts.total;
      }

      for (const [kind, count] of Object.entries(counts.byKind)) {
        byKind[kind] += count;
      }
    }
  }

  const total = Object.values(byFile).reduce((sum, n) => sum + n, 0);
  return { total, byFile, byKind };
}

async function writeJson(filePath, payload) {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, `${JSON.stringify(payload, null, 2)}\n`, 'utf8');
}

async function readJson(filePath) {
  try {
    const raw = await fs.readFile(filePath, 'utf8');
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function compareAgainstBaseline(current, baseline) {
  const failures = [];
  const baselineByFile = baseline?.byFile || {};

  for (const [file, count] of Object.entries(current.byFile)) {
    const baseCount = baselineByFile[file] || 0;
    if (count > baseCount) {
      failures.push(`${file}: ${count} (baseline ${baseCount})`);
    }
  }

  return failures;
}

function compareAgainstTargets(current, targets) {
  const failures = [];

  const totalMax = Number(targets?.totalMax);
  if (Number.isFinite(totalMax) && current.total > totalMax) {
    failures.push(`total: ${current.total} (target ${totalMax})`);
  }

  const byKindMax = targets?.byKindMax || {};
  for (const [kind, count] of Object.entries(current.byKind)) {
    const cap = Number(byKindMax[kind]);
    if (Number.isFinite(cap) && count > cap) {
      failures.push(`${kind}: ${count} (target ${cap})`);
    }
  }

  const defaultPerFileMax = Number(targets?.defaultPerFileMax);
  const byFileMax = targets?.byFileMax || {};

  for (const [file, count] of Object.entries(current.byFile)) {
    const explicitMax = Number(byFileMax[file]);
    const cap = Number.isFinite(explicitMax)
      ? explicitMax
      : (Number.isFinite(defaultPerFileMax) ? defaultPerFileMax : null);

    if (cap !== null && count > cap) {
      failures.push(`${file}: ${count} (target ${cap})`);
    }
  }

  return failures;
}

async function main() {
  const shouldWriteBaseline = process.argv.includes('--write-baseline');
  const shouldWriteTargets = process.argv.includes('--write-targets');
  const current = await computeCounts();

  if (shouldWriteBaseline) {
    await writeJson(BASELINE_PATH, {
      generatedAt: new Date().toISOString(),
      total: current.total,
      byFile: current.byFile,
      byKind: current.byKind,
    });
    console.log(`Window usage baseline written (${current.total} total).`);
    return;
  }

  if (shouldWriteTargets) {
    await writeJson(TARGETS_PATH, {
      generatedAt: new Date().toISOString(),
      totalMax: current.total,
      byKindMax: current.byKind,
      defaultPerFileMax: null,
      byFileMax: current.byFile,
    });
    console.log(`Window usage targets written (${current.total} total max).`);
    return;
  }

  const targets = await readJson(TARGETS_PATH);
  if (targets) {
    const failures = compareAgainstTargets(current, targets);
    if (failures.length > 0) {
      console.error('Window/document/globalThis usage target check failed:');
      for (const line of failures) console.error(`- ${line}`);
      process.exit(1);
    }

    console.log(`Window/document/globalThis target check passed (${current.total} current, target ${targets.totalMax}).`);
    return;
  }

  const baseline = await readJson(BASELINE_PATH);
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

  console.log(`Window usage check passed (${current.total} current, baseline ${baseline.total}).`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
