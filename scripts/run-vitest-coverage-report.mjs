import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const DEFAULT_OUTPUT_FILE = 'artifacts/quality/vitest-full-report.json';

function parseArgs(argv) {
  const args = {
    suite: 'full',
    outputFile: path.resolve(DEFAULT_OUTPUT_FILE),
  };

  for (let index = 2; index < argv.length; index += 1) {
    const arg = argv[index];
    const next = argv[index + 1];

    if (arg === '--suite' && next) {
      args.suite = next;
      index += 1;
      continue;
    }
    if (arg === '--output-file' && next) {
      args.outputFile = next;
      index += 1;
    }
  }

  return args;
}

const args = parseArgs(process.argv);
const vitestEntrypoint = path.resolve('node_modules/vitest/vitest.mjs');
fs.mkdirSync(path.dirname(args.outputFile), { recursive: true });

const result = spawnSync(
  process.execPath,
  [
    vitestEntrypoint,
    'run',
    '--coverage',
    '--reporter=default',
    '--reporter=json',
    `--outputFile=${args.outputFile}`,
  ],
  {
    stdio: 'inherit',
    env: {
      ...process.env,
      CODEX_VITEST_SUITE: args.suite,
    },
  },
);

if (result.error) {
  throw result.error;
}

process.exit(result.status ?? 1);
