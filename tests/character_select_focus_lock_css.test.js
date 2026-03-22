import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';

describe('character select focus lock css', () => {
  it('uses a stronger vignette and tempers card particles during focus lock', () => {
    const css = readFileSync(new URL('../css/styles.css', import.meta.url), 'utf8');

    expect(css).toContain('#charSelectSubScreen.is-focus-locked::after');
    expect(css).toContain('radial-gradient(circle at 50% 40%');
    expect(css).toContain('rgba(1, 2, 8, 0.9) 100%');
    expect(css).toContain('#charSelectSubScreen.is-focus-locked #particleCanvas');
    expect(css).toContain('opacity: 0.28;');
  });
});
