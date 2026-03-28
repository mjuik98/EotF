import path from 'node:path';
import { runSmokeScriptWithServer } from './browser_smoke_support.mjs';

const smokeUrl = process.env.SMOKE_URL || '';
const outDir = process.env.SMOKE_OUT_DIR || path.join('output', 'web-game', 'help-pause-hotkey-smoke');
const scriptPath = path.join(process.cwd(), 'scripts', 'help_pause_hotkey_smoke_check.mjs');
const distDir = process.env.SMOKE_DIST_DIR || path.join(process.cwd(), 'dist');
const result = await runSmokeScriptWithServer({
  smokeUrl,
  distDir,
  outDir,
  scriptPath,
  label: 'help/pause smoke',
});

process.exit(result);
