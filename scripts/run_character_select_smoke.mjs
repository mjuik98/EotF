import { spawnSync } from 'node:child_process';
import path from 'node:path';

const smokeUrl = process.env.SMOKE_URL || '';
const outDir = process.env.SMOKE_OUT_DIR || path.join('output', 'web-game', 'character-select-level-xp-smoke');
const scriptPath = path.join(process.cwd(), 'scripts', 'character_select_smoke_check.mjs');

const env = {
  ...process.env,
  SMOKE_OUT_DIR: outDir,
};

if (smokeUrl) {
  env.SMOKE_URL = smokeUrl;
}

const result = spawnSync(process.execPath, [scriptPath], {
  env,
  stdio: 'inherit',
});

if (result.error) {
  throw result.error;
}

process.exit(result.status ?? 0);
