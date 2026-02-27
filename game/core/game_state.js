import { GameStateCoreMethods } from './game_state_core_methods.js';
import { EventBus } from './event_bus.js';
import { Reducers } from './state_actions.js';

export const GS = {
    // ─── Game Data (Single Source of Truth) ───
    currentScreen: 'title',
    meta: {
        runCount: 1, totalKills: 0, bestChain: 0, echoFragments: 0,
        worldMemory: {},
        inscriptions: { echo_boost: false, resilience: false, fortune: false },
        storyPieces: [], _hiddenEndingHinted: false,
        codex: { enemies: new Set(), cards: new Set(), items: new Set() },
        unlocks: { ascension: false, endless: false },
        maxAscension: 0,
        runConfig: { ascension: 0, endless: false, blessing: 'none', curse: 'none' },
        progress: { echoShards: 0, totalDamage: 0, victories: 0, failures: 0, bossKills: {} },
    },
    player: {
        class: 'swordsman', hp: 80, maxHp: 80, shield: 0,
        echo: 0, maxEcho: 100, echoChain: 0,
        energy: 3, maxEnergy: 3, gold: 0, kills: 0,
        deck: [], hand: [], graveyard: [], exhausted: [],
        items: [], buffs: {}, silenceGauge: 0, zeroCost: false, _freeCardUses: 0, costDiscount: 0, _nextCardDiscount: 0, _cascadeCards: new Map(),
        upgradedCards: new Set(), _cardUpgradeBonus: {},
    },
    currentRegion: 0, currentFloor: 1,
    mapNodes: [], currentNode: null, visitedNodes: new Set(),
    combat: { active: false, enemies: [], turn: 0, playerTurn: true, log: [] },
    _selectedTarget: null,
    worldMemory: {},

    // ─── runConfig accessor ───
    get runConfig() { return this.meta.runConfig; },
    set runConfig(val) { this.meta.runConfig = val; },

    // ─── Dirty Flag System ───
    _dirty: new Set(),
    markDirty(key) { this._dirty.add(key); },
    isDirty(key) {
        if (key === undefined) return this._dirty.size > 0;
        return this._dirty.has(key);
    },
    hasDirtyFlag(key) { return this._dirty.has(key); },
    clearDirty(key) { if (key) this._dirty.delete(key); else this._dirty.clear(); },
    clearDirtyFlag(key) { this._dirty.delete(key); },

    // ─── Stats ───
    stats: { damageDealt: 0, damageTaken: 0, cardsPlayed: 0, maxChain: 0 },
    _heartUsed: false, _temporalTurn: 0, _bossAdvancePending: false,

    // ═══════════════════════════════════════
    //  Dispatch System (단일 상태 변경 진입점)
    // ═══════════════════════════════════════

    /**
     * 상태 변경 디스패치
     * @param {string} action — Action type (예: 'player:damage')
     * @param {object} payload — Action 데이터
     * @returns {object} Reducer 결과
     */
    dispatch(action, payload = {}) {
        const reducer = Reducers[action];
        if (!reducer) {
            console.warn(`[GS.dispatch] Unknown action: ${action}`);
            return null;
        }

        const result = reducer(this, payload);

        // 이벤트 버스로 상태 변경 알림
        EventBus.emit(action, { payload, result, gs: this });

        return result;
    },

    /**
     * 상태 변경 구독 (EventBus 바로가기)
     */
    subscribe(event, callback) {
        return EventBus.on(event, callback);
    },

    /**
     * EventBus 직접 접근
     */
    get bus() {
        return EventBus;
    },
};

// Merge business logic methods
Object.assign(GS, GameStateCoreMethods);
