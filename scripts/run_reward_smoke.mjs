import path from 'node:path';
import { runSmokeScriptWithServer } from './browser_smoke_support.mjs';

const smokeUrl = process.env.SMOKE_URL || '';
const outDir = process.env.SMOKE_OUT_DIR || path.join('output', 'web-game', 'refactor-smoke-reward-flow');
const scriptPath = path.join(process.cwd(), 'scripts', 'smoke_deep_combat_reward.mjs');
const distDir = path.join(process.cwd(), 'dist');
const result = await runSmokeScriptWithServer({
  smokeUrl,
  distDir,
  outDir,
  scriptPath,
  scriptArgs: ({ appUrl }) => ['--url', appUrl, '--out-dir', outDir],
  label: 'reward smoke',
});

process.exit(result);
