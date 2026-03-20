import fs from 'node:fs';
import path from 'node:path';

import { describe, expect, it } from 'vitest';

describe('game_state_runtime_methods file structure', () => {
  it('routes combat and card helper ownership through explicit legacy compat adapters', () => {
    const source = fs.readFileSync(
      path.join(process.cwd(), 'game/shared/state/game_state_runtime_methods.js'),
      'utf8',
    );

    expect(source).toContain("./compat/game_state_combat_runtime_compat_methods.js");
    expect(source).toContain("./compat/game_state_card_runtime_compat_methods.js");
    expect(source).not.toContain("../../features/combat/application/combat_methods_compat.js");
    expect(source).not.toContain("../../features/combat/application/card_methods_compat.js");
  });
});
