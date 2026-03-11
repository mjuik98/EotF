import { describe, expect, it, vi } from 'vitest';

import { createFinishEventFlowUseCase } from '../game/app/event/use_cases/finish_event_flow_use_case.js';

describe('finish_event_flow_use_case', () => {
  it('clears current event, unlocks flow, and refreshes the run shell', () => {
    const unlockEventFlow = vi.fn();
    const finishEventFlow = createFinishEventFlowUseCase({ unlockEventFlow });
    const gs = { _eventLock: true };
    const clearCurrentEvent = vi.fn();
    const switchScreen = vi.fn();
    const updateUI = vi.fn();
    const renderMinimap = vi.fn();
    const updateNextNodes = vi.fn();

    finishEventFlow({
      gs,
      clearCurrentEvent,
      switchScreen,
      updateUI,
      renderMinimap,
      updateNextNodes,
    });

    expect(clearCurrentEvent).toHaveBeenCalledTimes(1);
    expect(unlockEventFlow).toHaveBeenCalledWith(gs);
    expect(switchScreen).toHaveBeenCalledWith('game');
    expect(updateUI).toHaveBeenCalledTimes(1);
    expect(renderMinimap).toHaveBeenCalledTimes(1);
    expect(updateNextNodes).toHaveBeenCalledTimes(1);
  });
});
