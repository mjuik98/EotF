import { attachGameStateRuntimeMethods } from '../shared/state/game_state_runtime_methods.js';
import { EventBus } from './event_bus.js';
import { Reducers } from './state_actions.js';
import { ErrorCodes, ErrorSeverity } from './error_codes.js';
import { reportError } from './error_reporter.js';
import { createDefaultGameStateShape } from './game_state_defaults.js';

const defaultStateShape = createDefaultGameStateShape();

export const GS = {
    currentScreen: 'title',
    ...defaultStateShape,

    get runConfig() { return this.meta.runConfig; },
    set runConfig(val) { this.meta.runConfig = val; },

    _dirty: new Set(),
    markDirty(key) { this._dirty.add(key); },
    isDirty(key) {
        if (key === undefined) return this._dirty.size > 0;
        return this._dirty.has(key);
    },
    hasDirtyFlag(key) { return this._dirty.has(key); },
    clearDirty(key) { if (key) this._dirty.delete(key); else this._dirty.clear(); },
    clearDirtyFlag(key) { this._dirty.delete(key); },

    dispatch(action, payload = {}) {
        const reducer = Reducers[action];
        if (!reducer) {
            reportError(`Unknown action: ${action}`, {
                code: ErrorCodes.INVALID_ACTION,
                severity: ErrorSeverity.WARN,
                context: 'GS.dispatch',
                meta: { action },
            });
            return null;
        }

        const dispatchId = `${action}#${++this._dispatchSeq}`;
        const dispatchTs = Date.now();
        this._dispatchDepth += 1;
        let result = null;
        try {
            result = reducer(this, payload);
        } finally {
            this._dispatchDepth = Math.max(0, this._dispatchDepth - 1);
        }

        EventBus.emit(action, {
            payload,
            result,
            gs: this,
            dispatchId,
            ts: dispatchTs,
        });

        return result;
    },

    commit(action, payload = {}) {
        return this.dispatch(action, payload);
    },

    mutate(action, payload = {}) {
        return this.dispatch(action, payload);
    },

    isDispatching() {
        return this._dispatchDepth > 0;
    },

    subscribe(event, callback) {
        return EventBus.on(event, callback);
    },

    get bus() {
        return EventBus;
    },
};

attachGameStateRuntimeMethods(GS);
