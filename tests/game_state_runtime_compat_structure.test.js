import fs from 'node:fs';
import path from 'node:path';

import { describe, expect, it } from 'vitest';

describe('game state runtime compat structure', () => {
  it('keeps card runtime compat methods bound to the canonical combat application facade', () => {
    const source = fs.readFileSync(
      path.join(process.cwd(), 'game/shared/state/compat/game_state_card_runtime_compat_methods.js'),
      'utf8',
    );

    expect(source).toContain(
      "from '../../../features/combat/application/card_methods_facade.js'",
    );
    expect(source).not.toContain("from '../../../features/combat/compat/card_methods.js'");
  });

  it('keeps combat runtime compat methods bound to the canonical combat application facade', () => {
    const source = fs.readFileSync(
      path.join(process.cwd(), 'game/shared/state/compat/game_state_combat_runtime_compat_methods.js'),
      'utf8',
    );

    expect(source).toContain(
      "from '../../../features/combat/application/combat_methods_facade.js'",
    );
    expect(source).not.toContain("from '../../../features/combat/compat/combat_methods.js'");
  });
});
