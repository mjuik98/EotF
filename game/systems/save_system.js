import { SaveAdapter } from '../core/save_adapter.js';
import { Logger } from '../utils/logger.js';
import { META_SAVE_VERSION, RUN_SAVE_VERSION, migrateMetaSave, migrateRunSave } from './save_migrations.js';

const SAVE_KEY = 'echo_fallen_save';
const META_KEY = 'echo_fallen_meta';
const OUTBOX_RETRY_BASE_MS = 1000;
const OUTBOX_RETRY_MAX_MS = 30000;
const SAVE_ERROR_QUEUED = 'persist queued in outbox';

function _getDoc(deps) {
  if (deps?.doc) return deps.doc;
  if (typeof document === 'undefined') return null;
  return document;
}

function _getGS(deps) {
  return deps?.gs;
}

function _cloneSnapshot(data) {
  try {
    return JSON.parse(JSON.stringify(data));
  } catch {
    // Fallback to raw payload when snapshot cloning fails.
    return data;
  }
}

function _retryDelayMs(attempts) {
  const exp = Math.max(0, (Number(attempts) || 1) - 1);
  return Math.min(OUTBOX_RETRY_BASE_MS * (2 ** exp), OUTBOX_RETRY_MAX_MS);
}

function _createOutboxMetrics() {
  return {
    directWrites: 0,
    initialFailures: 0,
    queuedWrites: 0,
    coalescedWrites: 0,
    retryFailures: 0,
    retrySuccesses: 0,
    lastSuccessAt: 0,
    lastFailureAt: 0,
  };
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
  _outboxMetrics: _createOutboxMetrics(),

  _clearOutboxTimer() {
    if (this._outboxTimer) {
      clearTimeout(this._outboxTimer);
      this._outboxTimer = null;
      this._outboxTimerAt = 0;
    }
  },

  _scheduleOutboxFlush(delayMs = OUTBOX_RETRY_BASE_MS) {
    const safeDelay = Math.max(0, Number(delayMs) || 0);
    const targetTs = Date.now() + safeDelay;

    if (this._outboxTimer && this._outboxTimerAt <= targetTs) {
      return;
    }

    this._clearOutboxTimer();
    this._outboxTimerAt = targetTs;
    this._outboxTimer = setTimeout(() => {
      this._outboxTimer = null;
      this._outboxTimerAt = 0;
      this.flushOutbox();
    }, safeDelay);
  },

  _upsertOutboxEntry(key, payload) {
    const idx = this._outbox.findIndex((entry) => entry.key === key);
    const nextData = _cloneSnapshot(payload);

    if (idx >= 0) {
      this._outboxMetrics.coalescedWrites += 1;
      this._outbox[idx].data = nextData;
      this._outbox[idx].nextAttemptAt = Date.now();
      return;
    }

    this._outboxMetrics.queuedWrites += 1;
    this._outbox.push({
      key,
      data: nextData,
      attempts: 0,
      nextAttemptAt: Date.now(),
    });
  },

  _persistWithOutbox(key, payload) {
    const snapshot = _cloneSnapshot(payload);
    const ok = SaveAdapter.save(key, snapshot);
    if (ok) {
      this._outboxMetrics.directWrites += 1;
      this._outboxMetrics.lastSuccessAt = Date.now();
      return true;
    }

    this._outboxMetrics.initialFailures += 1;
    this._outboxMetrics.lastFailureAt = Date.now();
    this._upsertOutboxEntry(key, snapshot);
    this._scheduleOutboxFlush(this.OUTBOX_RETRY_BASE_MS);
    Logger.warn(`[SaveSystem] Save failed for "${key}". Queued for retry.`);
    return false;
  },

  _dropOutboxKey(key) {
    this._outbox = this._outbox.filter((entry) => entry.key !== key);
    if (!this._outbox.length) {
      this._clearOutboxTimer();
    }
  },

  flushOutbox() {
    if (!this._outbox.length) return 0;
    if (this._isFlushingOutbox) return this._outbox.length;

    this._isFlushingOutbox = true;
    try {
      const now = Date.now();
      let nextDelay = null;
      const pending = [];

      for (const entry of this._outbox) {
        if (entry.nextAttemptAt > now) {
          const waitMs = entry.nextAttemptAt - now;
          nextDelay = nextDelay === null ? waitMs : Math.min(nextDelay, waitMs);
          pending.push(entry);
          continue;
        }

        const ok = SaveAdapter.save(entry.key, entry.data);
        if (ok) {
          this._outboxMetrics.retrySuccesses += 1;
          this._outboxMetrics.lastSuccessAt = now;
          continue;
        }

        this._outboxMetrics.retryFailures += 1;
        this._outboxMetrics.lastFailureAt = now;
        entry.attempts += 1;
        const waitMs = _retryDelayMs(entry.attempts);
        entry.nextAttemptAt = now + waitMs;
        nextDelay = nextDelay === null ? waitMs : Math.min(nextDelay, waitMs);
        pending.push(entry);
      }

      this._outbox = pending;
      if (pending.length > 0) {
        this._scheduleOutboxFlush(nextDelay === null ? this.OUTBOX_RETRY_BASE_MS : nextDelay);
      } else {
        this._clearOutboxTimer();
      }
      return pending.length;
    } finally {
      this._isFlushingOutbox = false;
    }
  },

  getOutboxSize() {
    return this._outbox.length;
  },

  getOutboxMetrics() {
    let nextRetryAt = 0;
    for (const entry of this._outbox) {
      if (nextRetryAt === 0 || entry.nextAttemptAt < nextRetryAt) {
        nextRetryAt = entry.nextAttemptAt;
      }
    }

    return {
      ...this._outboxMetrics,
      queueDepth: this._outbox.length,
      nextRetryAt,
    };
  },

  resetOutboxMetrics() {
    this._outboxMetrics = _createOutboxMetrics();
  },

  clearOutbox() {
    this._outbox = [];
    this._clearOutboxTimer();
  },

  saveMeta(deps = {}) {
    const gs = _getGS(deps);
    if (!gs?.meta) return;

    try {
      const meta = { ...gs.meta };
      if (meta.codex) {
        meta.codex = {
          enemies: [...meta.codex.enemies],
          cards: [...meta.codex.cards],
          items: [...meta.codex.items],
        };
      }
      meta.version = META_SAVE_VERSION;
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
    const gs = _getGS(deps);
    if (!gs?.meta) return;

    try {
      const raw = SaveAdapter.load(this.META_KEY);
      const data = migrateMetaSave(raw);
      if (data) {
        if (data.codex) {
          data.codex = {
            enemies: new Set(data.codex.enemies || []),
            cards: new Set(data.codex.cards || []),
            items: new Set(data.codex.items || []),
          };
        }
        Object.assign(gs.meta, data);
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

    if (!gs.meta.runConfig) gs.meta.runConfig = {};
    // gs.runConfig is now a getter/setter in game_state.js, so manual sync is no longer required.
  },

  validateSaveData(data) {
    if (!data?.player) return false;
    if (!Number.isFinite(Number(data.version)) || Number(data.version) < 1) return false;
    const p = data.player;
    if (typeof p.hp !== 'number' || Number.isNaN(p.hp) || p.hp < 0) return false;
    if (typeof p.maxHp !== 'number' || p.maxHp <= 0 || p.maxHp > 9999) return false;
    if (p.hp > p.maxHp) return false;
    if (!Array.isArray(p.deck) || p.deck.length > 500) return false;
    if (typeof p.gold === 'number' && (p.gold < 0 || p.gold > 999999)) return false;
    if (typeof data.currentRegion === 'undefined') return false;
    return true;
  },

  saveRun(deps = {}) {
    const gs = _getGS(deps);
    if (!gs?.player) return;

    const isGameStarted = typeof deps.isGameStarted === 'function' ? deps.isGameStarted() : true;
    if (!isGameStarted) return;
    if (gs.combat?.active) return;

    try {
      const save = {
        version: RUN_SAVE_VERSION,
        player: {
          ...gs.player,
          buffs: gs.combat.active ? {} : { ...gs.player.buffs },
          hand: [],
          upgradedCards: [...(gs.player.upgradedCards instanceof Set ? gs.player.upgradedCards : [])],
          _cascadeCards: [],
        },
        currentRegion: gs.currentRegion,
        currentFloor: gs.currentFloor,
        regionFloors: gs.regionFloors || {},
        regionRoute: gs.regionRoute || {},
        mapNodes: gs.mapNodes || null,
        visitedNodes: gs.visitedNodes ? Array.from(gs.visitedNodes) : [],
        currentNode: gs.currentNode !== undefined ? gs.currentNode : null,
        stats: gs.stats,
        worldMemory: gs.worldMemory,
        ts: Date.now(),
      };
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
    const gs = _getGS(deps);
    if (!gs) return false;

    try {
      const raw = SaveAdapter.load(this.SAVE_KEY);
      const data = migrateRunSave(raw);
      if (!data) return false;

      if (!this.validateSaveData(data)) {
        Logger.error('[SaveSystem] Save data validation failed');
        return false;
      }

      Object.assign(gs.player, data.player);
      gs.player._cascadeCards = new Map();
      if (data.player.upgradedCards) {
        gs.player.upgradedCards = new Set(data.player.upgradedCards);
      }

      const loadedRegion = Number(data.currentRegion);
      const loadedFloor = Number(data.currentFloor);
      gs.currentRegion = Number.isFinite(loadedRegion) ? loadedRegion : 0;
      gs.currentFloor = Number.isFinite(loadedFloor) ? loadedFloor : 1;
      gs.regionFloors = (data.regionFloors && typeof data.regionFloors === 'object' && !Array.isArray(data.regionFloors))
        ? data.regionFloors
        : {};
      gs.regionRoute = (data.regionRoute && typeof data.regionRoute === 'object' && !Array.isArray(data.regionRoute))
        ? data.regionRoute
        : {};
      gs.stats = data.stats || gs.stats;
      gs.worldMemory = data.worldMemory || gs.worldMemory;

      if (data.mapNodes !== undefined) gs.mapNodes = data.mapNodes;
      if (data.visitedNodes) gs.visitedNodes = new Set(data.visitedNodes);
      if (data.currentNode !== undefined) gs.currentNode = data.currentNode;

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
    const doc = _getDoc(deps);
    if (!doc?.body) return;

    const el = doc.createElement('div');
    el.style.cssText = 'position:fixed;bottom:24px;right:24px;font-family:\'Share Tech Mono\',monospace;font-size:10px;color:rgba(0,255,204,0.6);z-index:1000;pointer-events:none;animation:fadeIn 0.3s ease both;';
    el.textContent = 'Saved';
    doc.body.appendChild(el);
    setTimeout(() => el.remove(), 1800);
  },
};
