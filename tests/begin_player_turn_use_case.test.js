import { afterEach, describe, expect, it, vi } from 'vitest';

import { beginPlayerTurnUseCase } from '../game/features/combat/public.js';

describe('begin_player_turn_use_case', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('starts the player turn and triggers combat start-of-turn hooks in order', () => {
    const onTurnStart = vi.fn();
    const syncCombatEnergy = vi.fn();
    const beforeStartPlayerTurn = vi.fn();
    const presentPlayerTurnReady = vi.fn();
    const preserveGuardianShield = vi.fn((state) => {
      state.player._preservedShield = 3;
    });
    const startPlayerTurn = vi.fn();
    const classMechanics = {
      guardian: {
        onTurnStart: vi.fn(),
      },
    };
    const gs = {
      combat: { active: true },
      player: { class: 'guardian', shield: 6 },
    };

    const started = beginPlayerTurnUseCase({
      gs,
      classMechanics,
      preserveGuardianShield,
      beforeStartPlayerTurn,
      startPlayerTurn,
      syncCombatEnergy,
      onTurnStart,
      presentPlayerTurnReady,
    });

    expect(started).toBe(true);
    expect(gs.player._preservedShield).toBe(3);
    expect(preserveGuardianShield).toHaveBeenCalledWith(gs);
    expect(beforeStartPlayerTurn).toHaveBeenCalledTimes(1);
    expect(startPlayerTurn).toHaveBeenCalledWith(gs);
    expect(syncCombatEnergy).toHaveBeenCalledTimes(1);
    expect(onTurnStart).toHaveBeenCalledWith(gs);
    expect(classMechanics.guardian.onTurnStart).toHaveBeenCalledWith(gs);
    expect(presentPlayerTurnReady).toHaveBeenCalledTimes(1);
  });

  it('does nothing when combat is already inactive', () => {
    const started = beginPlayerTurnUseCase({
      gs: { combat: { active: false } },
      presentPlayerTurnReady: vi.fn(),
    });

    expect(started).toBe(false);
  });
});
