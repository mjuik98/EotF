import {
  ensureRunConfig,
  getDoc,
  getMeta,
} from './run_mode_ui_helpers.js';
import { isContentUnlocked } from '../../../meta_progression/public.js';
import {
  deleteRunConfigPreset,
  loadRunConfigPreset,
  saveRunConfigPreset,
} from '../../state/run_config_state_commands.js';
import { ensureRunSettingsShell } from '../../platform/browser/ensure_run_settings_shell.js';
import {
  refreshInscriptionPanel,
  renderHiddenEnding,
  renderPanel,
  renderPresetDialog,
  syncModalMood,
} from './run_mode_ui_render.js';
import { bindRunModePanelEvents } from './run_mode_ui_bindings.js';
import { createUiSurfaceStateController } from '../../ports/presentation_shared_state_capabilities.js';

export function refreshRunModeUI(ui, deps = {}) {
  const { gs, runRules } = deps;
  if (!gs || !runRules) return false;

  const doc = getDoc(deps);
  const meta = getMeta(gs);
  if (!meta) return false;

  runRules.ensureMeta(meta);
  const cfg = ensureRunConfig(meta);

  renderPanel(ui, doc, cfg, meta, runRules, gs, deps.data || null);
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
    existingName: existing?.name || '',
    overwrite: !!existing,
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
  const doc = getDoc(deps);
  const idx = Math.max(0, Math.min(3, Math.floor(Number(ui._presetDialog.slot) || 0)));
  const rawName = doc.getElementById('rmPresetNameInput')?.value ?? ui._presetDialog.name;
  saveRunConfigPreset(meta, { slot: idx, name: rawName });

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
  const idx = Math.max(0, Math.min(3, Math.floor(Number(slot) || 0)));
  ui._selectedPresetSlot = idx;
  if (!loadRunConfigPreset(meta, idx, runRules, {
    isUnlocked: (query) => isContentUnlocked(meta, query),
  })) return false;

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
  if (!deleteRunConfigPreset(meta, idx)) return false;

  ui.refresh(deps);
  deps.saveMeta?.();
  deps.notice?.('프리셋을 삭제했습니다.');
  return true;
}

export function openRunSettingsModal(ui, deps = {}) {
  const doc = getDoc(deps);
  ensureRunSettingsShell(doc);
  const modal = doc.getElementById('runSettingsModal');
  if (!modal) return false;

  modal.classList.remove('fade-out');
  modal.style.display = 'flex';
  modal.classList.add('fade-in');

  const layout = doc.getElementById('inscriptionLayout');
  if (layout) {
    createUiSurfaceStateController({ element: layout }).setOpen(false);
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
    createUiSurfaceStateController({ element: layout }).setOpen(false);
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
