import fs from 'node:fs/promises';
import path from 'node:path';

const ROOT = process.cwd();
const GAME_DIR = path.join(ROOT, 'game');

const CORE_UI_ALLOWLIST = new Set([
  'game/core/main.js',
  'game/core/event_bindings.js',
  'game/core/init_sequence.js',
  'game/core/deps_factory.js',
]);

const CORE_UI_ALLOW_PREFIXES = ['game/core/bindings/'];
const FORBIDDEN_CORE_IMPORTS_FROM_UI = new Set([
  'game/core/main.js',
  'game/core/event_bindings.js',
]);

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

function getLayer(fileRel) {
  if (fileRel.startsWith('game/ui/')) return 'ui';
  if (fileRel.startsWith('game/combat/')) return 'combat';
  if (fileRel.startsWith('game/systems/')) return 'systems';
  if (fileRel.startsWith('game/core/')) return 'core';
  return 'other';
}

function resolveImport(fileAbs, spec) {
  if (!spec.startsWith('.')) return null;
  const fileDir = path.dirname(fileAbs);
  const resolved = path.resolve(fileDir, spec);
  const withExt = path.extname(resolved) ? resolved : `${resolved}.js`;
  return toPosix(path.relative(ROOT, withExt));
}

function isCoreUiImportAllowed(fileRel) {
  if (CORE_UI_ALLOWLIST.has(fileRel)) return true;
  return CORE_UI_ALLOW_PREFIXES.some((prefix) => fileRel.startsWith(prefix));
}

async function main() {
  const files = await collectFiles(GAME_DIR);
  const violations = [];

  for (const fileAbs of files) {
    const fileRel = toPosix(path.relative(ROOT, fileAbs));
    const layer = getLayer(fileRel);
    const source = await fs.readFile(fileAbs, 'utf8');
    const importRegex = /^\s*import\s+[^'"]*['"]([^'"]+)['"]/gm;

    let match;
    while ((match = importRegex.exec(source)) !== null) {
      const spec = match[1];
      const targetRel = resolveImport(fileAbs, spec);
      if (!targetRel) continue;
      const targetLayer = getLayer(targetRel);

      if ((layer === 'systems' || layer === 'combat') && targetLayer === 'ui') {
        violations.push(`${fileRel} -> ${targetRel} (systems/combat must not import ui)`);
      }

      if (layer === 'core' && targetLayer === 'ui' && !isCoreUiImportAllowed(fileRel)) {
        violations.push(`${fileRel} -> ${targetRel} (core file outside composition root importing ui)`);
      }

      if (layer === 'ui' && FORBIDDEN_CORE_IMPORTS_FROM_UI.has(targetRel)) {
        violations.push(`${fileRel} -> ${targetRel} (ui must not import core composition root)`);
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

