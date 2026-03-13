import fs from 'node:fs/promises';
import path from 'node:path';

const ROOT = process.cwd();
const TARGET_DIRS = ['game', 'engine', 'data'];
const ALLOW_PREFIXES = ['game/platform/legacy/'];
const ACCESS_PATTERNS = {
  windowLegacyState: /\bwindow\.(?:GS|GAME|GameState)\b/g,
  globalThisLegacyState: /\bglobalThis\.(?:GS|GAME|GameState)\b/g,
};

function toPosix(p) {
  return p.split(path.sep).join('/');
}

function isAllowed(fileRel) {
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

async function main() {
  const failures = [];

  for (const relDir of TARGET_DIRS) {
    const absDir = path.join(ROOT, relDir);
    const files = await collectFiles(absDir);
    for (const fileAbs of files) {
      const fileRel = toPosix(path.relative(ROOT, fileAbs));
      if (isAllowed(fileRel)) continue;

      const source = await fs.readFile(fileAbs, 'utf8');
      const counts = Object.entries(ACCESS_PATTERNS)
        .map(([kind, pattern]) => [kind, countPattern(source, pattern)])
        .filter(([, count]) => count > 0);

      if (counts.length === 0) continue;
      failures.push(`${fileRel}: ${counts.map(([kind, count]) => `${kind}=${count}`).join(', ')}`);
    }
  }

  if (failures.length > 0) {
    console.error('Legacy global access check failed:');
    for (const failure of failures) console.error(`- ${failure}`);
    process.exit(1);
  }

  console.log('Legacy global access check passed.');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
