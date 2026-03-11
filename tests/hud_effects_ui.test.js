import { describe, expect, it, vi } from 'vitest';
import { resetCombatUIUI } from '../game/ui/hud/hud_effects_ui.js';

function createDoc() {
  const elements = {
    combatOverlay: { classList: { remove: vi.fn() } },
    noiseGaugeOverlay: { remove: vi.fn() },
    cardTooltip: { classList: { remove: vi.fn() } },
    combatHandCards: { textContent: 'cards' },
    enemyZone: { textContent: 'enemies' },
    combatLog: { innerHTML: 'logs' },
  };

  return {
    getElementById(id) {
      return elements[id] || null;
    },
  };
}

describe('hud_effects_ui', () => {
  it('does not fall back to global resetCombatInfoPanel', () => {
    const prevReset = globalThis._resetCombatInfoPanel;
    globalThis._resetCombatInfoPanel = vi.fn();
    const doc = createDoc();

    resetCombatUIUI({ doc });

    expect(globalThis._resetCombatInfoPanel).not.toHaveBeenCalled();
    expect(doc.getElementById('combatOverlay').classList.remove).toHaveBeenCalledWith('active');
    expect(doc.getElementById('combatHandCards').textContent).toBe('');
    expect(doc.getElementById('enemyZone').textContent).toBe('');
    expect(doc.getElementById('combatLog').innerHTML).toBe('');

    globalThis._resetCombatInfoPanel = prevReset;
  });
});
