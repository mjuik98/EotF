import { changeScreenState } from '../../state/screen_state_commands.js';
import {
  applyActiveScreenState,
  shouldRemoveFloatingHpPanel,
} from './screen_ui_helpers.js';

function removeFloatingPlayerHpPanel(deps = {}) {
  deps?.doc?.getElementById?.('ncFloatingHpShell')?.remove?.();
}

export function switchScreenRuntime(screen, deps = {}) {
  const doc = deps.doc;

  applyActiveScreenState(screen, doc);

  if (deps?.gs) {
    changeScreenState(deps.gs, screen);
  }
  if (shouldRemoveFloatingHpPanel(screen)) {
    removeFloatingPlayerHpPanel({ doc });
  }
  if (screen === 'title' && typeof deps.onEnterTitle === 'function') {
    deps.onEnterTitle();
  }
}
