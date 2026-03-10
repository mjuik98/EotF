import { describe, expect, it, vi } from 'vitest';

const {
  buildDeckModalEntriesSpy,
  renderDeckStatusBarSpy,
  renderDeckModalCardsSpy,
  applyDeckFilterButtonStylesSpy,
  closeDeckModalSpy,
  getDeckModalFilterSpy,
  openDeckModalSpy,
  resetDeckModalFilterSpy,
  setDeckModalFilterSpy,
} = vi.hoisted(() => ({
  buildDeckModalEntriesSpy: vi.fn(() => ({ deckCount: 2, handCount: 1, graveCount: 0, entries: [] })),
  renderDeckStatusBarSpy: vi.fn(),
  renderDeckModalCardsSpy: vi.fn(),
  applyDeckFilterButtonStylesSpy: vi.fn(),
  closeDeckModalSpy: vi.fn(),
  getDeckModalFilterSpy: vi.fn(() => 'all'),
  openDeckModalSpy: vi.fn(),
  resetDeckModalFilterSpy: vi.fn(),
  setDeckModalFilterSpy: vi.fn(),
}));

vi.mock('../game/ui/cards/deck_modal_render_ui.js', () => ({
  buildDeckModalEntries: buildDeckModalEntriesSpy,
  renderDeckStatusBar: renderDeckStatusBarSpy,
  renderDeckModalCards: renderDeckModalCardsSpy,
  applyDeckFilterButtonStyles: applyDeckFilterButtonStylesSpy,
}));

vi.mock('../game/ui/cards/deck_modal_runtime_ui.js', () => ({
  closeDeckModal: closeDeckModalSpy,
  getDeckModalFilter: getDeckModalFilterSpy,
  openDeckModal: openDeckModalSpy,
  resetDeckModalFilter: resetDeckModalFilterSpy,
  setDeckModalFilter: setDeckModalFilterSpy,
}));

import { DeckModalUI } from '../game/ui/cards/deck_modal_ui.js';

function createDoc() {
  const elements = new Map();
  return {
    getElementById(id) {
      return elements.get(id) || null;
    },
    register(id, element) {
      elements.set(id, element);
    },
  };
}

describe('deck_modal_ui', () => {
  it('delegates modal open/close and filter reset to runtime helpers', () => {
    DeckModalUI.resetFilter();
    DeckModalUI.showDeckView({ doc: createDoc(), gs: {}, data: {} });
    DeckModalUI.closeDeckView({ doc: createDoc() });

    expect(resetDeckModalFilterSpy).toHaveBeenCalled();
    expect(openDeckModalSpy).toHaveBeenCalled();
    expect(closeDeckModalSpy).toHaveBeenCalled();
  });

  it('renders modal content and reapplies filter state through helpers', () => {
    const doc = createDoc();
    doc.register('deckViewModal', {});
    doc.register('deckStatusBar', {});
    doc.register('deckModalCount', {});
    doc.register('deckModalCards', {});

    const deps = {
      doc,
      gs: {
        player: {
          deck: ['a', 'b'],
          hand: ['a'],
          graveyard: [],
        },
      },
      data: {
        cards: {
          a: { type: 'ATTACK' },
          b: { type: 'SKILL' },
        },
      },
    };

    DeckModalUI.renderDeckModal(deps);
    DeckModalUI.setDeckFilter('ATTACK', deps);

    expect(getDeckModalFilterSpy).toHaveBeenCalled();
    expect(buildDeckModalEntriesSpy).toHaveBeenCalledWith(deps.gs, deps.data, 'all');
    expect(renderDeckStatusBarSpy).toHaveBeenCalled();
    expect(renderDeckModalCardsSpy).toHaveBeenCalled();
    expect(setDeckModalFilterSpy).toHaveBeenCalledWith('ATTACK');
    expect(applyDeckFilterButtonStylesSpy).toHaveBeenCalledWith(doc, 'ATTACK');
  });
});
