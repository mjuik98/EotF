import { beforeEach, describe, expect, it, vi } from 'vitest';

const hoisted = vi.hoisted(() => ({
  registerCoreModules: vi.fn(),
  registerTitleModules: vi.fn(),
  registerCombatModules: vi.fn(),
  registerRunModules: vi.fn(),
  registerScreenModules: vi.fn(),
}));

vi.mock('../game/core/composition/register_core_modules.js', () => ({
  registerCoreModules: hoisted.registerCoreModules,
}));

vi.mock('../game/core/composition/register_title_modules.js', () => ({
  registerTitleModules: hoisted.registerTitleModules,
}));

vi.mock('../game/core/composition/register_combat_modules.js', () => ({
  registerCombatModules: hoisted.registerCombatModules,
}));

vi.mock('../game/core/composition/register_run_modules.js', () => ({
  registerRunModules: hoisted.registerRunModules,
}));

vi.mock('../game/core/composition/register_screen_modules.js', () => ({
  registerScreenModules: hoisted.registerScreenModules,
}));

import { createModuleRegistry } from '../game/core/bindings/module_registry.js';

describe('createModuleRegistry', () => {
  beforeEach(() => {
    hoisted.registerCoreModules.mockReset();
    hoisted.registerTitleModules.mockReset();
    hoisted.registerCombatModules.mockReset();
    hoisted.registerRunModules.mockReset();
    hoisted.registerScreenModules.mockReset();
  });

  it('merges module groups in registry order and seeds runtime state', () => {
    hoisted.registerCoreModules.mockReturnValue({ source: 'core', collision: 'core' });
    hoisted.registerTitleModules.mockReturnValue({ titleOnly: true, collision: 'title' });
    hoisted.registerCombatModules.mockReturnValue({ combatOnly: true, collision: 'combat' });
    hoisted.registerRunModules.mockReturnValue({ runOnly: true, collision: 'run' });
    hoisted.registerScreenModules.mockReturnValue({ screenOnly: true, collision: 'screen' });

    expect(createModuleRegistry()).toEqual({
      source: 'core',
      titleOnly: true,
      combatOnly: true,
      runOnly: true,
      screenOnly: true,
      collision: 'screen',
      featureScopes: {
        core: { source: 'core', collision: 'core' },
        title: { titleOnly: true, collision: 'title' },
        combat: { combatOnly: true, collision: 'combat' },
        run: { runOnly: true, collision: 'run' },
        screen: { screenOnly: true, collision: 'screen' },
      },
      _gameStarted: false,
      _canvasRefs: null,
    });
  });
});
