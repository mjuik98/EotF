import { Logger } from '../../utils/logger.js';
import { presentSaveStatus } from './save_status_presenter.js';
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
  cloneSnapshot,
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

const SAVE_KEY = 'echo_fallen_save';
const META_KEY = 'echo_fallen_meta';
const OUTBOX_KEY = 'echo_fallen_outbox';
const SAVE_ERROR_QUEUED = 'persist queued in outbox';

function getSaveAdapter() {
  return getSaveStorage();
}

function isQueuedRunSaveError(error) {
  return error?.message === `[SaveSystem] run ${SAVE_ERROR_QUEUED}`;
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
      this._outbox = this._normalizeOutboxEntries(raw);
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

    const nextAttemptAt = this._outbox.reduce((soonest, entry) => (
      Math.min(soonest, Number.isFinite(entry.nextAttemptAt) ? entry.nextAttemptAt : Date.now())
    ), Number.POSITIVE_INFINITY);
    this._scheduleOutboxFlush(Math.max(0, nextAttemptAt - Date.now()));
  },

  _normalizeOutboxEntries(raw) {
    if (!Array.isArray(raw)) return [];

    return raw.flatMap((entry) => {
      if (!entry || typeof entry.key !== 'string' || !Object.prototype.hasOwnProperty.call(entry, 'data')) {
        return [];
      }

      return [{
        key: entry.key,
        data: cloneSnapshot(entry.data),
        attempts: Math.max(0, Math.floor(Number(entry.attempts) || 0)),
        createdAt: Number.isFinite(Number(entry.createdAt))
          ? Number(entry.createdAt)
          : Date.now(),
        updatedAt: Number.isFinite(Number(entry.updatedAt))
          ? Number(entry.updatedAt)
          : Number.isFinite(Number(entry.createdAt))
            ? Number(entry.createdAt)
            : Date.now(),
        nextAttemptAt: Number.isFinite(Number(entry.nextAttemptAt))
          ? Number(entry.nextAttemptAt)
          : Date.now(),
      }];
    });
  },

  _pruneExpiredOutboxEntries() {
    if (!Array.isArray(this._outbox) || this._outbox.length === 0) return false;

    const nextOutbox = this._outbox.filter((entry) => !isOutboxEntryExpired(entry));
    if (nextOutbox.length === this._outbox.length) return false;

    this._outbox = nextOutbox;
    return true;
  },

  _persistOutbox() {
    const saveAdapter = getSaveAdapter();
    if (!this._outbox.length) {
      saveAdapter?.remove?.(this.OUTBOX_KEY);
      return true;
    }

    const snapshot = this._outbox.map((entry) => ({
      key: entry.key,
      data: cloneSnapshot(entry.data),
      attempts: Math.max(0, Math.floor(Number(entry.attempts) || 0)),
      createdAt: Number.isFinite(Number(entry.createdAt))
        ? Number(entry.createdAt)
        : Date.now(),
      updatedAt: Number.isFinite(Number(entry.updatedAt))
        ? Number(entry.updatedAt)
        : Number.isFinite(Number(entry.createdAt))
          ? Number(entry.createdAt)
          : Date.now(),
      nextAttemptAt: Number.isFinite(Number(entry.nextAttemptAt))
        ? Number(entry.nextAttemptAt)
        : Date.now(),
    }));
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
    if (!this._outbox.some((entry) => entry.key === this.SAVE_KEY) && isQueuedRunSaveError(this._lastSaveError)) {
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

    try {
      const meta = buildMetaSave(gs, META_SAVE_VERSION);
      const persisted = this._persistWithOutbox(this.META_KEY, meta);
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

    try {
      const data = this._readMetaSaveData({ logErrors: false });
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

    ensureMetaRunConfig(gs.meta);
  },

  validateSaveData(data) {
    return validateRunSaveData(data);
  },

  saveRun(deps = {}) {
    const gs = getGS(deps);
    if (!gs?.player) return { status: 'skipped', persisted: false, reason: 'missing-player', queueDepth: this.getOutboxSize() };

    const isGameStarted = typeof deps.isGameStarted === 'function' ? deps.isGameStarted() : true;
    if (!isGameStarted) return { status: 'skipped', persisted: false, reason: 'game-not-started', queueDepth: this.getOutboxSize() };
    if (gs.combat?.active) return { status: 'skipped', persisted: false, reason: 'combat-active', queueDepth: this.getOutboxSize() };

    try {
      const save = buildRunSave(gs, RUN_SAVE_VERSION);
      const persisted = this._persistWithOutbox(this.SAVE_KEY, save);
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

    const data = this._readRunSaveData();
    if (!data) return false;

    hydrateRunState(gs, data);
    return true;
  },

  hasSave() {
    return !!this._readRunSaveData({ logErrors: false });
  },

  readRunPreview() {
    const previewRecord = this._readRunSaveRecord({ logErrors: false });
    const preview = previewRecord?.data || null;
    if (!preview) return null;

    const meta = this._readMetaSaveData({ logErrors: false });
    const nextPreview = {
      ...preview,
      saveState: previewRecord?.saveState || 'saved',
    };
    return meta ? { ...nextPreview, meta } : nextPreview;
  },

  _readRunSaveData({ logErrors = true } = {}) {
    return this._readRunSaveRecord({ logErrors })?.data || null;
  },

  _sanitizeLoadedSaveEntry(raw, {
    key,
    label,
    logErrors = true,
    isUnsupportedFutureVersion = () => false,
    queued = false,
  } = {}) {
    if (!raw) return null;
    if (!isUnsupportedFutureVersion(raw)) return raw;

    if (queued) {
      this._dropOutboxKey(key);
    } else {
      getSaveAdapter()?.remove?.(key);
    }

    if (logErrors) {
      Logger.warn(`[SaveSystem] Dropped unsupported future-version ${queued ? 'queued ' : ''}${label} save.`);
    }
    return null;
  },

  _readRunSaveRecord({ logErrors = true } = {}) {
    this._ensureOutboxLoaded();
    const saveAdapter = getSaveAdapter();

    try {
      const raw = this._sanitizeLoadedSaveEntry(saveAdapter?.load?.(this.SAVE_KEY) || null, {
        key: this.SAVE_KEY,
        label: 'run',
        logErrors,
        isUnsupportedFutureVersion: isUnsupportedFutureRunSave,
      });
      const queued = this._sanitizeLoadedSaveEntry(
        this._outbox.find((entry) => entry.key === this.SAVE_KEY)?.data || null,
        {
          key: this.SAVE_KEY,
          label: 'run',
          logErrors,
          isUnsupportedFutureVersion: isUnsupportedFutureRunSave,
          queued: true,
        },
      );
      const saveState = raw ? 'saved' : (queued ? 'queued' : null);
      const data = migrateRunSave(raw || queued);
      if (!data) return null;

      if (!this.validateSaveData(data)) {
        if (logErrors) Logger.error('[SaveSystem] Save data validation failed');
        return null;
      }

      return {
        data,
        saveState,
      };
    } catch (e) {
      if (logErrors) Logger.error('[SaveSystem] Run load failed:', e);
      return null;
    }
  },

  _readMetaSaveData({ logErrors = true } = {}) {
    this._ensureOutboxLoaded();
    const saveAdapter = getSaveAdapter();

    try {
      const raw = this._sanitizeLoadedSaveEntry(saveAdapter?.load?.(this.META_KEY) || null, {
        key: this.META_KEY,
        label: 'meta',
        logErrors,
        isUnsupportedFutureVersion: isUnsupportedFutureMetaSave,
      });
      const queued = this._sanitizeLoadedSaveEntry(
        this._outbox.find((entry) => entry.key === this.META_KEY)?.data || null,
        {
          key: this.META_KEY,
          label: 'meta',
          logErrors,
          isUnsupportedFutureVersion: isUnsupportedFutureMetaSave,
          queued: true,
        },
      );
      const data = migrateMetaSave(raw || queued);
      if (!data) return null;

      ensureMetaRunConfig(data);
      return data;
    } catch (e) {
      if (logErrors) Logger.error('[SaveSystem] Meta preview load failed:', e);
      return null;
    }
  },

  clearSave() {
    getSaveAdapter()?.remove?.(this.SAVE_KEY);
    this._dropOutboxKey(this.SAVE_KEY);
  },

  showSaveStatus(status, deps = {}) {
    return presentSaveStatus(status, deps);
  },

  showSaveBadge(deps = {}) {
    return presentSaveStatus({
      status: 'saved',
      persisted: true,
      queueDepth: 0,
    }, deps);
  },
};
