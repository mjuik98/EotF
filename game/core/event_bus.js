import { normalizeEventPayload, validateEventPayload } from './event_contracts.js';

class GameEventBus {
    constructor() {
        /** @type {Map<string, Set<Function>>} */
        this._listeners = new Map();
        /** @type {Array<{event: string, data: any, timestamp: number}>} */
        this._history = [];
        this._historyMax = 50;
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

    emit(event, data = null) {
        const normalized = normalizeEventPayload(event, data);
        const missing = validateEventPayload(event, normalized);

        if (missing.length > 0) {
            console.warn(`[EventBus] Contract mismatch for '${event}', missing: ${missing.join(', ')}`);
        }

        if (this._debug) {
            console.log(`[EventBus] ${event}`, normalized);
        }

        this._history.push({ event, data: normalized, timestamp: Date.now() });
        if (this._history.length > this._historyMax) this._history.shift();

        const set = this._listeners.get(event);
        if (set) {
            set.forEach((cb) => {
                try {
                    cb(normalized);
                } catch (err) {
                    console.error(`[EventBus] Error in listener for '${event}':`, err);
                }
            });
        }

        const wildcard = this._listeners.get('*');
        if (wildcard) {
            wildcard.forEach((cb) => {
                try {
                    cb({ event, data: normalized });
                } catch (e) {
                    // ignore wildcard callback errors
                }
            });
        }
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

