import path from 'node:path';
import { runSmokeScriptWithServer } from './browser_smoke_support.mjs';

const smokeUrl = process.env.SMOKE_URL || '';
const outDir = process.env.SMOKE_OUT_DIR || path.join('output', 'web-game', 'refactor-smoke-combat-ui');
const scriptPath = path.join(process.cwd(), 'scripts', 'smoke_combat_ui.mjs');
const distDir = process.env.SMOKE_DIST_DIR || path.join(process.cwd(), 'dist');
const result = await runSmokeScriptWithServer({
  smokeUrl,
  distDir,
  outDir,
  scriptPath,
  scriptArgs: ({ appUrl }) => ['--url', appUrl, '--out-dir', outDir],
  label: 'combat smoke',
});

process.exit(result);
