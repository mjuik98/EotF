import { describe, expect, it } from 'vitest';

import { buildBattleChronicleShellMarkup } from '../game/features/combat/platform/browser/ensure_battle_chronicle_shell.js';
import { buildDeckModalShellMarkup } from '../game/features/combat/platform/browser/ensure_deck_modal_shell.js';
import { buildCodexModalShellMarkup } from '../game/features/codex/platform/browser/ensure_codex_modal_shell.js';
import { buildCodexModalMarkup } from '../game/features/codex/presentation/browser/codex_ui_structure.js';
import { buildEventModalShellMarkup } from '../game/features/event/platform/browser/ensure_event_modal_shell.js';
import { buildRunSettingsShellMarkup } from '../game/features/run/platform/browser/ensure_run_settings_shell.js';
import { buildSettingsModalShellMarkup } from '../game/features/ui/platform/browser/ensure_settings_modal_shell.js';

describe('overlay modal shell markup', () => {
  it('uses the shared modal panel across overlay shells and body hooks where the shell owns content', () => {
    const panels = [
      buildRunSettingsShellMarkup(),
      buildSettingsModalShellMarkup(),
      buildDeckModalShellMarkup(),
      buildBattleChronicleShellMarkup(),
      buildEventModalShellMarkup(),
      buildCodexModalShellMarkup(),
    ];
    const bodyShells = [
      buildRunSettingsShellMarkup(),
      buildSettingsModalShellMarkup(),
      buildDeckModalShellMarkup(),
      buildBattleChronicleShellMarkup(),
      buildEventModalShellMarkup(),
    ];

    panels.forEach((markup) => {
      expect(markup).toContain('gm-modal-panel');
    });

    bodyShells.forEach((markup) => {
      expect(markup).toContain('gm-modal-body');
    });
  });

  it('uses the shared title hierarchy in the codex structure markup', () => {
    const markup = buildCodexModalMarkup();

    expect(markup).toContain('gm-modal-header');
    expect(markup).toContain('gm-modal-header-main');
    expect(markup).toContain('gm-modal-eyebrow');
    expect(markup).toContain('gm-modal-title');
    expect(markup).toContain('gm-modal-subtitle');
    expect(markup).toContain('gm-modal-body');
    expect(markup).toContain('gm-modal-footer');
  });
});
