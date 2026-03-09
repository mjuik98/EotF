import { bindRunModePanelEvents } from './run_mode_ui_bindings.js';
import {
  calcDiffScore,
  cloneRunConfig,
  ensureRunConfig,
  getDoc,
  getMeta,
} from './run_mode_ui_helpers.js';
import {
  curseFlash,
  flash,
  refreshInscriptionPanel,
  renderHiddenEnding,
  renderPanel,
  renderPresetDialog,
  syncModalMood,
} from './run_mode_ui_render.js';

export const RunModeUI = {
  _selectedPresetSlot: 0,
  _presetDialog: null,

  refresh(deps = {}) {
    const { gs, runRules } = deps;
    if (!gs || !runRules) return;

    const doc = getDoc(deps);
    const meta = getMeta(gs);
    if (!meta) return;

    runRules.ensureMeta(meta);
    const cfg = ensureRunConfig(meta);

    renderPanel(this, doc, cfg, meta, runRules, gs, deps.data || globalThis.DATA);
    bindRunModePanelEvents(this, deps);
    renderPresetDialog(this, doc, deps);
    syncModalMood(doc, cfg);

    this.refreshInscriptions(deps);
    renderHiddenEnding(meta, cfg, doc);
  },

  selectPresetSlot(slot, deps = {}) {
    const idx = Math.max(0, Math.min(3, Math.floor(Number(slot) || 0)));
    this._selectedPresetSlot = idx;

    const { gs } = deps;
    const meta = getMeta(gs);
    const preset = meta?.runConfigPresets?.[idx];
    if (preset?.config) {
      this.loadPreset(idx, deps);
      return;
    }

    this.refresh(deps);
  },

  selectCurse(id, deps = {}) {
    const { gs, runRules } = deps;
    if (!gs || !runRules) return;

    const meta = getMeta(gs);
    if (!meta) return;

    runRules.ensureMeta(meta);
    const cfg = ensureRunConfig(meta);
    cfg.curse = runRules.curses[id] ? id : 'none';

    const doc = getDoc(deps);
    const card = doc.querySelector(`#rmCurseGrid .rm-opt[data-id="${cfg.curse}"]`);
    const modal = doc.querySelector('#runSettingsModal .run-settings-panel');
    if (cfg.curse !== 'none') curseFlash(card, modal);
    else flash(card);

    this.refresh(deps);
    deps.saveMeta?.();
  },

  cycleCurse(deps = {}) {
    const { gs, runRules } = deps;
    if (!gs || !runRules) return;

    const meta = getMeta(gs);
    if (!meta) return;

    runRules.ensureMeta(meta);
    const cfg = ensureRunConfig(meta);
    cfg.curse = runRules.nextCurseId(cfg.curse || 'none');

    this.refresh(deps);
    deps.saveMeta?.();
  },

  shiftAscension(delta, deps = {}) {
    const { gs, runRules } = deps;
    if (!gs || !runRules) return;

    const meta = getMeta(gs);
    if (!meta) return;

    runRules.ensureMeta(meta);
    const cfg = ensureRunConfig(meta);

    if (!meta.unlocks?.ascension) {
      this.refresh(deps);
      return;
    }

    const cur = Number.isFinite(cfg.ascension) ? cfg.ascension : 0;
    const maxAsc = Math.max(0, meta.maxAscension || 0);
    cfg.ascension = Math.max(0, Math.min(maxAsc, cur + (delta < 0 ? -1 : 1)));

    this.refresh(deps);
    deps.saveMeta?.();
  },

  toggleEndlessMode(deps = {}) {
    const { gs, runRules } = deps;
    if (!gs || !runRules) return;

    const meta = getMeta(gs);
    if (!meta) return;

    runRules.ensureMeta(meta);
    const cfg = ensureRunConfig(meta);

    if (!meta.unlocks?.endless) {
      deps.notice?.('무한 모드는 아직 잠겨 있습니다.');
      this.refresh(deps);
      return;
    }

    cfg.endless = !cfg.endless;
    this.refresh(deps);
    deps.saveMeta?.();
  },

  savePreset(slot, deps = {}) {
    const { gs, runRules } = deps;
    if (!gs || !runRules) return;

    const meta = getMeta(gs);
    if (!meta) return;

    runRules.ensureMeta(meta);
    const idx = Math.max(0, Math.min(3, Math.floor(Number.isFinite(slot) ? slot : this._selectedPresetSlot) || 0));
    this._selectedPresetSlot = idx;
    const existing = meta.runConfigPresets[idx];
    this._presetDialog = {
      open: true,
      slot: idx,
      name: existing?.name || `프리셋 ${idx + 1}`,
    };
    renderPresetDialog(this, getDoc(deps), deps);
  },

  closePresetDialog(deps = {}) {
    this._presetDialog = null;
    getDoc(deps).getElementById('rmPresetDialog')?.remove();
  },

  confirmPresetSave(deps = {}) {
    const { gs, runRules } = deps;
    if (!gs || !runRules || !this._presetDialog?.open) return;

    const meta = getMeta(gs);
    if (!meta) return;

    runRules.ensureMeta(meta);
    const cfg = ensureRunConfig(meta);
    const doc = getDoc(deps);
    const idx = Math.max(0, Math.min(3, Math.floor(Number(this._presetDialog.slot) || 0)));
    const existing = meta.runConfigPresets[idx];
    const rawName = doc.getElementById('rmPresetNameInput')?.value ?? this._presetDialog.name;
    const fallbackName = existing?.name || `프리셋 ${idx + 1}`;

    meta.runConfigPresets[idx] = {
      id: existing?.id || `preset-${idx + 1}`,
      name: String(rawName || fallbackName).trim().slice(0, 32) || fallbackName,
      config: cloneRunConfig(cfg),
    };

    this._presetDialog = null;
    this.refresh(deps);
    deps.saveMeta?.();
    deps.notice?.('프리셋을 저장했습니다.');
  },

  loadPreset(slot, deps = {}) {
    const { gs, runRules } = deps;
    if (!gs || !runRules) return;

    const meta = getMeta(gs);
    if (!meta) return;

    runRules.ensureMeta(meta);
    const cfg = ensureRunConfig(meta);
    const idx = Math.max(0, Math.min(3, Math.floor(Number(slot) || 0)));
    this._selectedPresetSlot = idx;
    const preset = meta.runConfigPresets[idx];
    if (!preset?.config) return;

    Object.assign(cfg, cloneRunConfig(preset.config));
    cfg.ascension = Math.max(0, Math.min(meta.maxAscension || 0, cfg.ascension));
    if (!meta.unlocks?.endless) cfg.endless = false;
    if (!runRules.curses[cfg.curse]) cfg.curse = 'none';

    this.refresh(deps);
    deps.saveMeta?.();
    deps.notice?.('프리셋을 불러왔습니다.');
  },

  deletePreset(slot, deps = {}) {
    const { gs, runRules } = deps;
    if (!gs || !runRules) return;

    const meta = getMeta(gs);
    if (!meta) return;

    runRules.ensureMeta(meta);
    const idx = Math.max(0, Math.min(3, Math.floor(Number(slot) || 0)));
    this._selectedPresetSlot = idx;
    if (!meta.runConfigPresets[idx]) return;

    meta.runConfigPresets[idx] = null;
    meta.runConfigPresets = meta.runConfigPresets.slice(0, 4);

    this.refresh(deps);
    deps.saveMeta?.();
    deps.notice?.('프리셋을 삭제했습니다.');
  },

  refreshInscriptions(deps = {}) {
    refreshInscriptionPanel(this, deps);
  },

  toggleInscription(key, deps = {}) {
    const { gs } = deps;
    const meta = getMeta(gs);
    if (!meta) return;

    const runConfig = ensureRunConfig(meta);
    if (!runConfig) return;

    const arr = runConfig.disabledInscriptions;
    const idx = arr.indexOf(key);
    if (idx >= 0) arr.splice(idx, 1);
    else arr.push(key);

    this.refresh(deps);
    deps.saveMeta?.();
  },

  openSettings(deps = {}) {
    const doc = getDoc(deps);
    const modal = doc.getElementById('runSettingsModal');
    if (!modal) return;

    modal.classList.remove('fade-out');
    modal.style.display = 'flex';
    modal.classList.add('fade-in');

    const layout = doc.getElementById('inscriptionLayout');
    if (layout) {
      layout.dataset.open = 'false';
      layout.style.display = 'none';
    }

    doc.querySelector('#runSettingsModal .run-settings-panel')?.classList.remove('run-settings-with-inscription-layout');

    this.refresh(deps);
    this.refreshInscriptions(deps);
  },

  closeSettings(deps = {}) {
    const doc = getDoc(deps);
    const modal = doc.getElementById('runSettingsModal');
    if (!modal) return;

    this.closePresetDialog(deps);
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
  },

  _calcDiffScore(runRules, gs) {
    return calcDiffScore(runRules, gs);
  },
};
