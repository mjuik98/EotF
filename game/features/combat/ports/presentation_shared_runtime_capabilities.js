import {
  canContinueCombatTurn,
  isCombatResolutionPending,
} from '../../../shared/state/public.js';
import { getDoc, getHudUpdateDeps } from '../../../shared/runtime/hud_runtime_deps.js';
import {
  setDatasetBooleanState,
  setDatasetValue,
} from '../../../shared/ui/state/ui_state_dataset.js';

export {
  canContinueCombatTurn,
  getDoc,
  getHudUpdateDeps,
  isCombatResolutionPending,
  setDatasetBooleanState,
  setDatasetValue,
};
