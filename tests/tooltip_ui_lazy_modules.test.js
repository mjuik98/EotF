import { describe, expect, it, vi } from 'vitest';

const hoisted = vi.hoisted(() => ({
  combatTooltipModules: {
    extractTooltipCardId: vi.fn(() => 'strike'),
    hideGeneralTooltipUi: vi.fn(),
    hideItemTooltipUi: vi.fn(),
    positionCardTooltip: vi.fn(() => ({ x: 10, y: 20 })),
    renderCardTooltipContent: vi.fn(),
    showEnemyIntentTooltip: vi.fn(),
    showEnemyStatusTooltipOverlay: vi.fn(),
    showGeneralTooltipUi: vi.fn(),
    showItemTooltipUi: vi.fn(),
    syncCardKeywordTooltip: vi.fn(),
    hideEnemyIntentTooltip: vi.fn(),
    hideEnemyStatusTooltipOverlay: vi.fn(),
    StatusTooltipUI: { hide: vi.fn(), show: vi.fn() },
  },
  ensureCombatTooltipBrowserModules: vi.fn(async () => hoisted.combatTooltipModules),
}));

vi.mock('../game/features/combat/platform/browser/ensure_combat_tooltip_browser_modules.js', () => ({
  ensureCombatTooltipBrowserModules: hoisted.ensureCombatTooltipBrowserModules,
}));

import { TooltipUI } from '../game/features/combat/presentation/browser/tooltip_ui.js';

describe('TooltipUI lazy modules', () => {
  it('loads combat tooltip helpers on first use and reuses them', async () => {
    const tt = { classList: { add: vi.fn() } };
    const doc = {
      getElementById: vi.fn((id) => (id === 'cardTooltip' ? tt : null)),
    };
    const win = {};
    const deps = {
      doc,
      win,
      data: { cards: { strike: { id: 'strike', name: 'Strike' } } },
      gs: { player: {} },
    };

    await TooltipUI.showTooltip({ type: 'mouseenter' }, 'strike', deps);
    await TooltipUI.showItemTooltip({ type: 'mouseenter' }, 'void_crystal', deps);

    expect(hoisted.ensureCombatTooltipBrowserModules).toHaveBeenCalledTimes(2);
    expect(hoisted.combatTooltipModules.renderCardTooltipContent).toHaveBeenCalledWith(doc, deps.data.cards.strike, deps.gs, { cardId: 'strike' });
    expect(hoisted.combatTooltipModules.showItemTooltipUi).toHaveBeenCalledWith({ type: 'mouseenter' }, 'void_crystal', deps);
  });
});
