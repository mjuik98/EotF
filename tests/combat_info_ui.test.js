import { describe, expect, it, vi } from 'vitest';

const {
  resetCombatInfoStateSpy,
  toggleCombatInfoStateSpy,
  renderCombatInfoStatusesSpy,
  renderCombatInfoItemsSpy,
} = vi.hoisted(() => ({
  resetCombatInfoStateSpy: vi.fn(),
  toggleCombatInfoStateSpy: vi.fn(),
  renderCombatInfoStatusesSpy: vi.fn(),
  renderCombatInfoItemsSpy: vi.fn(),
}));

vi.mock('../game/features/combat/presentation/browser/combat_info_runtime_ui.js', () => ({
  resetCombatInfoState: resetCombatInfoStateSpy,
  toggleCombatInfoState: toggleCombatInfoStateSpy,
}));

vi.mock('../game/features/combat/presentation/browser/combat_info_status_ui.js', () => ({
  renderCombatInfoStatuses: renderCombatInfoStatusesSpy,
}));

vi.mock('../game/features/combat/presentation/browser/combat_info_items_ui.js', () => ({
  renderCombatInfoItems: renderCombatInfoItemsSpy,
}));

import { CombatInfoUI } from '../game/ui/combat/combat_info_ui.js';

function createDoc() {
  const elements = new Map();
  return {
    getElementById(id) {
      return elements.get(id) || null;
    },
    _register(id, element) {
      elements.set(id, element);
    },
  };
}

describe('combat_info_ui', () => {
  it('delegates reset and toggle to the runtime helper', () => {
    const deps = { gs: { player: {} } };

    CombatInfoUI.reset(deps);
    CombatInfoUI.toggle(deps);

    expect(resetCombatInfoStateSpy).toHaveBeenCalledWith(deps);
    expect(toggleCombatInfoStateSpy).toHaveBeenCalledTimes(1);
    expect(toggleCombatInfoStateSpy.mock.calls[0][0]).toBe(deps);
    expect(typeof toggleCombatInfoStateSpy.mock.calls[0][1].onOpen).toBe('function');
  });

  it('refreshes status and item sections when combat info roots exist', () => {
    const doc = createDoc();
    const statusEl = {};
    const itemEl = {};
    doc._register('combatStatusList', statusEl);
    doc._register('combatItemList', itemEl);

    const deps = {
      doc,
      gs: {
        player: {
          buffs: { shield: 3 },
          items: ['relic_a'],
        },
      },
      data: { items: { relic_a: { name: 'Relic' } } },
      statusKr: { shield: { name: 'Shield' } },
    };

    CombatInfoUI.refresh(deps);

    expect(renderCombatInfoStatusesSpy).toHaveBeenCalledWith({
      doc,
      statusEl,
      buffs: deps.gs.player.buffs,
      statusKr: deps.statusKr,
    });
    expect(renderCombatInfoItemsSpy).toHaveBeenCalledWith({
      doc,
      itemEl,
      items: deps.gs.player.items,
      data: deps.data,
    });
  });
});
