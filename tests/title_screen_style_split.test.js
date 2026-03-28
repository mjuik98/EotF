import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';

import { describe, expect, it } from 'vitest';

describe('title screen style split', () => {
  it('keeps title-screen layout rules out of the global stylesheet now that the feature loads its own css', () => {
    const globalStyles = readFileSync(path.join(process.cwd(), 'css', 'styles.css'), 'utf8');
    const titleScreenPath = path.join(process.cwd(), 'css', 'title_screen.css');
    const titleScreenStyles = readFileSync(titleScreenPath, 'utf8');

    expect(existsSync(titleScreenPath)).toBe(true);
    expect(globalStyles).not.toContain('.title-content {');
    expect(globalStyles).not.toContain('.title-run-archive-badge {');
    expect(globalStyles).not.toContain('.title-save-tooltip {');
    expect(titleScreenStyles).toContain('.title-content {');
    expect(titleScreenStyles).toContain('.title-run-archive-badge {');
    expect(titleScreenStyles).toContain('.title-save-tooltip {');
  });
});
