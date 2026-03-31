import { describe, expect, it, vi } from 'vitest';

import { createTitleSystemActions } from '../game/features/title/platform/browser/create_title_system_actions.js';
import { registerTitleBindings } from '../game/features/title/ui/title_bindings.js';
import { registerEscapeSurface } from '../game/shared/runtime/overlay_escape_support.js';

function createElement() {
  return {
    addEventListener: vi.fn(),
    style: {},
  };
}

function getBoundHandler(element, eventName = 'click') {
  const entry = element.addEventListener.mock.calls.find(([name]) => name === eventName);
  return entry?.[1];
}

function getDocumentHandler(doc, eventName) {
  const entry = doc.addEventListener.mock.calls.find(([name]) => name === eventName);
  return entry?.[1];
}

function registerVisibleTitleSurface(doc, key, close = vi.fn()) {
  return registerEscapeSurface(doc, key, {
    close,
    hotkeyKey: key,
    isVisible: () => true,
    priority: 400,
    scopes: ['title'],
  });
}

describe('registerTitleBindings', () => {
  it('routes title quit requests through the shared help-pause quit confirmation when available', async () => {
    const confirmQuitGame = vi.fn();
    const playClick = vi.fn();
    const win = { close: vi.fn() };

    const actions = createTitleSystemActions({
      modules: {
        HelpPauseUI: {
          confirmQuitGame,
        },
      },
      playClick,
      ports: {
        getHelpPauseDeps: () => ({ doc: { marker: 'doc' } }),
        getMetaProgressionDeps: () => ({}),
      },
      win,
    });

    await actions.quitGame();

    expect(playClick).toHaveBeenCalledTimes(1);
    expect(confirmQuitGame).toHaveBeenCalledWith(expect.objectContaining({
      doc: { marker: 'doc' },
      win,
    }));
  });

  it('routes title controls through injected actions', () => {
    const elements = {
      mainContinueBtn: createElement(),
      mainStartBtn: createElement(),
      mainRunRulesBtn: createElement(),
      mainCodexBtn: createElement(),
      mainSettingsBtn: createElement(),
      mainQuitBtn: createElement(),
      startBtn: createElement(),
      backToTitleBtn: createElement(),
      runSettingsCloseBtn: createElement(),
      runSettingsConfirmBtn: createElement(),
      endlessToggleBtn: createElement(),
      curseCycleBtn: createElement(),
      toggleInscriptionLayoutBtn: createElement(),
      toggleAllInscriptionsBtn: createElement(),
      codexModal: { classList: { contains: vi.fn(() => true) }, style: {} },
      runSettingsModal: { classList: { contains: vi.fn(() => false) }, style: { display: 'none' } },
      settingsModal: { classList: { contains: vi.fn(() => false) }, style: { display: 'none' } },
      charSelectSubScreen: { style: { display: 'none' } },
    };
    const stepperLeft = createElement();
    const stepperRight = createElement();
    const doc = {
      addEventListener: vi.fn(),
      getElementById: vi.fn((id) => elements[id] || null),
      querySelectorAll: vi.fn((selector) => {
        if (selector === '.run-mode-stepper .run-mode-btn') return [stepperLeft, stepperRight];
        return [];
      }),
    };
    const actions = {
      backToTitle: vi.fn(),
      closeCodex: vi.fn(),
      closeRunSettings: vi.fn(),
      closeSettings: vi.fn(),
      continueRun: vi.fn(),
      cycleRunCurse: vi.fn(),
      openCodexFromTitle: vi.fn(),
      openRunSettings: vi.fn(),
      openSettings: vi.fn(),
      quitGame: vi.fn(),
      selectClass: vi.fn(),
      shiftAscension: vi.fn(),
      showCharacterSelect: vi.fn(),
      startGame: vi.fn(),
      toggleEndlessMode: vi.fn(),
    };
    const audio = { playEvent: vi.fn(), playClick: vi.fn() };

    registerTitleBindings({
      actions,
      audio,
      doc,
      getIsTitleScreen: () => true,
      isVisibleModal: (element) => element?.classList?.contains?.('active') || false,
    });

    getBoundHandler(elements.mainStartBtn)?.();
    getBoundHandler(elements.mainContinueBtn)?.();
    getBoundHandler(elements.mainRunRulesBtn)?.();
    getBoundHandler(elements.mainCodexBtn)?.();
    getBoundHandler(elements.mainSettingsBtn)?.();
    getBoundHandler(elements.mainQuitBtn)?.();
    getBoundHandler(elements.startBtn)?.();
    getBoundHandler(elements.runSettingsCloseBtn)?.();
    getBoundHandler(elements.endlessToggleBtn)?.();
    getBoundHandler(stepperLeft)?.();
    getBoundHandler(stepperRight)?.();

    expect(actions.showCharacterSelect).toHaveBeenCalledTimes(1);
    expect(actions.continueRun).toHaveBeenCalledTimes(1);
    expect(actions.openRunSettings).toHaveBeenCalledTimes(1);
    expect(actions.openCodexFromTitle).toHaveBeenCalledTimes(1);
    expect(actions.openSettings).toHaveBeenCalledTimes(1);
    expect(actions.quitGame).toHaveBeenCalledTimes(1);
    expect(actions.startGame).toHaveBeenCalledTimes(1);
    expect(actions.closeRunSettings).toHaveBeenCalledTimes(1);
    expect(actions.toggleEndlessMode).toHaveBeenCalledTimes(1);
    expect(actions.shiftAscension).toHaveBeenNthCalledWith(1, -1);
    expect(actions.shiftAscension).toHaveBeenNthCalledWith(2, 1);
    expect(audio.playEvent).toHaveBeenCalled();
    expect(audio.playClick).not.toHaveBeenCalled();

    const onKeyDown = getDocumentHandler(doc, 'keydown');
    onKeyDown({ key: 'Escape' });
    expect(actions.closeCodex).toHaveBeenCalledTimes(1);

    const onDocClick = getDocumentHandler(doc, 'click');
    onDocClick({ target: { closest: vi.fn((selector) => (selector === '#backToTitleBtn' ? {} : null)) } });
    onDocClick({ target: { closest: vi.fn((selector) => (selector === '.class-btn' ? { dataset: { class: 'mage' } } : null)) } });

    expect(actions.backToTitle).toHaveBeenCalledTimes(1);
    expect(actions.selectClass).toHaveBeenCalledWith({ dataset: { class: 'mage' } });
  });

  it('uses escape to request quit from the main title when no higher-priority surface is open', () => {
    const elements = {
      codexModal: { classList: { contains: vi.fn(() => false) }, style: {} },
      runSettingsModal: { classList: { contains: vi.fn(() => false) }, style: { display: 'none' } },
      settingsModal: { classList: { contains: vi.fn(() => false) }, style: { display: 'none' } },
      charSelectSubScreen: { style: { display: 'none' } },
    };
    const doc = {
      addEventListener: vi.fn(),
      getElementById: vi.fn((id) => elements[id] || null),
      querySelectorAll: vi.fn(() => []),
    };
    const actions = {
      backToTitle: vi.fn(),
      closeCodex: vi.fn(),
      closeRunSettings: vi.fn(),
      closeSettings: vi.fn(),
      quitGame: vi.fn(),
    };

    registerTitleBindings({
      actions,
      audio: { playEvent: vi.fn(), playClick: vi.fn() },
      doc,
      getIsTitleScreen: () => true,
      isVisibleModal: () => false,
    });

    const onKeyDown = getDocumentHandler(doc, 'keydown');
    onKeyDown?.({ key: 'Escape', preventDefault: vi.fn(), stopPropagation: vi.fn(), stopImmediatePropagation: vi.fn() });

    expect(actions.quitGame).toHaveBeenCalledTimes(1);
    expect(actions.backToTitle).not.toHaveBeenCalled();
  });

  it('routes title letter shortcuts to run rules, codex, and settings from the main title screen', () => {
    const elements = {
      codexModal: { classList: { contains: vi.fn(() => false) }, style: {} },
      runSettingsModal: { classList: { contains: vi.fn(() => false) }, style: { display: 'none' } },
      settingsModal: { classList: { contains: vi.fn(() => false) }, style: { display: 'none' } },
      charSelectSubScreen: { style: { display: 'none' } },
      mainTitleSubScreen: { style: { display: 'block' } },
    };
    const doc = {
      addEventListener: vi.fn(),
      getElementById: vi.fn((id) => elements[id] || null),
      querySelectorAll: vi.fn(() => []),
    };
    const actions = {
      openRunSettings: vi.fn(),
      openCodexFromTitle: vi.fn(),
      openSettings: vi.fn(),
    };
    const audio = { playEvent: vi.fn(), playClick: vi.fn() };

    registerTitleBindings({
      actions,
      audio,
      doc,
      getIsTitleScreen: () => true,
      isVisibleModal: () => false,
    });

    const onKeyDown = getDocumentHandler(doc, 'keydown');
    onKeyDown?.({ key: 'r', preventDefault: vi.fn(), target: null });
    onKeyDown?.({ key: 'd', preventDefault: vi.fn(), target: null });
    onKeyDown?.({ key: 's', preventDefault: vi.fn(), target: null });

    expect(actions.openRunSettings).toHaveBeenCalledTimes(1);
    expect(actions.openCodexFromTitle).toHaveBeenCalledTimes(1);
    expect(actions.openSettings).toHaveBeenCalledTimes(1);
    expect(audio.playEvent).toHaveBeenCalledTimes(3);
  });

  [
    ['codex detail popup', 'codexDetail'],
    ['class select relic detail', 'classSelectRelicDetail'],
  ].forEach(([label, surfaceKey]) => {
    it(`closes the ${label} before the title codex modal`, () => {
      const closeSurface = vi.fn();
      const elements = {
        codexModal: { classList: { contains: vi.fn((name) => name === 'active') }, style: {} },
        runSettingsModal: { classList: { contains: vi.fn(() => false) }, style: { display: 'none' } },
        settingsModal: { classList: { contains: vi.fn(() => false) }, style: { display: 'none' } },
        charSelectSubScreen: { style: { display: 'none' } },
      };
      const doc = {
        addEventListener: vi.fn(),
        getElementById: vi.fn((id) => elements[id] || null),
        querySelectorAll: vi.fn(() => []),
      };
      registerVisibleTitleSurface(doc, surfaceKey, closeSurface);
      const actions = {
        closeCodex: vi.fn(),
        closeRunSettings: vi.fn(),
        closeSettings: vi.fn(),
        backToTitle: vi.fn(),
      };

      registerTitleBindings({
        actions,
        audio: { playEvent: vi.fn(), playClick: vi.fn() },
        doc,
        getIsTitleScreen: () => true,
        isVisibleModal: (element) => element?.classList?.contains?.('active') || false,
      });

      const onKeyDown = getDocumentHandler(doc, 'keydown');
      onKeyDown({ key: 'Escape', preventDefault: vi.fn(), stopPropagation: vi.fn(), stopImmediatePropagation: vi.fn() });

      expect(closeSurface).toHaveBeenCalledTimes(1);
      expect(actions.closeCodex).not.toHaveBeenCalled();
    });
  });
});
