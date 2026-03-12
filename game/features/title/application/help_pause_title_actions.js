import { returnToTitleFromPause } from '../app/title_return_actions.js';
import { resolveEndingActions } from './ending_action_ports.js';

function resolvePauseReturnAction(deps = {}) {
  if (typeof deps.returnToTitleFromPause === 'function') {
    return deps.returnToTitleFromPause;
  }

  return () => returnToTitleFromPause(deps);
}

export function buildTitleHelpPauseActions(deps = {}) {
  const endingActions = resolveEndingActions(deps);
  const returnAction = resolvePauseReturnAction(deps);

  return {
    returnToTitleFromPause: () => {
      const result = returnAction();
      return result === undefined ? true : result;
    },
    restartEndingFlow: () => endingActions.restart?.(),
    selectEndingFragment: (effect) => endingActions.selectFragment?.(effect),
    openEndingCodex: () => endingActions.openCodex?.(),
    endingActions,
  };
}

export function confirmPauseReturnToTitle(deps = {}) {
  return buildTitleHelpPauseActions(deps).returnToTitleFromPause();
}
