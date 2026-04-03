import { describe, expect, it, vi } from 'vitest';

import { confirmHelpPauseAbandonRun } from '../game/features/title/application/help_pause_abandon_actions.js';
import { cleanupCombatAfterAbandon } from '../game/features/combat/application/help_pause_abandon_combat_actions.js';

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

  it('publishes combat_end and clears combat-only item state on the live abandon cleanup path', () => {
    const doc = createDoc();
    doc.register('abandonConfirm', createElement());
    const combatOverlay = doc.register('combatOverlay', createElement());
    const gs = {
      combat: {
        active: true,
        playerTurn: true,
        enemies: [],
      },
      player: {
        maxEnergy: 4,
        energy: 0,
        hand: ['guard'],
        graveyard: [],
        exhausted: [],
        drawPile: ['strike'],
        discardPile: ['defend'],
      },
      _itemRuntime: {
        paradox_contract: { active: true, baseMax: 3 },
        crystal_ball: { discounted: new Set(['strike', 'defend']) },
        ancient_scroll: { tempCardId: 'tmp_card' },
      },
      triggerItems(trigger, data) {
        if (trigger === 'combat_end') {
          expect(this._itemRuntime.paradox_contract.active).toBe(true);
          expect(data).toEqual({
            isBoss: false,
            victory: false,
            defeated: true,
            abandoned: true,
          });
          this.player.maxEnergy = 3;
        }
        return data;
      },
    };

    confirmHelpPauseAbandonRun({
      doc,
      gs,
      cleanupCombatAfterAbandon,
      finalizeRunOutcome: vi.fn(),
      clearActiveRunSave: vi.fn(),
      showAbandonOutcome: vi.fn(() => false),
    }, vi.fn());

    expect(gs.combat.active).toBe(false);
    expect(gs.player.maxEnergy).toBe(3);
    expect(gs.player.hand).toEqual([]);
    expect(gs.player.drawPile).toEqual([]);
    expect(gs._itemRuntime).toEqual({});
    expect(combatOverlay.classList.remove).toHaveBeenCalledWith('active');
  });
});
