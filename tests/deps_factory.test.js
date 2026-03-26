import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ErrorCodes } from '../game/core/error_codes.js';
import {
  buildContractDepAccessors,
  createDeps,
  createDepsAccessors,
  initDepsFactory,
  listDepContracts,
  patchRefs,
} from '../game/core/deps_factory.js';

const EXPECTED_CONTRACTS = [
  'base',
  'story',
  'combatTurnBase',
  'event',
  'reward',
  'runReturn',
  'combatFlow',
  'eventFlow',
  'rewardFlow',
  'saveSystem',
  'hudUpdate',
  'combatHud',
  'cardTarget',
  'baseCard',
  'feedback',
  'codex',
  'deckModal',
  'tooltip',
  'screen',
  'combatInfo',
  'classSelect',
  'helpPause',
  'worldCanvas',
  'settings',
  'runMode',
  'runStart',
  'runSetup',
  'runNodeHandoff',
  'metaProgression',
  'regionTransition',
  'gameBoot',
];

function seedRefs(overrides = {}) {
  const saveMeta = vi.fn(() => ({ status: 'saved', persisted: true, queueDepth: 0 }));
  const showSaveStatus = vi.fn();
  const refs = {
    GAME: {
      getDeps: () => ({ token: 'legacy-deps' }),
      getRunDeps: () => ({ token: 'run-deps' }),
      getCombatDeps: () => ({ token: 'combat-deps' }),
      getEventDeps: () => ({ token: 'event-deps' }),
      getHudDeps: () => ({ token: 'hud-deps' }),
      getUiDeps: () => ({ token: 'ui-deps' }),
      getCanvasDeps: () => ({ token: 'canvas-deps' }),
    },
    _gameStarted: () => true,
    RunRules: { id: 'run-rules' },
    SaveSystem: { saveMeta, showSaveStatus },
    GS: { playCard: vi.fn() },
    ...overrides,
  };
  initDepsFactory(refs);
  return { refs, saveMeta, showSaveStatus };
}

