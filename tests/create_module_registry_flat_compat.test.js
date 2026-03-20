import { describe, expect, it, vi } from 'vitest';

import { createModuleRegistryFlatCompat } from '../game/core/bindings/create_module_registry_flat_compat.js';

describe('createModuleRegistryFlatCompat', () => {
  it('wraps only the legacy GS module with the runtime facade while leaving scoped groups canonical', () => {
    const dispatch = vi.fn();
    const featureScopes = {
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

    const legacyModules = createModuleRegistryFlatCompat(featureScopes);

    expect(legacyModules.AudioEngine).toBe(featureScopes.core.AudioEngine);
    expect(legacyModules.CodexUI).toBe(featureScopes.codex.CodexUI);
    expect(legacyModules.EventUI).toBe(featureScopes.event.EventUI);
    expect(legacyModules.RewardUI).toBe(featureScopes.reward.RewardUI);
    expect(legacyModules.GS).not.toBe(featureScopes.core.GS);
    expect(legacyModules.GS.dispatch).toBeTypeOf('function');
    expect(legacyModules.GS.dealDamage).toBeTypeOf('function');
    expect(featureScopes.core.GS.dealDamage).toBeUndefined();
  });

  it('only exposes legacy compat keys in the flat legacy bag', () => {
    const featureScopes = {
      core: {
        GS: {
          currentScreen: 'title',
          combat: { enemies: [] },
          player: { buffs: {}, echoChain: 0 },
          stats: {},
          dispatch: vi.fn(),
          markDirty: vi.fn(),
          addLog: vi.fn(),
          triggerItems: vi.fn(),
        },
        AudioEngine: { id: 'audio' },
        CustomOnlyCoreModule: { id: 'custom-core' },
      },
      title: {
        CharacterSelectUI: { id: 'character-select' },
        TitleOnlyInternalModule: { id: 'title-only' },
      },
      run: {
        RunModeUI: { id: 'run-mode' },
        RunOnlyInternalModule: { id: 'run-only' },
      },
    };

    const legacyModules = createModuleRegistryFlatCompat(featureScopes);

    expect(legacyModules.GS).toBeDefined();
    expect(legacyModules.AudioEngine).toBe(featureScopes.core.AudioEngine);
    expect(legacyModules.CharacterSelectUI).toBe(featureScopes.title.CharacterSelectUI);
    expect(legacyModules.RunModeUI).toBe(featureScopes.run.RunModeUI);
    expect(legacyModules.CustomOnlyCoreModule).toBeUndefined();
    expect(legacyModules.TitleOnlyInternalModule).toBeUndefined();
    expect(legacyModules.RunOnlyInternalModule).toBeUndefined();
  });
});
