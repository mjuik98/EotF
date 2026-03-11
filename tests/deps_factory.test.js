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
  'metaProgression',
  'regionTransition',
  'gameBoot',
];

function seedRefs(overrides = {}) {
  const saveMeta = vi.fn();
  const enterRun = vi.fn();
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
    RunStartUI: { enterRun },
    GS: { playCard: vi.fn() },
    ...overrides,
  };
  initDepsFactory(refs);
  return { refs, saveMeta, enterRun };
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
    const { saveMeta, enterRun } = seedRefs();

    const runMode = createDeps('runMode');
    runMode.saveMeta();
    expect(saveMeta).toHaveBeenCalledTimes(1);
    expect(saveMeta.mock.calls[0][0].runRules).toEqual({ id: 'run-rules' });

    const runSetup = createDeps('runSetup');
    runSetup.enterRun();
    expect(enterRun).toHaveBeenCalledTimes(1);
    expect(typeof enterRun.mock.calls[0][0].requestAnimationFrame).toBe('function');

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
    expect(listDepContracts()).toEqual(EXPECTED_CONTRACTS);
  });
});
