import fs from 'node:fs/promises';
import path from 'node:path';

const ROOT = process.cwd();
const CONFIG_PATH = path.join(ROOT, 'config', 'quality', 'compat_surface_allowlist.json');

const THIN_REEXPORT_PATTERNS = [
  /export\s+\{[\s\S]*?\}\s+from\s+['"][^'"]+['"]\s*;?/y,
  /export\s+\*\s+from\s+['"][^'"]+['"]\s*;?/y,
];

function toPosix(value) {
  return value.split(path.sep).join('/');
}

async function readConfig() {
  const raw = await fs.readFile(CONFIG_PATH, 'utf8');
  return JSON.parse(raw);
}

async function collectJsFiles(dir) {
  const out = [];
  let entries;

  try {
    entries = await fs.readdir(dir, { withFileTypes: true });
  } catch (error) {
    if (error?.code === 'ENOENT') return out;
    throw error;
  }

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

function isThinCompatSource(source) {
  const normalized = source
    .replace(/^\uFEFF/, '')
    .replace(/\/\*[\s\S]*?\*\//gu, '')
    .replace(/^\s*\/\/.*$/gmu, '')
    .trim();

  if (normalized.length === 0) return false;

  let cursor = 0;
  while (cursor < normalized.length) {
    while (cursor < normalized.length && /\s/u.test(normalized[cursor])) cursor += 1;
    if (cursor >= normalized.length) break;

    let matched = false;
    for (const pattern of THIN_REEXPORT_PATTERNS) {
      pattern.lastIndex = cursor;
      const result = pattern.exec(normalized);
      if (result && result.index === cursor) {
        cursor = pattern.lastIndex;
        matched = true;
        break;
      }
    }

    if (!matched) return false;
  }

  return true;
}

async function main() {
  const config = await readConfig();
  const allowlist = new Set(config.allowlist || []);
  const scanDirs = config.scanDirs || [];
  const nonThinCompatFiles = [];

  for (const relDir of scanDirs) {
    const absDir = path.join(ROOT, relDir);
    const files = await collectJsFiles(absDir);
    for (const fileAbs of files) {
      const source = await fs.readFile(fileAbs, 'utf8');
      if (isThinCompatSource(source)) continue;
      nonThinCompatFiles.push(toPosix(path.relative(ROOT, fileAbs)));
    }
  }

  const unexpected = nonThinCompatFiles.filter((file) => !allowlist.has(file));
  if (unexpected.length > 0) {
    console.error('Compat surface check failed: unexpected non-thin compat files found.');
    for (const file of unexpected) {
      console.error(`- ${file}`);
    }
    process.exit(1);
  }

  console.log(`Compat surface check passed (${nonThinCompatFiles.length} allowlisted non-thin compat files).`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
