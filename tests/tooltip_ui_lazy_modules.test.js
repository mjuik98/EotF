import { beforeEach, describe, expect, it, vi } from 'vitest';

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
  beforeEach(() => {
    hoisted.ensureCombatTooltipBrowserModules.mockClear();
    Object.values(hoisted.combatTooltipModules).forEach((value) => {
      if (typeof value?.mockClear === 'function') value.mockClear();
    });
  });

  it('can preload combat tooltip helpers before the first hover', async () => {
    await TooltipUI.preloadTooltipModules();

    expect(hoisted.ensureCombatTooltipBrowserModules).toHaveBeenCalledTimes(1);
  });

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

  it('binds focus and blur handlers in the shared attachment path', async () => {
    const listeners = new Map();
    const cardEl = {
      addEventListener: vi.fn((type, handler) => listeners.set(type, handler)),
      getAttribute: vi.fn(() => 'playCard("strike")'),
    };
    const tt = { classList: { add: vi.fn(), remove: vi.fn() } };
    const doc = {
      getElementById: vi.fn((id) => (id === 'cardTooltip' ? tt : null)),
      querySelectorAll: vi.fn(() => [cardEl]),
    };
    const deps = {
      doc,
      win: {},
      data: { cards: { strike: { id: 'strike', name: 'Strike' } } },
      gs: { player: {} },
    };
    const showSpy = vi.spyOn(TooltipUI, 'showTooltip').mockResolvedValue();
    const hideSpy = vi.spyOn(TooltipUI, 'hideTooltip').mockResolvedValue();

    TooltipUI.attachCardTooltips(deps);
    await listeners.get('focus')?.({ type: 'focus' });
    await listeners.get('blur')?.({ type: 'blur' });

    expect(cardEl.addEventListener).toHaveBeenCalledWith('focus', expect.any(Function));
    expect(cardEl.addEventListener).toHaveBeenCalledWith('blur', expect.any(Function));
    expect(showSpy).toHaveBeenCalledWith(expect.objectContaining({
      type: 'focus',
      currentTarget: cardEl,
      target: cardEl,
    }), 'strike', deps);
    expect(hideSpy).toHaveBeenCalledWith(deps);

    showSpy.mockRestore();
    hideSpy.mockRestore();
  });
});
