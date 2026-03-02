/**
 * Global Bridge & Namespace Management
 * Centralizes all window-level assignments to avoid cluttering main.js.
 */

export const GAME = {
    State: null,
    Data: null,
    Audio: null,
    Particle: null,
    Modules: {},
    API: {},

    init(gs, data, audio, particle) {
        this.State = gs;
        this.Data = data;
        this.Audio = audio;
        this.Particle = particle;

        // Direct global pointers (Legacy Support)
        window.GS = gs;
        window.GameState = gs;
        window.DATA = data;
        window.GAME = this;
        window.AudioEngine = audio;
        window.ParticleSystem = particle;
    },

    register(moduleName, moduleObj) {
        this.Modules[moduleName] = moduleObj;
        if (moduleObj && moduleObj.api) {
            Object.assign(this.API, moduleObj.api);
        }
    },

    getDeps() {
        return {
            gs: this.State,
            State: this.State,
            state: this.State,
            data: this.Data,
            Data: this.Data,
            audio: this.Audio,
            audioEngine: this.Audio,
            particles: this.Particle,
            particleSystem: this.Particle,
            doc: document,
            win: window,
            api: this.API,
            runRules: window.RunRules || this.Modules['RunRules'],
            ...this.Modules
        };
    },

    call(methodName, ...args) {
        if (typeof this.API[methodName] === 'function') {
            return this.API[methodName](...args);
        }
        if (typeof window[methodName] === 'function') {
            return window[methodName](...args);
        }
        console.warn(`[GAME] Method not found: ${methodName}`);
    }
};

/**
 * 윈도우 전역 객체에 주요 함수들을 노출합니다. (레거시 지원용)
 * @param {Object} mapping - 전역으로 노출할 객체들의 맵
 */
export function exposeGlobals(mapping) {
    if (!mapping || mapping === window) return;

    const reserved = ['window', 'document', 'location', 'top', 'parent', 'self'];

    Object.entries(mapping).forEach(([key, val]) => {
        if (reserved.includes(key)) return;

        try {
            window[key] = val;
        } catch (e) {
            console.warn(`[GAME] Could not expose global: ${key}`, e);
        }
    });
}
