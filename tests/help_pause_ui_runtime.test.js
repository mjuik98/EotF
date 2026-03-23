import { beforeEach, describe, expect, it, vi } from 'vitest';
import { SettingsManager } from '../game/core/settings_manager.js';
import {
  handleGlobalHotkey,
  saveRunBeforeReturn,
} from '../game/features/ui/public.js';

function createModalElement({ active = true } = {}) {
  return {
    hidden: false,
    style: {},
    classList: {
      contains: (name) => active && name === 'active',
    },
    remove: vi.fn(),
  };
}

function createDoc(elements = {}) {
  return {
    querySelector: () => null,
    getElementById: (id) => elements[id] || null,
    defaultView: {
      getComputedStyle: (el) => ({
        display: el?.style?.display || 'block',
        visibility: 'visible',
        opacity: el?.classList?.contains?.('active') ? '1' : '0',
        pointerEvents: el?.classList?.contains?.('active') ? 'auto' : 'none',
      }),
    },
  };
}

function createKeyEvent(overrides = {}) {
  return {
    key: '',
    code: '',
    repeat: false,
    preventDefault: vi.fn(),
    stopPropagation: vi.fn(),
    stopImmediatePropagation: vi.fn(),
    ...overrides,
  };
}

describe('help_pause_ui_runtime', () => {
  beforeEach(() => {
    Object.defineProperty(globalThis, 'localStorage', {
      value: {
        getItem: vi.fn(() => null),
        setItem: vi.fn(),
        removeItem: vi.fn(),
        clear: vi.fn(),
      },
      configurable: true,
      writable: true,
    });
    SettingsManager._data = null;
    SettingsManager.resetToDefaults();
  });

  it('consumes Escape and closes the pause menu before other handlers', () => {
    const pauseMenu = createModalElement();
    const doc = createDoc({ pauseMenu });
    const ui = {
      togglePause: vi.fn(),
      toggleHelp: vi.fn(),
      isHelpOpen: vi.fn(() => false),
    };
    const event = createKeyEvent({ key: 'Escape', code: 'Escape' });

    handleGlobalHotkey(event, {
      doc,
      ui,
      deps: {
        gs: { currentScreen: 'game', combat: { active: false } },
      },
    });

    expect(ui.togglePause).toHaveBeenCalledTimes(1);
    expect(ui.toggleHelp).not.toHaveBeenCalled();
    expect(event.preventDefault).toHaveBeenCalledTimes(1);
    expect(event.stopPropagation).toHaveBeenCalledTimes(1);
    expect(event.stopImmediatePropagation).toHaveBeenCalledTimes(1);
  });

  it('cycles to the next alive target on Tab and re-renders combat enemies', () => {
    const gs = {
      currentScreen: 'combat',
      _selectedTarget: 0,
      combat: {
        active: true,
        playerTurn: true,
        enemies: [
          { name: 'A', hp: 12 },
          { name: 'B', hp: 0 },
          { name: 'C', hp: 8 },
        ],
      },
      addLog: vi.fn(),
    };
    const renderCombatEnemies = vi.fn();
    const event = createKeyEvent({ key: 'Tab', code: 'Tab' });

    handleGlobalHotkey(event, {
      doc: createDoc(),
      ui: {
        togglePause: vi.fn(),
        toggleHelp: vi.fn(),
        isHelpOpen: () => false,
      },
      deps: {
        gs,
        renderCombatEnemies,
      },
    });

    expect(gs._selectedTarget).toBe(2);
    expect(gs.addLog).toHaveBeenCalledWith('🎯 대상: C', 'system');
    expect(renderCombatEnemies).toHaveBeenCalledTimes(1);
    expect(event.preventDefault).toHaveBeenCalledTimes(1);
  });

  it('does not open deck view while the full-map overlay is visible', () => {
    SettingsManager.set('keybindings.deckView', 'Tab');

    const showDeckView = vi.fn();
    const event = createKeyEvent({ key: 'Tab', code: 'Tab' });

    handleGlobalHotkey(event, {
      doc: createDoc({
        fullMapOverlay: createModalElement(),
      }),
      ui: {
        togglePause: vi.fn(),
        toggleHelp: vi.fn(),
        isHelpOpen: () => false,
      },
      deps: {
        gs: { currentScreen: 'game', combat: { active: false } },
        showDeckView,
      },
    });

    expect(showDeckView).not.toHaveBeenCalled();
    expect(event.preventDefault).not.toHaveBeenCalled();
  });

  it('does not open deck view while the codex modal is visible', () => {
    SettingsManager.set('keybindings.deckView', 'Tab');

    const showDeckView = vi.fn();
    const event = createKeyEvent({ key: 'Tab', code: 'Tab' });

    handleGlobalHotkey(event, {
      doc: createDoc({
        codexModal: createModalElement(),
      }),
      ui: {
        togglePause: vi.fn(),
        toggleHelp: vi.fn(),
        isHelpOpen: () => false,
      },
      deps: {
        gs: { currentScreen: 'game', combat: { active: false } },
        showDeckView,
      },
    });

    expect(showDeckView).not.toHaveBeenCalled();
    expect(event.preventDefault).not.toHaveBeenCalled();
  });

  it('does not open deck view while the settings modal is visible', () => {
    SettingsManager.set('keybindings.deckView', 'Tab');

    const showDeckView = vi.fn();
    const event = createKeyEvent({ key: 'Tab', code: 'Tab' });

    handleGlobalHotkey(event, {
      doc: createDoc({
        settingsModal: createModalElement(),
      }),
      ui: {
        togglePause: vi.fn(),
        toggleHelp: vi.fn(),
        isHelpOpen: () => false,
      },
      deps: {
        gs: { currentScreen: 'game', combat: { active: false } },
        showDeckView,
      },
    });

    expect(showDeckView).not.toHaveBeenCalled();
    expect(event.preventDefault).not.toHaveBeenCalled();
  });

  it('does not open the codex while the settings modal is visible', () => {
    const openCodex = vi.fn();
    const event = createKeyEvent({ key: 'c', code: 'KeyC' });

    handleGlobalHotkey(event, {
      doc: createDoc({
        settingsModal: createModalElement(),
      }),
      ui: {
        togglePause: vi.fn(),
        toggleHelp: vi.fn(),
        isHelpOpen: () => false,
      },
      deps: {
        gs: { currentScreen: 'game', combat: { active: false } },
        openCodex,
      },
    });

    expect(openCodex).not.toHaveBeenCalled();
    expect(event.preventDefault).not.toHaveBeenCalled();
  });

  it('does not open help while the codex modal is visible', () => {
    const toggleHelp = vi.fn();
    const event = createKeyEvent({ key: '?', code: 'Slash' });

    handleGlobalHotkey(event, {
      doc: createDoc({
        codexModal: createModalElement(),
      }),
      ui: {
        togglePause: vi.fn(),
        toggleHelp,
        isHelpOpen: () => false,
      },
      deps: {
        gs: { currentScreen: 'game', combat: { active: false } },
      },
    });

    expect(toggleHelp).not.toHaveBeenCalled();
    expect(event.preventDefault).not.toHaveBeenCalled();
  });

  it('closes help when the help hotkey is pressed while help is visible', () => {
    const toggleHelp = vi.fn();
    const event = createKeyEvent({ key: '?', code: 'Slash' });

    handleGlobalHotkey(event, {
      doc: createDoc({
        helpMenu: {
          style: { display: 'block' },
          classList: { contains: () => false },
        },
      }),
      ui: {
        togglePause: vi.fn(),
        toggleHelp,
        isHelpOpen: () => true,
      },
      deps: {
        gs: { currentScreen: 'game', combat: { active: false } },
      },
    });

    expect(toggleHelp).toHaveBeenCalledTimes(1);
    expect(event.preventDefault).toHaveBeenCalledTimes(1);
  });

  it('blocks combat hotkeys while the deck view is visible', () => {
    const gs = {
      currentScreen: 'combat',
      _selectedTarget: 0,
      player: { hand: ['strike'] },
      combat: {
        active: true,
        playerTurn: true,
        enemies: [
          { name: 'A', hp: 12 },
          { name: 'B', hp: 8 },
        ],
      },
      addLog: vi.fn(),
    };
    const drawCard = vi.fn();
    const playCard = vi.fn();
    const renderCombatEnemies = vi.fn();

    handleGlobalHotkey(createKeyEvent({ key: 'q', code: 'KeyQ' }), {
      doc: createDoc({
        deckViewModal: createModalElement(),
      }),
      ui: {
        togglePause: vi.fn(),
        toggleHelp: vi.fn(),
        isHelpOpen: () => false,
      },
      deps: {
        gs,
        drawCard,
        playCard,
        renderCombatEnemies,
      },
    });

    handleGlobalHotkey(createKeyEvent({ key: '1', code: 'Digit1' }), {
      doc: createDoc({
        deckViewModal: createModalElement(),
      }),
      ui: {
        togglePause: vi.fn(),
        toggleHelp: vi.fn(),
        isHelpOpen: () => false,
      },
      deps: {
        gs,
        drawCard,
        playCard,
        renderCombatEnemies,
      },
    });

    handleGlobalHotkey(createKeyEvent({ key: 'Tab', code: 'Tab' }), {
      doc: createDoc({
        deckViewModal: createModalElement(),
      }),
      ui: {
        togglePause: vi.fn(),
        toggleHelp: vi.fn(),
        isHelpOpen: () => false,
      },
      deps: {
        gs,
        drawCard,
        playCard,
        renderCombatEnemies,
      },
    });

    expect(drawCard).not.toHaveBeenCalled();
    expect(playCard).not.toHaveBeenCalled();
    expect(gs._selectedTarget).toBe(0);
    expect(renderCombatEnemies).not.toHaveBeenCalled();
  });

  it('uses injected saveRun when returning to title', () => {
    const saveRun = vi.fn();

    saveRunBeforeReturn({
      gs: { currentScreen: 'game' },
      saveRun,
    });

    expect(saveRun).toHaveBeenCalledWith({
      gs: { currentScreen: 'game' },
    });
  });

  it('prefers injected playCard actions for numeric combat hotkeys', () => {
    const gs = {
      currentScreen: 'combat',
      player: { hand: ['strike'] },
      playCard: vi.fn(),
      combat: {
        active: true,
        playerTurn: true,
        enemies: [{ name: 'A', hp: 12 }],
      },
    };
    const playCard = vi.fn();
    const event = createKeyEvent({ key: '1', code: 'Digit1' });

    handleGlobalHotkey(event, {
      doc: createDoc(),
      ui: {
        togglePause: vi.fn(),
        toggleHelp: vi.fn(),
        isHelpOpen: () => false,
      },
      deps: {
        gs,
        playCard,
      },
    });

    expect(playCard).toHaveBeenCalledWith('strike', 0);
    expect(gs.playCard).not.toHaveBeenCalled();
  });

  it('does not fall back to gs.playCard for numeric combat hotkeys', () => {
    const gs = {
      currentScreen: 'combat',
      player: { hand: ['strike'] },
      playCard: vi.fn(),
      combat: {
        active: true,
        playerTurn: true,
        enemies: [{ name: 'A', hp: 12 }],
      },
    };
    const event = createKeyEvent({ key: '1', code: 'Digit1' });

    handleGlobalHotkey(event, {
      doc: createDoc(),
      ui: {
        togglePause: vi.fn(),
        toggleHelp: vi.fn(),
        isHelpOpen: () => false,
      },
      deps: { gs },
    });

    expect(gs.playCard).not.toHaveBeenCalled();
  });
});
