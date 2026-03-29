import { describe, expect, it } from 'vitest';
import { readText } from './helpers/guardrail_fs.js';

describe('build-first optimization guardrails', () => {
  it('keeps codex, event, and reward registrars off the shared static screen feature builder', () => {
    const files = [
      'game/platform/browser/composition/register_codex_modules.js',
      'game/platform/browser/composition/register_event_modules.js',
      'game/platform/browser/composition/register_reward_modules.js',
    ];

    for (const file of files) {
      const source = readText(file);
      expect(source).not.toContain('buildScreenFeaturePrimaryModules');
      expect(source).toMatch(/createLazy[A-Za-z]+Module/);
    }
  });

  it('keeps codex, run-rules, title, settings, and character-select CSS out of eager html and plain-browser ESM imports', () => {
    const html = readText('index.html');
    const codexUi = readText('game/features/codex/presentation/browser/codex_ui.js');
    const runModeUi = readText('game/features/run/presentation/browser/run_mode_ui.js');
    const gameBootUi = readText('game/features/title/presentation/browser/game_boot_ui.js');
    const settingsUi = readText('game/features/ui/presentation/browser/settings_ui.js');

    expect(html).not.toContain('css/codex_v3.css');
    expect(html).not.toContain('css/run-rules-redesign.css');
    expect(html).not.toContain('css/title_screen.css');
    expect(html).not.toContain('css/settings_modal.css');
    expect(html).not.toContain('css/class_progression.css');
    expect(html).not.toContain('css/character_select_layout.css');
    expect(codexUi).not.toContain("import '../../../../../css/codex_v3.css';");
    expect(runModeUi).not.toContain("import '../../../../../css/run-rules-redesign.css';");
    expect(gameBootUi).not.toContain("import '../../../../../css/title_screen.css';");
    expect(settingsUi).not.toContain("import '../../../../../css/settings_modal.css';");
  });

  it('keeps title, event, and reward shells as feature-owned lazy mounts instead of eager html payloads', () => {
    const html = readText('index.html');
    const characterSelectShell = readText('game/features/title/platform/browser/ensure_character_select_shell.js');
    const eventModalShell = readText('game/features/event/platform/browser/ensure_event_modal_shell.js');
    const rewardScreenShell = readText('game/features/reward/platform/browser/ensure_reward_screen_shell.js');

    expect(html).toContain('id="titleSceneRoot"');
    expect(html).toContain('id="runtimeSceneRoot"');
    expect(html).toContain('id="charSelectSubScreen"');
    expect(html).toContain('id="eventModal"');
    expect(html).toContain('id="rewardScreen"');
    expect(html).not.toContain('CHOOSE YOUR ECHO');
    expect(html).not.toContain('건너뛰기 (보상 없이 계속)');
    expect(html).not.toContain('LAYER 1 · 우발적 이벤트');
    expect(characterSelectShell).toContain('당신의 잔향을 선택하라');
    expect(eventModalShell).toContain('LAYER 1 · 우발적 이벤트');
    expect(rewardScreenShell).toContain('건너뛰기 (보상 없이 계속)');
  });

  it('keeps run/settings/deck/chronicle/codex shells out of the eager html payload', () => {
    const html = readText('index.html');
    const runSettingsShell = readText('game/features/run/platform/browser/ensure_run_settings_shell.js');
    const deckModalShell = readText('game/features/combat/platform/browser/ensure_deck_modal_shell.js');
    const settingsModalShell = readText('game/features/ui/platform/browser/ensure_settings_modal_shell.js');
    const chronicleShell = readText('game/features/combat/platform/browser/ensure_battle_chronicle_shell.js');
    const codexShell = readText('game/features/codex/platform/browser/ensure_codex_modal_shell.js');

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

  it('avoids a full-body decorative backdrop layer behind the run rules content', () => {
    const runRulesCss = readText('css/run-rules-redesign.css');

    expect(runRulesCss).not.toContain('#runSettingsBody::before {');
  });

  it('keeps the repository contract free of removed doc paths', () => {
    const agents = readText('AGENTS.md');
    const readme = readText('README.md');

    expect(agents).not.toContain('docs/architecture_boundaries.md');
    expect(agents).not.toContain('docs/scaling_playbook.md');
    expect(readme).not.toContain('progress.md');
    expect(readme).not.toContain('docs/architecture_refactoring_plan.md');
  });
});
