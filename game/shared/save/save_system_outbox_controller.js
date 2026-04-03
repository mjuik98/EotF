import { Logger } from '../logging/logger.js';
import { getSaveStorage } from './save_storage.js';
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

function getSaveAdapter() {
  return getSaveStorage();
}

export const saveSystemOutboxController = {
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
    clearQueuedRunSaveErrorIfRecovered(this);
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
};
