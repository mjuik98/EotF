import { describe, expect, it, vi } from 'vitest';

import { presentEventChoiceResolution } from '../game/features/event/presentation/browser/event_choice_resolution_presenter.js';

function createDoc() {
  const eventDesc = { textContent: '' };
  return {
    getElementById: vi.fn((id) => (id === 'eventDesc' ? eventDesc : null)),
    refs: { eventDesc },
  };
}

describe('event_choice_resolution_presenter', () => {
  it('renders result text, toasts, and persistent choices', () => {
    const doc = createDoc();
    const updateUI = vi.fn();
    const onRefreshGoldBar = vi.fn();
    const showItemToast = vi.fn();
    const renderChoices = vi.fn();

    presentEventChoiceResolution({
      doc,
      event: { persistent: true, choices: [{ text: 'Take reward' }] },
      gs: { _eventLock: false },
      onRefreshGoldBar,
      onResolveChoice: vi.fn(),
      renderChoices,
      renderContinueChoice: vi.fn(),
      showItemToast,
      updateUI,
      viewModel: {
        acquiredCardToast: {
          payload: { id: 'strike', name: 'Strike' },
          options: { typeLabel: 'common card acquired' },
        },
        acquiredItemToast: {
          payload: { id: 'charm', name: 'Charm' },
        },
        rerenderChoices: true,
        resultText: 'You take the reward.',
        upgradeToast: null,
      },
    });

    expect(updateUI).toHaveBeenCalledTimes(1);
    expect(onRefreshGoldBar).toHaveBeenCalledTimes(2);
    expect(showItemToast).toHaveBeenNthCalledWith(
      1,
      { id: 'strike', name: 'Strike' },
      { typeLabel: 'common card acquired' },
    );
    expect(showItemToast).toHaveBeenNthCalledWith(2, { id: 'charm', name: 'Charm' });
    expect(doc.refs.eventDesc.textContent).toBe('You take the reward.');
    expect(renderChoices).toHaveBeenCalledTimes(1);
  });

  it('renders a continue choice for closable non-persistent results', () => {
    const doc = createDoc();
    const onFinish = vi.fn();
    const renderContinueChoice = vi.fn((_doc, onContinue) => onContinue());

    presentEventChoiceResolution({
      doc,
      event: { persistent: false },
      gs: { _eventLock: true },
      onFinish,
      onRefreshGoldBar: vi.fn(),
      renderChoices: vi.fn(),
      renderContinueChoice,
      showItemToast: vi.fn(),
      updateUI: vi.fn(),
      viewModel: {
        continueChoice: true,
        resultText: 'Slash 강화 완료',
        upgradeToast: {
          payload: {
            name: 'Upgrade: Slash',
            icon: '\u2728',
            desc: 'Slash 강화 완료',
          },
        },
      },
    });

    expect(renderContinueChoice).toHaveBeenCalledTimes(1);
    expect(onFinish).toHaveBeenCalledTimes(1);
    expect(doc.refs.eventDesc.textContent).toBe('Slash 강화 완료');
  });
});
