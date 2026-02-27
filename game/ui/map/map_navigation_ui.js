import { GS } from '../../core/game_state.js';
import { Trigger } from '../../data/triggers.js';


export const MapNavigationUI = {
  moveToNode(nodeRef, deps = {}) {
    const gs = deps.gs;
    if (!gs) return;

    let node = nodeRef;
    if (typeof node === 'string') {
      node = gs.mapNodes.find(n => n.id === node);
    }

    if (!node || !node.accessible || node.visited) return;
    if (gs._nodeMoveLock) return;
    gs._nodeMoveLock = true;

    try {
      const doc = deps.doc || document;
      const overlay = doc.getElementById('nodeCardOverlay');
      if (overlay) {
        overlay.style.pointerEvents = 'none';
        overlay.style.display = 'none';
      }

      node.visited = true;
      gs.currentNode = node;
      const prevFloor = gs.currentFloor;
      gs.currentFloor = node.floor;
      const isCombatNode = node.type === 'combat' || node.type === 'elite' || node.type === 'boss';
      if (gs.currentFloor !== prevFloor) {
        gs.triggerItems?.(Trigger.FLOOR_START, { floor: gs.currentFloor });
      }

      if (gs.player.class === 'swordsman') {
        deps.classMechanics?.swordsman?.onMove?.(gs);
      }

      gs.mapNodes
        .filter(n => n.floor === node.floor + 1)
        .forEach(n => { n.accessible = true; });

      deps.audioEngine?.playFootstep?.();
      deps.renderMinimap?.();
      deps.updateUI?.();

      setTimeout(() => {
        try {
          if (!isCombatNode) deps.updateNextNodes?.();
          const NODE_HANDLERS = {
            combat: (d) => d.startCombat?.(false),
            elite: (d) => d.startCombat?.(false),
            boss: (d) => d.startCombat?.(true),
            event: (d) => d.triggerRandomEvent?.(),
            shop: (d) => d.showShop?.(),
            rest: (d) => d.showRestSite?.(),
          };
          NODE_HANDLERS[node.type]?.(deps);
        } finally {
          gs._nodeMoveLock = false;
        }
      }, 300);
    } catch (e) {
      console.error('[MapNavigationUI] 이동 중 오류:', e);
      gs._nodeMoveLock = false;
      deps.updateUI?.();
    }
  },
};
