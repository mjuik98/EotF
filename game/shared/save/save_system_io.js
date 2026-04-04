import { validateRunSaveData } from './save_repository.js';
import { getSaveNotifications, getSaveStorage } from './save_runtime_context.js';
import {
  hasExplicitSlot,
} from './save_slot_keys.js';
import {
  exportSaveBundle as exportSaveBundleViaBundleIo,
  importSaveBundle as importSaveBundleViaBundleIo,
} from './save_system_bundle_io.js';
import {
  clearQueuedRunSaveErrorIfRecovered,
  hasSaveForSystem,
  loadMetaForSystem,
  loadRunForSystem,
  readMetaPreviewForSystem,
  readMetaSaveDataForSystem as readMetaSaveDataViaRunMetaIo,
  readRunPreviewForSystem,
  readRunSaveDataForSystem as readRunSaveDataViaRunMetaIo,
  readRunSaveRecordForSystem as readRunSaveRecordViaRunMetaIo,
  saveMetaForSystem,
  saveRunForSystem,
} from './save_system_run_meta_io.js';
import {
  getSaveSlotKeys as getSaveSlotKeysViaSummaries,
  getSaveSlotSummaries as getSaveSlotSummariesViaSummaries,
  getSelectedSaveSlot as getSelectedSaveSlotViaSummaries,
  resolveSaveSlot as resolveSaveSlotViaSummaries,
  selectSaveSlot as selectSaveSlotViaSummaries,
} from './save_system_slot_summaries.js';

function getSaveAdapter(deps = {}) {
  return getSaveStorage(deps);
}

export {
  clearQueuedRunSaveErrorIfRecovered,
  hasSaveForSystem,
  loadMetaForSystem,
  loadRunForSystem,
  readMetaPreviewForSystem,
  readRunPreviewForSystem,
  saveMetaForSystem,
  saveRunForSystem,
};

function resolveSaveStatusNotifier(deps = {}) {
  if (typeof deps.notifySaveStatus === 'function') return deps.notifySaveStatus;
  if (typeof deps.presentSaveStatus === 'function') return deps.presentSaveStatus;
  return getSaveNotifications(deps).saveStatus;
}

export function resolveSaveSlot(system, deps = {}) {
  return resolveSaveSlotViaSummaries(system, deps);
}

export function getSaveSlotKeys(system, slot) {
  return getSaveSlotKeysViaSummaries(system, slot);
}

export function getSelectedSaveSlot(system) {
  return getSelectedSaveSlotViaSummaries(system);
}

export function selectSaveSlot(system, slot, deps = {}) {
  return selectSaveSlotViaSummaries(system, slot, deps);
}

export function getSaveSlotSummaries(system, { slots = null } = {}) {
  return getSaveSlotSummariesViaSummaries(system, { slots });
}

export function exportSaveBundle(system, deps = {}) {
  return exportSaveBundleViaBundleIo(system, deps);
}

export function importSaveBundle(system, bundle, deps = {}) {
  return importSaveBundleViaBundleIo(system, bundle, deps);
}

export function readRunSaveDataForSystem(system, { logErrors = true, ...deps } = {}) {
  return readRunSaveDataViaRunMetaIo(system, { ...deps, logErrors });
}

export function readRunSaveRecordForSystem(system, { logErrors = true, ...deps } = {}) {
  return readRunSaveRecordViaRunMetaIo(system, { ...deps, logErrors });
}

export function readMetaSaveDataForSystem(system, { logErrors = true, ...deps } = {}) {
  return readMetaSaveDataViaRunMetaIo(system, { ...deps, logErrors });
}

export function clearSaveForSystem(system, options = {}) {
  const { saveKey, metaKey } = system._getSlotKeys(system.resolveSlot(options));
  getSaveAdapter(options)?.remove?.(saveKey);
  system._dropOutboxKey(saveKey, options);

  if (hasExplicitSlot(options)) {
    getSaveAdapter(options)?.remove?.(metaKey);
    system._dropOutboxKey(metaKey, options);
  }
}

export function showSaveStatusForSystem(system, status, deps = {}) {
  const notifySaveStatus = resolveSaveStatusNotifier(deps);
  if (typeof notifySaveStatus !== 'function') return false;

  const metrics = system.getOutboxMetrics();
  const queueDepth = Math.max(
    Number(status?.queueDepth || 0),
    Number(metrics?.queueDepth || 0),
  );
  const nextRetryAt = Number(status?.nextRetryAt || 0) || Number(metrics?.nextRetryAt || 0);
  const notified = notifySaveStatus({
    ...status,
    ...(queueDepth > 0 ? { queueDepth } : {}),
    ...(nextRetryAt > 0 ? { nextRetryAt } : {}),
  }, deps);
  return notified !== false;
}

export function showSaveBadgeForSystem(system, deps = {}) {
  const notifySaveStatus = resolveSaveStatusNotifier(deps);
  if (typeof notifySaveStatus !== 'function') return false;

  const notified = notifySaveStatus({
    status: 'saved',
    persisted: true,
    queueDepth: 0,
  }, deps);
  return notified !== false;
}

export function validateSaveDataForSystem(data) {
  return validateRunSaveData(data);
}
