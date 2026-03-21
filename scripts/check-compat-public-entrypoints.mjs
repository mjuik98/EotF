import fs from 'node:fs/promises';
import path from 'node:path';

const ROOT = process.cwd();
const COMPAT_ROOTS = [
  path.join(ROOT, 'game', 'app'),
  path.join(ROOT, 'game', 'combat'),
  path.join(ROOT, 'game', 'presentation'),
  path.join(ROOT, 'game', 'state'),
  path.join(ROOT, 'game', 'systems'),
  path.join(ROOT, 'game', 'ui'),
];

function toPosix(value) {
  return value.split(path.sep).join('/');
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

function isAllowedFeaturePublicEntrypoint(targetRel) {
  return targetRel.endsWith('/public.js') || /\/ports\/public_[^/]+\.js$/.test(targetRel);
}

async function main() {
  const violations = [];
  const importRegex = /^\s*(?:import|export)\s+(?:[^'"]*?\s+from\s+)?['"]([^'"]+)['"]/gm;

  for (const compatRoot of COMPAT_ROOTS) {
    const files = await collectJsFiles(compatRoot);

    for (const fileAbs of files) {
      const fileRel = toPosix(path.relative(ROOT, fileAbs));
      const source = await fs.readFile(fileAbs, 'utf8');
      let match;

      while ((match = importRegex.exec(source)) !== null) {
        const targetRel = resolveImport(fileAbs, match[1]);
        if (!targetRel || !targetRel.startsWith('game/features/')) continue;
        if (isAllowedFeaturePublicEntrypoint(targetRel)) continue;

        violations.push(`${fileRel} -> ${targetRel}`);
      }
    }
  }

  if (violations.length > 0) {
    console.error('Compat public entrypoint check failed: compat roots must import features through public entrypoints only.');
    for (const violation of violations) {
      console.error(`- ${violation}`);
    }
    process.exit(1);
  }

  console.log('Compat public entrypoint check passed (compat roots only import feature public entrypoints).');
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
