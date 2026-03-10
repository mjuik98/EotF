import {
  cloneRunConfig,
  ensureRunConfig,
  getDoc,
  getMeta,
} from './run_mode_ui_helpers.js';
import {
  refreshInscriptionPanel,
  renderHiddenEnding,
  renderPanel,
  renderPresetDialog,
  syncModalMood,
} from './run_mode_ui_render.js';
import { bindRunModePanelEvents } from './run_mode_ui_bindings.js';

export function refreshRunModeUI(ui, deps = {}) {
  const { gs, runRules } = deps;
  if (!gs || !runRules) return false;

  const doc = getDoc(deps);
  const meta = getMeta(gs);
  if (!meta) return false;

  runRules.ensureMeta(meta);
  const cfg = ensureRunConfig(meta);

  renderPanel(ui, doc, cfg, meta, runRules, gs, deps.data || globalThis.DATA);
  bindRunModePanelEvents(ui, deps);
  renderPresetDialog(ui, doc, deps);
  syncModalMood(doc, cfg);

  ui.refreshInscriptions(deps);
  renderHiddenEnding(meta, cfg, doc);
  return true;
}

export function selectPresetSlotRuntime(ui, slot, deps = {}) {
  const idx = Math.max(0, Math.min(3, Math.floor(Number(slot) || 0)));
  ui._selectedPresetSlot = idx;

  const { gs } = deps;
  const meta = getMeta(gs);
  const preset = meta?.runConfigPresets?.[idx];
  if (preset?.config) {
    ui.loadPreset(idx, deps);
    return;
  }

  ui.refresh(deps);
}

export function savePresetRuntime(ui, slot, deps = {}) {
  const { gs, runRules } = deps;
  if (!gs || !runRules) return false;

  const meta = getMeta(gs);
  if (!meta) return false;

  runRules.ensureMeta(meta);
  const idx = Math.max(0, Math.min(3, Math.floor(Number.isFinite(slot) ? slot : ui._selectedPresetSlot) || 0));
  ui._selectedPresetSlot = idx;
  const existing = meta.runConfigPresets[idx];
  ui._presetDialog = {
    open: true,
    slot: idx,
    name: existing?.name || `프리셋 ${idx + 1}`,
  };
  renderPresetDialog(ui, getDoc(deps), deps);
  return true;
}

export function closePresetDialogRuntime(ui, deps = {}) {
  ui._presetDialog = null;
  getDoc(deps).getElementById('rmPresetDialog')?.remove();
}

export function confirmPresetSaveRuntime(ui, deps = {}) {
  const { gs, runRules } = deps;
  if (!gs || !runRules || !ui._presetDialog?.open) return false;

  const meta = getMeta(gs);
  if (!meta) return false;

  runRules.ensureMeta(meta);
  const cfg = ensureRunConfig(meta);
  const doc = getDoc(deps);
  const idx = Math.max(0, Math.min(3, Math.floor(Number(ui._presetDialog.slot) || 0)));
  const existing = meta.runConfigPresets[idx];
  const rawName = doc.getElementById('rmPresetNameInput')?.value ?? ui._presetDialog.name;
  const fallbackName = existing?.name || `프리셋 ${idx + 1}`;

  meta.runConfigPresets[idx] = {
    id: existing?.id || `preset-${idx + 1}`,
    name: String(rawName || fallbackName).trim().slice(0, 32) || fallbackName,
    config: cloneRunConfig(cfg),
  };

  ui._presetDialog = null;
  ui.refresh(deps);
  deps.saveMeta?.();
  deps.notice?.('프리셋을 저장했습니다.');
  return true;
}

export function loadPresetRuntime(ui, slot, deps = {}) {
  const { gs, runRules } = deps;
  if (!gs || !runRules) return false;

  const meta = getMeta(gs);
  if (!meta) return false;

  runRules.ensureMeta(meta);
  const cfg = ensureRunConfig(meta);
  const idx = Math.max(0, Math.min(3, Math.floor(Number(slot) || 0)));
  ui._selectedPresetSlot = idx;
  const preset = meta.runConfigPresets[idx];
  if (!preset?.config) return false;

  Object.assign(cfg, cloneRunConfig(preset.config));
  cfg.ascension = Math.max(0, Math.min(meta.maxAscension || 0, cfg.ascension));
  if (!meta.unlocks?.endless) cfg.endless = false;
  if (!runRules.curses[cfg.curse]) cfg.curse = 'none';

  ui.refresh(deps);
  deps.saveMeta?.();
  deps.notice?.('프리셋을 불러왔습니다.');
  return true;
}

export function deletePresetRuntime(ui, slot, deps = {}) {
  const { gs, runRules } = deps;
  if (!gs || !runRules) return false;

  const meta = getMeta(gs);
  if (!meta) return false;

  runRules.ensureMeta(meta);
  const idx = Math.max(0, Math.min(3, Math.floor(Number(slot) || 0)));
  ui._selectedPresetSlot = idx;
  if (!meta.runConfigPresets[idx]) return false;

  meta.runConfigPresets[idx] = null;
  meta.runConfigPresets = meta.runConfigPresets.slice(0, 4);

  ui.refresh(deps);
  deps.saveMeta?.();
  deps.notice?.('프리셋을 삭제했습니다.');
  return true;
}

export function openRunSettingsModal(ui, deps = {}) {
  const doc = getDoc(deps);
  const modal = doc.getElementById('runSettingsModal');
  if (!modal) return false;

  modal.classList.remove('fade-out');
  modal.style.display = 'flex';
  modal.classList.add('fade-in');

  const layout = doc.getElementById('inscriptionLayout');
  if (layout) {
    layout.dataset.open = 'false';
    layout.style.display = 'none';
  }

  doc.querySelector('#runSettingsModal .run-settings-panel')?.classList.remove('run-settings-with-inscription-layout');

  ui.refresh(deps);
  ui.refreshInscriptions(deps);
  return true;
}

export function closeRunSettingsModal(ui, deps = {}) {
  const doc = getDoc(deps);
  const modal = doc.getElementById('runSettingsModal');
  if (!modal) return false;

  ui.closePresetDialog(deps);
  doc.body?.classList?.remove('run-rules-curse-active');
  modal.classList.remove('cursed');
  doc.querySelector('#runSettingsModal .run-settings-panel')?.classList.remove('cursed');

  const layout = doc.getElementById('inscriptionLayout');
  if (layout) {
    layout.dataset.open = 'false';
    layout.style.display = 'none';
  }

  doc.querySelector('#runSettingsModal .run-settings-panel')?.classList.remove('run-settings-with-inscription-layout');

  modal.classList.remove('fade-in');
  modal.classList.add('fade-out');

  const onEnd = () => {
    modal.style.display = 'none';
    modal.classList.remove('fade-out');
    modal.removeEventListener('animationend', onEnd);
  };

  modal.addEventListener('animationend', onEnd);
  setTimeout(() => {
    if (modal.style.display !== 'none') onEnd();
  }, 250);
  return true;
}
