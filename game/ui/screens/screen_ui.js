import { removeFloatingPlayerHpPanel } from '../shared/player_hp_panel_ui.js';
import {
  applyActiveScreenState,
  getDoc,
  shouldRemoveFloatingHpPanel,
} from './screen_ui_helpers.js';

export const ScreenUI = {
  switchScreen(screen, deps = {}) {
    const doc = getDoc(deps);

    applyActiveScreenState(screen, doc);

    if (deps?.gs) deps.gs.currentScreen = screen;
    if (shouldRemoveFloatingHpPanel(screen)) {
      removeFloatingPlayerHpPanel({ doc });
    }
    if (screen === 'title' && typeof deps.onEnterTitle === 'function') {
      deps.onEnterTitle();
    }
  },
};
