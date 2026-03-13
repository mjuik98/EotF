import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ErrorCodes } from '../game/core/error_codes.js';
import {
  createDeps,
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
  const saveMeta = vi.fn();
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
    SaveSystem: { saveMeta },
    GS: { playCard: vi.fn() },
    ...overrides,
  };
  initDepsFactory(refs);
  return { refs, saveMeta };
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

  it('throws AppError with deps missing code for unknown contracts', () => {
    try {
      createDeps('missing-contract');
      throw new Error('expected createDeps to throw');
    } catch (err) {
      expect(err.code).toBe(ErrorCodes.DEPS_CONTRACT_MISSING);
    }
  });

  it('keeps nested run contracts wired via createDeps', () => {
    const { saveMeta } = seedRefs();

    const runMode = createDeps('runMode');
    runMode.saveMeta();
    expect(saveMeta).toHaveBeenCalledTimes(1);
    expect(saveMeta.mock.calls[0][0].runRules).toEqual({ id: 'run-rules' });

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

  it('builds feature contracts from feature-specific GAME dep getters', () => {
    seedRefs();

    expect(createDeps('combatTurnBase').token).toBe('combat-deps');
    expect(createDeps('hudUpdate').token).toBe('hud-deps');
    expect(createDeps('event').token).toBe('event-deps');
    expect(createDeps('worldCanvas').token).toBe('canvas-deps');
    expect(createDeps('runStart').token).toBe('run-deps');
    expect(createDeps('codex').token).toBe('ui-deps');
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
