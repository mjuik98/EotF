import { describe, expect, it, vi, afterEach } from 'vitest';

import { runEnemyTurnUseCase } from '../game/features/combat/public.js';

describe('run_enemy_turn_use_case', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('delegates enemy turn orchestration through injected callbacks and starts the player turn', async () => {
    const gs = {
      combat: {
        active: true,
        turn: 3,
        enemies: [
          { name: 'Imp', hp: 12, statusEffects: {} },
        ],
      },
      player: {
        class: 'guardian',
        shield: 5,
        hp: 30,
        buffs: {},
        hand: [],
      },
    };
    const data = { id: 'data' };
    const tickEvents = [{ index: 0, type: 'poison', dmg: 5 }];
    const classMechanics = {
      guardian: {
        onTurnStart: vi.fn(),
      },
    };
    const processEnemyStatusTicksFn = vi.fn().mockReturnValue(tickEvents);
    const processEnemyStunFn = vi.fn().mockReturnValue(false);
    const getEnemyActionFn = vi.fn().mockReturnValue({ type: 'strike', dmg: 6, multi: 1 });
    const processEnemyAttackFn = vi.fn().mockReturnValue([{ hitIndex: 0, enemyDied: false }]);
    const handleEnemyEffectFn = vi.fn().mockReturnValue({ uiAction: 'updateUI' });
    const decayEnemyWeakenFn = vi.fn();
    const processPlayerStatusTicksFn = vi.fn().mockReturnValue({
      alive: true,
      actions: ['updateStatusDisplay', 'renderCombatCards'],
    });
    const startPlayerTurn = vi.fn();

    const cleanupTooltips = vi.fn();
    const playStatusTickEffects = vi.fn();
    const renderCombatEnemies = vi.fn();
    const waitForCombat = vi.fn().mockResolvedValue(true);
    const playEnemyAttackHit = vi.fn().mockResolvedValue(false);
    const dispatchUiAction = vi.fn();
    const syncCombatEnergy = vi.fn();
    const onTurnStart = vi.fn();
    const onPlayerTurnStarted = vi.fn();

    await runEnemyTurnUseCase({
      gs,
      data,
      classMechanics,
      cleanupTooltips,
      shouldAbortTurn: () => false,
      waitForCombat,
      playStatusTickEffects,
      renderCombatEnemies,
      showBossPhaseShift: vi.fn(),
      playEnemyAttackHit,
      dispatchUiAction,
      syncCombatEnergy,
      onTurnStart,
      onPlayerTurnStarted,
      processEnemyStatusTicksFn,
      processEnemyStunFn,
      getEnemyActionFn,
      processEnemyAttackFn,
      handleEnemyEffectFn,
      decayEnemyWeakenFn,
      processPlayerStatusTicksFn,
      startPlayerTurn,
    });

    expect(cleanupTooltips).toHaveBeenCalledTimes(1);
    expect(playStatusTickEffects).toHaveBeenCalledWith(tickEvents);
    expect(waitForCombat).toHaveBeenNthCalledWith(1, gs, 800);
    expect(waitForCombat).toHaveBeenNthCalledWith(2, gs, 600);
    expect(playEnemyAttackHit).toHaveBeenCalledWith(0, { hitIndex: 0, enemyDied: false }, { type: 'strike', dmg: 6, multi: 1 });
    expect(dispatchUiAction).toHaveBeenNthCalledWith(1, { uiAction: 'updateUI' });
    expect(dispatchUiAction).toHaveBeenNthCalledWith(2, { uiAction: 'updateStatusDisplay' });
    expect(dispatchUiAction).toHaveBeenNthCalledWith(3, { uiAction: 'renderCombatCards' });
    expect(syncCombatEnergy).toHaveBeenCalledTimes(1);
    expect(onTurnStart).toHaveBeenCalledWith(gs);
    expect(classMechanics.guardian.onTurnStart).toHaveBeenCalledWith(gs);
    expect(onPlayerTurnStarted).toHaveBeenCalledTimes(1);
    expect(startPlayerTurn).toHaveBeenCalledTimes(1);
    expect(gs.player._preservedShield).toBe(2);
    expect(renderCombatEnemies).toHaveBeenCalled();
  });
});
