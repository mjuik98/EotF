import { beforeEach, describe, expect, it, vi } from 'vitest';

const hoisted = vi.hoisted(() => ({
  registerCoreModules: vi.fn(),
  registerTitleModules: vi.fn(),
  registerCodexModules: vi.fn(),
  registerEventModules: vi.fn(),
  registerRewardModules: vi.fn(),
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

vi.mock('../game/core/composition/register_codex_modules.js', () => ({
  registerCodexModules: hoisted.registerCodexModules,
}));

vi.mock('../game/core/composition/register_event_modules.js', () => ({
  registerEventModules: hoisted.registerEventModules,
}));

vi.mock('../game/core/composition/register_reward_modules.js', () => ({
  registerRewardModules: hoisted.registerRewardModules,
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
    hoisted.registerCodexModules.mockReset();
    hoisted.registerEventModules.mockReset();
    hoisted.registerRewardModules.mockReset();
    hoisted.registerCombatModules.mockReset();
    hoisted.registerRunModules.mockReset();
    hoisted.registerScreenModules.mockReset();
  });

  it('merges module groups in registry order and seeds runtime state', () => {
    hoisted.registerCoreModules.mockReturnValue({ source: 'core', collision: 'core' });
    hoisted.registerTitleModules.mockReturnValue({ titleOnly: true, collision: 'title' });
    hoisted.registerCodexModules.mockReturnValue({ codexOnly: true, collision: 'codex' });
    hoisted.registerEventModules.mockReturnValue({ eventOnly: true, collision: 'event' });
    hoisted.registerRewardModules.mockReturnValue({ rewardOnly: true, collision: 'reward' });
    hoisted.registerCombatModules.mockReturnValue({ combatOnly: true, collision: 'combat' });
    hoisted.registerRunModules.mockReturnValue({ runOnly: true, collision: 'run' });
    hoisted.registerScreenModules.mockReturnValue({ screenOnly: true, collision: 'screen' });

    const registry = createModuleRegistry();

    expect(registry).toEqual({
      legacyModules: {
        source: 'core',
        titleOnly: true,
        codexOnly: true,
        eventOnly: true,
        rewardOnly: true,
        combatOnly: true,
        runOnly: true,
        screenOnly: true,
        collision: 'screen',
      },
      featureScopes: {
        core: { source: 'core', collision: 'core' },
        title: { titleOnly: true, collision: 'title' },
        codex: { codexOnly: true, collision: 'codex' },
        event: { eventOnly: true, collision: 'event' },
        reward: { rewardOnly: true, collision: 'reward' },
        combat: { combatOnly: true, collision: 'combat' },
        run: { runOnly: true, collision: 'run' },
        screen: { screenOnly: true, collision: 'screen' },
      },
      _gameStarted: false,
      _canvasRefs: null,
    });
    expect(registry.source).toBe('core');
    expect(registry.titleOnly).toBe(true);
    expect(registry.codexOnly).toBe(true);
    expect(registry.eventOnly).toBe(true);
    expect(registry.rewardOnly).toBe(true);
    expect(registry.combatOnly).toBe(true);
    expect(registry.runOnly).toBe(true);
    expect(registry.screenOnly).toBe(true);
    expect(registry.collision).toBe('screen');
    expect(Object.keys(registry)).not.toContain('source');
    expect(Object.keys(registry)).not.toContain('titleOnly');
    expect(Object.keys(registry)).not.toContain('codexOnly');
    expect(Object.keys(registry)).not.toContain('combatOnly');
  });
});
