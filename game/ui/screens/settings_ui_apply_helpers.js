import { SettingsManager } from '../../core/settings_manager.js';
import {
  getDoc,
  syncVolumeDisplay,
  updateToggleVisual,
} from './settings_ui_helpers.js';

export function normalizeSettingsVolumePercent(value) {
  return Math.max(0, Math.min(100, Number(value)));
}

export function applySettingsVolume(type, value, deps = {}) {
  const percent = normalizeSettingsVolumePercent(value);
  const normalized = percent / 100;

  SettingsManager.set(`volumes.${type}`, normalized);

  if (type === 'master') deps.audioEngine?.setVolume?.(normalized);
  if (type === 'sfx') deps.audioEngine?.setSfxVolume?.(normalized);
  if (type === 'ambient') deps.audioEngine?.setAmbientVolume?.(normalized);

  syncVolumeDisplay(type, percent, deps);
  return { percent, normalized };
}

export function toggleSettingsMute(type, deps = {}, applyVolume = applySettingsVolume) {
  const doc = getDoc(deps);
  const slider = doc.querySelector(`#settings-vol-${type}-slider`);
  if (!slider) return false;

  const current = Number(slider.value);
  if (current > 0) {
    slider.dataset.prevValue = String(current);
    applyVolume(type, 0, deps);
    return true;
  }

  const prev = Number(slider.dataset.prevValue ?? 80);
  applyVolume(type, prev, deps);
  return true;
}

export function applySettingsVisual(key, value, deps = {}) {
  SettingsManager.set(`visual.${key}`, value);

  if (key === 'screenShake') deps.ScreenShake?.setEnabled?.(value);
  if (key === 'hitStop') deps.HitStop?.setEnabled?.(value);
  if (key === 'particles') deps.ParticleSystem?.setEnabled?.(value);

  const doc = getDoc(deps);
  if (key === 'reducedMotion') {
    doc.documentElement.classList.toggle('reduced-motion', value);
  }

  const el = doc.getElementById(`settings-visual-${key}`);
  if (el) el.checked = value;
  updateToggleVisual(doc, `settings-visual-${key}`, value);
  return value;
}

export function applySettingsAccessibility(key, value, deps = {}) {
  SettingsManager.set(`accessibility.${key}`, value);
  const doc = getDoc(deps);

  if (key === 'fontSize') {
    doc.documentElement.dataset.fontSize = value;
    doc.querySelectorAll('[data-font-size]').forEach((btn) => {
      btn.classList.toggle('active', btn.dataset.fontSize === value);
    });
    return value;
  }

  if (key === 'highContrast') {
    doc.documentElement.classList.toggle('high-contrast', value);
    updateToggleVisual(doc, 'settings-access-highContrast', value);
    return value;
  }

  if (key === 'tooltipDwell') {
    updateToggleVisual(doc, 'settings-access-tooltipDwell', value);
  }

  return value;
}

export function resetSettingsToDefaults(deps = {}, syncAllTabs = () => {}) {
  const defaults = SettingsManager.resetToDefaults();
  const doc = getDoc(deps);
  syncAllTabs(doc);

  deps.audioEngine?.setVolume?.(defaults.volumes.master);
  deps.audioEngine?.setSfxVolume?.(defaults.volumes.sfx);
  deps.audioEngine?.setAmbientVolume?.(defaults.volumes.ambient);

  deps.ScreenShake?.setEnabled?.(defaults.visual.screenShake);
  deps.HitStop?.setEnabled?.(defaults.visual.hitStop);
  deps.ParticleSystem?.setEnabled?.(defaults.visual.particles);

  doc.documentElement.classList.toggle('reduced-motion', defaults.visual.reducedMotion);
  doc.documentElement.dataset.fontSize = defaults.accessibility.fontSize;
  doc.documentElement.classList.toggle('high-contrast', defaults.accessibility.highContrast);
  return defaults;
}