describe('deps factory', () => {
  beforeEach(() => {
    seedRefs();
  });

  it('exposes the expected contract set', () => {
    const contracts = listDepContracts();
    const contractSet = new Set(contracts);

    expect(contractSet.size).toBe(EXPECTED_CONTRACTS.length);
    for (const name of EXPECTED_CONTRACTS) {
      expect(contractSet.has(name)).toBe(true);
    }
  });

  it('creates deps for every contract and applies overrides', () => {
    for (const name of EXPECTED_CONTRACTS) {
      const deps = createDeps(name, { __override: true });
      expect(typeof deps).toBe('object');
      expect(deps.__override).toBe(true);
      expect(typeof deps.token).toBe('string');
    }
  });

  it('builds feature-facing dep accessors from contract maps', () => {
    const createDepsSpy = vi.fn((contractName, overrides = {}) => ({
      token: contractName,
      ...overrides,
    }));

    const accessors = createDepsAccessors({
      getScreenDeps: 'screen',
      getTooltipDeps: 'tooltip',
    }, createDepsSpy);

    expect(Object.isFrozen(accessors)).toBe(true);
    expect(accessors.getScreenDeps({ gs: { hp: 10 } })).toEqual({
      token: 'screen',
      gs: { hp: 10 },
    });
    expect(accessors.getTooltipDeps()).toEqual({ token: 'tooltip' });
    expect(createDepsSpy).toHaveBeenNthCalledWith(1, 'screen', { gs: { hp: 10 } });
    expect(createDepsSpy).toHaveBeenNthCalledWith(2, 'tooltip', {});
  });

  it('builds contract dep accessors from a createDeps function or accessor-style fallback object', () => {
    const createDepsSpy = vi.fn((contractName, overrides = {}) => ({
      token: contractName,
      ...overrides,
    }));
    const accessorFallback = {
      getScreenDeps: vi.fn(() => ({ token: 'fallback-screen' })),
      getTooltipDeps: vi.fn(() => ({ token: 'fallback-tooltip' })),
    };

    const contractAccessors = buildContractDepAccessors({
      getScreenDeps: 'screen',
      getTooltipDeps: 'tooltip',
    }, createDepsSpy);
    const fallbackAccessors = buildContractDepAccessors({
      getScreenDeps: 'screen',
      getTooltipDeps: 'tooltip',
    }, accessorFallback);

    expect(contractAccessors.getScreenDeps({ gs: { hp: 1 } })).toEqual({
      token: 'screen',
      gs: { hp: 1 },
    });
    expect(fallbackAccessors.getScreenDeps()).toEqual({ token: 'fallback-screen' });
    expect(fallbackAccessors.getTooltipDeps()).toEqual({ token: 'fallback-tooltip' });
    expect(createDepsSpy).toHaveBeenNthCalledWith(1, 'screen', { gs: { hp: 1 } });
    expect(accessorFallback.getScreenDeps).toHaveBeenCalledTimes(1);
    expect(accessorFallback.getTooltipDeps).toHaveBeenCalledTimes(1);
  });

  it('throws AppError with deps missing code for unknown contracts', () => {
    try {
      createDeps('missing-contract');
      throw new Error('expected createDeps to throw');
    } catch (err) {
      expect(err.code).toBe(ErrorCodes.DEPS_CONTRACT_MISSING);
    }
  });

  it('keeps nested run contracts wired via createDeps', () => {
    const { saveMeta, showSaveStatus } = seedRefs();

    const runMode = createDeps('runMode');
    runMode.saveMeta();
    expect(saveMeta).toHaveBeenCalledTimes(1);
    expect(saveMeta.mock.calls[0][0].runRules).toEqual({ id: 'run-rules' });
    expect(showSaveStatus).toHaveBeenCalledTimes(1);
    expect(showSaveStatus.mock.calls[0][0]).toEqual({ status: 'saved', persisted: true, queueDepth: 0 });
    expect(showSaveStatus.mock.calls[0][1].runRules).toEqual({ id: 'run-rules' });

    const combatFlow = createDeps('combatFlow');
    const eventFlow = createDeps('eventFlow');
    const rewardFlow = createDeps('rewardFlow');
    const runSetup = createDeps('runSetup');
    expect(typeof runSetup.enterGameplay).toBe('function');
    expect(typeof runSetup.enterRun).toBe('function');
    expect(typeof runSetup.startGame).toBe('function');

    const runStart = createDeps('runStart');
    const runNodeHandoff = createDeps('runNodeHandoff');
    expect(typeof combatFlow.startCombat).toBe('function');
    expect(typeof eventFlow.openEvent).toBe('function');
    expect(typeof rewardFlow.openReward).toBe('function');
    expect(typeof runStart.continueLoadedRun).toBe('function');
    expect(typeof runStart.requestAnimationFrame).toBe('function');
    expect(typeof runNodeHandoff.startCombat).toBe('function');
    expect(typeof runNodeHandoff.openEvent).toBe('function');

    const gameBoot = createDeps('gameBoot');
    expect(gameBoot.saveSystem).toBeDefined();
    expect(gameBoot.saveSystemDeps.runRules).toEqual({ id: 'run-rules' });
  });

  it('prefers canonical core gs for the game boot contract when legacy run deps are stale', () => {
    const canonicalGs = {
      currentScreen: 'title',
      player: { hp: 80 },
    };

    seedRefs({
      GAME: {
        getDeps: () => ({ token: 'legacy-deps' }),
        getRunDeps: () => ({ token: 'run-deps', gs: { currentScreen: 'title' } }),
        getCombatDeps: () => ({ token: 'combat-deps' }),
        getEventDeps: () => ({ token: 'event-deps' }),
        getHudDeps: () => ({ token: 'hud-deps' }),
        getUiDeps: () => ({ token: 'ui-deps' }),
        getCanvasDeps: () => ({ token: 'canvas-deps' }),
      },
      featureRefs: {
        core: {
          GS: canonicalGs,
        },
      },
    });

    const gameBoot = createDeps('gameBoot');

    expect(gameBoot.gs).toBe(canonicalGs);
  });

  it('prefers the canonical core save system for the game boot contract', () => {
    const staleSaveSystem = { id: 'stale-save' };
    const canonicalSaveSystem = { id: 'canonical-save' };

    seedRefs({
      SaveSystem: staleSaveSystem,
      featureRefs: {
        core: {
          SaveSystem: canonicalSaveSystem,
        },
      },
    });

    const gameBoot = createDeps('gameBoot');

    expect(gameBoot.saveSystem).toBe(canonicalSaveSystem);
  });

  it('builds feature contracts from feature-specific GAME dep getters', () => {
    const setBonusSystem = { id: 'set-bonus-system' };
    seedRefs({ SetBonusSystem: setBonusSystem });

    expect(createDeps('combatTurnBase').token).toBe('combat-deps');
    expect(createDeps('hudUpdate').token).toBe('hud-deps');
    expect(createDeps('event').token).toBe('event-deps');
    expect(createDeps('worldCanvas').token).toBe('canvas-deps');
    expect(createDeps('worldCanvas').setBonusSystem).toBe(setBonusSystem);
    expect(createDeps('runStart').token).toBe('run-deps');
    expect(createDeps('codex').token).toBe('ui-deps');
  });

  it('prefers explicit runtime ports over the raw legacy GAME root when provided', () => {
    seedRefs({
      GAME: {
        getDeps: () => ({ token: 'legacy-game-deps' }),
        getRunDeps: () => ({ token: 'legacy-run-deps' }),
        getCombatDeps: () => ({ token: 'legacy-combat-deps' }),
        getEventDeps: () => ({ token: 'legacy-event-deps' }),
        getHudDeps: () => ({ token: 'legacy-hud-deps' }),
        getUiDeps: () => ({ token: 'legacy-ui-deps' }),
        getCanvasDeps: () => ({ token: 'legacy-canvas-deps' }),
      },
      runtimePorts: {
        getGameDeps: () => ({ token: 'runtime-game-deps' }),
        getRuntimeDeps: () => ({ token: 'runtime-run-deps' }),
        getRunRuntimeDeps: () => ({ token: 'runtime-run-deps' }),
        getCombatRuntimeDeps: () => ({ token: 'runtime-combat-deps' }),
        getUiRuntimeDeps: () => ({ token: 'runtime-ui-deps' }),
        getFeatureDeps: (feature) => ({ token: `runtime-${feature}-deps` }),
      },
    });

    expect(createDeps('combatTurnBase').token).toBe('runtime-combat-deps');
    expect(createDeps('event').token).toBe('runtime-event-deps');
    expect(createDeps('hudUpdate').token).toBe('runtime-hud-deps');
    expect(createDeps('worldCanvas').token).toBe('runtime-canvas-deps');
    expect(createDeps('runStart').token).toBe('runtime-run-deps');
    expect(createDeps('codex').token).toBe('runtime-ui-deps');
  });

  it('prefers scoped core GAME refs over stale flat GAME aliases when runtime ports are absent', () => {
    seedRefs({
      GAME: {
        getDeps: () => ({ token: 'legacy-game-deps' }),
        getRunDeps: () => ({ token: 'legacy-run-deps' }),
        getCombatDeps: () => ({ token: 'legacy-combat-deps' }),
        getEventDeps: () => ({ token: 'legacy-event-deps' }),
        getHudDeps: () => ({ token: 'legacy-hud-deps' }),
        getUiDeps: () => ({ token: 'legacy-ui-deps' }),
        getCanvasDeps: () => ({ token: 'legacy-canvas-deps' }),
      },
      featureRefs: {
        core: {
          GAME: {
            getDeps: () => ({ token: 'scoped-game-deps' }),
            getRunDeps: () => ({ token: 'scoped-run-deps' }),
            getCombatDeps: () => ({ token: 'scoped-combat-deps' }),
            getEventDeps: () => ({ token: 'scoped-event-deps' }),
            getHudDeps: () => ({ token: 'scoped-hud-deps' }),
            getUiDeps: () => ({ token: 'scoped-ui-deps' }),
            getCanvasDeps: () => ({ token: 'scoped-canvas-deps' }),
          },
        },
      },
    });

    expect(createDeps('combatTurnBase').token).toBe('scoped-combat-deps');
    expect(createDeps('event').token).toBe('scoped-event-deps');
    expect(createDeps('hudUpdate').token).toBe('scoped-hud-deps');
    expect(createDeps('worldCanvas').token).toBe('scoped-canvas-deps');
    expect(createDeps('runStart').token).toBe('scoped-run-deps');
    expect(createDeps('codex').token).toBe('scoped-ui-deps');
  });

  it('uses patched refs without rebuilding the public contract list', () => {
    seedRefs({
      RunRules: { id: 'initial-rules' },
    });

    patchRefs({
      RunRules: { id: 'patched-rules' },
    });

    const deps = createDeps('runMode');

    expect(deps.runRules).toEqual({ id: 'patched-rules' });
    expect(new Set(listDepContracts())).toEqual(new Set(EXPECTED_CONTRACTS));
  });

  it('wires combat card-play contracts through scoped action refs when present', () => {
    const playCard = vi.fn();
    const renderCombatEnemies = vi.fn();

    seedRefs({
      GS: { playCard: vi.fn() },
      playCard,
      renderCombatEnemies,
      featureRefs: {
        combat: {
          playCard,
          renderCombatEnemies,
        },
      },
    });

    expect(createDeps('cardTarget').playCard).toBe(playCard);
    expect(createDeps('helpPause').playCard).toBe(playCard);
    expect(createDeps('baseCard').playCardHandler).toBe(playCard);
  });

  it('does not fall back to GS card-play methods for combat contracts', () => {
    const gsPlayCard = vi.fn();

    seedRefs({
      GS: { playCard: gsPlayCard },
    });

    expect(createDeps('baseCard').playCardHandler).toBeUndefined();
  });

  it('wires reward contracts through scoped reward and screen refs when present', () => {
    const showRewardScreen = vi.fn();
    const switchScreen = vi.fn();

    seedRefs({
      showRewardScreen,
      switchScreen,
      featureRefs: {
        reward: {
          showRewardScreen,
        },
        screen: {
          switchScreen,
        },
      },
    });

    const rewardDeps = createDeps('reward');
    const rewardFlow = createDeps('rewardFlow');

    rewardDeps.showRewardScreen('boss');
    rewardDeps.showGameplayScreen();
    rewardFlow.openReward('elite');
    rewardFlow.showGameplayScreen();

    expect(showRewardScreen).toHaveBeenCalledWith('boss');
    expect(showRewardScreen).toHaveBeenCalledWith('elite');
    expect(switchScreen).toHaveBeenCalledWith('game');
    expect(switchScreen).toHaveBeenCalledTimes(2);
  });
});
