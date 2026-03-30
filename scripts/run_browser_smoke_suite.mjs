import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const smokeCommands = [
  'smoke:character-select',
  'smoke:reward',
  'smoke:combat-ui',
  'smoke:help-pause-hotkeys',
  'smoke:title-meta',
  'smoke:save-load',
  'smoke:save-outbox-recovery',
];
const args = new Set(process.argv.slice(2));

function writeGithubSummary(text) {
  const summaryPath = process.env.GITHUB_STEP_SUMMARY;
  if (!summaryPath) return;
  fs.appendFileSync(summaryPath, `${text}\n`);
}

function formatDurationMs(durationMs) {
  if (!Number.isFinite(durationMs)) return 'n/a';
  if (durationMs < 1000) return `${durationMs}ms`;
  return `${(durationMs / 1000).toFixed(2)}s`;
}

export function formatSmokeSuiteSummary(results = []) {
  const totalMs = results.reduce((sum, result) => sum + (Number(result.durationMs) || 0), 0);
  const lines = [
    `### Browser Smoke Suite`,
    ``,
    `- Total checks: \`${results.length}\``,
    `- Total duration: \`${formatDurationMs(totalMs)}\``,
    ``,
    `| Command | Result | Duration |`,
    `| --- | --- | ---: |`,
  ];

  for (const result of results) {
    lines.push(
      `| \`${result.command}\` | ${result.ok ? 'pass' : `fail (${result.exitCode ?? 'error'})`} | ${formatDurationMs(result.durationMs)} |`,
    );
  }

  return `${lines.join('\n')}\n`;
}

function buildStandaloneSmokeDist(workspaceRoot = process.cwd()) {
  const viteCliPath = path.join(workspaceRoot, 'node_modules', 'vite', 'bin', 'vite.js');
  const distDir = path.join(workspaceRoot, 'tmp', `smoke-dist-${process.pid}-${Date.now()}`);
  fs.mkdirSync(path.dirname(distDir), { recursive: true });

  const result = spawnSync(process.execPath, [viteCliPath, 'build', '--outDir', distDir, '--emptyOutDir'], {
    stdio: 'inherit',
    env: process.env,
  });
  if (result.error) throw result.error;
  if ((result.status ?? 1) !== 0) {
    process.exit(result.status ?? 1);
  }
  return distDir;
}

function resolveReuseDistDir(workspaceRoot = process.cwd()) {
  const distDir = path.join(workspaceRoot, 'dist');
  if (!fs.existsSync(distDir)) {
    throw new Error('Cannot reuse dist for smoke:browser because dist/ does not exist. Run npm run build first.');
  }
  return distDir;
}

const results = [];
const smokeEnv = { ...process.env };
let tempDistDir = '';

if (!smokeEnv.SMOKE_URL && !smokeEnv.SMOKE_DIST_DIR) {
  if (args.has('--reuse-dist')) {
    smokeEnv.SMOKE_DIST_DIR = resolveReuseDistDir();
  } else {
    tempDistDir = buildStandaloneSmokeDist();
    smokeEnv.SMOKE_DIST_DIR = tempDistDir;
  }
}

try {
  for (const smokeCommand of smokeCommands) {
    const start = Date.now();
    console.log(`[smoke:browser] start ${smokeCommand}`);
    const npmExecPath = process.env.npm_execpath;
    const npmNodePath = process.env.npm_node_execpath || process.execPath;
    const result = npmExecPath
      ? spawnSync(npmNodePath, [npmExecPath, 'run', smokeCommand], {
        stdio: 'inherit',
        env: smokeEnv,
      })
      : spawnSync('npm', ['run', smokeCommand], {
        stdio: 'inherit',
        env: smokeEnv,
        shell: true,
      });
    const durationMs = Date.now() - start;
    const smokeResult = {
      command: smokeCommand,
      durationMs,
      exitCode: result.status ?? null,
      ok: !result.error && (result.status ?? 1) === 0,
    };
    results.push(smokeResult);
    console.log(`[smoke:browser] ${smokeResult.ok ? 'pass' : 'fail'} ${smokeCommand} (${formatDurationMs(durationMs)})`);

    if (result.error) {
      writeGithubSummary(formatSmokeSuiteSummary(results));
      throw result.error;
    }
    if ((result.status ?? 1) !== 0) {
      writeGithubSummary(formatSmokeSuiteSummary(results));
      process.exit(result.status ?? 1);
    }
  }
} finally {
  if (tempDistDir) {
    fs.rmSync(tempDistDir, { recursive: true, force: true });
  }
}

writeGithubSummary(formatSmokeSuiteSummary(results));
