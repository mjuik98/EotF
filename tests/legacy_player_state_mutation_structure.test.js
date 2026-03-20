import fs from 'node:fs';
import path from 'node:path';

import { describe, expect, it } from 'vitest';

describe('legacy player state mutation structure', () => {
  it('keeps the legacy player mutation module as a thin re-export to the shared canonical module', () => {
    const source = fs.readFileSync(
      path.join(process.cwd(), 'game/platform/legacy/state/legacy_player_state_command_mutations.js'),
      'utf8',
    ).trim();

    expect(source).toBe("export * from '../../../shared/state/player_state_legacy_mutations.js';");
  });
});
