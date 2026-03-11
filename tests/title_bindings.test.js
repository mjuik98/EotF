import { describe, expect, it, vi } from 'vitest';

import { registerTitleBindings } from '../game/features/title/ui/title_bindings.js';

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

describe('registerTitleBindings', () => {
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
      classSelectContainer: createElement(),
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
    const audio = { playClick: vi.fn() };

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
    getBoundHandler(elements.backToTitleBtn)?.();
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
    expect(actions.backToTitle).toHaveBeenCalledTimes(1);
    expect(actions.closeRunSettings).toHaveBeenCalledTimes(1);
    expect(actions.toggleEndlessMode).toHaveBeenCalledTimes(1);
    expect(actions.shiftAscension).toHaveBeenNthCalledWith(1, -1);
    expect(actions.shiftAscension).toHaveBeenNthCalledWith(2, 1);
    expect(audio.playClick).toHaveBeenCalled();

    const [, onKeyDown] = doc.addEventListener.mock.calls.find(([name]) => name === 'keydown');
    onKeyDown({ key: 'Escape' });
    expect(actions.closeCodex).toHaveBeenCalledTimes(1);

    const classClick = getBoundHandler(elements.classSelectContainer);
    classClick({ target: { closest: vi.fn(() => ({ dataset: { class: 'mage' } })) } });
    expect(actions.selectClass).toHaveBeenCalledWith({ dataset: { class: 'mage' } });
  });
});
