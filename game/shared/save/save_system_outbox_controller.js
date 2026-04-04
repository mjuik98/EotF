import { Logger } from '../logging/logger.js';
import { getSaveStorage } from './save_runtime_context.js';
import { createOutboxMetrics, summarizeOutboxMetrics } from './save_outbox_metrics.js';
import {
  clearOutboxTimer,
  dropOutboxKey,
  flushOutboxQueue,
  isOutboxEntryExpired,
  OUTBOX_RETRY_BASE_MS,
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
import { clearQueuedRunSaveErrorIfRecovered } from './save_system_io.js';

function getSaveAdapter(deps = {}) {
  return getSaveStorage(deps);
}

export const saveSystemOutboxController = {
  _ensureOutboxLoaded(deps = {}) {
    if (this._outboxLoaded) return;
    if (Array.isArray(this._outbox) && this._outbox.length > 0) {
      this._outboxLoaded = true;
      return;
    }

    const saveAdapter = getSaveAdapter(deps);
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
      this._persistOutbox(deps);
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

  _persistOutbox(deps = {}) {
    const saveAdapter = getSaveAdapter(deps);
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

  _upsertOutboxEntry(key, payload, deps = {}) {
    this._ensureOutboxLoaded(deps);
    upsertOutboxEntry(this, key, payload);
    this._persistOutbox(deps);
  },

  _persistWithOutbox(key, payload, deps = {}) {
    this._ensureOutboxLoaded(deps);
    const saveAdapter = getSaveAdapter(deps);
    const persisted = persistWithOutbox(this, key, payload, {
      save: (saveKey, snapshot) => saveAdapter?.save?.(saveKey, snapshot) || false,
      logWarn: (message) => Logger.warn(message),
    });
    if (!persisted) {
      this._persistOutbox(deps);
    }
    return persisted;
  },

  _dropOutboxKey(key, deps = {}) {
    this._ensureOutboxLoaded(deps);
    dropOutboxKey(this, key);
    this._persistOutbox(deps);
  },

  flushOutbox(deps = {}) {
    this._ensureOutboxLoaded(deps);
    if (this._pruneExpiredOutboxEntries()) {
      this._persistOutbox(deps);
    }
    const saveAdapter = getSaveAdapter(deps);
    const remaining = flushOutboxQueue(this, {
      save: (key, payload) => saveAdapter?.save?.(key, payload) || false,
    });
    this._persistOutbox(deps);
    clearQueuedRunSaveErrorIfRecovered(this);
    return remaining;
  },

  getOutboxSize(deps = {}) {
    this._ensureOutboxLoaded(deps);
    return this._outbox.length;
  },

  getOutboxMetrics(deps = {}) {
    this._ensureOutboxLoaded(deps);
    return summarizeOutboxMetrics(this._outboxMetrics, this._outbox);
  },

  resetOutboxMetrics() {
    this._outboxMetrics = createOutboxMetrics();
  },

  clearOutbox(deps = {}) {
    this._outbox = [];
    this._outboxLoaded = true;
    this._clearOutboxTimer();
    getSaveAdapter(deps)?.remove?.(this.OUTBOX_KEY);
  },
};
