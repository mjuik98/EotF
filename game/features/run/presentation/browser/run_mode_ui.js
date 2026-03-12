import {
  calcDiffScore,
  ensureRunConfig,
  getDoc,
  getMeta,
} from '../../../../ui/run/run_mode_ui_helpers.js';
import {
  curseFlash,
  flash,
  refreshInscriptionPanel,
} from '../../../../ui/run/run_mode_ui_render.js';
import {
  closePresetDialogRuntime,
  closeRunSettingsModal,
  confirmPresetSaveRuntime,
  deletePresetRuntime,
  loadPresetRuntime,
  openRunSettingsModal,
  refreshRunModeUI,
  savePresetRuntime,
  selectPresetSlotRuntime,
} from '../../../../ui/run/run_mode_ui_runtime.js';

export const RunModeUI = {
  _selectedPresetSlot: 0,
  _presetDialog: null,

  refresh(deps = {}) {
    refreshRunModeUI(this, deps);
  },

  selectPresetSlot(slot, deps = {}) {
    selectPresetSlotRuntime(this, slot, deps);
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
    savePresetRuntime(this, slot, deps);
  },

  closePresetDialog(deps = {}) {
    closePresetDialogRuntime(this, deps);
  },

  confirmPresetSave(deps = {}) {
    confirmPresetSaveRuntime(this, deps);
  },

  loadPreset(slot, deps = {}) {
    loadPresetRuntime(this, slot, deps);
  },

  deletePreset(slot, deps = {}) {
    deletePresetRuntime(this, slot, deps);
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
    openRunSettingsModal(this, deps);
  },

  closeSettings(deps = {}) {
    closeRunSettingsModal(this, deps);
  },

  _calcDiffScore(runRules, gs) {
    return calcDiffScore(runRules, gs);
  },
};
