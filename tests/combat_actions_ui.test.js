import { describe, expect, it, vi } from 'vitest';
import { CombatActionsUI } from '../game/features/combat/presentation/browser/combat_actions_ui.js';

describe('CombatActionsUI', () => {
  it('passes injected combat deps through to the runtime draw helper', () => {
    const executePlayerDraw = vi.fn(() => true);
    const gs = {
      combat: { active: true, playerTurn: true },
      player: { energy: 2, hand: ['a'] },
    };

    expect(CombatActionsUI.drawCard({ gs, executePlayerDraw })).toBe(true);
    expect(executePlayerDraw).toHaveBeenCalledWith(gs);
  });
});
