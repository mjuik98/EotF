import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const suite = process.argv[2] || 'fast';
const args = process.argv.slice(3);
const runs = readNumericFlag(args, '--runs', 3);
const sample = readNumericFlag(args, '--sample', 40);
const manifestPath = path.join(process.cwd(), 'config', 'quality', 'test_suite_manifest.json');
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
const suiteFiles = Array.isArray(manifest[suite]) ? [...manifest[suite]] : [];

if (suiteFiles.length === 0) {
  throw new Error(`Unknown or empty vitest suite "${suite}" in test_suite_manifest.json`);
}

const vitestEntrypoint = path.resolve('node_modules/vitest/vitest.mjs');
const boundedSample = Math.max(1, Math.min(sample, suiteFiles.length));

for (let runIndex = 0; runIndex < runs; runIndex += 1) {
  const shuffled = shuffle([...suiteFiles]);
  const selectedFiles = shuffled.slice(0, boundedSample);
  console.log(`[order-guard] suite=${suite} run=${runIndex + 1}/${runs} files=${selectedFiles.length}`);
  const result = spawnSync(
    process.execPath,
    [vitestEntrypoint, 'run', ...selectedFiles],
    {
      stdio: 'inherit',
      env: {
        ...process.env,
        CODEX_VITEST_SUITE: suite,
      },
    },
  );

  if (result.error) {
    throw result.error;
  }
  if ((result.status ?? 1) !== 0) {
    process.exit(result.status ?? 1);
  }
}

function readNumericFlag(argv, flag, fallback) {
  const index = argv.indexOf(flag);
  if (index === -1) return fallback;
  const value = Number(argv[index + 1]);
  return Number.isFinite(value) && value > 0 ? value : fallback;
}

function shuffle(items) {
  for (let index = items.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [items[index], items[swapIndex]] = [items[swapIndex], items[index]];
  }
  return items;
}
