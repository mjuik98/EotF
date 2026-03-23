import { describe, expect, it } from 'vitest';
import { createResolveEventChoiceUseCase } from '../game/features/event/public.js';

describe('resolve_event_choice_use_case', () => {
  it('builds toast-ready view model for persistent event results', () => {
    const gs = { _eventLock: false };
    const resolveEventChoice = createResolveEventChoiceUseCase({
      resolveChoice: () => ({
        resultText: 'Reward granted',
        acquiredCard: 'strike',
        acquiredItem: 'charm',
      }),
    });

    const execution = resolveEventChoice({
      choiceIdx: 0,
      event: { persistent: true, choices: [{ text: 'Take reward' }] },
      gs,
      sharedData: {
        cards: { strike: { id: 'strike', rarity: 'common' } },
        items: { charm: { id: 'charm', name: 'Charm' } },
      },
    });

    expect(execution.viewModel.rerenderChoices).toBe(true);
    expect(execution.viewModel.releaseLock).toBe(true);
    expect(execution.viewModel.acquiredCardToast).toEqual(expect.objectContaining({
      payload: { id: 'strike', rarity: 'common' },
    }));
    expect(execution.viewModel.acquiredItemToast).toEqual(expect.objectContaining({
      payload: { id: 'charm', name: 'Charm' },
    }));
    expect(gs._eventLock).toBe(false);
  });

  it('keeps the lock when a closable non-persistent result should show continue', () => {
    const gs = { _eventLock: false };
    const resolveEventChoice = createResolveEventChoiceUseCase({
      resolveChoice: () => ({
        resultText: 'Slash 강화 완료',
        isFail: false,
        shouldClose: true,
      }),
    });

    const execution = resolveEventChoice({
      choiceIdx: 0,
      event: { persistent: false, choices: [{ text: '카드 강화', cssClass: 'shop-choice-upgrade' }] },
      gs,
    });

    expect(execution.viewModel.continueChoice).toBe(true);
    expect(execution.viewModel.releaseLock).toBe(false);
    expect(execution.viewModel.upgradeToast?.payload?.name).toBe('Upgrade: Slash');
    expect(gs._eventLock).toBe(true);
  });
});
