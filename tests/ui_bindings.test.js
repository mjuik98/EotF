import { beforeEach, describe, expect, it, vi } from 'vitest';

vi.mock('../game/core/deps_factory.js', () => ({
  getCodexDeps: vi.fn(() => ({ token: 'codex-deps' })),
  getCombatHudDeps: vi.fn(() => ({ token: 'combat-hud-deps' })),
  getCombatInfoDeps: vi.fn(() => ({ token: 'combat-info-deps' })),
  getDeckModalDeps: vi.fn(() => ({ token: 'deck-modal-deps' })),
  getHudUpdateDeps: vi.fn(() => ({ token: 'hud-update-deps' })),
  getScreenDeps: vi.fn(() => ({ token: 'screen-deps' })),
  getTooltipDeps: vi.fn(() => ({ token: 'tooltip-deps' })),
  buildFeatureContractAccessors: vi.fn((contractMap, depsFactory) => Object.freeze(
    Object.fromEntries(
      Object.keys(contractMap).map((name) => [
        name,
        (overrides = {}) => ({
          ...(depsFactory?.[name]?.() || {}),
          ...overrides,
        }),
      ]),
    ),
  )),
}));

import * as Deps from '../game/core/deps_factory.js';
import { createUIBindings } from '../game/core/bindings/ui_bindings.js';

