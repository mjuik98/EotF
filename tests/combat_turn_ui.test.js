import { describe, expect, it, vi } from 'vitest';

import { CombatTurnUI } from '../game/ui/combat/combat_turn_ui.js';

describe('combat_turn_ui', () => {
  it('routes player status tick energy refresh through injected deps', () => {
    const updateCombatEnergy = vi.fn();
    const updateStatusDisplay = vi.fn();
    const updateUI = vi.fn();
    const gs = {
      player: { hp: 20 },
      combat: {},
    };

    const alive = CombatTurnUI.processPlayerStatusTicks({
      gs,
      shuffleArray: (items) => items,
      updateCombatEnergy,
      updateStatusDisplay,
      updateUI,
    });

    expect(alive).toBe(true);
    expect(updateCombatEnergy).toHaveBeenCalledWith(gs);
    expect(updateStatusDisplay).toHaveBeenCalledTimes(1);
    expect(updateUI).toHaveBeenCalledTimes(1);
  });
});
