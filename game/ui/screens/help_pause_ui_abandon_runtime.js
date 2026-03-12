import { confirmHelpPauseAbandonRun } from '../../features/title/application/help_pause_abandon_actions.js';

export function confirmAbandonRun(deps = {}, onClosePauseMenu = () => {}) {
  return confirmHelpPauseAbandonRun(deps, onClosePauseMenu);
}
