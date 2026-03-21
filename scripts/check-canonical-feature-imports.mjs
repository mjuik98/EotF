import fs from 'node:fs/promises';
import path from 'node:path';

const ROOT = process.cwd();
const GAME_ROOT = path.join(ROOT, 'game');
const COMPAT_ROOTS = [
  'game/app/',
  'game/combat/',
  'game/presentation/',
  'game/state/',
  'game/systems/',
  'game/ui/',
];

function toPosix(value) {
  return value.split(path.sep).join('/');
}

function isCompatPath(fileRel) {
  return COMPAT_ROOTS.some((root) => fileRel.startsWith(root));
}

async function collectJsFiles(dir) {
  const out = [];
  const entries = await fs.readdir(dir, { withFileTypes: true });

  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      out.push(...(await collectJsFiles(full)));
      continue;
    }
    if (entry.isFile() && full.endsWith('.js')) out.push(full);
  }

  return out;
}

function resolveImport(fileAbs, spec) {
  if (!spec.startsWith('.')) return null;
  const fileDir = path.dirname(fileAbs);
  const resolved = path.resolve(fileDir, spec);
  const withExt = path.extname(resolved) ? resolved : `${resolved}.js`;
  return toPosix(path.relative(ROOT, withExt));
}

async function main() {
  const files = await collectJsFiles(GAME_ROOT);
  const violations = [];
  const importRegex = /^\s*(?:import|export)\s+(?:[^'"]*?\s+from\s+)?['"]([^'"]+)['"]/gm;

  for (const fileAbs of files) {
    const fileRel = toPosix(path.relative(ROOT, fileAbs));
    if (isCompatPath(fileRel)) continue;

    const source = await fs.readFile(fileAbs, 'utf8');
    let match;
    while ((match = importRegex.exec(source)) !== null) {
      const targetRel = resolveImport(fileAbs, match[1]);
      if (!targetRel || !isCompatPath(targetRel)) continue;

      violations.push(`${fileRel} -> ${targetRel}`);
    }
  }

  if (violations.length > 0) {
    console.error('Canonical feature import check failed: non-compat code must not import compat roots.');
    for (const violation of violations) {
      console.error(`- ${violation}`);
    }
    process.exit(1);
  }

  console.log('Canonical feature import check passed (no non-compat imports of compat roots).');
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
