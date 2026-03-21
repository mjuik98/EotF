import { spawnSync } from 'node:child_process';
import path from 'node:path';

const smokeUrl = process.env.SMOKE_URL || 'http://127.0.0.1:8000';
const outDir = process.env.SMOKE_OUT_DIR || path.join('output', 'web-game', 'refactor-smoke-combat-ui');
const scriptPath = path.join(process.cwd(), 'scripts', 'smoke_combat_ui.mjs');

const result = spawnSync(process.execPath, [scriptPath, '--url', smokeUrl, '--out-dir', outDir], {
  stdio: 'inherit',
});

if (result.error) {
  throw result.error;
}

process.exit(result.status ?? 0);
