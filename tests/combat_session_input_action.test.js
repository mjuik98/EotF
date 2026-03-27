import { describe, expect, it, vi } from 'vitest';

import {
  cycleNextCombatTarget,
  handleCombatInputAction,
} from '../game/features/combat_session/ports/public_application_capabilities.js';

describe('combat_session_input_action', () => {
  it('cycles combat targets through alive enemies only', () => {
    const gs = {
      _selectedTarget: 0,
      combat: {
        enemies: [
          { name: 'A', hp: 12 },
          { name: 'B', hp: 0 },
          { name: 'C', hp: 8 },
        ],
      },
      addLog: vi.fn(),
    };
    const deps = { renderCombatEnemies: vi.fn() };

    expect(cycleNextCombatTarget(gs, deps)).toBe(true);
    expect(gs._selectedTarget).toBe(2);
    expect(gs.addLog).toHaveBeenCalledWith('🎯 대상: C', 'system');
    expect(deps.renderCombatEnemies).toHaveBeenCalledTimes(1);
  });

  it('handles combat-only actions once run-session policy allows them', () => {
    const drawCard = vi.fn();
    const preventDefault = vi.fn();

    const handled = handleCombatInputAction('drawCard', {
      deps: {
        drawCard,
        buttonFeedback: { triggerDrawButton: vi.fn() },
      },
      event: { preventDefault },
      runHotkeyState: { allowsCombatHotkeys: true },
    });

    expect(handled).toBe(true);
    expect(preventDefault).toHaveBeenCalledTimes(1);
    expect(drawCard).toHaveBeenCalledTimes(1);
  });
});
