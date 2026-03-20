import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';

describe('ending_screen_fx file structure', () => {
  it('delegates model and browser runtime details to focused modules', () => {
    const filePath = path.resolve(process.cwd(), 'game/features/ui/presentation/browser/ending_screen_fx.js');
    const source = readFileSync(filePath, 'utf8');

    expect(source).toContain("from './ending_screen_fx_model.js'");
    expect(source).toContain("from './ending_screen_fx_runtime.js'");
  });
});
