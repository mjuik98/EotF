import { describe, expect, it, vi } from 'vitest';

import { createEndingFragmentChoiceActions } from '../game/ui/screens/ending_fragment_choice_actions.js';

describe('ending_fragment_choice_actions', () => {
  it('disables choices, plays click audio, selects the fragment, and schedules cleanup', () => {
    const disableChoices = vi.fn();
    const pick = vi.fn();
    const scheduleCleanup = vi.fn();
    const playEvent = vi.fn();
    const playClick = vi.fn();

    const actions = createEndingFragmentChoiceActions({
      audioEngine: { playEvent, playClick },
      disableChoices,
      pick,
      scheduleCleanup,
    });

    actions.choose('fortune');

    expect(disableChoices).toHaveBeenCalledTimes(1);
    expect(playEvent).toHaveBeenCalledWith('ui', 'click');
    expect(playClick).not.toHaveBeenCalled();
    expect(pick).toHaveBeenCalledWith('fortune');
    expect(scheduleCleanup).toHaveBeenCalledTimes(1);
  });
});
