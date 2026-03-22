import { describe, expect, it, vi } from 'vitest';
import { performCombatDrawCard } from '../game/ui/combat/combat_actions_runtime_ui.js';

describe('combat_actions_runtime_ui', () => {
  it('uses the injected executePlayerDraw command when runtime card helpers are unavailable', () => {
    const executePlayerDraw = vi.fn(() => true);
    const gs = {
      combat: { active: true, playerTurn: true },
      player: { energy: 2, hand: ['a'] },
      dispatch: vi.fn(),
    };

    expect(performCombatDrawCard(gs, { executePlayerDraw })).toBe(true);
    expect(executePlayerDraw).toHaveBeenCalledWith(gs);
    expect(gs.dispatch).not.toHaveBeenCalled();
  });

  it('spends energy and draws one card when draw is available', () => {
    const gs = {
      combat: { active: true, playerTurn: true },
      player: { energy: 2, hand: ['a'] },
      dispatch: vi.fn(),
      drawCards: vi.fn(),
    };

    expect(performCombatDrawCard(gs)).toBe(true);
    expect(gs.dispatch).toHaveBeenCalledWith(expect.any(String), { amount: -1 });
    expect(gs.drawCards).toHaveBeenCalledWith(1);
  });

  it('does nothing when draw is unavailable', () => {
    const gs = {
      combat: { active: true, playerTurn: false },
      player: { energy: 2, hand: ['a'] },
      dispatch: vi.fn(),
      drawCards: vi.fn(),
    };

    expect(performCombatDrawCard(gs)).toBe(false);
    expect(gs.dispatch).not.toHaveBeenCalled();
    expect(gs.drawCards).not.toHaveBeenCalled();
  });
});
