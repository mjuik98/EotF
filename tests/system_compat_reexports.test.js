import fs from 'node:fs';
import path from 'node:path';

import { describe, expect, it } from 'vitest';

describe('system compat re-exports', () => {
  it('keeps legacy systems files as thin feature re-exports once ownership moves', () => {
    const classProgressionSource = fs.readFileSync(
      path.join(process.cwd(), 'game/systems/class_progression_system.js'),
      'utf8',
    ).trim();
    const setBonusSource = fs.readFileSync(
      path.join(process.cwd(), 'game/systems/set_bonus_system.js'),
      'utf8',
    ).trim();

    expect(classProgressionSource).toBe(
      "export { ClassProgressionSystem } from '../features/title/domain/class_progression_system.js';",
    );
    expect(setBonusSource).toBe(
      "export { SetBonusSystem } from '../features/combat/domain/set_bonus_system.js';",
    );
  });
});
