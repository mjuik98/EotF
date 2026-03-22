import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';

describe('class progression css', () => {
  it('anchors the level line near the identity block without a character-card xp readout', () => {
    const css = readFileSync(new URL('../css/class_progression.css', import.meta.url), 'utf8');

    expect(css).toContain('#cardLevelBadge');
    expect(css).toContain('position: relative');
    expect(css).toContain('justify-content: center');
    expect(css).toContain('margin-bottom: 12px');
    expect(css).not.toContain('#cardXpBarWrap');
    expect(css).not.toContain('.csm-card-xp-track');
    expect(css).not.toContain('.csm-card-xp-fill');
    expect(css).not.toContain('.csm-card-xp-text');
  });
});
