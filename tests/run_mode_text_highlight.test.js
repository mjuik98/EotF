import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';

import { DescriptionUtils } from '../game/utils/description_utils.js';
import { highlightRunModeText } from '../game/features/run/presentation/browser/run_mode_text_highlight.js';

describe('run_mode_text_highlight', () => {
  it('delegates run-mode rich text highlighting to the shared description highlighter', () => {
    const text = '전투 시작: 피해 14. 잔향 20 충전 [소진]';

    expect(highlightRunModeText(text)).toBe(DescriptionUtils.highlight(text));
  });

  it('keeps the wrapper thin instead of reintroducing a second token engine', () => {
    const source = readFileSync(new URL('../game/features/run/presentation/browser/run_mode_text_highlight.js', import.meta.url), 'utf8');

    expect(source).toContain('DescriptionUtils.highlight');
    expect(source).not.toContain('function protect');
    expect(source).not.toContain('function escapeHtml');
  });
});
