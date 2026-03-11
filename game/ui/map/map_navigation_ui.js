import { Trigger } from '../../data/triggers.js';
import { MAP_COMBAT_NODE_TYPES } from '../../../data/map_node_data.js';
import { playUiFootstep } from '../../domain/audio/audio_event_helpers.js';
import { setNodeMovementLocked } from '../../app/shared/use_cases/runtime_state_use_case.js';


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
    setNodeMovementLocked(gs, true);

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
      const isCombatNode = MAP_COMBAT_NODE_TYPES.includes(node.type);
      if (gs.currentFloor !== prevFloor) {
        gs.triggerItems?.(Trigger.FLOOR_START, { floor: gs.currentFloor });
      }

      if (gs.player.class === 'swordsman') {
        deps.classMechanics?.swordsman?.onMove?.(gs);
      }

      const nextFloorNodes = gs.mapNodes.filter(n => n.floor === node.floor + 1);
      const hasExplicitChildren = Array.isArray(node.children) && node.children.length > 0;
      const allowedChildren = hasExplicitChildren ? new Set(node.children) : null;
      nextFloorNodes.forEach((nextNode) => {
        nextNode.accessible = hasExplicitChildren ? allowedChildren.has(nextNode.id) : true;
      });

      playUiFootstep(deps.audioEngine);
      deps.renderMinimap?.();
      deps.updateUI?.();

      setTimeout(() => {
        try {
          if (!isCombatNode) deps.updateNextNodes?.();
          const NODE_HANDLERS = {
            combat: (d) => d.startCombat?.('normal'),
            elite: (d) => d.startCombat?.('normal'),
            mini_boss: (d) => d.startCombat?.('mini_boss'),
            boss: (d) => d.startCombat?.('boss'),
            event: (d) => d.triggerRandomEvent?.(),
            shop: (d) => d.showShop?.(),
            rest: (d) => d.showRestSite?.(),
          };
          NODE_HANDLERS[node.type]?.(deps);
        } finally {
          setNodeMovementLocked(gs, false);
        }
      }, 300);
    } catch (e) {
      console.error('[MapNavigationUI] 이동 중 오류:', e);
      setNodeMovementLocked(gs, false);
      deps.updateUI?.();
    }
  },
};
