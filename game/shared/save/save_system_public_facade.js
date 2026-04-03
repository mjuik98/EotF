import {
  clearSaveForSystem,
  exportSaveBundle,
  getSaveSlotKeys,
  getSaveSlotSummaries,
  getSelectedSaveSlot,
  hasSaveForSystem,
  importSaveBundle,
  loadMetaForSystem,
  loadRunForSystem,
  readMetaPreviewForSystem,
  readMetaSaveDataForSystem,
  readRunPreviewForSystem,
  readRunSaveDataForSystem,
  readRunSaveRecordForSystem,
  resolveSaveSlot,
  saveMetaForSystem,
  saveRunForSystem,
  selectSaveSlot,
  showSaveBadgeForSystem,
  showSaveStatusForSystem,
  validateSaveDataForSystem,
} from './save_system_io.js';

export const saveSystemPublicFacade = {
  resolveSlot(deps = {}) {
    return resolveSaveSlot(this, deps);
  },

  _getSlotKeys(slot) {
    return getSaveSlotKeys(this, slot);
  },

  saveMeta(deps = {}) {
    return saveMetaForSystem(this, deps);
  },

  loadMeta(deps = {}) {
    loadMetaForSystem(this, deps);
  },

  validateSaveData(data) {
    return validateSaveDataForSystem(data);
  },

  saveRun(deps = {}) {
    return saveRunForSystem(this, deps);
  },

  loadRun(deps = {}) {
    return loadRunForSystem(this, deps);
  },

  hasSave(deps = {}) {
    return hasSaveForSystem(this, deps);
  },

  readRunPreview(deps = {}) {
    return readRunPreviewForSystem(this, deps);
  },

  readMetaPreview(deps = {}) {
    return readMetaPreviewForSystem(this, deps);
  },

  getSelectedSlot() {
    return getSelectedSaveSlot(this);
  },

  selectSlot(slot, deps = {}) {
    return selectSaveSlot(this, slot, deps);
  },

  getSlotSummaries({ slots = null } = {}) {
    return getSaveSlotSummaries(this, { slots });
  },

  exportBundle(deps = {}) {
    return exportSaveBundle(this, deps);
  },

  importBundle(bundle, deps = {}) {
    return importSaveBundle(this, bundle, deps);
  },

  _readRunSaveData({ logErrors = true, ...deps } = {}) {
    return readRunSaveDataForSystem(this, { ...deps, logErrors });
  },

  _readRunSaveRecord({ logErrors = true, ...deps } = {}) {
    return readRunSaveRecordForSystem(this, { ...deps, logErrors });
  },

  _readMetaSaveData({ logErrors = true, ...deps } = {}) {
    return readMetaSaveDataForSystem(this, { ...deps, logErrors });
  },

  clearSave(options = {}) {
    clearSaveForSystem(this, options);
  },

  showSaveStatus(status, deps = {}) {
    return showSaveStatusForSystem(this, status, deps);
  },

  showSaveBadge(deps = {}) {
    return showSaveBadgeForSystem(this, deps);
  },
};
