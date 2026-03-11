import { moveToNodeUseCase } from '../../app/run/use_cases/move_to_node_use_case.js';
import { playUiFootstep } from '../../domain/audio/audio_event_helpers.js';
import { Trigger } from '../../data/triggers.js';
import { MAP_COMBAT_NODE_TYPES } from '../../../data/map_node_data.js';
import { presentNodeTransition } from './map_navigation_presenter.js';

export const MapNavigationUI = {
  moveToNode(nodeRef, deps = {}) {
    const gs = deps.gs;
    if (!gs) return;

    try {
      const result = moveToNodeUseCase({
        combatNodeTypes: MAP_COMBAT_NODE_TYPES,
        floorStartTrigger: Trigger.FLOOR_START,
        gs,
        nodeRef,
        classMechanics: deps.classMechanics,
        lockNodeMovement: deps.setNodeMovementLocked,
      });
      if (!result?.ok) return result;

      return presentNodeTransition(result, deps, {
        playFootstep: playUiFootstep,
        unlockNodeMovement: () => deps.setNodeMovementLocked?.(gs, false),
      });
    } catch (e) {
      console.error('[MapNavigationUI] 이동 중 오류:', e);
      deps.setNodeMovementLocked?.(gs, false);
      deps.updateUI?.();
    }
  },
};
