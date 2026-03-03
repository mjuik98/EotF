import { normalizeEventPayload, validateEventPayload } from './event_contracts.js';
import { AppConfig } from './app_config.js';
import { ErrorCodes, ErrorSeverity } from './error_codes.js';
import { reportError } from './error_reporter.js';
import { recordRuntimeEvent } from './runtime_metrics.js';
import { Logger } from '../utils/logger.js';

class GameEventBus {
  constructor() {
    /** @type {Map<string, Set<Function>>} */
    this._listeners = new Map();
    /** @type {Array<{event: string, data: any, timestamp: number}>} */
    this._history = [];
    this._historyMax = AppConfig.eventHistoryMax;
    /** @type {Map<string, number>} */
    this._dedupeSeenAt = new Map();
    /** @type {boolean} */
    this._debug = false;
  }

  on(event, callback) {
    if (!this._listeners.has(event)) {
      this._listeners.set(event, new Set());
    }
    this._listeners.get(event).add(callback);
    return () => this.off(event, callback);
  }

  once(event, callback) {
    const wrapper = (data) => {
      this.off(event, wrapper);
      callback(data);
    };
    return this.on(event, wrapper);
  }

  off(event, callback) {
    const set = this._listeners.get(event);
    if (set) {
      set.delete(callback);
      if (set.size === 0) this._listeners.delete(event);
    }
  }

  _isDuplicate(event, dedupeKey, dedupeWindowMs) {
    if (!dedupeKey) return false;
    const key = `${event}|${dedupeKey}`;
    const now = Date.now();
    const prev = this._dedupeSeenAt.get(key);
    this._dedupeSeenAt.set(key, now);

    // Opportunistic cleanup to avoid unbounded growth.
    for (const [cacheKey, timestamp] of this._dedupeSeenAt.entries()) {
      if (now - timestamp > dedupeWindowMs * 2) this._dedupeSeenAt.delete(cacheKey);
    }

    return typeof prev === 'number' && now - prev <= dedupeWindowMs;
  }

  emit(event, data = null, options = {}) {
    const dedupeWindowMs =
      typeof options.dedupeWindowMs === 'number'
        ? Math.max(0, options.dedupeWindowMs)
        : AppConfig.eventDedupeWindowMs;

    if (this._isDuplicate(event, options.dedupeKey, dedupeWindowMs)) {
      Logger.debug(`[EventBus] Skipped duplicate event: ${event} (${options.dedupeKey})`);
      return false;
    }

    const normalized = normalizeEventPayload(event, data);
    const contractIssues = validateEventPayload(event, normalized);

    if (contractIssues.length > 0 && AppConfig.strictEventContracts) {
      reportError(`Contract mismatch for '${event}'`, {
        code: ErrorCodes.EVENT_CONTRACT_MISMATCH,
        severity: ErrorSeverity.WARN,
        context: 'EventBus.emit',
        meta: { event, issues: contractIssues },
      });
    }

    if (this._debug) {
      Logger.debug(`[EventBus] ${event}`, normalized);
    }

    recordRuntimeEvent(event);
    this._history.push({ event, data: normalized, timestamp: Date.now() });
    if (this._history.length > this._historyMax) this._history.shift();

    const set = this._listeners.get(event);
    if (set) {
      set.forEach((cb) => {
        try {
          cb(normalized);
        } catch (err) {
          reportError(err, {
            code: ErrorCodes.EVENT_LISTENER_FAILED,
            severity: ErrorSeverity.ERROR,
            context: 'EventBus.emit.listener',
            meta: { event },
          });
        }
      });
    }

    const wildcard = this._listeners.get('*');
    if (wildcard) {
      wildcard.forEach((cb) => {
        try {
          cb({ event, data: normalized });
        } catch {
          // Ignore wildcard callback errors by design.
        }
      });
    }

    return true;
  }

  clear(event) {
    if (event) {
      this._listeners.delete(event);
    } else {
      this._listeners.clear();
    }
  }

  setDebug(enabled) {
    this._debug = enabled;
  }

  getHistory(filter) {
    if (!filter) return [...this._history];
    return this._history.filter((h) => h.event.includes(filter));
  }
}

export const EventBus = new GameEventBus();
