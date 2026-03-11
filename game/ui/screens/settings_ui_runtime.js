import { SettingsManager } from '../../core/settings_manager.js';
import { playUiClick } from '../../domain/audio/audio_event_helpers.js';
import {
  getDoc,
  getWin,
} from './settings_ui_helpers.js';
import {
  beginSettingsRebindUi,
  cleanupSettingsRebindUi,
  setSettingsModalActive,
} from './settings_ui_runtime_helpers.js';

export function getLiveSettingsDeps(ui, doc) {
  return {
    ...(ui._runtimeDeps || {}),
    doc,
    win: getWin(ui._runtimeDeps || {}),
  };
}

export function openSettingsModal(ui, deps = {}) {
  const doc = getDoc(deps);
  const modal = doc.getElementById('settingsModal');
  if (!modal) {
    console.warn('[SettingsUI] #settingsModal not found');
    return false;
  }

  ui._runtimeDeps = deps;
  ui._bindDomEvents(doc);
  SettingsManager.load();
  ui._syncAllTabs(doc);
  ui.setTab(ui._activeTab, deps);
  setSettingsModalActive(modal, true);
  playUiClick(deps.audioEngine);
  return true;
}

export function closeSettingsModal(ui, deps = {}) {
  const doc = getDoc(deps);
  setSettingsModalActive(doc.getElementById('settingsModal'), false);
  cancelSettingsRebind(ui, deps);
  playUiClick(deps.audioEngine);
}

export function cleanupSettingsRebind(ui, action, doc) {
  cleanupSettingsRebindUi(ui, action, doc);
}

export function cancelSettingsRebind(ui, deps = {}) {
  if (!ui._listeningAction) return;

  const doc = getDoc(deps);
  ui._syncKeybindingDisplay(ui._listeningAction, doc);
  cleanupSettingsRebind(ui, ui._listeningAction, doc);
}

export function startSettingsRebind(ui, action, deps = {}) {
  const doc = getDoc(deps);
  cancelSettingsRebind(ui, deps);
  beginSettingsRebindUi(ui, action, doc, getWin(deps));

  ui._keydownHandler = (e) => {
    e.preventDefault();
    if (e.code === 'Escape') {
      cancelSettingsRebind(ui, deps);
      return;
    }

    SettingsManager.set(`keybindings.${action}`, e.code);
    ui._syncKeybindingDisplay(action, doc);
    cleanupSettingsRebind(ui, action, doc);
  };

  ui._rebindWindow?.addEventListener('keydown', ui._keydownHandler);
}
