import fs from 'node:fs';
import path from 'node:path';

import { describe, expect, it } from 'vitest';

describe('game state runtime compat structure', () => {
  it('keeps card runtime compat methods bound to the canonical combat runtime port surface', () => {
    const source = fs.readFileSync(
      path.join(process.cwd(), 'game/shared/state/compat/game_state_card_runtime_compat_methods.js'),
      'utf8',
    );

    expect(source).toContain(
      "from '../../../features/combat/ports/public_game_state_runtime_capabilities.js'",
    );
    expect(source).not.toContain("from '../../../features/combat/compat/card_methods.js'");
  });

  it('keeps combat runtime compat methods bound to the canonical combat runtime port surface', () => {
    const source = fs.readFileSync(
      path.join(process.cwd(), 'game/shared/state/compat/game_state_combat_runtime_compat_methods.js'),
      'utf8',
    );

    expect(source).toContain(
      "from '../../../features/combat/ports/public_game_state_runtime_capabilities.js'",
    );
    expect(source).not.toContain("from '../../../features/combat/compat/combat_methods.js'");
  });
});
