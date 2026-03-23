import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { CombatInitializer } from '../game/features/combat/public.js';
import { startCombatFlowUseCase } from '../game/features/combat/public.js';

function createDeps() {
  return {
    gs: {
      currentRegion: 2,
      combat: { turn: 1, active: false },
      player: { class: 'guardian' },
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
    difficultyScaler: {},
    runRules: {
      onCombatStart: vi.fn(),
      onCombatDeckReady: vi.fn(),
    },
    classMechanics: {
      guardian: { onCombatStart: vi.fn() },
    },
    showWorldMemoryNotice: vi.fn(),
    setTimeoutFn: vi.fn((fn) => fn()),
    shuffleArray: vi.fn(),
    api: {
      drawCards: vi.fn(),
    },
  };
}

describe('startCombatFlowUseCase', () => {
  beforeEach(() => {
    vi.spyOn(CombatInitializer, 'resetCombatState').mockImplementation(() => {});
    vi.spyOn(CombatInitializer, 'spawnEnemies').mockImplementation(() => ({
      spawnedKeys: ['ancient_echo'],
      isHiddenBoss: true,
    }));
    vi.spyOn(CombatInitializer, 'applyRegionDebuffs').mockImplementation(() => {});
    vi.spyOn(CombatInitializer, 'initDeck').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('orchestrates combat start state, spawn, class hooks, and deck setup', () => {
    const deps = createDeps();
    deps.enterCombatState = vi.fn((state) => {
      state.combat.active = true;
      state.currentScreen = 'game';
    });
    deps.setActiveCombatRegionState = vi.fn((state, region) => {
      state._activeRegionId = Number(region.id);
      return state._activeRegionId;
    });

    const result = startCombatFlowUseCase('boss', {
      ...deps,
      applyRegionDebuffs: CombatInitializer.applyRegionDebuffs,
      initDeck: CombatInitializer.initDeck,
      playBossPhase: vi.fn(),
      resetCombatState: CombatInitializer.resetCombatState,
      spawnEnemies: CombatInitializer.spawnEnemies,
    });

    expect(result).toMatchObject({
      combatMode: 'boss',
      isBoss: true,
      isMiniBoss: false,
      spawnResult: {
        spawnedKeys: ['ancient_echo'],
        isHiddenBoss: true,
      },
    });
    expect(deps.gs._activeRegionId).toBe(6);
    expect(deps.gs.combat.active).toBe(true);
    expect(deps.gs.currentScreen).toBe('game');
    expect(deps.setActiveCombatRegionState).toHaveBeenCalledWith(deps.gs, { id: '6', boss: ['ancient_echo'] });
    expect(deps.enterCombatState).toHaveBeenCalledWith(deps.gs);
    expect(CombatInitializer.resetCombatState).toHaveBeenCalledWith(deps.gs);
    expect(CombatInitializer.spawnEnemies).toHaveBeenCalledWith(
      deps.gs,
      deps.data,
      'boss',
      expect.objectContaining({
        getRegionData: deps.getRegionData,
        getBaseRegionIndex: deps.getBaseRegionIndex,
        getRegionCount: deps.getRegionCount,
        difficultyScaler: deps.difficultyScaler,
      }),
    );
    expect(CombatInitializer.applyRegionDebuffs).toHaveBeenCalledWith(
      deps.gs,
      deps.getBaseRegionIndex,
      { runRules: deps.runRules },
    );
    expect(deps.classMechanics.guardian.onCombatStart).toHaveBeenCalledWith(deps.gs);
    expect(deps.gs.triggerItems).toHaveBeenCalledWith('combat_start');
    expect(CombatInitializer.initDeck).toHaveBeenCalledWith(deps.gs, {
      shuffleArrayFn: deps.shuffleArray,
      drawCardsFn: deps.api.drawCards,
    });
    expect(deps.runRules.onCombatDeckReady).toHaveBeenCalledWith(deps.gs);
    expect(deps.gs.addLog).toHaveBeenNthCalledWith(1, '⚔️ 전투 시작!', 'system');
    expect(deps.gs.addLog).toHaveBeenNthCalledWith(2, '── 턴 1 ──', 'turn-divider');
    expect(deps.showWorldMemoryNotice).toHaveBeenCalledTimes(1);
  });

  it('fails fast when required combat dependencies are missing', () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

    expect(startCombatFlowUseCase('normal', { gs: null })).toBeNull();
    expect(consoleError).toHaveBeenCalledWith('[CombatStart] Missing dependencies');
  });
});
