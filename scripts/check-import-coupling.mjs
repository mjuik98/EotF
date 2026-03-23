import fsSync from 'node:fs';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = process.cwd();
const POLICY_PATH = path.join(ROOT, 'config', 'architecture_policy.json');
const BASELINE_PATH = path.join(ROOT, 'config', 'quality', 'import_coupling_baseline.json');
const DEFAULT_IMPORT_COUPLING_TARGETS_FILE_PATH = path.join(ROOT, 'config', 'quality', 'import_coupling_targets.json');
export const IMPORT_COUPLING_TARGETS_PATH = DEFAULT_IMPORT_COUPLING_TARGETS_FILE_PATH.replaceAll('\\', '/');

function toPosix(p) {
  return p.split(path.sep).join('/');
}

async function readPolicy() {
  const raw = await fs.readFile(POLICY_PATH, 'utf8');
  return JSON.parse(raw);
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

function getLayer(fileRel, layerMatchers) {
  for (const matcher of layerMatchers) {
    if (fileRel.startsWith(matcher.prefix)) return matcher.layer;
  }
  return 'other';
}

function resolveImport(fileAbs, spec) {
  if (!spec.startsWith('.')) return null;
  const fileDir = path.dirname(fileAbs);
  const resolved = path.resolve(fileDir, spec);
  const withExt = path.extname(resolved) ? resolved : `${resolved}.js`;
  return toPosix(path.relative(ROOT, withExt));
}

export async function computeCoupling() {
  const policy = await readPolicy();
  const scanDirs = policy.scanDirs || ['game'];
  const layerMatchers = policy.layerMatchers || [];
  const counts = {};

  const files = [];
  for (const relDir of scanDirs) {
    files.push(...(await collectFiles(path.join(ROOT, relDir))));
  }

  for (const fileAbs of files) {
    const fileRel = toPosix(path.relative(ROOT, fileAbs));
    const sourceLayer = getLayer(fileRel, layerMatchers);
    const source = await fs.readFile(fileAbs, 'utf8');
    const importRegex = /^\s*import\s+[^'"]*['"]([^'"]+)['"]/gm;

    let match;
    while ((match = importRegex.exec(source)) !== null) {
      const targetRel = resolveImport(fileAbs, match[1]);
      if (!targetRel) continue;
      const targetLayer = getLayer(targetRel, layerMatchers);
      if (sourceLayer === 'other' || targetLayer === 'other') continue;
      if (sourceLayer === targetLayer) continue;

      const pair = `${sourceLayer}->${targetLayer}`;
      counts[pair] = (counts[pair] || 0) + 1;
    }
  }

  const byPair = Object.fromEntries(
    Object.entries(counts).sort(([a], [b]) => a.localeCompare(b)),
  );

  return {
    total: Object.values(byPair).reduce((sum, count) => sum + count, 0),
    byPair,
  };
}

async function writeBaseline(payload) {
  await fs.mkdir(path.dirname(BASELINE_PATH), { recursive: true });
  await fs.writeFile(
    BASELINE_PATH,
    `${JSON.stringify({ ...payload, generatedAt: new Date().toISOString() }, null, 2)}\n`,
    'utf8',
  );
}

async function readBaseline() {
  try {
    const raw = await fs.readFile(BASELINE_PATH, 'utf8');
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function readCouplingTargets(targetsPath = DEFAULT_IMPORT_COUPLING_TARGETS_FILE_PATH) {
  return JSON.parse(fsSync.readFileSync(targetsPath, 'utf8'));
}

function compareAgainstBaseline(current, baseline) {
  const failures = [];
  const baselineByPair = baseline?.byPair || {};
  for (const [pair, count] of Object.entries(current.byPair)) {
    const baseCount = baselineByPair[pair] || 0;
    if (count > baseCount) failures.push(`${pair}: ${count} (baseline ${baseCount})`);
  }
  return failures;
}

export function compareAgainstTargets(current, targets) {
  const failures = [];
  if (typeof targets?.maxTotal === 'number' && current.total > targets.maxTotal) {
    failures.push(`total: ${current.total} (target ${targets.maxTotal})`);
  }
  for (const [pair, target] of Object.entries(targets?.maxByPair || {})) {
    const count = current.byPair?.[pair] || 0;
    if (count > target) failures.push(`${pair}: ${count} (target ${target})`);
  }
  return failures;
}

async function main() {
  const shouldWrite = process.argv.includes('--write-baseline');
  const asJson = process.argv.includes('--json');
  const current = await computeCoupling();

  if (shouldWrite) {
    await writeBaseline(current);
    console.log(`Import coupling baseline written (${current.total} cross-layer imports).`);
    return;
  }

  if (asJson) {
    console.log(JSON.stringify(current, null, 2));
    return;
  }

  const baseline = await readBaseline();
  const targets = readCouplingTargets();
  if (!baseline) {
    console.error(`Missing baseline: ${toPosix(path.relative(ROOT, BASELINE_PATH))}`);
    console.error('Run: node scripts/check-import-coupling.mjs --write-baseline');
    process.exit(1);
  }

  const failures = compareAgainstBaseline(current, baseline);
  const targetFailures = compareAgainstTargets(current, targets);
  if (failures.length > 0 || targetFailures.length > 0) {
    console.error('Import coupling check failed:');
    if (failures.length > 0) {
      console.error('New cross-layer growth detected:');
      for (const line of failures) console.error(`- ${line}`);
    }
    if (targetFailures.length > 0) {
      console.error('Configured coupling targets exceeded:');
      for (const line of targetFailures) console.error(`- ${line}`);
    }
    process.exit(1);
  }

  console.log(
    `Import coupling check passed (${current.total} current, baseline ${baseline.total}).`,
  );
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
