import { describe, expect, it, vi, afterEach } from 'vitest';

import { endPlayerTurnUseCase } from '../game/features/combat/public.js';
import * as endTurnService from '../game/features/combat/application/end_turn_service.js';

describe('end_player_turn_use_case', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('orchestrates enemy-turn handoff through injected UI callbacks', () => {
    vi.spyOn(endTurnService, 'endPlayerTurnService').mockReturnValue({
      result: { discarded: 2 },
      ui: {
        resetChain: true,
        cleanupTooltips: true,
        setEnemyTurn: true,
        enemyTurnDelayMs: 700,
      },
    });

    const resetChainUi = vi.fn();
    const cleanupTurnUi = vi.fn();
    const showEnemyTurnUi = vi.fn();
    const runEnemyTurn = vi.fn();
    const scheduleEnemyTurn = vi.fn();

    const result = endPlayerTurnUseCase({
      gs: { player: { class: 'guardian' } },
      data: {},
      canPlay: vi.fn(),
      classMechanics: {},
      resetChainUi,
      cleanupTurnUi,
      showEnemyTurnUi,
      runEnemyTurn,
      scheduleEnemyTurn,
    });

    expect(result).toEqual({ discarded: 2 });
    expect(resetChainUi).toHaveBeenCalledWith(0);
    expect(cleanupTurnUi).toHaveBeenCalledTimes(1);
    expect(showEnemyTurnUi).toHaveBeenCalledTimes(1);
    expect(scheduleEnemyTurn).toHaveBeenCalledWith(runEnemyTurn, 700);
  });

  it('returns null and skips UI work when the turn cannot end', () => {
    vi.spyOn(endTurnService, 'endPlayerTurnService').mockReturnValue(null);

    const resetChainUi = vi.fn();

    const result = endPlayerTurnUseCase({
      gs: {},
      resetChainUi,
    });

    expect(result).toBeNull();
    expect(resetChainUi).not.toHaveBeenCalled();
  });

  it('uses the injected timeout scheduler when no custom enemy-turn scheduler is provided', async () => {
    vi.spyOn(endTurnService, 'endPlayerTurnService').mockReturnValue({
      result: { discarded: 1 },
      ui: {
        resetChain: false,
        cleanupTooltips: false,
        setEnemyTurn: false,
        enemyTurnDelayMs: 450,
      },
    });

    const setTimeoutFn = vi.fn((callback, delayMs) => {
      callback();
      return delayMs;
    });
    const runEnemyTurn = vi.fn().mockResolvedValue(undefined);

    const result = endPlayerTurnUseCase({
      gs: { player: { class: 'guardian' } },
      runEnemyTurn,
      setTimeoutFn,
    });

    await Promise.resolve();

    expect(result).toEqual({ discarded: 1 });
    expect(setTimeoutFn).toHaveBeenCalledTimes(1);
    expect(setTimeoutFn).toHaveBeenCalledWith(expect.any(Function), 450);
    expect(runEnemyTurn).toHaveBeenCalledTimes(1);
  });
});
