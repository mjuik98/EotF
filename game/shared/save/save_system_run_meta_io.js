import { Logger } from '../logging/logger.js';
import {
  META_SAVE_VERSION,
  RUN_SAVE_VERSION,
  isUnsupportedFutureMetaSave,
  isUnsupportedFutureRunSave,
  migrateMetaSave,
  migrateRunSave,
} from './save_migrations.js';
import { getSaveStorage } from './save_runtime_context.js';
import {
  buildMetaSave,
  buildRunSave,
  ensureMetaRunConfig,
  getGS,
  hydrateMetaState,
  hydrateRunState,
} from './save_repository.js';
import { readMetaSaveData, readRunSaveRecord } from './save_readers.js';
import {
  isRunSaveStorageKey,
  SAVE_ERROR_QUEUED,
  syncActiveSaveSlot,
} from './save_slot_keys.js';

function getSaveAdapter(deps = {}) {
  return getSaveStorage(deps);
}

function isQueuedRunSaveError(error) {
  return error?.message === `[SaveSystem] run ${SAVE_ERROR_QUEUED}`;
}

export function saveMetaForSystem(system, deps = {}) {
  const gs = getGS(deps);
  if (!gs?.meta) return null;
  const { slot, metaKey } = system._getSlotKeys(system.resolveSlot(deps));
  syncActiveSaveSlot(gs, slot);

  try {
    const meta = buildMetaSave(gs, META_SAVE_VERSION);
    if (meta) meta.activeSaveSlot = slot;
    const persisted = system._persistWithOutbox(metaKey, meta, deps);
    if (!persisted) {
      system._lastSaveError = new Error(`[SaveSystem] meta ${SAVE_ERROR_QUEUED}`);
      return { status: 'queued', persisted: false, queueDepth: system.getOutboxSize(deps) };
    }
    return { status: 'saved', persisted: true, queueDepth: system.getOutboxSize(deps) };
  } catch (error) {
    Logger.error('[SaveSystem] Meta save failed:', error?.name, error?.message);
    system._lastSaveError = error;
    return { status: 'error', persisted: false, queueDepth: system.getOutboxSize(deps), error };
  }
}

export function loadMetaForSystem(system, deps = {}) {
  const gs = getGS(deps);
  if (!gs?.meta) return;
  const slot = system.resolveSlot(deps);
  syncActiveSaveSlot(gs, slot);

  try {
    const data = system._readMetaSaveData({ slot, logErrors: false });
    if (data) {
      hydrateMetaState(gs, data);
    }
  } catch (error) {
    Logger.warn('[SaveSystem] Meta load failed:', error.message);
  }

  const runRules = deps.runRules;
  try {
    runRules?.ensureMeta?.(gs.meta);
  } catch (error) {
    Logger.warn('[SaveSystem] RunRules.ensureMeta failed:', error.message);
  }

  syncActiveSaveSlot(gs, slot);
  ensureMetaRunConfig(gs.meta);
}

export function saveRunForSystem(system, deps = {}) {
  const gs = getGS(deps);
  if (!gs?.player) return { status: 'skipped', persisted: false, reason: 'missing-player', queueDepth: system.getOutboxSize(deps) };
  const { slot, saveKey } = system._getSlotKeys(system.resolveSlot(deps));
  syncActiveSaveSlot(gs, slot);

  const isGameStarted = typeof deps.isGameStarted === 'function' ? deps.isGameStarted() : true;
  if (!isGameStarted) return { status: 'skipped', persisted: false, reason: 'game-not-started', queueDepth: system.getOutboxSize(deps) };
  if (gs.combat?.active) return { status: 'skipped', persisted: false, reason: 'combat-active', queueDepth: system.getOutboxSize(deps) };

  try {
    const save = buildRunSave(gs, RUN_SAVE_VERSION);
    const persisted = system._persistWithOutbox(saveKey, save, deps);
    if (!persisted) {
      system._lastSaveError = new Error(`[SaveSystem] run ${SAVE_ERROR_QUEUED}`);
      return { status: 'queued', persisted: false, queueDepth: system.getOutboxSize(deps) };
    }
    system._lastSaveError = null;
    return { status: 'saved', persisted: true, queueDepth: system.getOutboxSize(deps) };
  } catch (error) {
    Logger.error('[SaveSystem] Run save failed:', error?.name, error?.message);
    system._lastSaveError = error;
    return { status: 'error', persisted: false, queueDepth: system.getOutboxSize(deps), error };
  }
}

export function loadRunForSystem(system, deps = {}) {
  const gs = getGS(deps);
  if (!gs) return false;
  const slot = system.resolveSlot(deps);
  syncActiveSaveSlot(gs, slot);

  const data = system._readRunSaveData({ slot });
  if (!data) return false;

  hydrateRunState(gs, data);
  return true;
}

export function hasSaveForSystem(system, deps = {}) {
  return !!system._readRunSaveData({ ...deps, logErrors: false });
}

export function readRunPreviewForSystem(system, deps = {}) {
  const slot = system.resolveSlot(deps);
  const previewRecord = system._readRunSaveRecord({ slot, logErrors: false });
  const preview = previewRecord?.data || null;
  if (!preview) return null;

  const meta = system._readMetaSaveData({ slot, logErrors: false });
  const nextPreview = {
    ...preview,
    saveState: previewRecord?.saveState || 'saved',
  };
  return meta ? { ...nextPreview, meta } : nextPreview;
}

export function readMetaPreviewForSystem(system, deps = {}) {
  return system._readMetaSaveData({ ...deps, logErrors: false });
}

export function readRunSaveDataForSystem(system, { logErrors = true, ...deps } = {}) {
  return system._readRunSaveRecord({ ...deps, logErrors })?.data || null;
}

export function readRunSaveRecordForSystem(system, { logErrors = true, ...deps } = {}) {
  system._ensureOutboxLoaded(deps);
  const { saveKey } = system._getSlotKeys(system.resolveSlot(deps));
  return readRunSaveRecord({
    outbox: system._outbox,
    saveAdapter: getSaveAdapter(deps),
    saveKey,
    logErrors,
    isUnsupportedFutureVersion: isUnsupportedFutureRunSave,
    migrateSave: migrateRunSave,
    validateSaveData: (data) => system.validateSaveData(data),
    dropOutboxKey: (key) => system._dropOutboxKey(key, deps),
    removePersistedKey: (key) => getSaveAdapter(deps)?.remove?.(key),
    logWarn: (message) => Logger.warn(message),
    logError: (...args) => Logger.error(...args),
  });
}

export function readMetaSaveDataForSystem(system, { logErrors = true, ...deps } = {}) {
  system._ensureOutboxLoaded(deps);
  const { metaKey } = system._getSlotKeys(system.resolveSlot(deps));
  return readMetaSaveData({
    outbox: system._outbox,
    saveAdapter: getSaveAdapter(deps),
    metaKey,
    logErrors,
    isUnsupportedFutureVersion: isUnsupportedFutureMetaSave,
    migrateSave: migrateMetaSave,
    ensureMetaRunConfig,
    dropOutboxKey: (key) => system._dropOutboxKey(key, deps),
    removePersistedKey: (key) => getSaveAdapter(deps)?.remove?.(key),
    logWarn: (message) => Logger.warn(message),
    logError: (...args) => Logger.error(...args),
  });
}

export function clearQueuedRunSaveErrorIfRecovered(system) {
  if (!system._outbox.some((entry) => isRunSaveStorageKey(system.SAVE_KEY, entry.key)) && isQueuedRunSaveError(system._lastSaveError)) {
    system._lastSaveError = null;
  }
}
