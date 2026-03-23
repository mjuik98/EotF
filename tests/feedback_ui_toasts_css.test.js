import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

describe('feedback toast css regression', () => {
  it('keeps reduced-motion and stacked-toast polish selectors in place', () => {
    const source = readFileSync(path.join(process.cwd(), 'css/styles.css'), 'utf8');

    expect(source).toContain('.stack-toast-count');
    expect(source).toContain('.toast-summary-value');
    expect(source).toContain('font-variant-numeric: tabular-nums');
    expect(source).toContain('@media (prefers-reduced-motion: reduce)');
    expect(source).toContain('animation: fadeIn 0.16s ease-out both');
    expect(source).toContain('animation: fadeOut 0.14s ease-in forwards');
  });
});
