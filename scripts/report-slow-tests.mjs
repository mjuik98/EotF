import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { normalizeTestFilePath, readSuiteManifest } from './test_suite_manifest.mjs';

function parseArgs(argv) {
  const args = {
    suite: 'fast',
    thresholdMs: 500,
    top: 10,
    inputFile: null,
  };

  for (let index = 2; index < argv.length; index += 1) {
    const arg = argv[index];
    const next = argv[index + 1];

    if (arg === '--suite' && next) {
      args.suite = next;
      index += 1;
      continue;
    }
    if (arg === '--threshold-ms' && next) {
      args.thresholdMs = Number(next);
      index += 1;
      continue;
    }
    if (arg === '--top' && next) {
      args.top = Number(next);
      index += 1;
      continue;
    }
    if (arg === '--input-file' && next) {
      args.inputFile = next;
      index += 1;
    }
  }

  return args;
}

export function sortSlowTestFiles(entries = []) {
  return [...entries].sort((a, b) => b.durationMs - a.durationMs || a.name.localeCompare(b.name));
}

export function collectSlowTestFiles(report = {}, { thresholdMs = 500 } = {}) {
  const testResults = Array.isArray(report?.testResults) ? report.testResults : [];
  const files = [];

  for (const result of testResults) {
    const start = Number(result?.startTime);
    const end = Number(result?.endTime);
    if (!Number.isFinite(start) || !Number.isFinite(end)) continue;
    const durationMs = Math.max(0, Math.round(end - start));
    if (durationMs <= thresholdMs) continue;
    files.push({
      name: String(result?.name || ''),
      durationMs,
    });
  }

  return sortSlowTestFiles(files);
}

export function filterReportToSuite(report = {}, { suite = 'fast', manifest = readSuiteManifest() } = {}) {
  if (suite === 'full') return report;

  const suiteFiles = new Set((manifest?.[suite] || []).map(normalizeTestFilePath));
  const testResults = Array.isArray(report?.testResults) ? report.testResults : [];

  return {
    ...report,
    testResults: testResults.filter((result) => {
      const filePath = normalizeTestFilePath(toRelativePath(String(result?.name || '')));
      return suiteFiles.has(filePath);
    }),
  };
}

function toRelativePath(filePath) {
  const normalized = String(filePath || '').replaceAll('\\', '/');
  const cwd = process.cwd().replaceAll('\\', '/');
  if (normalized.startsWith(`${cwd}/`)) {
    return normalized.slice(cwd.length + 1);
  }
  return normalized;
}

function buildSummaryLines({ suite, thresholdMs, top, slowFiles }) {
  const lines = [
    `### Slow Test Report`,
    ``,
    `- Suite: \`${suite}\``,
    `- Threshold: \`${thresholdMs}ms\``,
    `- Reported entries: \`${Math.min(slowFiles.length, top)} / ${slowFiles.length}\``,
  ];

  if (slowFiles.length === 0) {
    lines.push(`- Result: no files exceeded the threshold`);
    return lines;
  }

  lines.push(``, `| Duration | File |`, `| ---: | --- |`);
  for (const entry of slowFiles.slice(0, top)) {
    lines.push(`| ${entry.durationMs}ms | \`${toRelativePath(entry.name)}\` |`);
  }
  return lines;
}

export function formatSlowTestSummary({ suite, thresholdMs, top, slowFiles }) {
  return `${buildSummaryLines({ suite, thresholdMs, top, slowFiles }).join('\n')}\n`;
}

function writeGithubSummary(text) {
  const summaryPath = process.env.GITHUB_STEP_SUMMARY;
  if (!summaryPath) return;
  fs.appendFileSync(summaryPath, `${text}\n`);
}

function runVitestJsonReport({ suite, outputFile }) {
  const runResult = spawnSync(
    process.execPath,
    [
      path.join(process.cwd(), 'node_modules', 'vitest', 'vitest.mjs'),
      'run',
      '--reporter=json',
      `--outputFile=${outputFile}`,
    ],
    {
      stdio: 'inherit',
      env: {
        ...process.env,
        CODEX_VITEST_SUITE: suite,
      },
    },
  );

  if (runResult.error) {
    throw runResult.error;
  }
  if ((runResult.status ?? 1) !== 0) {
    process.exit(runResult.status ?? 1);
  }
}

function readVitestJsonReport(inputFile) {
  return JSON.parse(fs.readFileSync(inputFile, 'utf8'));
}

function printSummary({ suite, thresholdMs, top, slowFiles }) {
  console.log(`Slow test file report (suite=${suite}, threshold>${thresholdMs}ms):`);
  if (slowFiles.length === 0) {
    console.log('- no files exceeded the threshold');
  } else {
    for (const entry of slowFiles.slice(0, top)) {
      console.log(`- ${entry.durationMs}ms ${toRelativePath(entry.name)}`);
    }
  }

  writeGithubSummary(formatSlowTestSummary({ suite, thresholdMs, top, slowFiles }));
}

export function main() {
  const args = parseArgs(process.argv);
  const outputFile = path.join(os.tmpdir(), `vitest-slow-report-${process.pid}.json`);

  try {
    const report = args.inputFile
      ? readVitestJsonReport(args.inputFile)
      : (() => {
        runVitestJsonReport({
          suite: args.suite,
          outputFile,
        });
        return readVitestJsonReport(outputFile);
      })();
    const filteredReport = filterReportToSuite(report, { suite: args.suite });
    const slowFiles = collectSlowTestFiles(filteredReport, { thresholdMs: args.thresholdMs });
    printSummary({
      suite: args.suite,
      thresholdMs: args.thresholdMs,
      top: args.top,
      slowFiles,
    });
  } finally {
    fs.rmSync(outputFile, { force: true });
  }
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  main();
}
