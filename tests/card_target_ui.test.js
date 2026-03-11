import { describe, expect, it, vi } from 'vitest';
import { CardTargetUI } from '../game/ui/cards/card_target_ui.js';

describe('card_target_ui', () => {
  it('rerenders enemies through injected deps when selecting a target', () => {
    const renderCombatEnemies = vi.fn();
    const gs = {
      _selectedTarget: null,
      addLog: vi.fn(),
      combat: {
        active: true,
        playerTurn: true,
        enemies: [{ hp: 10, name: 'Slime' }],
      },
    };

    CardTargetUI.selectTarget(0, { gs, renderCombatEnemies });

    expect(gs._selectedTarget).toBe(0);
    expect(gs.addLog).toHaveBeenCalledWith('🎯 Slime 타겟 지정', 'system');
    expect(renderCombatEnemies).toHaveBeenCalledTimes(1);
  });

  it('does not fall back to window combat rendering when no injected renderer exists', () => {
    const prevWindow = globalThis.window;
    globalThis.window = {
      CombatUI: {
        renderCombatEnemies: vi.fn(),
      },
      DATA: { cards: {} },
    };

    const gs = {
      _selectedTarget: null,
      addLog: vi.fn(),
      combat: {
        active: true,
        playerTurn: true,
        enemies: [{ hp: 10, name: 'Slime' }],
      },
    };

    CardTargetUI.selectTarget(0, { gs, data: { cards: {} } });

    expect(globalThis.window.CombatUI.renderCombatEnemies).not.toHaveBeenCalled();
    globalThis.window = prevWindow;
  });
});
