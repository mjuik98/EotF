import fs from 'node:fs';
import path from 'node:path';

import { describe, expect, it } from 'vitest';

describe('combat damage system structure', () => {
  it('keeps the compat damage system as a thin re-export to the canonical application module', () => {
    const source = fs.readFileSync(
      path.join(process.cwd(), 'game/features/combat/compat/damage_system.js'),
      'utf8',
    ).trim();

    expect(source).toBe("export { DamageSystem } from '../application/damage_system_facade.js';");
  });
});
