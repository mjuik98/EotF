import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';

import { describe, expect, it } from 'vitest';

describe('run mode style split', () => {
  it('keeps run-settings layout rules out of the global stylesheet now that the feature loads its own css', () => {
    const globalStyles = readFileSync(path.join(process.cwd(), 'css', 'styles.css'), 'utf8');
    const runModePath = path.join(process.cwd(), 'css', 'run-rules-redesign.css');
    const legacyPublicPath = path.join(process.cwd(), 'public', 'css', 'run-rules-redesign.css');
    const runModeStyles = readFileSync(runModePath, 'utf8');

    expect(globalStyles).not.toContain('Run Rules Layout (shared with run-rules-redesign.css)');
    expect(globalStyles).not.toContain('#runSettingsBody');
    expect(existsSync(runModePath)).toBe(true);
    expect(existsSync(legacyPublicPath)).toBe(false);
    expect(runModeStyles).toContain('#runSettingsModal .run-settings-panel');
  });

  it('styles locked curse cards with explicit lock-state rules', () => {
    const runModeStyles = readFileSync(path.join(process.cwd(), 'css', 'run-rules-redesign.css'), 'utf8');

    expect(runModeStyles).toContain('.rm-opt.locked');
    expect(runModeStyles).toContain('.rm-opt-lock');
  });
});