describe('createUIBindings', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('routes hud, codex, tooltip, and screen actions through feature ports', async () => {
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
    modules.featureScopes = {
      core: {
        GS: modules.GS,
        AudioEngine: modules.AudioEngine,
      },
      screen: {
        ScreenUI: modules.ScreenUI,
      },
    };
    const fns = {};

    createUIBindings(modules, fns);

    fns.updateUI();
    fns.updateStatusDisplay();
    fns._resetCombatInfoPanel();
    fns.updateChainUI(3);
    fns.setBar('hp', 40);
    fns.showDeckView();
    await fns.openCodex();
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
    expect(modules.DeckModalUI.showDeckView).toHaveBeenCalledWith(expect.objectContaining({
      token: 'deck-modal-deps',
      showTooltip: expect.any(Function),
      hideTooltip: expect.any(Function),
    }));
    expect(modules.AudioEngine.playClick).toHaveBeenCalledTimes(1);
    expect(modules.CodexUI.openCodex).toHaveBeenCalledWith({ token: 'codex-deps' });
    expect(modules.TooltipUI.showTooltip).toHaveBeenCalledWith({ type: 'mouseenter' }, 'strike', { token: 'tooltip-deps' });
    expect(modules.ScreenUI.switchScreen).toHaveBeenCalledWith('game', { token: 'screen-deps' });
    expect(Deps.getHudUpdateDeps).toHaveBeenCalledTimes(2);
    expect(Deps.getCombatInfoDeps).toHaveBeenCalledTimes(1);
    expect(Deps.getCombatHudDeps).toHaveBeenCalledTimes(1);
    expect(Deps.getDeckModalDeps).toHaveBeenCalledTimes(1);
    expect(Deps.getCodexDeps).toHaveBeenCalledTimes(1);
    expect(Deps.getTooltipDeps).toHaveBeenCalledTimes(1);
    expect(Deps.getScreenDeps).toHaveBeenCalledTimes(1);

    globalThis.document = originalDocument;
  });

  it('routes switchScreen through screen_service when gs dispatch is available', () => {
    const modules = {
      GS: {
        currentScreen: 'title',
        dispatch: vi.fn(),
      },
      AudioEngine: { playClick: vi.fn() },
      ScreenUI: { switchScreen: vi.fn() },
    };
    modules.featureScopes = {
      core: {
        GS: modules.GS,
        AudioEngine: modules.AudioEngine,
      },
      screen: {
        ScreenUI: modules.ScreenUI,
      },
    };
    const fns = {};

    createUIBindings(modules, fns);
    fns.switchScreen('game');

    expect(modules.GS.dispatch).toHaveBeenCalledTimes(1);
    expect(modules.ScreenUI.switchScreen).toHaveBeenCalledWith('game', {
      token: 'screen-deps',
      gs: modules.GS,
    });
  });

  it('prefers gs from hud deps over stale module aliases when updating status display', () => {
    const staleGs = { token: 'stale-gs' };
    const scopedGs = { token: 'scoped-gs' };
    Deps.getHudUpdateDeps.mockReturnValueOnce({
      token: 'hud-update-deps',
      gs: scopedGs,
    });

    const doc = {
      defaultView: {},
      getElementById: vi.fn((id) => (id === 'statusEffects' ? { id } : null)),
    };
    const originalDocument = globalThis.document;
    globalThis.document = doc;

    const modules = {
      GS: staleGs,
      AudioEngine: { playClick: vi.fn() },
      TooltipUI: {},
      StatusEffectsUI: { updateStatusDisplay: vi.fn() },
    };
    const fns = {};

    createUIBindings(modules, fns);
    fns.updateStatusDisplay();

    expect(modules.StatusEffectsUI.updateStatusDisplay).toHaveBeenCalledWith(expect.objectContaining({
      gs: scopedGs,
      statusContainerId: 'statusEffects',
    }));

    globalThis.document = originalDocument;
  });

  it('falls back to legacy compat gs before stale top-level aliases when hud deps omit gs', () => {
    const staleGs = { token: 'stale-gs' };
    const compatGs = { token: 'compat-gs' };
    Deps.getHudUpdateDeps.mockReturnValueOnce({
      token: 'hud-update-deps',
    });

    const doc = {
      defaultView: {},
      getElementById: vi.fn((id) => (id === 'statusEffects' ? { id } : null)),
    };
    const originalDocument = globalThis.document;
    globalThis.document = doc;

    const modules = {
      GS: staleGs,
      legacyModules: {
        GS: compatGs,
      },
      AudioEngine: { playClick: vi.fn() },
      TooltipUI: {},
      StatusEffectsUI: { updateStatusDisplay: vi.fn() },
    };
    const fns = {};

    createUIBindings(modules, fns);
    fns.updateStatusDisplay();

    expect(modules.StatusEffectsUI.updateStatusDisplay).toHaveBeenCalledWith(expect.objectContaining({
      gs: compatGs,
      statusContainerId: 'statusEffects',
    }));

    globalThis.document = originalDocument;
  });

  it('prefers scoped ui modules over stale top-level aliases for tooltip, codex, and audio actions', async () => {
    const staleAudioEngine = { playClick: vi.fn() };
    const scopedAudioEngine = { playClick: vi.fn() };
    const staleTooltipUI = {
      showTooltip: vi.fn(),
      hideTooltip: vi.fn(),
    };
    const scopedTooltipUI = {
      showTooltip: vi.fn(),
      hideTooltip: vi.fn(),
    };
    const staleCodexUI = { openCodex: vi.fn() };
    const scopedCodexUI = { openCodex: vi.fn() };
    const staleScreenUI = { switchScreen: vi.fn() };
    const scopedScreenUI = { switchScreen: vi.fn() };

    const modules = {
      GS: { currentScreen: 'title', dispatch: vi.fn() },
      AudioEngine: staleAudioEngine,
      TooltipUI: staleTooltipUI,
      CodexUI: staleCodexUI,
      ScreenUI: staleScreenUI,
      featureScopes: {
        core: {
          GS: { currentScreen: 'title', dispatch: vi.fn() },
          AudioEngine: scopedAudioEngine,
        },
        codex: {
          CodexUI: scopedCodexUI,
        },
        screen: {
          TooltipUI: scopedTooltipUI,
          ScreenUI: scopedScreenUI,
        },
      },
    };
    const fns = {};

    createUIBindings(modules, fns);

    fns.showTooltip({ type: 'mouseenter' }, 'strike');
    await fns.openCodex();
    fns.switchScreen('game');

    expect(scopedTooltipUI.showTooltip).toHaveBeenCalledWith(
      { type: 'mouseenter' },
      'strike',
      { token: 'tooltip-deps' },
    );
    expect(staleTooltipUI.showTooltip).not.toHaveBeenCalled();
    expect(scopedAudioEngine.playClick).toHaveBeenCalledTimes(1);
    expect(staleAudioEngine.playClick).not.toHaveBeenCalled();
    expect(scopedCodexUI.openCodex).toHaveBeenCalledWith({ token: 'codex-deps' });
    expect(staleCodexUI.openCodex).not.toHaveBeenCalled();
    expect(scopedScreenUI.switchScreen).toHaveBeenCalledWith('game', {
      token: 'screen-deps',
      gs: modules.featureScopes.core.GS,
    });
    expect(staleScreenUI.switchScreen).not.toHaveBeenCalled();
  });
});
