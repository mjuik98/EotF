import { describe, expect, it, vi } from 'vitest';

import { createModuleRegistryFlatCompat } from '../game/core/bindings/create_module_registry_flat_compat.js';

describe('createModuleRegistryFlatCompat', () => {
  it('wraps only the legacy GS module with the runtime facade while leaving scoped groups canonical', () => {
    const dispatch = vi.fn();
    const groups = {
      core: {
        GS: {
          currentScreen: 'title',
          combat: { enemies: [] },
          player: { buffs: {}, echoChain: 0 },
          stats: {},
          dispatch,
          markDirty: vi.fn(),
          addLog: vi.fn(),
          triggerItems: vi.fn(),
        },
        AudioEngine: { id: 'audio' },
      },
      title: { TitleUI: { id: 'title' } },
      codex: { CodexUI: { id: 'codex' } },
      event: { EventUI: { id: 'event' } },
      reward: { RewardUI: { id: 'reward' } },
      combat: { CombatUI: { id: 'combat' } },
      run: { RunModeUI: { id: 'run' } },
      screen: { ScreenUI: { id: 'screen' } },
    };

    const legacyModules = createModuleRegistryFlatCompat(groups);

    expect(legacyModules.AudioEngine).toBe(groups.core.AudioEngine);
    expect(legacyModules.CodexUI).toBe(groups.codex.CodexUI);
    expect(legacyModules.EventUI).toBe(groups.event.EventUI);
    expect(legacyModules.RewardUI).toBe(groups.reward.RewardUI);
    expect(legacyModules.GS).not.toBe(groups.core.GS);
    expect(legacyModules.GS.dispatch).toBeTypeOf('function');
    expect(legacyModules.GS.dealDamage).toBeTypeOf('function');
    expect(groups.core.GS.dealDamage).toBeUndefined();
  });
});
