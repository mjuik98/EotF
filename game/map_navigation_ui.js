'use strict';

(function initMapNavigationUI(globalObj) {
  const MapNavigationUI = {
    moveToNode(nodeRef, deps = {}) {
      const gs = deps.gs || globalObj.GS;
      if (!gs) return;

      let node = nodeRef;
      if (typeof node === 'string') {
        node = gs.mapNodes.find(n => n.id === node);
      }

      if (!node || !node.accessible || node.visited) return;
      if (gs._nodeMoveLock) return;
      gs._nodeMoveLock = true;

      const doc = deps.doc || document;
      const overlay = doc.getElementById('nodeCardOverlay');
      if (overlay) overlay.style.pointerEvents = 'none';

      node.visited = true;
      gs.currentNode = node;
      gs.currentFloor = node.floor;

      if (gs.player.class === 'swordsman') {
        deps.classMechanics?.swordsman?.onMove?.(gs);
      }

      gs.mapNodes
        .filter(n => n.floor === node.floor + 1)
        .forEach(n => { n.accessible = true; });

      deps.audioEngine?.playFootstep?.();
      deps.updateNextNodes?.();
      deps.renderMapOverlay?.();
      deps.renderMinimap?.();
      deps.updateUI?.();

      setTimeout(() => {
        gs._nodeMoveLock = false;
        switch (node.type) {
          case 'combat':
          case 'elite':
            deps.startCombat?.(false);
            break;
          case 'boss':
            deps.startCombat?.(true);
            break;
          case 'event':
            deps.triggerRandomEvent?.();
            break;
          case 'shop':
            deps.showShop?.();
            break;
          case 'rest':
            deps.showRestSite?.();
            break;
          default:
            break;
        }
      }, 300);
    },
  };

  globalObj.MapNavigationUI = MapNavigationUI;
})(window);
