import fs from 'node:fs';
import path from 'node:path';

import { describe, expect, it } from 'vitest';

describe('player runtime structure', () => {
  it('composes shared player runtime methods from split player modules', () => {
    const source = fs.readFileSync(
      path.join(process.cwd(), 'game/shared/state/player_runtime_methods.js'),
      'utf8',
    );

    expect(source).toContain("from '../player/player_resource_use_cases.js'");
    expect(source).toContain("from '../player/player_runtime_effects.js'");
    expect(source).toContain("from '../player/player_ui_effects.js'");
  });
});
