import { describe, expect, it, vi } from 'vitest';
import {
  buildCharacterSelectShellMarkup,
  ensureCharacterSelectShell,
} from '../game/features/title/platform/browser/ensure_character_select_shell.js';

describe('ensureCharacterSelectShell', () => {
  it('builds stage-centric shell markup with inspector and summary anchors', () => {
    const markup = buildCharacterSelectShellMarkup();

    expect(markup).toContain('id="charStage"');
    expect(markup).toContain('id="charInspector"');
    expect(markup).toContain('id="charStageMeta"');
    expect(markup).toContain('id="cardSummary"');
    expect(markup).toContain('id="dotsRow"');
    expect(markup).toContain('id="buttonsRow"');
  });

  it('mounts shell markup into the character select container', () => {
    const container = { innerHTML: '' };
    const doc = {
      getElementById: vi.fn((id) => {
        if (id === 'charSelectSubScreen') return container;
        return null;
      }),
    };

    const mounted = ensureCharacterSelectShell(doc);

    expect(mounted).toBe(container);
    expect(container.innerHTML).toContain('id="charStage"');
    expect(container.innerHTML).toContain('id="cardSummary"');
  });
});
