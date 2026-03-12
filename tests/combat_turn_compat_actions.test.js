import { describe, expect, it, vi } from 'vitest';

import {
  handleBossPhaseShiftAction,
  handleEnemyEffectAction,
  processEnemyStatusTicksAction,
  processPlayerStatusTicksAction,
} from '../game/features/combat/app/combat_turn_compat_actions.js';

describe('combat_turn_compat_actions', () => {
  it('renders enemies after enemy status ticks', () => {
    const renderCombatEnemies = vi.fn();
    const tickEvents = [{ type: 'poison' }];

    const result = processEnemyStatusTicksAction({
      gs: { combat: { enemies: [] } },
      renderCombatEnemies,
      processEnemyStatusTicksFn: vi.fn().mockReturnValue(tickEvents),
    });

    expect(result).toEqual(tickEvents);
    expect(renderCombatEnemies).toHaveBeenCalledTimes(1);
  });

  it('syncs energy and UI after player status ticks', () => {
    const syncCombatEnergy = vi.fn();
    const updateStatusDisplay = vi.fn();
    const updateUI = vi.fn();

    const alive = processPlayerStatusTicksAction({
      gs: { combat: { active: true }, player: { buffs: {} } },
      syncCombatEnergy,
      updateStatusDisplay,
      updateUI,
      processPlayerStatusTicksFn: vi.fn().mockReturnValue({ alive: true, actions: [] }),
    });

    expect(alive).toBe(true);
    expect(syncCombatEnergy).toHaveBeenCalledTimes(1);
    expect(updateStatusDisplay).toHaveBeenCalledTimes(1);
    expect(updateUI).toHaveBeenCalledTimes(1);
  });

  it('delegates boss phase shift presentation', () => {
    const presentBossPhaseShift = vi.fn();
    const effect = { phase: 2, buffsPurged: true };

    const result = handleBossPhaseShiftAction({
      gs: { player: { buffs: {} } },
      enemy: { name: 'Boss' },
      index: 1,
      presentBossPhaseShift,
      handleBossPhaseShiftFn: vi.fn().mockReturnValue(effect),
    });

    expect(result).toEqual(effect);
    expect(presentBossPhaseShift).toHaveBeenCalledWith({ name: 'Boss' }, 1);
  });

  it('dispatches UI actions returned from enemy effects', () => {
    const dispatchUiAction = vi.fn();
    const result = { uiAction: 'updateUI' };

    expect(handleEnemyEffectAction({
      gs: { currentRegion: 2 },
      data: { id: 'data' },
      effect: 'gain_block',
      enemy: { name: 'Imp' },
      dispatchUiAction,
      getCombatRegionId: vi.fn().mockReturnValue(7),
      handleEnemyEffectFn: vi.fn().mockReturnValue(result),
    })).toEqual(result);

    expect(dispatchUiAction).toHaveBeenCalledWith(result);
  });
});
