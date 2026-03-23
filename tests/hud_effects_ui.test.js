import { describe, expect, it, vi } from 'vitest';
import { resetCombatUIUI } from '../game/features/combat/public.js';

function createDoc() {
  const elements = {
    combatOverlay: { classList: { remove: vi.fn() } },
    noiseGaugeOverlay: { remove: vi.fn() },
    cardTooltip: { classList: { remove: vi.fn() } },
    combatHandCards: { textContent: 'cards' },
    enemyZone: { textContent: 'enemies' },
    combatLog: { innerHTML: 'logs' },
    recentCombatFeed: { innerHTML: 'recent feed' },
    combatRelicPanel: { dataset: { open: 'true' } },
    combatRelicRailSlots: { innerHTML: '<span>slot</span>' },
    combatRelicPanelList: { innerHTML: '<div>relic</div>' },
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
    expect(doc.getElementById('recentCombatFeed').innerHTML).toBe('');

    globalThis._resetCombatInfoPanel = prevReset;
  });

  it('resets relic panel state and clears relic rail content', () => {
    const doc = createDoc();

    resetCombatUIUI({ doc });

    expect(doc.getElementById('combatRelicPanel').dataset.open).toBe('false');
    expect(doc.getElementById('combatRelicRailSlots').innerHTML).toBe('');
    expect(doc.getElementById('combatRelicPanelList').innerHTML).toBe('');
  });
});
