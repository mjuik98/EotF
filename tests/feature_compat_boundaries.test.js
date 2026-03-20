import fs from 'node:fs';
import path from 'node:path';

import { describe, expect, it } from 'vitest';

const ROOT = process.cwd();

describe('feature compat boundaries', () => {
  it('keeps combat and event compat implementations in feature compat directories while old application paths stay as thin shims', () => {
    const shimExpectations = {
      'game/features/combat/application/card_methods_compat.js': '../application/card_methods_facade.js',
      'game/features/combat/application/combat_lifecycle_compat.js': '../application/combat_lifecycle_facade.js',
      'game/features/combat/application/combat_methods_compat.js': '../application/combat_methods_facade.js',
      'game/features/combat/application/damage_system_compat.js': '../application/damage_system_facade.js',
      'game/features/combat/application/death_handler_compat.js': '../application/death_handler_facade.js',
      'game/features/combat/application/turn_manager_compat.js': '../application/turn_manager_facade.js',
      'game/features/event/application/event_manager_compat.js': '../application/event_manager_facade.js',
    };

    for (const [file, target] of Object.entries(shimExpectations)) {
      const source = fs.readFileSync(path.join(ROOT, file), 'utf8');
      expect(source).toContain(`export {`);
      expect(source).toContain(target);
    }

    const existingCompatFiles = [
      'game/features/combat/compat/card_methods.js',
      'game/features/combat/compat/combat_lifecycle.js',
      'game/features/combat/compat/combat_methods.js',
      'game/features/combat/compat/damage_system.js',
      'game/features/combat/compat/death_handler.js',
      'game/features/combat/compat/turn_manager.js',
      'game/features/event/compat/event_manager.js',
    ];

    for (const file of existingCompatFiles) {
      expect(fs.existsSync(path.join(ROOT, file))).toBe(true);
    }
  });
});
