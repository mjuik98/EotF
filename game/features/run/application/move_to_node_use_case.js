import {
  applyNodeTraversalState,
  resolveNodeByRef,
} from '../../../shared/state/map_state_commands.js';
import { setNodeMovementLocked } from '../../../shared/state/runtime_flow_controls.js';

export function moveToNodeUseCase({
  combatNodeTypes = [],
  floorStartTrigger,
  gs,
  nodeRef,
  classMechanics,
  lockNodeMovement = setNodeMovementLocked,
} = {}) {
  if (!gs) return { ok: false, reason: 'missing-gs' };

  const node = resolveNodeByRef(gs, nodeRef);
  if (!node) return { ok: false, reason: 'missing-node' };
  if (!node.accessible || node.visited) return { ok: false, reason: 'blocked-node', node };
  if (gs._nodeMoveLock) return { ok: false, reason: 'move-locked', node };

  lockNodeMovement(gs, true);

  try {
    const traversalState = applyNodeTraversalState(gs, node);
    if (traversalState.currentFloor !== traversalState.prevFloor) {
      gs.triggerItems?.(floorStartTrigger, { floor: traversalState.currentFloor });
    }

    const playerClass = gs.player?.class;
    if (playerClass === 'swordsman') {
      classMechanics?.swordsman?.onMove?.(gs);
    }

    return {
      ok: true,
      isCombatNode: combatNodeTypes.includes(node.type),
      node,
      prevFloor: traversalState.prevFloor,
    };
  } catch (error) {
    lockNodeMovement(gs, false);
    throw error;
  }
}
