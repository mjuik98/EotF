import { spawnSync } from 'node:child_process';
import path from 'node:path';

import { runSmokeScriptWithServer } from './browser_smoke_support.mjs';

function resolveOutDir(outDirSegments = []) {
  return process.env.SMOKE_OUT_DIR || path.join('output', 'web-game', ...outDirSegments);
}

function resolveScriptPath(scriptFile) {
  return path.join(process.cwd(), 'scripts', scriptFile);
}

export function runForwardedSmokeWrapper({
  scriptFile,
  outDirSegments,
} = {}) {
  const smokeUrl = process.env.SMOKE_URL || '';
  const outDir = resolveOutDir(outDirSegments);
  const scriptPath = resolveScriptPath(scriptFile);
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

  return result.status ?? 0;
}

export async function runHostedSmokeWrapper({
  scriptFile,
  outDirSegments,
  label,
  scriptArgs,
} = {}) {
  return runSmokeScriptWithServer({
    smokeUrl: process.env.SMOKE_URL || '',
    distDir: process.env.SMOKE_DIST_DIR || path.join(process.cwd(), 'dist'),
    outDir: resolveOutDir(outDirSegments),
    scriptPath: resolveScriptPath(scriptFile),
    scriptArgs,
    label,
  });
}
