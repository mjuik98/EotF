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
    expect(css).toContain('#cardSummary');
    expect(css).toContain('font-size: 15px');
    expect(css).toContain('rgba(236, 243, 255, 0.92)');
    expect(css).toContain('.char-info-shell');
    expect(css).toContain('backdrop-filter: blur(18px)');
    expect(css).toContain('rgba(255, 255, 255, 0.18)');
    expect(css).toContain('.char-info-text');
    expect(css).toContain('color: #d5ddf2');
    expect(css).toContain('.char-playstyle-item');
    expect(css).toContain('.deck-card-role');
    expect(css).toContain('.char-confirm-btn');
    expect(css).toContain('0 18px 34px rgba(0, 0, 0, 0.26)');
  });
});
