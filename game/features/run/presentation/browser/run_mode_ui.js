import {
  calcDiffScore,
  getDoc,
  getMeta,
} from './run_mode_ui_helpers.js';
import {
  getContentVisibility,
  getUnlockRequirementLabel,
  isContentUnlocked,
} from '../../integration/meta_progression_capabilities.js';
import { ensureRunModeUiStyle } from './run_mode_ui_style.js';
import {
  selectRunCurse,
  shiftRunAscension,
  toggleRunEndless,
  toggleRunInscription,
} from '../../state/run_config_state_commands.js';
import {
  curseFlash,
  flash,
  refreshInscriptionPanel,
} from './run_mode_ui_render.js';
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
} from './run_mode_ui_runtime.js';

export const RunModeUI = {
  _selectedPresetSlot: 0,
  _presetDialog: null,

  refresh(deps = {}) {
    ensureRunModeUiStyle(getDoc(deps));
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
    const currentCurse = meta.runConfig?.curse || 'none';
    const selectedCurse = selectRunCurse(meta, runRules, id, {
      isUnlocked: (query) => isContentUnlocked(meta, query),
    });

    if (id !== selectedCurse && getContentVisibility(meta, { type: 'curse', id }) === 'locked-visible') {
      deps.notice?.(getUnlockRequirementLabel({ type: 'curse', id }));
      return;
    }

    const doc = getDoc(deps);
    const card = doc.querySelector(`#rmCurseGrid .rm-opt[data-id="${selectedCurse}"]`);
    const modal = doc.querySelector('#runSettingsModal .run-settings-panel');
    if (selectedCurse !== currentCurse || id === 'none') {
      if (selectedCurse !== 'none') curseFlash(card, modal);
      else flash(card);
    }

    this.refresh(deps);
    deps.saveMeta?.();
  },

  cycleCurse(deps = {}) {
    const { gs, runRules } = deps;
    if (!gs || !runRules) return;

    const meta = getMeta(gs);
    if (!meta) return;

    runRules.ensureMeta(meta);
    const current = meta.runConfig?.curse || 'none';
    const maxSteps = Math.max(1, Object.keys(runRules.curses || {}).length);
    let next = current;
    for (let idx = 0; idx < maxSteps; idx += 1) {
      next = runRules.nextCurseId(next);
      const selected = selectRunCurse(meta, runRules, next, {
        isUnlocked: (query) => isContentUnlocked(meta, query),
      });
      if (selected !== current || selected === 'none') break;
    }

    this.refresh(deps);
    deps.saveMeta?.();
  },

  shiftAscension(delta, deps = {}) {
    const { gs, runRules } = deps;
    if (!gs || !runRules) return;

    const meta = getMeta(gs);
    if (!meta) return;

    runRules.ensureMeta(meta);
    if (!meta.unlocks?.ascension) {
      this.refresh(deps);
      return;
    }

    shiftRunAscension(meta, delta);

    this.refresh(deps);
    deps.saveMeta?.();
  },

  toggleEndlessMode(deps = {}) {
    const { gs, runRules } = deps;
    if (!gs || !runRules) return;

    const meta = getMeta(gs);
    if (!meta) return;

    runRules.ensureMeta(meta);
    if (!meta.unlocks?.endless) {
      deps.notice?.('무한 모드는 아직 잠겨 있습니다.');
      this.refresh(deps);
      return;
    }

    toggleRunEndless(meta);
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

    toggleRunInscription(meta, key);

    this.refresh(deps);
    deps.saveMeta?.();
  },

  openSettings(deps = {}) {
    ensureRunModeUiStyle(getDoc(deps));
    openRunSettingsModal(this, deps);
  },

  closeSettings(deps = {}) {
    closeRunSettingsModal(this, deps);
  },

  _calcDiffScore(runRules, gs) {
    return calcDiffScore(runRules, gs);
  },
};
