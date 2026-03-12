import { resolveGs } from './help_pause_ui_helpers.js';
import { createTitlePauseMenuActions } from '../../features/title/application/help_pause_menu_actions.js';

export function saveRunBeforeReturnRuntime(deps = {}) {
  const gs = resolveGs(deps);
  if (!gs) return false;

  if (typeof deps.saveRun === 'function') {
    deps.saveRun({ gs });
    return true;
  }

  return false;
}

export function closePauseMenuRuntime(doc, onClose) {
  doc?.getElementById?.('pauseMenu')?.remove();
  if (typeof onClose === 'function') onClose();
}

export function swallowEscapeEvent(event) {
  event.preventDefault();
  event.stopPropagation();
  if (typeof event.stopImmediatePropagation === 'function') {
    event.stopImmediatePropagation();
  }
}

export function createPauseMenuRuntimeCallbacks({ deps = {}, ui }) {
  return createTitlePauseMenuActions({ deps, ui });
}
