import fs from 'node:fs';
import path from 'node:path';

import { describe, expect, it } from 'vitest';

describe('combat compat re-exports', () => {
  it('keeps legacy combat facade files as thin feature re-exports once ownership moves', () => {
    const expectations = {
      'game/combat/combat_lifecycle.js':
        "export { CombatLifecycle } from '../features/combat/application/combat_lifecycle_compat.js';",
      'game/combat/death_handler.js':
        "export { DeathHandler } from '../features/combat/application/death_handler_compat.js';",
      'game/combat/turn_manager.js':
        "export { TurnManager } from '../features/combat/application/turn_manager_compat.js';",
    };

    for (const [file, expected] of Object.entries(expectations)) {
      const source = fs.readFileSync(path.join(process.cwd(), file), 'utf8').trim();
      expect(source).toBe(expected);
    }
  });
});
