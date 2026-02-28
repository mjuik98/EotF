import { SaveAdapter } from '../core/save_adapter.js';
import { Logger } from '../utils/logger.js';
const SAVE_KEY = 'echo_fallen_save';
const META_KEY = 'echo_fallen_meta';

function _getDoc(deps) {
  return deps?.doc || document;
}

function _getGS(deps) {
  return deps?.gs;
}

export const SaveSystem = {
  SAVE_KEY,
  META_KEY,

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
      SaveAdapter.save(this.META_KEY, meta);
    } catch (e) {
      Logger.error('[SaveSystem] 메타 데이터 저장 실패:', e?.name, e?.message);
      this._lastSaveError = e;
    }
  },

  loadMeta(deps = {}) {
    const gs = _getGS(deps);
    if (!gs?.meta) return;

    try {
      const data = SaveAdapter.load(this.META_KEY);
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
      Logger.warn('[SaveSystem] 메타 로드 중 오류:', e.message);
    }

    const runRules = deps.runRules;
    try {
      runRules?.ensureMeta?.(gs.meta);
    } catch (e) {
      Logger.warn('[SaveSystem] RunRules.ensureMeta 실패:', e.message);
    }

    if (!gs.meta.runConfig) gs.meta.runConfig = {};
    // gs.runConfig is now a getter/setter in game_state.js, so manual sync is no longer required.
  },

  validateSaveData(data) {
    if (!data?.player) return false;
    const p = data.player;
    if (typeof p.hp !== 'number' || isNaN(p.hp) || p.hp < 0) return false;
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
        player: {
          ...gs.player,
          buffs: gs.combat.active ? {} : { ...gs.player.buffs },
          hand: [],
          upgradedCards: [...(gs.player.upgradedCards instanceof Set ? gs.player.upgradedCards : [])],
          _cascadeCards: [], // Map은 저장 불필요 (전투 중 세이브 차단됨)
        },
        currentRegion: gs.currentRegion,
        currentFloor: gs.currentFloor,
        mapNodes: gs.mapNodes || null,
        visitedNodes: gs.visitedNodes ? Array.from(gs.visitedNodes) : [],
        currentNode: gs.currentNode !== undefined ? gs.currentNode : null,
        stats: gs.stats,
        worldMemory: gs.worldMemory,
        ts: Date.now(),
      };
      SaveAdapter.save(this.SAVE_KEY, save);
    } catch (e) {
      Logger.error('[SaveSystem] 런 데이터 저장 실패:', e?.name, e?.message);
      this._lastSaveError = e;
    }
  },

  loadRun(deps = {}) {
    const gs = _getGS(deps);
    if (!gs) return false;

    try {
      const data = SaveAdapter.load(this.SAVE_KEY);
      if (!data) return false;

      if (!this.validateSaveData(data)) {
        Logger.error('[SaveSystem] 저장 데이터 유효성 검사 실패');
        return false;
      }

      Object.assign(gs.player, data.player);
      gs.player._cascadeCards = new Map(); // 로드 시 항상 Map으로 초기화
      if (data.player.upgradedCards) {
        gs.player.upgradedCards = new Set(data.player.upgradedCards);
      }

      const loadedRegion = Number(data.currentRegion);
      const loadedFloor = Number(data.currentFloor);
      gs.currentRegion = Number.isFinite(loadedRegion) ? loadedRegion : 0;
      gs.currentFloor = Number.isFinite(loadedFloor) ? loadedFloor : 1;
      gs.stats = data.stats || gs.stats;
      gs.worldMemory = data.worldMemory || gs.worldMemory;

      if (data.mapNodes !== undefined) gs.mapNodes = data.mapNodes;
      if (data.visitedNodes) gs.visitedNodes = new Set(data.visitedNodes);
      if (data.currentNode !== undefined) gs.currentNode = data.currentNode;

      return true;
    } catch (e) {
      Logger.error('[SaveSystem] 로드 중 예외 발생:', e);
      return false;
    }
  },

  hasSave() {
    return SaveAdapter.has(this.SAVE_KEY);
  },

  clearSave() {
    SaveAdapter.remove(this.SAVE_KEY);
  },

  showSaveBadge(deps = {}) {
    const doc = _getDoc(deps);
    if (!doc?.body) return;

    const el = doc.createElement('div');
    el.style.cssText = 'position:fixed;bottom:24px;right:24px;font-family:\'Share Tech Mono\',monospace;font-size:10px;color:rgba(0,255,204,0.6);z-index:1000;pointer-events:none;animation:fadeIn 0.3s ease both;';
    el.textContent = '💾 저장됨';
    doc.body.appendChild(el);
    setTimeout(() => el.remove(), 1800);
  },
};
