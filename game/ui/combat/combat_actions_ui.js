function _getDoc(deps) {
  return deps?.doc || document;
}

export const CombatActionsUI = {
  drawCard(deps = {}) {
    const gs = deps.gs;
    if (!gs) return;

    if (typeof gs.API?.executePlayerDraw === 'function') {
      gs.API.executePlayerDraw(gs);
    } else {
      console.warn('[CombatActionsUI] GameAPI.executePlayerDraw not found, falling back to legacy');
      // Legacy fallback if API not yet initialized
      if (gs.player.energy >= 1 && gs.player.hand.length < 8) {
        gs.player.energy -= 1;
        gs.drawCards(1);
      }
    }
  }
};
