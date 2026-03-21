import fs from 'node:fs';
import path from 'node:path';

import { describe, expect, it } from 'vitest';

const ROOT = process.cwd();

describe('build-first optimization guardrails', () => {
  it('keeps codex, event, and reward registrars off the shared static screen feature builder', () => {
    const files = [
      'game/platform/browser/composition/register_codex_modules.js',
      'game/platform/browser/composition/register_event_modules.js',
      'game/platform/browser/composition/register_reward_modules.js',
    ];

    for (const file of files) {
      const source = fs.readFileSync(path.join(ROOT, file), 'utf8');
      expect(source).not.toContain('buildScreenFeaturePrimaryModules');
      expect(source).toMatch(/createLazy[A-Za-z]+Module/);
    }
  });

  it('keeps codex and run-rules CSS out of eager html and plain-browser ESM imports', () => {
    const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
    const codexUi = fs.readFileSync(
      path.join(ROOT, 'game/features/codex/presentation/browser/codex_ui.js'),
      'utf8',
    );
    const runModeUi = fs.readFileSync(
      path.join(ROOT, 'game/features/run/presentation/browser/run_mode_ui.js'),
      'utf8',
    );

    expect(html).not.toContain('css/codex_v3.css');
    expect(html).not.toContain('css/run-rules-redesign.css');
    expect(codexUi).not.toContain("import '../../../../../css/codex_v3.css';");
    expect(runModeUi).not.toContain("import '../../../../../css/run-rules-redesign.css';");
  });

  it('keeps title, event, and reward shells as feature-owned lazy mounts instead of eager html payloads', () => {
    const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
    const characterSelectShell = fs.readFileSync(
      path.join(ROOT, 'game/features/title/platform/browser/ensure_character_select_shell.js'),
      'utf8',
    );
    const eventModalShell = fs.readFileSync(
      path.join(ROOT, 'game/features/event/platform/browser/ensure_event_modal_shell.js'),
      'utf8',
    );
    const rewardScreenShell = fs.readFileSync(
      path.join(ROOT, 'game/features/reward/platform/browser/ensure_reward_screen_shell.js'),
      'utf8',
    );

    expect(html).toContain('id="charSelectSubScreen"');
    expect(html).toContain('id="eventModal"');
    expect(html).toContain('id="rewardScreen"');
    expect(html).not.toContain('CHOOSE YOUR ECHO');
    expect(html).not.toContain('건너뛰기 (보상 없이 계속)');
    expect(html).not.toContain('LAYER 1 · 우발적 이벤트');
    expect(characterSelectShell).toContain('CHOOSE YOUR ECHO');
    expect(eventModalShell).toContain('LAYER 1 · 우발적 이벤트');
    expect(rewardScreenShell).toContain('건너뛰기 (보상 없이 계속)');
  });

  it('keeps run/settings/deck/chronicle/codex shells out of the eager html payload', () => {
    const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
    const runSettingsShell = fs.readFileSync(
      path.join(ROOT, 'game/features/run/platform/browser/ensure_run_settings_shell.js'),
      'utf8',
    );
    const deckModalShell = fs.readFileSync(
      path.join(ROOT, 'game/features/combat/platform/browser/ensure_deck_modal_shell.js'),
      'utf8',
    );
    const settingsModalShell = fs.readFileSync(
      path.join(ROOT, 'game/features/ui/platform/browser/ensure_settings_modal_shell.js'),
      'utf8',
    );
    const chronicleShell = fs.readFileSync(
      path.join(ROOT, 'game/features/combat/platform/browser/ensure_battle_chronicle_shell.js'),
      'utf8',
    );
    const codexShell = fs.readFileSync(
      path.join(ROOT, 'game/features/codex/platform/browser/ensure_codex_modal_shell.js'),
      'utf8',
    );

    expect(html).toContain('id="runSettingsModal"');
    expect(html).toContain('id="deckViewModal"');
    expect(html).toContain('id="settingsModal"');
    expect(html).toContain('id="battleChronicleOverlay"');
    expect(html).toContain('id="codexModal"');
    expect(html).not.toContain('각인 상세 설정');
    expect(html).not.toContain('📚 덱');
    expect(html).not.toContain('settings-vol-master-slider');
    expect(html).not.toContain('발견한 모든 것이 기록된다');
    expect(html).not.toContain('chronicle-filter-btn');
    expect(runSettingsShell).toContain('각인 상세 설정');
    expect(deckModalShell).toContain('📚 덱');
    expect(settingsModalShell).toContain('SETTINGS');
    expect(chronicleShell).toContain('chronicle-filter-btn');
    expect(codexShell).toContain('codex-modal-inner');
  });

  it('keeps the repository contract free of removed doc paths', () => {
    const agents = fs.readFileSync(path.join(ROOT, 'AGENTS.md'), 'utf8');
    const readme = fs.readFileSync(path.join(ROOT, 'README.md'), 'utf8');

    expect(agents).not.toContain('docs/architecture_boundaries.md');
    expect(agents).not.toContain('docs/scaling_playbook.md');
    expect(readme).not.toContain('progress.md');
    expect(readme).not.toContain('docs/architecture_refactoring_plan.md');
  });
});
