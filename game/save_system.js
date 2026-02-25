import { SaveAdapter } from './save_adapter.js';
const SAVE_KEY = 'echo_fallen_save';
  const META_KEY = 'echo_fallen_meta';

  function _getDoc(deps) {
    return deps?.doc || document;
  }

  function _getGS(deps) {
    return deps?.gs || window.GS;
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
        console.warn('[SaveSystem] 메타 데이터 저장 실패:', e?.name, e?.message);
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
      } catch (e) { }

      const runRules = deps.runRules || window.RunRules;
      try {
        runRules?.ensureMeta?.(gs.meta);
      } catch (e) { }

      gs.runConfig = {
        ascension: gs.meta.runConfig.ascension || 0,
        endless: !!gs.meta.runConfig.endless,
        endlessMode: !!gs.meta.runConfig.endless,
        blessing: gs.meta.runConfig.blessing || 'none',
        curse: gs.meta.runConfig.curse || 'none',
      };
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
        console.warn('[SaveSystem] 런 데이터 저장 실패:', e?.name, e?.message);
        this._lastSaveError = e;
      }
    },

    loadRun(deps = {}) {
      const gs = _getGS(deps);
      if (!gs) return false;

      try {
        const data = SaveAdapter.load(this.SAVE_KEY);
        if (!data || !data.player) return false;

        Object.assign(gs.player, data.player);
        if (data.player.upgradedCards) {
          gs.player.upgradedCards = new Set(data.player.upgradedCards);
        }

        gs.currentRegion = data.currentRegion || 'forest';
        gs.currentFloor = data.currentFloor || 1;
        gs.stats = data.stats || gs.stats;
        gs.worldMemory = data.worldMemory || gs.worldMemory;

        if (data.mapNodes !== undefined) gs.mapNodes = data.mapNodes;
        if (data.visitedNodes) gs.visitedNodes = new Set(data.visitedNodes);
        if (data.currentNode !== undefined) gs.currentNode = data.currentNode;

        return true;
      } catch (e) {
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
