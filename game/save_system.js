'use strict';

(function initSaveSystem(globalObj) {
  const SAVE_KEY = 'echo_fallen_save';
  const META_KEY = 'echo_fallen_meta';

  function _getStorage() {
    try {
      return globalObj.localStorage;
    } catch (e) {
      return null;
    }
  }

  function _getDoc(deps) {
    return deps?.doc || document;
  }

  function _getGS(deps) {
    return deps?.gs || globalObj.GS;
  }

  const SaveSystem = {
    SAVE_KEY,
    META_KEY,

    saveMeta(deps = {}) {
      const storage = _getStorage();
      const gs = _getGS(deps);
      if (!storage || !gs?.meta) return;

      try {
        const meta = { ...gs.meta };
        if (meta.codex) {
          meta.codex = {
            enemies: [...meta.codex.enemies],
            cards: [...meta.codex.cards],
            items: [...meta.codex.items],
          };
        }
        storage.setItem(this.META_KEY, JSON.stringify(meta));
      } catch (e) { }
    },

    loadMeta(deps = {}) {
      const storage = _getStorage();
      const gs = _getGS(deps);
      if (!storage || !gs?.meta) return;

      try {
        const raw = storage.getItem(this.META_KEY);
        if (raw) {
          const data = JSON.parse(raw);
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

      const runRules = deps.runRules || globalObj.RunRules;
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
      const storage = _getStorage();
      const gs = _getGS(deps);
      if (!storage || !gs?.player) return;

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
        storage.setItem(this.SAVE_KEY, JSON.stringify(save));
      } catch (e) { }
    },

    loadRun(deps = {}) {
      const storage = _getStorage();
      const gs = _getGS(deps);
      if (!storage || !gs) return false;

      try {
        const raw = storage.getItem(this.SAVE_KEY);
        if (!raw) return false;
        const data = JSON.parse(raw);
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
      const storage = _getStorage();
      if (!storage) return false;
      try {
        return !!storage.getItem(this.SAVE_KEY);
      } catch (e) {
        return false;
      }
    },

    clearSave() {
      const storage = _getStorage();
      if (!storage) return;
      try {
        storage.removeItem(this.SAVE_KEY);
      } catch (e) { }
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

  globalObj.SaveSystem = SaveSystem;
})(window);
