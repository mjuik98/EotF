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

    call(methodName, ...args) {
        const fn = this.API[methodName];
        if (typeof fn === 'function') return fn(...args);
        console.warn(`[GAME] API Method not found: ${methodName}`);
        return null;
    },

    getDeps() {
        return {
            gs: this.State,
            data: this.Data,
            doc: document,
            win: window,
            audioEngine: this.Audio,
            particleSystem: this.Particle,
            api: this.API,
            // References that will be injected by main.js
            runRules: window.RunRules,
            classMechanics: window.ClassMechanics,
            getRegionData: window.getRegionData,
            getBaseRegionIndex: window.getBaseRegionIndex,
            getRegionCount: window.getRegionCount,
            difficultyScaler: window.DifficultyScaler,
            shuffleArray: window.RandomUtils?.shuffleArray,
            hitStop: window.HitStop,
            screenShake: window.ScreenShake,
            fovEngine: window.FovEngine,
            setBonusSystem: window.SetBonusSystem,
        };
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
