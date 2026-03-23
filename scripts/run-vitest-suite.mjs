import { spawnSync } from 'node:child_process';
import path from 'node:path';

const suite = process.argv[2] || 'fast';
const forwardedArgs = process.argv.slice(3).filter((arg, index, args) => !(index === 0 && arg === '--run' && args.length > 1));
if (!['fast', 'guardrails', 'full'].includes(suite)) {
  throw new Error(`Unknown vitest suite "${suite}". Expected fast, guardrails, or full.`);
}

const vitestEntrypoint = path.resolve('node_modules/vitest/vitest.mjs');
const result = spawnSync(
  process.execPath,
  [vitestEntrypoint, 'run', ...forwardedArgs],
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

process.exit(result.status ?? 1);
