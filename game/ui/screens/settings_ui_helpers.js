import { SettingsManager } from '../../core/settings_manager.js';
export {
  checkConflicts,
  codeToLabel,
  KEYBINDING_GROUPS,
  resolveKeybindRow,
  sortKeybindingRows,
  syncKeybindingDisplay,
  updateConflictBanner,
} from './settings_ui_keybinding_helpers.js';

export function getDoc(deps) {
  return deps?.doc || document;
}

export function getWin(deps) {
  return deps?.win || window;
}

export function updateToggleVisual(doc, checkboxId, checked) {
  const el = doc.getElementById(checkboxId);
  if (!el) return;

  if (el.type === 'checkbox') {
    el.checked = checked;
  }

  const track = doc.querySelector(`[data-toggle-for="${checkboxId}"]`);
  if (track) track.classList.toggle('on', checked);
}

export function applyTabDisplay(doc, tabName, raf) {
  doc.querySelectorAll('.settings-tab-btn').forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.tab === tabName);
  });

  doc.querySelectorAll('.settings-tab-panel').forEach((panel) => {
    const isActive = panel.dataset.tab === tabName;
    panel.style.display = isActive ? 'block' : 'none';

    if (!isActive) return;
    panel.style.opacity = '0';
    panel.style.transform = 'translateY(8px)';
    raf(() => {
      panel.style.transition = 'opacity 0.2s ease, transform 0.2s ease';
      panel.style.opacity = '1';
      panel.style.transform = 'translateY(0)';
    });
  });
}

export function syncVolumeDisplay(type, pct, deps = {}) {
  const doc = getDoc(deps);
  const val = Number.isFinite(Number(pct)) ? Math.round(Number(pct)) : 0;
  const icon = val === 0 ? '🔇' : val < 40 ? '🔈' : val < 70 ? '🔉' : '🔊';

  doc.querySelectorAll(`#settings-vol-${type}-val`).forEach((el) => {
    el.textContent = `${val}%`;
  });
  doc.querySelectorAll(`#settings-vol-${type}-slider`).forEach((el) => {
    el.value = String(val);
    el.style.setProperty('--fill-percent', `${val}%`);
  });
  doc.querySelectorAll(`#settings-vol-${type}-icon`).forEach((el) => {
    el.textContent = icon;
  });
}

export function syncAllSettingsTabs(doc, handlers = {}) {
  const data = SettingsManager.getAll();
  const syncVolume = handlers.syncVolumeDisplay || syncVolumeDisplay;
  const syncKeybinding = handlers.syncKeybindingDisplay || syncKeybindingDisplay;
  const checkKeybindingConflicts = handlers.checkConflicts || checkConflicts;

  syncVolume('master', Math.round(data.volumes.master * 100), { doc });
  syncVolume('sfx', Math.round(data.volumes.sfx * 100), { doc });
  syncVolume('ambient', Math.round(data.volumes.ambient * 100), { doc });

  for (const [key, val] of Object.entries(data.visual)) {
    updateToggleVisual(doc, `settings-visual-${key}`, Boolean(val));
  }

  doc.querySelectorAll('[data-font-size]').forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.fontSize === data.accessibility.fontSize);
  });
  updateToggleVisual(doc, 'settings-access-highContrast', Boolean(data.accessibility.highContrast));
  updateToggleVisual(doc, 'settings-access-tooltipDwell', Boolean(data.accessibility.tooltipDwell));

  for (const action of Object.keys(data.keybindings || {})) {
    syncKeybinding(action, doc);
  }

  checkKeybindingConflicts(doc);
}

export function applyBootSettings(deps = {}) {
  const data = SettingsManager.load();
  const doc = getDoc(deps);

  deps.ScreenShake?.setEnabled?.(Boolean(data.visual.screenShake));
  deps.HitStop?.setEnabled?.(Boolean(data.visual.hitStop));
  deps.ParticleSystem?.setEnabled?.(Boolean(data.visual.particles));

  doc.documentElement.classList.toggle('reduced-motion', Boolean(data.visual.reducedMotion));
  doc.documentElement.dataset.fontSize = data.accessibility.fontSize;
  doc.documentElement.classList.toggle('high-contrast', Boolean(data.accessibility.highContrast));

  return data;
}
