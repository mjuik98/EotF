import { SaveAdapter } from '../../platform/storage/save_adapter.js';
import { Logger } from '../../utils/logger.js';
import { META_SAVE_VERSION, RUN_SAVE_VERSION, migrateMetaSave, migrateRunSave } from '../../systems/save_migrations.js';
import {
  buildMetaSave,
  buildRunSave,
  ensureMetaRunConfig,
  getDoc,
  getGS,
  hydrateMetaState,
  hydrateRunState,
  validateRunSaveData,
} from '../../systems/save/save_repository.js';
import { createOutboxMetrics, summarizeOutboxMetrics } from '../../systems/save/save_outbox_metrics.js';
import {
  clearOutboxTimer,
  dropOutboxKey,
  flushOutboxQueue,
  OUTBOX_RETRY_BASE_MS,
  OUTBOX_RETRY_MAX_MS,
  persistWithOutbox,
  scheduleOutboxFlush,
  upsertOutboxEntry,
} from '../../systems/save/save_outbox_queue.js';

const SAVE_KEY = 'echo_fallen_save';
const META_KEY = 'echo_fallen_meta';
const SAVE_ERROR_QUEUED = 'persist queued in outbox';

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
    return persistWithOutbox(this, key, payload, {
      save: (saveKey, snapshot) => SaveAdapter.save(saveKey, snapshot),
      logWarn: (message) => Logger.warn(message),
    });
  },

  _dropOutboxKey(key) {
    dropOutboxKey(this, key);
  },

  flushOutbox() {
    return flushOutboxQueue(this, {
      save: (key, payload) => SaveAdapter.save(key, payload),
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

    try {
      const raw = SaveAdapter.load(this.META_KEY);
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

    try {
      const raw = SaveAdapter.load(this.SAVE_KEY);
      const data = migrateRunSave(raw);
      if (!data) return false;

      if (!this.validateSaveData(data)) {
        Logger.error('[SaveSystem] Save data validation failed');
        return false;
      }

      hydrateRunState(gs, data);
      return true;
    } catch (e) {
      Logger.error('[SaveSystem] Run load failed:', e);
      return false;
    }
  },

  hasSave() {
    return SaveAdapter.has(this.SAVE_KEY);
  },

  clearSave() {
    SaveAdapter.remove(this.SAVE_KEY);
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
