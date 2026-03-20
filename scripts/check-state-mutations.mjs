import fs from 'node:fs/promises';
import path from 'node:path';

const ROOT = process.cwd();
const BASELINE_PATH = path.join(ROOT, 'docs', 'metrics', 'state_mutation_baseline.json');
const TARGETS_PATH = path.join(ROOT, 'docs', 'metrics', 'state_mutation_targets.json');
const TARGET_DIRS = ['game'];

const ALLOW_MUTATION_FILES = new Set([
  'game/core/state_actions.js',
  'game/core/game_state.js',
  'game/core/store/game_state.js',
  'game/shared/state/runtime_session_commands.js',
]);

const MUTATION_PATTERNS = [
  /\b(?:gs|this)\.(?:player|combat|meta|currentRegion|currentFloor|mapNodes|currentNode|visitedNodes|stats|worldMemory)\b.*(?:\+\+|--|\+=|-=|\*=|\/=|%=|=(?!=))/, 
  /\b(?:gs|this)\.(?:_selectedTarget|_bossRewardPending|_bossLastRegion|_endCombatRunning|_endCombatScheduled)\b.*(?:\+\+|--|\+=|-=|\*=|\/=|%=|=(?!=))/,
];

function toPosix(p) {
  return p.split(path.sep).join('/');
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

function countViolations(source) {
  const lines = source.split('\n');
  let count = 0;
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('//')) continue;
    if (MUTATION_PATTERNS.some((re) => re.test(trimmed))) count += 1;
  }
  return count;
}

async function computeCounts() {
  const counts = {};
  for (const relDir of TARGET_DIRS) {
    const absDir = path.join(ROOT, relDir);
    const files = await collectFiles(absDir);
    for (const fileAbs of files) {
      const fileRel = toPosix(path.relative(ROOT, fileAbs));
      if (ALLOW_MUTATION_FILES.has(fileRel)) continue;
      const source = await fs.readFile(fileAbs, 'utf8');
      const count = countViolations(source);
      if (count > 0) counts[fileRel] = count;
    }
  }
  return counts;
}

function sumCounts(byFile) {
  return Object.values(byFile).reduce((sum, n) => sum + n, 0);
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

  for (const [file, count] of Object.entries(current)) {
    const baseCount = baselineByFile[file] || 0;
    if (count > baseCount) {
      failures.push(`${file}: ${count} (baseline ${baseCount})`);
    }
  }

  return failures;
}

function compareAgainstTargets(current, targets) {
  const failures = [];
  const total = sumCounts(current);

  const totalMax = Number(targets?.totalMax);
  if (Number.isFinite(totalMax) && total > totalMax) {
    failures.push(`total: ${total} (target ${totalMax})`);
  }

  const defaultPerFileMax = Number(targets?.defaultPerFileMax);
  const byFileMax = targets?.byFileMax || {};

  for (const [file, count] of Object.entries(current)) {
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
  const total = sumCounts(current);

  if (shouldWriteBaseline) {
    await writeJson(BASELINE_PATH, {
      generatedAt: new Date().toISOString(),
      total,
      byFile: current,
    });
    console.log(`State mutation baseline written (${total} total).`);
    return;
  }

  if (shouldWriteTargets) {
    await writeJson(TARGETS_PATH, {
      generatedAt: new Date().toISOString(),
      totalMax: total,
      defaultPerFileMax: null,
      byFileMax: current,
    });
    console.log(`State mutation targets written (${total} total max).`);
    return;
  }

  const targets = await readJson(TARGETS_PATH);
  if (targets) {
    const failures = compareAgainstTargets(current, targets);
    if (failures.length > 0) {
      console.error('State mutation target check failed:');
      for (const line of failures) console.error(`- ${line}`);
      process.exit(1);
    }

    console.log(`State mutation target check passed (${total} current, target ${targets.totalMax}).`);
    return;
  }

  const baseline = await readJson(BASELINE_PATH);
  if (!baseline) {
    console.error(`Missing baseline: ${toPosix(path.relative(ROOT, BASELINE_PATH))}`);
    console.error('Run: node scripts/check-state-mutations.mjs --write-baseline');
    process.exit(1);
  }

  const failures = compareAgainstBaseline(current, baseline);
  if (failures.length > 0) {
    console.error('State mutation check failed (new direct mutation growth detected):');
    for (const line of failures) console.error(`- ${line}`);
    process.exit(1);
  }

  console.log(`State mutation check passed (${total} current, baseline ${baseline.total}).`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
