export function getDocFromDeps(deps) {
  return deps?.doc || deps?.win?.document || null;
}

export function getWinFromDeps(deps) {
  return deps?.win || deps?.doc?.defaultView || null;
}

export function createDamageRuntime(gs, deps = {}) {
  return {
    doc: getDocFromDeps(deps),
    win: getWinFromDeps(deps),
    enemies: Array.isArray(gs.combat?.enemies) ? gs.combat.enemies : [],
    getBuff: (id) => {
      if (typeof gs.getBuff === 'function') return gs.getBuff(id);
      return gs.player?.buffs?.[id] || null;
    },
    triggerItem: (trigger, payload) => (
      typeof gs.triggerItems === 'function' ? gs.triggerItems(trigger, payload) : undefined
    ),
  };
}
