import { describe, expect, it } from 'vitest';
import { pathExists, readText } from './helpers/guardrail_fs.js';

describe('feature compat structure', () => {
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
      const source = readText(file);
      expect(source).toContain('export {');
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
      expect(pathExists(file)).toBe(true);
    }
  });

  it('keeps combat compat capabilities bound to canonical application facades', () => {
    const source = readText('game/features/combat/ports/public_compat_capabilities.js');

    expect(source).toContain('../application/card_methods_facade.js');
    expect(source).toContain('../application/combat_lifecycle_facade.js');
    expect(source).toContain('../application/combat_methods_facade.js');
    expect(source).toContain('../application/damage_system_facade.js');
    expect(source).toContain('../application/death_handler_facade.js');
    expect(source).toContain('../application/turn_manager_facade.js');
    expect(source).not.toContain('../compat/card_methods.js');
    expect(source).not.toContain('../compat/combat_lifecycle.js');
  });

  it('keeps event compat capabilities bound to the canonical application facade', () => {
    const source = readText('game/features/event/ports/public_surface.js');

    expect(source).toContain('../application/event_manager_facade.js');
    expect(source).not.toContain('../compat/event_manager.js');
  });
});
