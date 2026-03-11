import { describe, expect, it, vi } from 'vitest';
import { createUiActions } from '../game/features/ui/app/ui_actions.js';

describe('createUiActions deck modal deps', () => {
  it('injects tooltip and description ports into deck modal actions', () => {
    const modules = {
      DescriptionUtils: { highlight: vi.fn((text) => text) },
      TooltipUI: {
        showTooltip: vi.fn(),
        hideTooltip: vi.fn(),
      },
      DeckModalUI: {
        showDeckView: vi.fn(),
        renderDeckModal: vi.fn(),
        setDeckFilter: vi.fn(),
      },
    };
    const fns = {};
    const deckModalDeps = { doc: { id: 'doc' }, gs: { id: 'gs' }, data: { cards: {} } };
    const tooltipDeps = { token: 'tooltip' };
    const ports = {
      getDeckModalDeps: () => deckModalDeps,
      getTooltipDeps: () => tooltipDeps,
    };

    const actions = createUiActions(modules, fns, ports);
    actions.showDeckView();
    actions._renderDeckModal();
    actions.setDeckFilter('ATTACK');

    expect(modules.DeckModalUI.showDeckView).toHaveBeenCalledWith(expect.objectContaining({
      ...deckModalDeps,
      DescriptionUtils: modules.DescriptionUtils,
      descriptionUtils: modules.DescriptionUtils,
      showTooltip: expect.any(Function),
      hideTooltip: expect.any(Function),
    }));
    expect(modules.DeckModalUI.renderDeckModal).toHaveBeenCalledWith(expect.objectContaining({
      ...deckModalDeps,
      DescriptionUtils: modules.DescriptionUtils,
      descriptionUtils: modules.DescriptionUtils,
    }));
    expect(modules.DeckModalUI.setDeckFilter).toHaveBeenCalledWith('ATTACK', expect.objectContaining({
      ...deckModalDeps,
      DescriptionUtils: modules.DescriptionUtils,
      descriptionUtils: modules.DescriptionUtils,
    }));

    const showTooltip = modules.DeckModalUI.showDeckView.mock.calls[0][0].showTooltip;
    const hideTooltip = modules.DeckModalUI.showDeckView.mock.calls[0][0].hideTooltip;
    showTooltip({ type: 'mouseenter' }, 'strike');
    hideTooltip();

    expect(modules.TooltipUI.showTooltip).toHaveBeenCalledWith({ type: 'mouseenter' }, 'strike', tooltipDeps);
    expect(modules.TooltipUI.hideTooltip).toHaveBeenCalledWith(tooltipDeps);
  });
});
