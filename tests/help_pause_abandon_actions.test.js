import { describe, expect, it, vi } from 'vitest';

import { confirmHelpPauseAbandonRun } from '../game/features/title/application/help_pause_abandon_actions.js';

function createElement() {
  return {
    id: '',
    children: [],
    classList: {
      remove: vi.fn(),
    },
    remove() {},
  };
}

function createDoc() {
  const elements = {};
  return {
    getElementById: (id) => elements[id] || null,
    register(id, node) {
      node.id = id;
      elements[id] = node;
      return node;
    },
  };
}

describe('help_pause_abandon_actions', () => {
  it('cleans combat, finalizes defeat, clears save, and shows abandon outcome', () => {
    const doc = createDoc();
    doc.register('abandonConfirm', createElement());
    const combatOverlay = doc.register('combatOverlay', createElement());
    const deactivateCombat = vi.fn((gs) => {
      gs.combat.active = false;
    });
    const finalizeRunOutcome = vi.fn();
    const clearActiveRunSave = vi.fn();
    const showOutcome = vi.fn(() => false);
    const onClosePauseMenu = vi.fn();
    const deps = {
      doc,
      gs: {
        combat: { active: true },
      },
      finalizeRunOutcome,
      clearActiveRunSave,
      showAbandonOutcome: showOutcome,
    };

    const result = confirmHelpPauseAbandonRun({
      ...deps,
      deactivateCombat,
      hudUpdateUI: null,
      showAbandonOutcome: showOutcome,
    }, onClosePauseMenu);

    expect(result).toBe(false);
    expect(onClosePauseMenu).toHaveBeenCalledWith(doc);
    expect(deactivateCombat).toHaveBeenCalledWith(deps.gs);
    expect(deps.gs.combat.active).toBe(false);
    expect(combatOverlay.classList.remove).toHaveBeenCalledWith('active');
    expect(finalizeRunOutcome).toHaveBeenCalledWith('defeat', { echoFragments: 2, abandoned: true }, { gs: deps.gs });
    expect(clearActiveRunSave).toHaveBeenCalledTimes(1);
    expect(showOutcome).toHaveBeenCalledWith(expect.objectContaining({
      doc,
      gs: deps.gs,
    }));
  });
});
