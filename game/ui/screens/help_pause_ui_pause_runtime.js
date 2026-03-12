import {
  getDoc,
  isVisibleModal,
  resolveGs,
} from './help_pause_ui_helpers.js';
import {
  closePauseMenu,
  createPauseMenuCallbacks,
} from './help_pause_ui_runtime.js';
import {
  createPauseMenu,
} from './help_pause_ui_overlays.js';

export function togglePauseMenuRuntime({
  deps = {},
  ui,
  currentPauseOpen = false,
  onPauseStateChange,
} = {}) {
  const gs = resolveGs(deps);
  const doc = getDoc(deps);
  if (!gs || !doc) return currentPauseOpen;

  const existingMenu = doc.getElementById('pauseMenu');
  const isPauseOpen = isVisibleModal(existingMenu, doc);
  if (isPauseOpen) {
    closePauseMenu(doc, () => {
      onPauseStateChange?.(false);
    });
    return false;
  }

  onPauseStateChange?.(true);
  const menu = createPauseMenu(
    doc,
    gs,
    deps,
    createPauseMenuCallbacks({
      deps,
      ui,
    }),
  );

  doc.body.appendChild(menu);
  deps._syncVolumeUI?.();
  return true;
}
