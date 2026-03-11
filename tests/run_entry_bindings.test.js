import { describe, expect, it, vi } from 'vitest';

import { registerRunEntryBindings } from '../game/features/run/ui/run_entry_bindings.js';

function createElement() {
  return {
    addEventListener: vi.fn(),
    classList: { contains: vi.fn(() => false) },
    dataset: {},
    style: {},
  };
}

function getBoundHandler(element, eventName = 'click') {
  const entry = element.addEventListener.mock.calls.find(([name]) => name === eventName);
  return entry?.[1];
}

describe('registerRunEntryBindings', () => {
  it('routes run/combat controls through injected actions and adapters', () => {
    const elements = {
      mazeMinimapCanvas: createElement(),
      mazeMoveUp: createElement(),
      mazeMoveLeft: createElement(),
      mazeMoveDown: createElement(),
      mazeMoveRight: createElement(),
      useEchoSkillBtn: createElement(),
      combatDrawCardBtn: createElement(),
      endPlayerTurnBtn: createElement(),
      showBattleChronicleBtn: createElement(),
      closeBattleChronicleBtn: createElement(),
      rewardSkipInitBtn: createElement(),
      rewardSkipConfirmBtn: createElement(),
      rewardSkipCancelBtn: createElement(),
      deckViewCloseBtn: createElement(),
      codexCloseBtn: createElement(),
      combatOverlay: { classList: { contains: vi.fn(() => true) } },
    };
    const deckFilterButton = createElement();
    deckFilterButton.dataset.filter = 'attack';
    const codexTabButton = createElement();
    codexTabButton.dataset.tab = 'cards';
    const doc = {
      addEventListener: vi.fn(),
      getElementById: vi.fn((id) => elements[id] || null),
      querySelectorAll: vi.fn((selector) => {
        if (selector === '.deck-filter-btn') return [deckFilterButton];
        if (selector === '.codex-tab-btn') return [codexTabButton];
        return [];
      }),
    };
    const actions = {
      closeBattleChronicle: vi.fn(),
      closeCodex: vi.fn(),
      closeDeckView: vi.fn(),
      drawCard: vi.fn(),
      endPlayerTurn: vi.fn(),
      hideEchoSkillTooltip: vi.fn(),
      hideSkipConfirm: vi.fn(),
      setCodexTab: vi.fn(),
      setDeckFilter: vi.fn(),
      showEchoSkillTooltip: vi.fn(),
      showFullMap: vi.fn(),
      showSkipConfirm: vi.fn(),
      skipReward: vi.fn(),
      toggleBattleChronicle: vi.fn(),
      useEchoSkill: vi.fn(),
    };
    const audio = { playClick: vi.fn(), playFootstep: vi.fn(), resume: vi.fn() };
    const feedbackUI = {
      triggerDrawButtonEffect: vi.fn(),
      triggerEchoButtonEffect: vi.fn(),
    };
    const mazeSystem = { move: vi.fn() };

    registerRunEntryBindings({
      actions,
      audio,
      doc,
      feedbackUI,
      mazeSystem,
    });

    getBoundHandler(elements.mazeMinimapCanvas)?.({ stopPropagation: vi.fn() });
    getBoundHandler(elements.mazeMoveUp)?.();
    getBoundHandler(elements.useEchoSkillBtn)?.();
    getBoundHandler(elements.useEchoSkillBtn, 'mouseenter')?.({ type: 'mouseenter' });
    getBoundHandler(elements.useEchoSkillBtn, 'mouseleave')?.();
    getBoundHandler(elements.combatDrawCardBtn)?.();
    getBoundHandler(elements.endPlayerTurnBtn)?.();
    getBoundHandler(elements.showBattleChronicleBtn)?.();
    getBoundHandler(elements.closeBattleChronicleBtn)?.();
    getBoundHandler(elements.rewardSkipInitBtn)?.();
    getBoundHandler(elements.rewardSkipConfirmBtn)?.();
    getBoundHandler(elements.rewardSkipCancelBtn)?.();
    getBoundHandler(deckFilterButton)?.();
    getBoundHandler(elements.deckViewCloseBtn)?.();
    getBoundHandler(codexTabButton)?.();
    getBoundHandler(elements.codexCloseBtn)?.();

    const [, onKeyDown] = doc.addEventListener.mock.calls.find(([name]) => name === 'keydown');
    onKeyDown({ key: 'L' });

    expect(actions.showFullMap).toHaveBeenCalledTimes(1);
    expect(audio.resume).toHaveBeenCalledTimes(1);
    expect(audio.playFootstep).toHaveBeenCalledTimes(1);
    expect(mazeSystem.move).toHaveBeenCalledWith(0, -1);
    expect(actions.useEchoSkill).toHaveBeenCalledTimes(1);
    expect(actions.showEchoSkillTooltip).toHaveBeenCalledTimes(1);
    expect(actions.hideEchoSkillTooltip).toHaveBeenCalledTimes(1);
    expect(feedbackUI.triggerEchoButtonEffect).toHaveBeenCalledTimes(1);
    expect(actions.drawCard).toHaveBeenCalledTimes(1);
    expect(feedbackUI.triggerDrawButtonEffect).toHaveBeenCalledTimes(1);
    expect(actions.endPlayerTurn).toHaveBeenCalledTimes(1);
    expect(actions.toggleBattleChronicle).toHaveBeenCalledTimes(2);
    expect(actions.closeBattleChronicle).toHaveBeenCalledTimes(1);
    expect(actions.showSkipConfirm).toHaveBeenCalledTimes(1);
    expect(actions.skipReward).toHaveBeenCalledTimes(1);
    expect(actions.hideSkipConfirm).toHaveBeenCalledTimes(1);
    expect(actions.setDeckFilter).toHaveBeenCalledWith('attack');
    expect(actions.closeDeckView).toHaveBeenCalledTimes(1);
    expect(actions.setCodexTab).toHaveBeenCalledWith('cards');
    expect(actions.closeCodex).toHaveBeenCalledTimes(1);
  });
});
