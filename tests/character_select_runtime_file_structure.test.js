import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import path from 'node:path';

describe('character select runtime file structure', () => {
  it('delegates browser env and modal state helpers to focused modules', () => {
    const filePath = path.resolve(process.cwd(), 'game/features/title/application/create_character_select_runtime.js');
    const source = readFileSync(filePath, 'utf8');

    expect(source).toContain("from './character_select_runtime_env.js'");
    expect(source).toContain("from './character_select_runtime_state.js'");
  });
});
