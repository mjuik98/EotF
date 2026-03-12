import { describe, expect, it, vi } from 'vitest';

import { startCombatRuntime } from '../game/features/combat/application/create_combat_start_runtime.js';

function createDeps() {
  return {
    gs: {
      currentRegion: 2,
      currentScreen: 'map',
      combat: { turn: 1, active: false, enemies: [] },
      player: { class: 'guardian', echoChain: 0 },
      triggerItems: vi.fn(),
      addLog: vi.fn(),
    },
    data: {
      enemies: {
        ancient_echo: { name: 'Ancient Echo', hp: 100 },
      },
    },
    getRegionData: vi.fn(() => ({ id: '6', boss: ['ancient_echo'] })),
    getBaseRegionIndex: vi.fn(() => 0),
    getRegionCount: vi.fn(() => 5),
    classMechanics: {
      guardian: { onCombatStart: vi.fn() },
    },
    runRules: {
      onCombatDeckReady: vi.fn(),
    },
    api: {
      drawCards: vi.fn(),
    },
    shuffleArray: vi.fn(),
  };
}

describe('create_combat_start_runtime', () => {
  it('routes combat start through feature state commands and runtime presentation hooks', () => {
    const deps = createDeps();
    const runtime = {
      applyCombatEntryOverlay: vi.fn(),
      applyRegionDebuffs: vi.fn(),
      enterCombatState: vi.fn((state) => {
        state.combat.active = true;
        state.currentScreen = 'game';
      }),
      finalizeCombatStartUi: vi.fn(),
      initDeck: vi.fn(),
      resetCombatStartSurface: vi.fn(),
      resetCombatState: vi.fn((state) => {
        state.combat.turn = 1;
      }),
      scheduleCombatEntryAnimations: vi.fn(),
      scheduleCombatStartBanner: vi.fn(),
      setActiveCombatRegionState: vi.fn((state, region) => {
        state._activeRegionId = Number(region.id);
      }),
      showCombatBossBanner: vi.fn(),
      spawnEnemies: vi.fn((state) => {
        state.combat.enemies = [{ name: 'Ancient Echo', hp: 100 }];
        return { spawnedKeys: ['ancient_echo'], isHiddenBoss: false };
      }),
      syncCombatStartButtons: vi.fn(),
    };

    const result = startCombatRuntime('boss', deps, runtime);

    expect(result).toMatchObject({
      combatMode: 'boss',
      isBoss: true,
      spawnResult: { spawnedKeys: ['ancient_echo'] },
    });
    expect(runtime.setActiveCombatRegionState).toHaveBeenCalledWith(deps.gs, { id: '6', boss: ['ancient_echo'] });
    expect(runtime.enterCombatState).toHaveBeenCalledWith(deps.gs);
    expect(runtime.resetCombatStartSurface).toHaveBeenCalledWith(deps.gs, expect.objectContaining({
      enterCombatState: runtime.enterCombatState,
      setActiveCombatRegionState: runtime.setActiveCombatRegionState,
    }));
    expect(runtime.applyCombatEntryOverlay).toHaveBeenCalledWith(deps.gs, expect.any(Object));
    expect(runtime.showCombatBossBanner).toHaveBeenCalledWith(deps.gs, false, expect.any(Object));
    expect(runtime.scheduleCombatEntryAnimations).toHaveBeenCalledTimes(1);
    expect(runtime.syncCombatStartButtons).toHaveBeenCalledWith(deps.gs, expect.any(Object));
    expect(runtime.scheduleCombatStartBanner).toHaveBeenCalledWith(true, false, expect.any(Object));
    expect(runtime.finalizeCombatStartUi).toHaveBeenCalledWith(deps.gs, expect.any(Object));
  });
});
