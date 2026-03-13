export const InscriptionSystem = {
  getInscriptionLevel(gs, id) {
    if (!gs?.meta?.inscriptions) return 0;
    if (gs.runConfig?.disabledInscriptions?.includes(id)) return 0;
    const val = gs.meta.inscriptions[id];
    if (typeof val === 'boolean') return val ? 1 : 0;
    return Math.max(0, Math.floor(Number(val) || 0));
  },

  setInscriptionLevel(gs, id, level) {
    if (!gs?.meta) return;
    const meta = gs.meta;
    if (!meta.inscriptions) meta.inscriptions = {};
    meta.inscriptions[id] = Math.max(0, Math.floor(level));
  },

  addInscriptionLevel(gs, id, amount = 1, dataRef = null) {
    if (!gs?.meta) return;
    const meta = gs.meta;
    if (!meta.inscriptions) meta.inscriptions = {};

    let nextLevel = this.getInscriptionLevel(gs, id) + amount;
    if (dataRef?.inscriptions?.[id]?.maxLevel) {
      nextLevel = Math.min(nextLevel, dataRef.inscriptions[id].maxLevel);
    }

    meta.inscriptions[id] = nextLevel;
  },

  getActiveInscriptions(gs, dataRef) {
    if (!dataRef?.inscriptions) return [];
    const active = [];
    for (const [id, def] of Object.entries(dataRef.inscriptions)) {
      const level = this.getInscriptionLevel(gs, id);
      if (level > 0) {
        active.push({ id, def, level: Math.min(level, def.maxLevel || 1) });
      }
    }
    return active;
  },

  getActiveSynergies(gs, dataRef) {
    if (!dataRef?.synergies) return [];
    const activeSynergies = [];
    outer: for (const [id, syn] of Object.entries(dataRef.synergies)) {
      const reqs = id.split('+');
      for (const req of reqs) {
        if (this.getInscriptionLevel(gs, req) < 1) continue outer;
      }
      activeSynergies.push({ id, syn });
    }
    return activeSynergies;
  },

  applyStartBonuses(gs, dataRef) {
    if (!gs || !gs.player) return;

    const active = this.getActiveInscriptions(gs, dataRef);
    for (const item of active) {
      const levelIdx = item.level - 1;
      const levelDef = item.def.levels[levelIdx];
      if (levelDef && typeof levelDef.apply === 'function') {
        levelDef.apply(gs);
      }
    }

    const synergies = this.getActiveSynergies(gs, dataRef);
    for (const { syn } of synergies) {
      if (syn.trigger === 'passive' && typeof syn.effect === 'function') {
        syn.effect(gs);
      }
    }
  },

  triggerSynergy(gs, trigger, dataRef, args = null) {
    if (!gs) return;
    const synergies = this.getActiveSynergies(gs, dataRef);
    for (const { syn } of synergies) {
      if (syn.trigger === trigger && typeof syn.effect === 'function') {
        syn.effect(gs, args);
      }
    }
  },
};
