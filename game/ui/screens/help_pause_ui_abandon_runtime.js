import { confirmHelpPauseAbandonRun } from '../../features/title/application/help_pause_abandon_actions.js';
import { removeFloatingPlayerHpPanel } from '../shared/player_hp_panel_ui.js';

export function confirmAbandonRun(deps = {}, onClosePauseMenu = () => {}) {
  return confirmHelpPauseAbandonRun({
    ...deps,
    removeFloatingPlayerHpPanel,
  }, onClosePauseMenu);
}
