import fs from 'node:fs';
import path from 'node:path';

import { describe, expect, it } from 'vitest';

describe('combat compat structure', () => {
  it('keeps the compat card methods as a thin re-export to the canonical application module', () => {
    const source = fs.readFileSync(
      path.join(process.cwd(), 'game/features/combat/compat/card_methods.js'),
      'utf8',
    ).trim();

    expect(source).toBe("export { CardMethods } from '../application/card_methods_facade.js';");
  });

  it('keeps the compat combat lifecycle as a thin re-export to the canonical application module', () => {
    const source = fs.readFileSync(
      path.join(process.cwd(), 'game/features/combat/compat/combat_lifecycle.js'),
      'utf8',
    ).trim();

    expect(source).toBe(
      "export { CombatLifecycle } from '../application/combat_lifecycle_facade.js';",
    );
  });

  it('keeps the compat combat methods as a thin re-export to the canonical application module', () => {
    const source = fs.readFileSync(
      path.join(process.cwd(), 'game/features/combat/compat/combat_methods.js'),
      'utf8',
    ).trim();

    expect(source).toBe("export { CombatMethods } from '../application/combat_methods_facade.js';");
  });

  it('keeps the compat death handler as a thin re-export to the canonical application module', () => {
    const source = fs.readFileSync(
      path.join(process.cwd(), 'game/features/combat/compat/death_handler.js'),
      'utf8',
    ).trim();

    expect(source).toBe("export { DeathHandler } from '../application/death_handler_facade.js';");
  });

  it('keeps the compat turn manager as a thin re-export to the canonical application module', () => {
    const source = fs.readFileSync(
      path.join(process.cwd(), 'game/features/combat/compat/turn_manager.js'),
      'utf8',
    ).trim();

    expect(source).toBe("export { TurnManager } from '../application/turn_manager_facade.js';");
  });
});
