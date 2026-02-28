import fs from 'node:fs/promises';
import path from 'node:path';

const ROOT = process.cwd();
const POLICY_PATH = path.join(ROOT, 'docs', 'architecture_policy.json');

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

function isSourceAllowed(fileRel, rule) {
  if (Array.isArray(rule.allowSources) && rule.allowSources.includes(fileRel)) return true;
  if (Array.isArray(rule.allowSourcePrefixes)) {
    return rule.allowSourcePrefixes.some((prefix) => fileRel.startsWith(prefix));
  }
  return false;
}

function evaluateRule(rule, fileRel, targetRel, sourceLayer, targetLayer) {
  const fromMatches = Array.isArray(rule.from) ? rule.from.includes(sourceLayer) : true;
  if (!fromMatches) return null;

  if (isSourceAllowed(fileRel, rule)) return null;

  if (Array.isArray(rule.denyTargets) && rule.denyTargets.includes(targetRel)) {
    return `${fileRel} -> ${targetRel} (${rule.message || rule.id})`;
  }

  if (Array.isArray(rule.to) && rule.to.includes(targetLayer)) {
    return `${fileRel} -> ${targetRel} (${rule.message || rule.id})`;
  }

  return null;
}

async function main() {
  const policy = await readPolicy();
  const scanDirs = policy.scanDirs || ['game'];
  const layerMatchers = policy.layerMatchers || [];
  const rules = policy.rules || [];

  const files = [];
  for (const relDir of scanDirs) {
    const absDir = path.join(ROOT, relDir);
    files.push(...(await collectFiles(absDir)));
  }

  const violations = [];

  for (const fileAbs of files) {
    const fileRel = toPosix(path.relative(ROOT, fileAbs));
    const sourceLayer = getLayer(fileRel, layerMatchers);
    const source = await fs.readFile(fileAbs, 'utf8');
    const importRegex = /^\s*import\s+[^'"]*['"]([^'"]+)['"]/gm;

    let match;
    while ((match = importRegex.exec(source)) !== null) {
      const spec = match[1];
      const targetRel = resolveImport(fileAbs, spec);
      if (!targetRel) continue;

      const targetLayer = getLayer(targetRel, layerMatchers);
      for (const rule of rules) {
        const violation = evaluateRule(rule, fileRel, targetRel, sourceLayer, targetLayer);
        if (violation) violations.push(violation);
      }
    }
  }

  if (violations.length > 0) {
    console.error('Architecture boundary check failed:');
    for (const v of violations) console.error(`- ${v}`);
    process.exit(1);
  }

  console.log('Architecture boundary check passed.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
