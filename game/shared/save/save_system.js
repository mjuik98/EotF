import { Logger } from '../../utils/logger.js';
import {
  META_SAVE_VERSION,
  RUN_SAVE_VERSION,
  isUnsupportedFutureMetaSave,
  isUnsupportedFutureRunSave,
  migrateMetaSave,
  migrateRunSave,
} from './save_migrations.js';
import { getSaveStorage } from './save_storage.js';
import {
  buildMetaSave,
  buildRunSave,
  ensureMetaRunConfig,
  getGS,
  hydrateMetaState,
  hydrateRunState,
  validateRunSaveData,
} from './save_repository.js';
import { createOutboxMetrics, summarizeOutboxMetrics } from './save_outbox_metrics.js';
import {
  clearOutboxTimer,
  dropOutboxKey,
  flushOutboxQueue,
  isOutboxEntryExpired,
  OUTBOX_ENTRY_TTL_MS,
  OUTBOX_RETRY_BASE_MS,
  OUTBOX_RETRY_MAX_MS,
  persistWithOutbox,
  scheduleOutboxFlush,
  upsertOutboxEntry,
} from './save_outbox_queue.js';
import {
  computeNextOutboxFlushDelay,
  createOutboxPersistedSnapshot,
  normalizeOutboxEntries,
  pruneExpiredOutboxEntries,
} from './save_outbox_state.js';
import {
  readMetaSaveData,
  readRunSaveRecord,
} from './save_readers.js';
import { getSaveNotifications } from './save_notifications.js';

const SAVE_KEY = 'echo_fallen_save';
const META_KEY = 'echo_fallen_meta';
const OUTBOX_KEY = 'echo_fallen_outbox';
const SAVE_ERROR_QUEUED = 'persist queued in outbox';
const DEFAULT_SAVE_SLOT = 1;
const SAVE_SLOT_COUNT = 3;
const SAVE_BUNDLE_SCHEMA_VERSION = 1;

function normalizeSaveSlot(slot) {
  const resolved = Number(slot);
  if (!Number.isInteger(resolved) || resolved < 1) return DEFAULT_SAVE_SLOT;
  return resolved;
}

function buildSlotKey(baseKey, slot) {
  const normalizedSlot = normalizeSaveSlot(slot);
  if (normalizedSlot === DEFAULT_SAVE_SLOT) return baseKey;
  return `${baseKey}_slot${normalizedSlot}`;
}

function hasExplicitSlot(options = {}) {
  return Object.prototype.hasOwnProperty.call(options || {}, 'slot');
}

function isRunSaveStorageKey(baseKey, key) {
  const value = String(key || '');
  return value === baseKey || value.startsWith(`${baseKey}_slot`);
}

function syncActiveSaveSlot(gs, slot) {
  if (!gs?.meta) return;
  Object.assign(gs.meta, { activeSaveSlot: normalizeSaveSlot(slot) });
}

function getSaveAdapter() {
  return getSaveStorage();
}

function isQueuedRunSaveError(error) {
  return error?.message === `[SaveSystem] run ${SAVE_ERROR_QUEUED}`;
}

function resolveSaveStatusNotifier(deps = {}) {
  if (typeof deps.notifySaveStatus === 'function') return deps.notifySaveStatus;
  if (typeof deps.presentSaveStatus === 'function') return deps.presentSaveStatus;
  return getSaveNotifications().saveStatus;
}

