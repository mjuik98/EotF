import fs from 'node:fs/promises';
import path from 'node:path';

const ROOT = process.cwd();
const SCAN_ROOTS = [
  path.join(ROOT, 'game'),
  path.join(ROOT, 'scripts'),
  path.join(ROOT, 'data'),
];
const DEPRECATED_COMPAT_TARGETS = new Set([
  'game/features/ui/ports/public_feature_support_capabilities.js',
  'game/features/ui/ports/public_shared_support_capabilities.js',
  'game/core/shared_support_capabilities.js',
  'game/platform/legacy/core_support/public_core_support_capabilities.js',
]);

function toPosix(value) {
  return value.split(path.sep).join('/');
}

async function collectJsFiles(dir) {
  const out = [];
  let entries = [];
  try {
    entries = await fs.readdir(dir, { withFileTypes: true });
  } catch {
    return out;
  }

  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      out.push(...(await collectJsFiles(full)));
      continue;
    }
    if (entry.isFile() && full.endsWith('.js')) out.push(full);
    if (entry.isFile() && full.endsWith('.mjs')) out.push(full);
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
  const files = (
    await Promise.all(SCAN_ROOTS.map((root) => collectJsFiles(root)))
  ).flat();
  const violations = [];
  const importRegex = /^\s*(?:import|export)\s+(?:[^'"]*?\s+from\s+)?['"]([^'"]+)['"]/gm;

  for (const fileAbs of files) {
    const fileRel = toPosix(path.relative(ROOT, fileAbs));
    if (DEPRECATED_COMPAT_TARGETS.has(fileRel)) continue;

    const source = await fs.readFile(fileAbs, 'utf8');
    let match;
    while ((match = importRegex.exec(source)) !== null) {
      const targetRel = resolveImport(fileAbs, match[1]);
      if (!targetRel || !DEPRECATED_COMPAT_TARGETS.has(targetRel)) continue;
      violations.push(`${fileRel} -> ${targetRel}`);
    }
  }

  if (violations.length > 0) {
    console.error('Deprecated compat import check failed: deprecated compat-only barrels must not be imported.');
    for (const violation of violations) {
      console.error(`- ${violation}`);
    }
    process.exit(1);
  }

  console.log('Deprecated compat import check passed (no runtime imports of deprecated compat-only barrels).');
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
