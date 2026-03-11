import { unlockEventFlow } from '../../shared/use_cases/runtime_state_use_case.js';

export function createFinishEventFlowUseCase(options = {}) {
  const unlockFlow = options.unlockEventFlow || unlockEventFlow;

  return function finishEventFlow(input = {}) {
    const {
      gs,
      clearCurrentEvent,
      switchScreen,
      updateUI,
      renderMinimap,
      updateNextNodes,
    } = input;

    clearCurrentEvent?.();
    unlockFlow(gs);
    switchScreen?.('game');
    updateUI?.();
    renderMinimap?.();
    updateNextNodes?.();
  };
}
