import { SettingsManager } from '../../core/settings_manager.js';
import { bindSettingsDomEvents } from './settings_ui_bindings.js';
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
  updateToggleVisual,
} from './settings_ui_helpers.js';

export const SettingsUI = {
  _activeTab: 'sound',
  _listeningAction: null,
  _keydownHandler: null,
  _rebindWindow: null,
  _boundDoc: null,
  _runtimeDeps: {},

  openSettings(deps = {}) {
    const doc = getDoc(deps);
    const modal = doc.getElementById('settingsModal');
    if (!modal) {
      console.warn('[SettingsUI] #settingsModal not found');
      return;
    }

    this._runtimeDeps = deps;
    this._bindDomEvents(doc);
    SettingsManager.load();
    this._syncAllTabs(doc);
    this.setTab(this._activeTab, deps);
    modal.classList.add('active');
    deps.audioEngine?.playClick?.();
  },

  closeSettings(deps = {}) {
    const doc = getDoc(deps);
    const modal = doc.getElementById('settingsModal');
    modal?.classList.remove('active');
    this._cancelRebind(deps);
    deps.audioEngine?.playClick?.();
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
    const percent = Math.max(0, Math.min(100, Number(value)));
    const normalized = percent / 100;

    SettingsManager.set(`volumes.${type}`, normalized);

    if (type === 'master') deps.audioEngine?.setVolume?.(normalized);
    if (type === 'sfx') deps.audioEngine?.setSfxVolume?.(normalized);
    if (type === 'ambient') deps.audioEngine?.setAmbientVolume?.(normalized);

    this._syncVolumeDisplay(type, percent, deps);
  },

  muteToggle(type, deps = {}) {
    const doc = getDoc(deps);
    const slider = doc.querySelector(`#settings-vol-${type}-slider`);
    if (!slider) return;

    const current = Number(slider.value);
    if (current > 0) {
      slider.dataset.prevValue = String(current);
      this.applyVolume(type, 0, deps);
      return;
    }

    const prev = Number(slider.dataset.prevValue ?? 80);
    this.applyVolume(type, prev, deps);
  },

  applyVisual(key, value, deps = {}) {
    SettingsManager.set(`visual.${key}`, value);

    if (key === 'screenShake') deps.ScreenShake?.setEnabled?.(value);
    if (key === 'hitStop') deps.HitStop?.setEnabled?.(value);
    if (key === 'particles') deps.ParticleSystem?.setEnabled?.(value);
    if (key === 'reducedMotion') {
      const doc = getDoc(deps);
      doc.documentElement.classList.toggle('reduced-motion', value);
    }

    const doc = getDoc(deps);
    const el = doc.getElementById(`settings-visual-${key}`);
    if (el) el.checked = value;
    updateToggleVisual(doc, `settings-visual-${key}`, value);
  },

  applyAccessibility(key, value, deps = {}) {
    SettingsManager.set(`accessibility.${key}`, value);
    const doc = getDoc(deps);

    if (key === 'fontSize') {
      doc.documentElement.dataset.fontSize = value;
      doc.querySelectorAll('[data-font-size]').forEach((btn) => {
        btn.classList.toggle('active', btn.dataset.fontSize === value);
      });
      return;
    }

    if (key === 'highContrast') {
      doc.documentElement.classList.toggle('high-contrast', value);
      updateToggleVisual(doc, 'settings-access-highContrast', value);
      return;
    }

    if (key === 'tooltipDwell') {
      updateToggleVisual(doc, 'settings-access-tooltipDwell', value);
    }
  },

  startRebind(action, deps = {}) {
    const doc = getDoc(deps);
    this._cancelRebind(deps);

    this._listeningAction = action;
    this._rebindWindow = getWin(deps);

    const btn = doc.querySelector(`[data-keybind="${action}"]`);
    if (btn) {
      btn.textContent = '입력...';
      btn.classList.add('listening');
    }

    this._keydownHandler = (e) => {
      e.preventDefault();
      if (e.code === 'Escape') {
        this._cancelRebind(deps);
        return;
      }

      SettingsManager.set(`keybindings.${action}`, e.code);
      this._syncKeybindingDisplay(action, doc);
      this._cleanupRebind(action, doc);
    };

    this._rebindWindow?.addEventListener('keydown', this._keydownHandler);
  },

  _cancelRebind(deps = {}) {
    if (!this._listeningAction) return;

    const doc = getDoc(deps);
    this._syncKeybindingDisplay(this._listeningAction, doc);
    this._cleanupRebind(this._listeningAction, doc);
  },

  _cleanupRebind(action, doc) {
    const btn = doc.querySelector(`[data-keybind="${action}"]`);
    btn?.classList.remove('listening');

    if (this._keydownHandler) {
      this._rebindWindow?.removeEventListener('keydown', this._keydownHandler);
      this._keydownHandler = null;
    }

    this._listeningAction = null;
    this._rebindWindow = null;
    this._checkConflicts(doc);
  },

  resetToDefaults(deps = {}) {
    const defaults = SettingsManager.resetToDefaults();
    const doc = getDoc(deps);
    this._syncAllTabs(doc);

    deps.audioEngine?.setVolume?.(defaults.volumes.master);
    deps.audioEngine?.setSfxVolume?.(defaults.volumes.sfx);
    deps.audioEngine?.setAmbientVolume?.(defaults.volumes.ambient);

    deps.ScreenShake?.setEnabled?.(defaults.visual.screenShake);
    deps.HitStop?.setEnabled?.(defaults.visual.hitStop);
    deps.ParticleSystem?.setEnabled?.(defaults.visual.particles);

    doc.documentElement.classList.toggle('reduced-motion', defaults.visual.reducedMotion);
    doc.documentElement.dataset.fontSize = defaults.accessibility.fontSize;
    doc.documentElement.classList.toggle('high-contrast', defaults.accessibility.highContrast);
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
    return {
      ...(this._runtimeDeps || {}),
      doc,
      win: getWin(this._runtimeDeps || {}),
    };
  },

  _bindDomEvents(doc) {
    bindSettingsDomEvents(this, doc);
  },
};
