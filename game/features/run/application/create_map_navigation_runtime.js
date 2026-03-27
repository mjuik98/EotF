import { moveToNodeUseCase } from './move_to_node_use_case.js';
import { playUiFootstep } from '../ports/public_audio_runtime_capabilities.js';
import { presentNodeTransition } from '../ports/public_navigation_presentation_capabilities.js';
import {
  MAP_COMBAT_NODE_TYPES,
  Trigger,
} from '../ports/public_data_runtime_capabilities.js';
import { reportError } from '../../../core/error_reporter.js';

export function createMapNavigationRuntime(overrides = {}) {
  const {
    combatNodeTypes = MAP_COMBAT_NODE_TYPES,
    floorStartTrigger = Trigger.FLOOR_START,
    moveToNode = moveToNodeUseCase,
    playFootstep = playUiFootstep,
    presentTransition = presentNodeTransition,
  } = overrides;

  return {
    moveToNode(nodeRef, deps = {}) {
      const gs = deps.gs;
      if (!gs) return null;

      try {
        const result = moveToNode({
          combatNodeTypes,
          floorStartTrigger,
          gs,
          nodeRef,
          classMechanics: deps.classMechanics,
          lockNodeMovement: deps.setNodeMovementLocked,
        });
        if (!result?.ok) return result;

        return presentTransition(result, deps, {
          playFootstep,
          unlockNodeMovement: () => deps.setNodeMovementLocked?.(gs, false),
        });
      } catch (error) {
        reportError(error, { context: 'run:map-navigation' });
        deps.setNodeMovementLocked?.(gs, false);
        deps.updateUI?.();
        return null;
      }
    },
  };
}
