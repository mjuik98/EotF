import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const DEFAULT_BUNDLE_BUDGETS = {
  entryJs: { label: 'main entry js', maxBytes: 410 * 1024 },
  entryCss: { label: 'main entry css', maxBytes: 193 * 1024 },
  uiEventJs: { label: 'ui-event chunk', maxBytes: 45 * 1024 },
  uiRewardJs: { label: 'ui-reward chunk', maxBytes: 20 * 1024 },
  uiCombatJs: { label: 'ui-combat chunk', maxBytes: 323 * 1024 },
  uiCombatTooltipsJs: { label: 'ui-combat-tooltips chunk', maxBytes: 20 * 1024 },
  uiSettingsJs: { label: 'ui-settings chunk', maxBytes: 24 * 1024 },
  uiShellOverlaysJs: { label: 'ui-shell-overlays chunk', maxBytes: 24 * 1024 },
  codexUiJs: { label: 'codex ui chunk', maxBytes: 40 * 1024 },
  runModeUiJs: { label: 'run mode ui chunk', maxBytes: 30 * 1024 },
};

function statFile(filePath) {
  return fs.statSync(filePath).size;
}

function findAssetByPattern(distDir, pattern) {
  const assetsDir = path.join(distDir, 'assets');
  if (!fs.existsSync(assetsDir)) return null;

  return fs.readdirSync(assetsDir)
    .find((file) => pattern.test(file)) || null;
}

function readManifest(distDir) {
  const manifestPath = path.join(distDir, '.vite', 'manifest.json');
  if (!fs.existsSync(manifestPath)) return null;
  return JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
}

export function collectBundleStats(distDir = path.join(process.cwd(), 'dist')) {
  const manifest = readManifest(distDir);
  const entry = manifest?.['index.html'] || null;

  const entryJsFile = entry?.file || findAssetByPattern(distDir, /^index-.*\.js$/);
  const entryCssFile = entry?.css?.[0] || findAssetByPattern(distDir, /^index-.*\.css$/);
  const uiEventFile = findAssetByPattern(distDir, /^ui-event-.*\.js$/);
  const uiRewardFile = findAssetByPattern(distDir, /^ui-reward-.*\.js$/);
  const uiCombatFile = findAssetByPattern(distDir, /^ui-combat-(?!deck-|chronicle-|tooltips-).*\.js$/);
  const uiCombatTooltipsFile = findAssetByPattern(distDir, /^ui-combat-tooltips-.*\.js$/);
  const uiSettingsFile = findAssetByPattern(distDir, /^ui-settings-.*\.js$/);
  const uiShellOverlaysFile = findAssetByPattern(distDir, /^ui-shell-overlays-.*\.js$/);
  const codexUiFile = findAssetByPattern(distDir, /^codex_ui-.*\.js$/);
  const runModeUiFile = findAssetByPattern(distDir, /^(run_mode_ui|ui-run-mode)-.*\.js$/);

  const assetFiles = {
    entryJs: entryJsFile && path.join(distDir, 'assets', path.basename(entryJsFile)),
    entryCss: entryCssFile && path.join(distDir, 'assets', path.basename(entryCssFile)),
    uiEventJs: uiEventFile && path.join(distDir, 'assets', uiEventFile),
    uiRewardJs: uiRewardFile && path.join(distDir, 'assets', uiRewardFile),
    uiCombatJs: uiCombatFile && path.join(distDir, 'assets', uiCombatFile),
    uiCombatTooltipsJs: uiCombatTooltipsFile && path.join(distDir, 'assets', uiCombatTooltipsFile),
    uiSettingsJs: uiSettingsFile && path.join(distDir, 'assets', uiSettingsFile),
    uiShellOverlaysJs: uiShellOverlaysFile && path.join(distDir, 'assets', uiShellOverlaysFile),
    codexUiJs: codexUiFile && path.join(distDir, 'assets', codexUiFile),
    runModeUiJs: runModeUiFile && path.join(distDir, 'assets', runModeUiFile),
  };

  const stats = {};
  for (const [key, filePath] of Object.entries(assetFiles)) {
    if (!filePath || !fs.existsSync(filePath)) continue;
    stats[key] = {
      file: path.relative(distDir, filePath).replaceAll('\\', '/'),
      bytes: statFile(filePath),
    };
  }

  return stats;
}

export function assertBundleBudgets({
  budgets = DEFAULT_BUNDLE_BUDGETS,
  distDir = path.join(process.cwd(), 'dist'),
} = {}) {
  const stats = collectBundleStats(distDir);
  const missing = Object.keys(budgets).filter((key) => !stats[key]);

  if (missing.length > 0) {
    throw new Error(`Missing bundle stats for: ${missing.join(', ')}`);
  }

  const failures = Object.entries(budgets)
    .map(([key, budget]) => ({
      key,
      label: budget.label,
      file: stats[key].file,
      bytes: stats[key].bytes,
      maxBytes: budget.maxBytes,
    }))
    .filter((entry) => entry.bytes > entry.maxBytes);

  return {
    stats,
    failures,
  };
}

function formatBytes(bytes) {
  return `${(bytes / 1024).toFixed(2)} kB`;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  const distArgIndex = process.argv.indexOf('--dist');
  const distDir = distArgIndex >= 0
    ? path.resolve(process.cwd(), process.argv[distArgIndex + 1])
    : path.join(process.cwd(), 'dist');
  const asJson = process.argv.includes('--json');

  try {
    const report = assertBundleBudgets({ distDir });

    if (asJson) {
      console.log(JSON.stringify(report, null, 2));
    } else {
      Object.entries(DEFAULT_BUNDLE_BUDGETS).forEach(([key, budget]) => {
        const stat = report.stats[key];
        console.log(`${budget.label}: ${formatBytes(stat.bytes)} / ${formatBytes(budget.maxBytes)} (${stat.file})`);
      });
    }

    if (report.failures.length > 0) {
      report.failures.forEach((failure) => {
        console.error(
          `Budget exceeded for ${failure.label}: ${formatBytes(failure.bytes)} > ${formatBytes(failure.maxBytes)} (${failure.file})`,
        );
      });
      process.exitCode = 1;
    }
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
