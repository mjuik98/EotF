import { SettingsManager } from '../../core/settings_manager.js';
import {
  getDoc,
  getWin,
} from './settings_ui_helpers.js';

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
  modal.classList.add('active');
  deps.audioEngine?.playClick?.();
  return true;
}

export function closeSettingsModal(ui, deps = {}) {
  const doc = getDoc(deps);
  doc.getElementById('settingsModal')?.classList.remove('active');
  cancelSettingsRebind(ui, deps);
  deps.audioEngine?.playClick?.();
}

export function cleanupSettingsRebind(ui, action, doc) {
  const btn = doc.querySelector(`[data-keybind="${action}"]`);
  btn?.classList.remove('listening');

  if (ui._keydownHandler) {
    ui._rebindWindow?.removeEventListener('keydown', ui._keydownHandler);
    ui._keydownHandler = null;
  }

  ui._listeningAction = null;
  ui._rebindWindow = null;
  ui._checkConflicts(doc);
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

  ui._listeningAction = action;
  ui._rebindWindow = getWin(deps);

  const btn = doc.querySelector(`[data-keybind="${action}"]`);
  if (btn) {
    btn.textContent = '입력...';
    btn.classList.add('listening');
  }

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
