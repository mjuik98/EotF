import { Logger } from '../../utils/logger.js';
import { META_SAVE_VERSION, RUN_SAVE_VERSION, migrateMetaSave, migrateRunSave } from './save_migrations.js';
import { getSaveStorage } from './save_storage.js';
import {
  buildMetaSave,
  buildRunSave,
  ensureMetaRunConfig,
  getDoc,
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
  OUTBOX_RETRY_BASE_MS,
  OUTBOX_RETRY_MAX_MS,
  persistWithOutbox,
  scheduleOutboxFlush,
  upsertOutboxEntry,
} from './save_outbox_queue.js';

const SAVE_KEY = 'echo_fallen_save';
const META_KEY = 'echo_fallen_meta';
const SAVE_ERROR_QUEUED = 'persist queued in outbox';

function getSaveAdapter() {
  return getSaveStorage();
}

export const SaveSystem = {
  SAVE_KEY,
  META_KEY,
  OUTBOX_RETRY_BASE_MS,
  OUTBOX_RETRY_MAX_MS,
  _outbox: [],
  _outboxTimer: null,
  _outboxTimerAt: 0,
  _isFlushingOutbox: false,
  _outboxMetrics: createOutboxMetrics(),

  _clearOutboxTimer() {
    clearOutboxTimer(this);
  },

  _scheduleOutboxFlush(delayMs = OUTBOX_RETRY_BASE_MS) {
    scheduleOutboxFlush(this, () => this.flushOutbox(), delayMs);
  },

  _upsertOutboxEntry(key, payload) {
    upsertOutboxEntry(this, key, payload);
  },

  _persistWithOutbox(key, payload) {
    const saveAdapter = getSaveAdapter();
    return persistWithOutbox(this, key, payload, {
      save: (saveKey, snapshot) => saveAdapter?.save?.(saveKey, snapshot) || false,
      logWarn: (message) => Logger.warn(message),
    });
  },

  _dropOutboxKey(key) {
    dropOutboxKey(this, key);
  },

  flushOutbox() {
    const saveAdapter = getSaveAdapter();
    return flushOutboxQueue(this, {
      save: (key, payload) => saveAdapter?.save?.(key, payload) || false,
    });
  },

  getOutboxSize() {
    return this._outbox.length;
  },

  getOutboxMetrics() {
    return summarizeOutboxMetrics(this._outboxMetrics, this._outbox);
  },

  resetOutboxMetrics() {
    this._outboxMetrics = createOutboxMetrics();
  },

  clearOutbox() {
    this._outbox = [];
    this._clearOutboxTimer();
  },

  saveMeta(deps = {}) {
    const gs = getGS(deps);
    if (!gs?.meta) return;

    try {
      const meta = buildMetaSave(gs, META_SAVE_VERSION);
      const persisted = this._persistWithOutbox(this.META_KEY, meta);
      if (!persisted) {
        this._lastSaveError = new Error(`[SaveSystem] meta ${SAVE_ERROR_QUEUED}`);
      }
    } catch (e) {
      Logger.error('[SaveSystem] Meta save failed:', e?.name, e?.message);
      this._lastSaveError = e;
    }
  },

  loadMeta(deps = {}) {
    const gs = getGS(deps);
    if (!gs?.meta) return;
    const saveAdapter = getSaveAdapter();

    try {
      const raw = saveAdapter?.load?.(this.META_KEY) || null;
      const data = migrateMetaSave(raw);
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
    if (!gs?.player) return;

    const isGameStarted = typeof deps.isGameStarted === 'function' ? deps.isGameStarted() : true;
    if (!isGameStarted) return;
    if (gs.combat?.active) return;

    try {
      const save = buildRunSave(gs, RUN_SAVE_VERSION);
      const persisted = this._persistWithOutbox(this.SAVE_KEY, save);
      if (!persisted) {
        this._lastSaveError = new Error(`[SaveSystem] run ${SAVE_ERROR_QUEUED}`);
      }
    } catch (e) {
      Logger.error('[SaveSystem] Run save failed:', e?.name, e?.message);
      this._lastSaveError = e;
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

  _readRunSaveData({ logErrors = true } = {}) {
    const saveAdapter = getSaveAdapter();

    try {
      const raw = saveAdapter?.load?.(this.SAVE_KEY) || null;
      const data = migrateRunSave(raw);
      if (!data) return null;

      if (!this.validateSaveData(data)) {
        if (logErrors) Logger.error('[SaveSystem] Save data validation failed');
        return null;
      }

      return data;
    } catch (e) {
      if (logErrors) Logger.error('[SaveSystem] Run load failed:', e);
      return null;
    }
  },

  clearSave() {
    getSaveAdapter()?.remove?.(this.SAVE_KEY);
    this._dropOutboxKey(this.SAVE_KEY);
  },

  showSaveBadge(deps = {}) {
    const doc = getDoc(deps);
    if (!doc?.body) return;

    const el = doc.createElement('div');
    el.style.cssText = 'position:fixed;bottom:24px;right:24px;font-family:\'Share Tech Mono\',monospace;font-size:10px;color:rgba(0,255,204,0.6);z-index:1000;pointer-events:none;animation:fadeIn 0.3s ease both;';
    el.textContent = 'Saved';
    doc.body.appendChild(el);
    setTimeout(() => el.remove(), 1800);
  },
};