export const SaveSystem = {
  SAVE_KEY,
  META_KEY,
  OUTBOX_KEY,
  OUTBOX_ENTRY_TTL_MS,
  OUTBOX_RETRY_BASE_MS,
  OUTBOX_RETRY_MAX_MS,
  _outbox: [],
  _outboxLoaded: false,
  _outboxTimer: null,
  _outboxTimerAt: 0,
  _isFlushingOutbox: false,
  _outboxMetrics: createOutboxMetrics(),
  _selectedSlot: DEFAULT_SAVE_SLOT,

  resolveSlot(deps = {}) {
    return normalizeSaveSlot(
      deps?.slot
      ?? deps?.gs?.meta?.activeSaveSlot
      ?? this._selectedSlot
      ?? DEFAULT_SAVE_SLOT,
    );
  },

  _getSlotKeys(slot) {
    const resolvedSlot = normalizeSaveSlot(slot);
    return {
      slot: resolvedSlot,
      saveKey: buildSlotKey(this.SAVE_KEY, resolvedSlot),
      metaKey: buildSlotKey(this.META_KEY, resolvedSlot),
    };
  },

  _ensureOutboxLoaded() {
    if (this._outboxLoaded) return;
    if (Array.isArray(this._outbox) && this._outbox.length > 0) {
      this._outboxLoaded = true;
      return;
    }

    const saveAdapter = getSaveAdapter();
    this._outboxLoaded = true;

    try {
      const raw = saveAdapter?.load?.(this.OUTBOX_KEY);
      this._outbox = normalizeOutboxEntries(raw);
    } catch (error) {
      Logger.warn('[SaveSystem] Outbox load failed:', error?.message || error);
      this._outbox = [];
    }

    const prunedStaleEntries = this._pruneExpiredOutboxEntries();
    if (prunedStaleEntries) {
      Logger.warn(`[SaveSystem] Dropped stale queued saves older than ${this.OUTBOX_ENTRY_TTL_MS}ms.`);
      this._persistOutbox();
    }

    if (!this._outbox.length) return;

    this._scheduleOutboxFlush(computeNextOutboxFlushDelay(this._outbox) ?? this.OUTBOX_RETRY_BASE_MS);
  },

  _normalizeOutboxEntries(raw) {
    return normalizeOutboxEntries(raw);
  },

  _pruneExpiredOutboxEntries() {
    const result = pruneExpiredOutboxEntries(this._outbox, { isExpired: isOutboxEntryExpired });
    this._outbox = result.entries;
    return result.changed;
  },

  _persistOutbox() {
    const saveAdapter = getSaveAdapter();
    if (!this._outbox.length) {
      saveAdapter?.remove?.(this.OUTBOX_KEY);
      return true;
    }

    const snapshot = createOutboxPersistedSnapshot(this._outbox);
    const persisted = saveAdapter?.save?.(this.OUTBOX_KEY, snapshot);
    if (!persisted) {
      Logger.warn('[SaveSystem] Failed to persist the save outbox.');
    }
    return !!persisted;
  },

  _clearOutboxTimer() {
    clearOutboxTimer(this);
  },

  _scheduleOutboxFlush(delayMs = OUTBOX_RETRY_BASE_MS) {
    scheduleOutboxFlush(this, () => this.flushOutbox(), delayMs);
  },

  _upsertOutboxEntry(key, payload) {
    this._ensureOutboxLoaded();
    upsertOutboxEntry(this, key, payload);
    this._persistOutbox();
  },

  _persistWithOutbox(key, payload) {
    this._ensureOutboxLoaded();
    const saveAdapter = getSaveAdapter();
    const persisted = persistWithOutbox(this, key, payload, {
      save: (saveKey, snapshot) => saveAdapter?.save?.(saveKey, snapshot) || false,
      logWarn: (message) => Logger.warn(message),
    });
    if (!persisted) {
      this._persistOutbox();
    }
    return persisted;
  },

  _dropOutboxKey(key) {
    this._ensureOutboxLoaded();
    dropOutboxKey(this, key);
    this._persistOutbox();
  },

  flushOutbox() {
    this._ensureOutboxLoaded();
    if (this._pruneExpiredOutboxEntries()) {
      this._persistOutbox();
    }
    const saveAdapter = getSaveAdapter();
    const remaining = flushOutboxQueue(this, {
      save: (key, payload) => saveAdapter?.save?.(key, payload) || false,
    });
    this._persistOutbox();
    if (!this._outbox.some((entry) => isRunSaveStorageKey(this.SAVE_KEY, entry.key)) && isQueuedRunSaveError(this._lastSaveError)) {
      this._lastSaveError = null;
    }
    return remaining;
  },

  getOutboxSize() {
    this._ensureOutboxLoaded();
    return this._outbox.length;
  },

  getOutboxMetrics() {
    this._ensureOutboxLoaded();
    return summarizeOutboxMetrics(this._outboxMetrics, this._outbox);
  },

  resetOutboxMetrics() {
    this._outboxMetrics = createOutboxMetrics();
  },

  clearOutbox() {
    this._outbox = [];
    this._outboxLoaded = true;
    this._clearOutboxTimer();
    getSaveAdapter()?.remove?.(this.OUTBOX_KEY);
  },

  saveMeta(deps = {}) {
    const gs = getGS(deps);
    if (!gs?.meta) return;
    const { slot, metaKey } = this._getSlotKeys(this.resolveSlot(deps));
    syncActiveSaveSlot(gs, slot);

    try {
      const meta = buildMetaSave(gs, META_SAVE_VERSION);
      if (meta) meta.activeSaveSlot = slot;
      const persisted = this._persistWithOutbox(metaKey, meta);
      if (!persisted) {
        this._lastSaveError = new Error(`[SaveSystem] meta ${SAVE_ERROR_QUEUED}`);
        return { status: 'queued', persisted: false, queueDepth: this.getOutboxSize() };
      }
      return { status: 'saved', persisted: true, queueDepth: this.getOutboxSize() };
    } catch (e) {
      Logger.error('[SaveSystem] Meta save failed:', e?.name, e?.message);
      this._lastSaveError = e;
      return { status: 'error', persisted: false, queueDepth: this.getOutboxSize(), error: e };
    }
  },

  loadMeta(deps = {}) {
    const gs = getGS(deps);
    if (!gs?.meta) return;
    const slot = this.resolveSlot(deps);
    syncActiveSaveSlot(gs, slot);

    try {
      const data = this._readMetaSaveData({ slot, logErrors: false });
      if (data) {
        hydrateMetaState(gs, data);
      }
    } catch (e) {
      Logger.warn('[SaveSystem] Meta load failed:', e.message);
    }

    const runRules = deps.runRules;
    try {
      runRules?.ensureMeta?.(gs.meta);
    } catch (e) {
      Logger.warn('[SaveSystem] RunRules.ensureMeta failed:', e.message);
    }

    syncActiveSaveSlot(gs, slot);
    ensureMetaRunConfig(gs.meta);
  },

  validateSaveData(data) {
    return validateRunSaveData(data);
  },

  saveRun(deps = {}) {
    const gs = getGS(deps);
    if (!gs?.player) return { status: 'skipped', persisted: false, reason: 'missing-player', queueDepth: this.getOutboxSize() };
    const { slot, saveKey } = this._getSlotKeys(this.resolveSlot(deps));
    syncActiveSaveSlot(gs, slot);

    const isGameStarted = typeof deps.isGameStarted === 'function' ? deps.isGameStarted() : true;
    if (!isGameStarted) return { status: 'skipped', persisted: false, reason: 'game-not-started', queueDepth: this.getOutboxSize() };
    if (gs.combat?.active) return { status: 'skipped', persisted: false, reason: 'combat-active', queueDepth: this.getOutboxSize() };

    try {
      const save = buildRunSave(gs, RUN_SAVE_VERSION);
      const persisted = this._persistWithOutbox(saveKey, save);
      if (!persisted) {
        this._lastSaveError = new Error(`[SaveSystem] run ${SAVE_ERROR_QUEUED}`);
        return { status: 'queued', persisted: false, queueDepth: this.getOutboxSize() };
      }
      this._lastSaveError = null;
      return { status: 'saved', persisted: true, queueDepth: this.getOutboxSize() };
    } catch (e) {
      Logger.error('[SaveSystem] Run save failed:', e?.name, e?.message);
      this._lastSaveError = e;
      return { status: 'error', persisted: false, queueDepth: this.getOutboxSize(), error: e };
    }
  },

  loadRun(deps = {}) {
    const gs = getGS(deps);
    if (!gs) return false;
    const slot = this.resolveSlot(deps);
    syncActiveSaveSlot(gs, slot);

    const data = this._readRunSaveData({ slot });
    if (!data) return false;

    hydrateRunState(gs, data);
    return true;
  },

  hasSave(deps = {}) {
    return !!this._readRunSaveData({ ...deps, logErrors: false });
  },

  readRunPreview(deps = {}) {
    const slot = this.resolveSlot(deps);
    const previewRecord = this._readRunSaveRecord({ slot, logErrors: false });
    const preview = previewRecord?.data || null;
    if (!preview) return null;

    const meta = this._readMetaSaveData({ slot, logErrors: false });
    const nextPreview = {
      ...preview,
      saveState: previewRecord?.saveState || 'saved',
    };
    return meta ? { ...nextPreview, meta } : nextPreview;
  },

  readMetaPreview(deps = {}) {
    return this._readMetaSaveData({ ...deps, logErrors: false });
  },

  getSelectedSlot() {
    return this.resolveSlot();
  },

  selectSlot(slot, deps = {}) {
    const selectedSlot = normalizeSaveSlot(slot);
    this._selectedSlot = selectedSlot;
    syncActiveSaveSlot(deps?.gs, selectedSlot);
    return selectedSlot;
  },

  getSlotSummaries({ slots = null } = {}) {
    const resolvedSlots = Array.isArray(slots) && slots.length
      ? slots.map((slot) => normalizeSaveSlot(slot))
      : Array.from({ length: SAVE_SLOT_COUNT }, (_, index) => index + 1);

    return resolvedSlots.map((slot) => ({
      slot,
      hasSave: this.hasSave({ slot }),
      preview: this.readRunPreview({ slot }),
      meta: this.readMetaPreview({ slot }),
    }));
  },

  exportBundle(deps = {}) {
    const slot = this.resolveSlot(deps);
    return {
      schemaVersion: SAVE_BUNDLE_SCHEMA_VERSION,
      slot,
      exportedAt: Date.now(),
      meta: this.readMetaPreview({ slot }),
      run: this._readRunSaveData({ slot, logErrors: false }),
    };
  },

  importBundle(bundle, deps = {}) {
    if (!bundle || typeof bundle !== 'object') {
      throw new Error('[SaveSystem] Invalid save bundle.');
    }

    const slot = this.resolveSlot(deps);
    const { saveKey, metaKey } = this._getSlotKeys(slot);
    const nextMeta = bundle.meta && typeof bundle.meta === 'object'
      ? { ...bundle.meta, activeSaveSlot: slot }
      : null;
    const nextRun = bundle.run && typeof bundle.run === 'object'
      ? bundle.run
      : null;

    if (nextMeta) this._persistWithOutbox(metaKey, nextMeta);
    if (nextRun) this._persistWithOutbox(saveKey, nextRun);
    this.selectSlot(slot, deps);

    if (deps?.gs?.meta && nextMeta) {
      hydrateMetaState(deps.gs, nextMeta);
      syncActiveSaveSlot(deps.gs, slot);
    }
    return { status: 'imported', slot };
  },

  _readRunSaveData({ logErrors = true, ...deps } = {}) {
    return this._readRunSaveRecord({ ...deps, logErrors })?.data || null;
  },

  _readRunSaveRecord({ logErrors = true, ...deps } = {}) {
    this._ensureOutboxLoaded();
    const { saveKey } = this._getSlotKeys(this.resolveSlot(deps));
    return readRunSaveRecord({
      outbox: this._outbox,
      saveAdapter: getSaveAdapter(),
      saveKey,
      logErrors,
      isUnsupportedFutureVersion: isUnsupportedFutureRunSave,
      migrateSave: migrateRunSave,
      validateSaveData: (data) => this.validateSaveData(data),
      dropOutboxKey: (key) => this._dropOutboxKey(key),
      removePersistedKey: (key) => getSaveAdapter()?.remove?.(key),
      logWarn: (message) => Logger.warn(message),
      logError: (...args) => Logger.error(...args),
    });
  },

  _readMetaSaveData({ logErrors = true, ...deps } = {}) {
    this._ensureOutboxLoaded();
    const { metaKey } = this._getSlotKeys(this.resolveSlot(deps));
    return readMetaSaveData({
      outbox: this._outbox,
      saveAdapter: getSaveAdapter(),
      metaKey,
      logErrors,
      isUnsupportedFutureVersion: isUnsupportedFutureMetaSave,
      migrateSave: migrateMetaSave,
      ensureMetaRunConfig,
      dropOutboxKey: (key) => this._dropOutboxKey(key),
      removePersistedKey: (key) => getSaveAdapter()?.remove?.(key),
      logWarn: (message) => Logger.warn(message),
      logError: (...args) => Logger.error(...args),
    });
  },

  clearSave(options = {}) {
    const { saveKey, metaKey } = this._getSlotKeys(this.resolveSlot(options));
    getSaveAdapter()?.remove?.(saveKey);
    this._dropOutboxKey(saveKey);

    if (hasExplicitSlot(options)) {
      getSaveAdapter()?.remove?.(metaKey);
      this._dropOutboxKey(metaKey);
    }
  },

  showSaveStatus(status, deps = {}) {
    const notifySaveStatus = resolveSaveStatusNotifier(deps);
    if (typeof notifySaveStatus !== 'function') return false;

    const metrics = this.getOutboxMetrics();
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
  },

  showSaveBadge(deps = {}) {
    const notifySaveStatus = resolveSaveStatusNotifier(deps);
    if (typeof notifySaveStatus !== 'function') return false;

    const notified = notifySaveStatus({
      status: 'saved',
      persisted: true,
      queueDepth: 0,
    }, deps);
    return notified !== false;
  },
};
