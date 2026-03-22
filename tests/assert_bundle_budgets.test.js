import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import { afterEach, describe, expect, it } from 'vitest';

import { assertBundleBudgets, collectBundleStats } from '../scripts/assert-bundle-budgets.mjs';

const tempDirs = [];

function writeSizedFile(filePath, bytes) {
  fs.writeFileSync(filePath, Buffer.alloc(bytes, 0));
}

function createFixtureDist() {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'bundle-budget-'));
  const distDir = path.join(tempDir, 'dist');
  const assetsDir = path.join(distDir, 'assets');
  const viteDir = path.join(distDir, '.vite');
  fs.mkdirSync(assetsDir, { recursive: true });
  fs.mkdirSync(viteDir, { recursive: true });

  writeSizedFile(path.join(assetsDir, 'index-test.js'), 10 * 1024);
  writeSizedFile(path.join(assetsDir, 'index-test.css'), 8 * 1024);
  writeSizedFile(path.join(assetsDir, 'ui-event-test.js'), 9 * 1024);
  writeSizedFile(path.join(assetsDir, 'ui-reward-test.js'), 7 * 1024);
  writeSizedFile(path.join(assetsDir, 'ui-combat-test.js'), 11 * 1024);
  writeSizedFile(path.join(assetsDir, 'ui-combat-copy-test.js'), 50 * 1024);
  writeSizedFile(path.join(assetsDir, 'ui-combat-deck-test.js'), 99 * 1024);
  writeSizedFile(path.join(assetsDir, 'ui-combat-chronicle-test.js'), 98 * 1024);
  writeSizedFile(path.join(assetsDir, 'ui-combat-tooltips-test.js'), 10 * 1024);
  writeSizedFile(path.join(assetsDir, 'ui-settings-test.js'), 6 * 1024);
  writeSizedFile(path.join(assetsDir, 'ui-shell-overlays-test.js'), 8 * 1024);
  writeSizedFile(path.join(assetsDir, 'codex_ui-test.js'), 6 * 1024);
  writeSizedFile(path.join(assetsDir, 'ui-run-mode-test.js'), 5 * 1024);

  fs.writeFileSync(
    path.join(viteDir, 'manifest.json'),
    JSON.stringify({
      'index.html': {
        file: 'assets/index-test.js',
        css: ['assets/index-test.css'],
      },
    }),
  );

  tempDirs.push(tempDir);
  return distDir;
}

afterEach(() => {
  while (tempDirs.length > 0) {
    fs.rmSync(tempDirs.pop(), { recursive: true, force: true });
  }
});

describe('assert_bundle_budgets', () => {
  it('ignores shared ui-combat-copy chunks when measuring the main combat chunk budget', () => {
    const distDir = createFixtureDist();
    const stats = collectBundleStats(distDir);

    expect(stats.uiCombatJs.file).toBe('assets/ui-combat-test.js');

    expect(() => assertBundleBudgets({
      distDir,
      budgets: {
        entryJs: { label: 'main entry js', maxBytes: 10 * 1024 },
        entryCss: { label: 'main entry css', maxBytes: 8 * 1024 },
        uiEventJs: { label: 'ui-event chunk', maxBytes: 9 * 1024 },
        uiRewardJs: { label: 'ui-reward chunk', maxBytes: 7 * 1024 },
        uiCombatJs: { label: 'ui-combat chunk', maxBytes: 11 * 1024 },
        uiCombatTooltipsJs: { label: 'ui-combat-tooltips chunk', maxBytes: 10 * 1024 },
        uiSettingsJs: { label: 'ui-settings chunk', maxBytes: 6 * 1024 },
        uiShellOverlaysJs: { label: 'ui-shell-overlays chunk', maxBytes: 8 * 1024 },
        codexUiJs: { label: 'codex ui chunk', maxBytes: 6 * 1024 },
        runModeUiJs: { label: 'run mode ui chunk', maxBytes: 5 * 1024 },
      },
    })).not.toThrow();
  });

  it('passes when bundle artifacts stay within budget', () => {
    const distDir = createFixtureDist();

    expect(() => assertBundleBudgets({ distDir })).not.toThrow();
  });

  it('fails when a required bundle artifact exceeds its budget', () => {
    const distDir = createFixtureDist();

    expect(() => assertBundleBudgets({
      distDir,
      budgets: {
        entryJs: { label: 'main entry js', maxBytes: 8 * 1024 },
        entryCss: { label: 'main entry css', maxBytes: 8 * 1024 },
        uiEventJs: { label: 'ui-event chunk', maxBytes: 9 * 1024 },
        uiRewardJs: { label: 'ui-reward chunk', maxBytes: 7 * 1024 },
        uiCombatJs: { label: 'ui-combat chunk', maxBytes: 11 * 1024 },
        uiCombatTooltipsJs: { label: 'ui-combat-tooltips chunk', maxBytes: 10 * 1024 },
        uiSettingsJs: { label: 'ui-settings chunk', maxBytes: 6 * 1024 },
        uiShellOverlaysJs: { label: 'ui-shell-overlays chunk', maxBytes: 8 * 1024 },
        codexUiJs: { label: 'codex ui chunk', maxBytes: 6 * 1024 },
        runModeUiJs: { label: 'run mode ui chunk', maxBytes: 5 * 1024 },
      },
    })).not.toThrow();

    expect(() => {
      const report = assertBundleBudgets({
        distDir,
        budgets: {
          entryJs: { label: 'main entry js', maxBytes: 4 * 1024 },
          entryCss: { label: 'main entry css', maxBytes: 8 * 1024 },
          uiEventJs: { label: 'ui-event chunk', maxBytes: 9 * 1024 },
          uiRewardJs: { label: 'ui-reward chunk', maxBytes: 7 * 1024 },
          uiCombatJs: { label: 'ui-combat chunk', maxBytes: 11 * 1024 },
          uiCombatTooltipsJs: { label: 'ui-combat-tooltips chunk', maxBytes: 10 * 1024 },
          uiSettingsJs: { label: 'ui-settings chunk', maxBytes: 6 * 1024 },
          uiShellOverlaysJs: { label: 'ui-shell-overlays chunk', maxBytes: 8 * 1024 },
          codexUiJs: { label: 'codex ui chunk', maxBytes: 6 * 1024 },
          runModeUiJs: { label: 'run mode ui chunk', maxBytes: 5 * 1024 },
        },
      });
      if (report.failures.length > 0) {
        throw new Error(report.failures[0].label);
      }
    }).toThrow('main entry js');
  });
});
