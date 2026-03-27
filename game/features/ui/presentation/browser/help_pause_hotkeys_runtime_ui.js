import { cycleNextCombatTarget } from '../../../combat_session/ports/public_application_capabilities.js';
import {
  getRunHotkeyPolicy,
  getRunHotkeyState,
  isVisibleModal,
} from './help_pause_ui_helpers.js';

export function closeOverlayOnEscape(event, element, onClose, swallowEscape) {
  if (!element) return false;
  swallowEscape(event);
  onClose();
  return true;
}

export function closeVisibleModalById(event, doc, id, onClose, swallowEscape) {
  const el = doc.getElementById(id);
  if (!isVisibleModal(el, doc)) return false;
  swallowEscape(event);
  onClose(el);
  return true;
}

export function cycleNextTarget(gs, deps) {
  cycleNextCombatTarget(gs, deps);
}

export function handleEscapeHotkey(event, { deps, doc, gs, ui, swallowEscape }) {
  const runHotkeyState = getRunHotkeyState(doc, gs);
  const hotkeyPolicy = getRunHotkeyPolicy(runHotkeyState.mode);

  if (closeVisibleModalById(event, doc, 'fullMapOverlay', (overlay) => {
    if (typeof overlay._closeFullMap === 'function') overlay._closeFullMap();
    else overlay.remove();
  }, swallowEscape)) {
    return true;
  }

  if (closeVisibleModalById(event, doc, 'battleChronicleOverlay', () => {
    if (typeof deps.closeBattleChronicle === 'function') deps.closeBattleChronicle();
  }, swallowEscape)) {
    return true;
  }

  if (closeOverlayOnEscape(event, doc.getElementById('returnTitleConfirm'), () => {
    doc.getElementById('returnTitleConfirm')?.remove();
  }, swallowEscape)) {
    return true;
  }

  if (closeOverlayOnEscape(event, doc.getElementById('abandonConfirm'), () => {
    doc.getElementById('abandonConfirm')?.remove();
  }, swallowEscape)) {
    return true;
  }

  const helpMenu = doc.getElementById('helpMenu');
  if (helpMenu && helpMenu.style.display !== 'none') {
    swallowEscape(event);
    ui.toggleHelp(deps);
    return true;
  }

  if (closeVisibleModalById(event, doc, 'deckViewModal', () => {
    if (typeof deps.closeDeckView === 'function') deps.closeDeckView();
  }, swallowEscape)) {
    return true;
  }

  if (closeVisibleModalById(event, doc, 'codexModal', () => {
    if (typeof deps.closeCodex === 'function') deps.closeCodex();
  }, swallowEscape)) {
    return true;
  }

  if (closeVisibleModalById(event, doc, 'runSettingsModal', () => {
    if (typeof deps.closeRunSettings === 'function') deps.closeRunSettings();
  }, swallowEscape)) {
    return true;
  }

  if (closeVisibleModalById(event, doc, 'settingsModal', () => {
    if (typeof deps.closeSettings === 'function') deps.closeSettings();
  }, swallowEscape)) {
    return true;
  }

  const pauseMenu = doc.getElementById('pauseMenu');
  if (isVisibleModal(pauseMenu, doc)) {
    swallowEscape(event);
    ui.togglePause(deps);
    return true;
  }

  if (hotkeyPolicy.pause && !ui.isHelpOpen()) {
    swallowEscape(event);
    ui.togglePause(deps);
    return true;
  }

  return runHotkeyState.mode === 'title';
}
