import { bindSettingsDomEvents } from '../../../../ui/screens/settings_ui_bindings.js';
import {
  applySettingsAccessibility,
  applySettingsVisual,
  applySettingsVolume,
  resetSettingsToDefaults,
  toggleSettingsMute,
} from '../../../../ui/screens/settings_ui_apply_helpers.js';
import {
  applyBootSettings,
  applyTabDisplay,
  checkConflicts,
  getDoc,
  getWin,
  resolveKeybindRow,
  sortKeybindingRows,
  syncAllSettingsTabs,
  syncKeybindingDisplay,
  syncVolumeDisplay,
  updateConflictBanner,
} from '../../../../ui/screens/settings_ui_helpers.js';
import {
  cancelSettingsRebind,
  cleanupSettingsRebind,
  closeSettingsModal,
  getLiveSettingsDeps,
  openSettingsModal,
  startSettingsRebind,
} from '../../../../ui/screens/settings_ui_runtime.js';

export const SettingsUI = {
  _activeTab: 'sound',
  _listeningAction: null,
  _keydownHandler: null,
  _rebindWindow: null,
  _boundDoc: null,
  _runtimeDeps: {},

  openSettings(deps = {}) {
    openSettingsModal(this, deps);
  },

  closeSettings(deps = {}) {
    closeSettingsModal(this, deps);
  },

  isOpen(deps = {}) {
    const doc = getDoc(deps);
    const modal = doc.getElementById('settingsModal');
    return modal?.classList.contains('active') ?? false;
  },

  setTab(tabName, deps = {}) {
    const doc = getDoc(deps);
    this._activeTab = tabName;
    const raf = getWin(deps)?.requestAnimationFrame || ((cb) => setTimeout(cb, 16));
    applyTabDisplay(doc, tabName, raf);
  },

  applyVolume(type, value, deps = {}) {
    applySettingsVolume(type, value, deps);
  },

  muteToggle(type, deps = {}) {
    toggleSettingsMute(type, deps, this.applyVolume.bind(this));
  },

  applyVisual(key, value, deps = {}) {
    applySettingsVisual(key, value, deps);
  },

  applyAccessibility(key, value, deps = {}) {
    applySettingsAccessibility(key, value, deps);
  },

  startRebind(action, deps = {}) {
    startSettingsRebind(this, action, deps);
  },

  _cancelRebind(deps = {}) {
    cancelSettingsRebind(this, deps);
  },

  _cleanupRebind(action, doc) {
    cleanupSettingsRebind(this, action, doc);
  },

  resetToDefaults(deps = {}) {
    resetSettingsToDefaults(deps, this._syncAllTabs.bind(this));
  },

  applyOnBoot(deps = {}) {
    return applyBootSettings(deps);
  },

  _syncAllTabs(doc) {
    syncAllSettingsTabs(doc, {
      syncVolumeDisplay: this._syncVolumeDisplay.bind(this),
      syncKeybindingDisplay: this._syncKeybindingDisplay.bind(this),
      checkConflicts: this._checkConflicts.bind(this),
    });
  },

  _syncVolumeDisplay(type, pct, deps = {}) {
    syncVolumeDisplay(type, pct, deps);
  },

  _syncKeybindingDisplay(action, doc) {
    syncKeybindingDisplay(action, doc);
  },

  _checkConflicts(doc) {
    checkConflicts(doc, {
      updateConflictBanner: this._updateConflictBanner.bind(this),
      sortKeybindingRows: this._sortKeybindingRows.bind(this),
    });
  },

  _updateConflictBanner(banner, conflictGroups) {
    updateConflictBanner(banner, conflictGroups);
  },

  _resolveKeybindRow(doc, action) {
    return resolveKeybindRow(doc, action);
  },

  _sortKeybindingRows(doc, conflicts) {
    sortKeybindingRows(doc, conflicts, this._resolveKeybindRow.bind(this));
  },

  _getLiveDeps(doc) {
    return getLiveSettingsDeps(this, doc);
  },

  _bindDomEvents(doc) {
    bindSettingsDomEvents(this, doc);
  },
};
