import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';

describe('character select layout css', () => {
  it('owns the new stage wrapper and non-sticky confirm flow', () => {
    const css = readFileSync(new URL('../css/character_select_layout.css', import.meta.url), 'utf8');

    expect(css).toContain('#charStage');
    expect(css).toContain('#charCardWrap');
    expect(css).toContain('#charInspector');
    expect(css).toContain('#buttonsRow');
    expect(css).toContain('position: static');
    expect(css).toContain('.char-info-body');
    expect(css).toContain('overflow: visible');
  });
});
