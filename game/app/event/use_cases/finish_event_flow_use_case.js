import { unlockEventFlow } from '../../../shared/state/runtime_flow_controls.js';

export function createFinishEventFlowUseCase(options = {}) {
  const unlockFlow = options.unlockEventFlow || unlockEventFlow;

  return function finishEventFlow(input = {}) {
    const {
      gs,
      clearCurrentEvent,
      showGameplayScreen,
      switchScreen,
      updateUI,
      renderMinimap,
      updateNextNodes,
    } = input;

    clearCurrentEvent?.();
    unlockFlow(gs);
    if (typeof showGameplayScreen === 'function') showGameplayScreen();
    else switchScreen?.('game');
    updateUI?.();
    renderMinimap?.();
    updateNextNodes?.();
  };
}
