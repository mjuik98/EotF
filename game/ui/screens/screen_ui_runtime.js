import { removeFloatingPlayerHpPanel } from '../shared/player_hp_panel_ui.js';
import {
  applyActiveScreenState,
  shouldRemoveFloatingHpPanel,
} from './screen_ui_helpers.js';

export function switchScreenRuntime(screen, deps = {}) {
  const doc = deps.doc;

  applyActiveScreenState(screen, doc);

  if (deps?.gs) deps.gs.currentScreen = screen;
  if (shouldRemoveFloatingHpPanel(screen)) {
    removeFloatingPlayerHpPanel({ doc });
  }
  if (screen === 'title' && typeof deps.onEnterTitle === 'function') {
    deps.onEnterTitle();
  }
}
