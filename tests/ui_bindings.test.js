import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../game/core/deps_factory.js', () => ({
  getCodexDeps: vi.fn(() => ({ token: 'codex-deps' })),
  getCombatHudDeps: vi.fn(() => ({ token: 'combat-hud-deps' })),
  getCombatInfoDeps: vi.fn(() => ({ token: 'combat-info-deps' })),
  getDeckModalDeps: vi.fn(() => ({ token: 'deck-modal-deps' })),
  getHudUpdateDeps: vi.fn(() => ({ token: 'hud-update-deps' })),
  getScreenDeps: vi.fn(() => ({ token: 'screen-deps' })),
  getTooltipDeps: vi.fn(() => ({ token: 'tooltip-deps' })),
}));

import * as Deps from '../game/core/deps_factory.js';
import { createUIBindings } from '../game/core/bindings/ui_bindings.js';

describe('createUIBindings', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('routes hud, codex, tooltip, and screen actions through feature ports', () => {
    const doc = {
      getElementById: vi.fn((id) => (id === 'statusEffects' ? { id } : null)),
    };
    const originalDocument = globalThis.document;
    globalThis.document = doc;

    const modules = {
      GS: { token: 'gs' },
      AudioEngine: { playClick: vi.fn() },
      HudUpdateUI: {
        updateUI: vi.fn(),
        doUpdateUI: vi.fn(),
        updateEndBtnWarn: vi.fn(),
      },
      StatusEffectsUI: { updateStatusDisplay: vi.fn() },
      TooltipUI: {
        showTooltip: vi.fn(),
        hideTooltip: vi.fn(),
        attachCardTooltips: vi.fn(),
        showItemTooltip: vi.fn(),
        hideItemTooltip: vi.fn(),
        showGeneralTooltip: vi.fn(),
        hideGeneralTooltip: vi.fn(),
      },
      CombatInfoUI: {
        reset: vi.fn(),
        toggle: vi.fn(),
        refresh: vi.fn(),
      },
      CombatHudUI: {
        updateChainUI: vi.fn(),
        updateNoiseWidget: vi.fn(),
        updateClassSpecialUI: vi.fn(),
      },
      DomValueUI: {
        setBar: vi.fn(),
        setText: vi.fn(),
      },
      DeckModalUI: {
        showDeckView: vi.fn(),
        renderDeckModal: vi.fn(),
        setDeckFilter: vi.fn(),
        closeDeckView: vi.fn(),
      },
      CodexUI: {
        openCodex: vi.fn(),
        setCodexTab: vi.fn(),
        renderCodexContent: vi.fn(),
        closeCodex: vi.fn(),
      },
      ScreenUI: { switchScreen: vi.fn() },
    };
    const fns = {};

    createUIBindings(modules, fns);

    fns.updateUI();
    fns.updateStatusDisplay();
    fns._resetCombatInfoPanel();
    fns.updateChainUI(3);
    fns.setBar('hp', 40);
    fns.showDeckView();
    fns.openCodex();
    fns.showTooltip({ type: 'mouseenter' }, 'strike');
    fns.switchScreen('game');

    expect(modules.HudUpdateUI.updateUI).toHaveBeenCalledWith({ token: 'hud-update-deps' });
    expect(modules.StatusEffectsUI.updateStatusDisplay).toHaveBeenCalledWith(expect.objectContaining({
      doc,
      gs: modules.GS,
      statusContainerId: 'statusEffects',
      tooltipUI: modules.TooltipUI,
    }));
    expect(modules.CombatInfoUI.reset).toHaveBeenCalledWith({ token: 'combat-info-deps' });
    expect(modules.CombatHudUI.updateChainUI).toHaveBeenCalledWith(3, { token: 'combat-hud-deps' });
    expect(modules.DomValueUI.setBar).toHaveBeenCalledWith('hp', 40, { doc });
    expect(modules.DeckModalUI.showDeckView).toHaveBeenCalledWith({ token: 'deck-modal-deps' });
    expect(modules.AudioEngine.playClick).toHaveBeenCalledTimes(1);
    expect(modules.CodexUI.openCodex).toHaveBeenCalledWith({ token: 'codex-deps' });
    expect(modules.TooltipUI.showTooltip).toHaveBeenCalledWith({ type: 'mouseenter' }, 'strike', { token: 'tooltip-deps' });
    expect(modules.ScreenUI.switchScreen).toHaveBeenCalledWith('game', { token: 'screen-deps' });
    expect(Deps.getHudUpdateDeps).toHaveBeenCalledTimes(1);
    expect(Deps.getCombatInfoDeps).toHaveBeenCalledTimes(1);
    expect(Deps.getCombatHudDeps).toHaveBeenCalledTimes(1);
    expect(Deps.getDeckModalDeps).toHaveBeenCalledTimes(1);
    expect(Deps.getCodexDeps).toHaveBeenCalledTimes(1);
    expect(Deps.getTooltipDeps).toHaveBeenCalledTimes(1);
    expect(Deps.getScreenDeps).toHaveBeenCalledTimes(1);

    globalThis.document = originalDocument;
  });
});
