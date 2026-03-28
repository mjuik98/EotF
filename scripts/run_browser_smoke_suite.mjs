import { spawnSync } from 'node:child_process';
import fs from 'node:fs';

const smokeCommands = [
  'smoke:character-select',
  'smoke:reward',
  'smoke:combat-ui',
  'smoke:help-pause-hotkeys',
  'smoke:title-meta',
  'smoke:save-load',
  'smoke:save-outbox-recovery',
];

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

const results = [];

for (const smokeCommand of smokeCommands) {
  const start = Date.now();
  console.log(`[smoke:browser] start ${smokeCommand}`);
  const npmExecPath = process.env.npm_execpath;
  const npmNodePath = process.env.npm_node_execpath || process.execPath;
  const result = npmExecPath
    ? spawnSync(npmNodePath, [npmExecPath, 'run', smokeCommand], {
      stdio: 'inherit',
      env: process.env,
    })
    : spawnSync('npm', ['run', smokeCommand], {
      stdio: 'inherit',
      env: process.env,
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

writeGithubSummary(formatSmokeSuiteSummary(results));
