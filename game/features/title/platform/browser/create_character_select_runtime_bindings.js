import { buildCharacterSelectFlowRuntimeBindings } from './character_select_runtime_flow_bindings.js';
import { buildCharacterSelectProgressionRuntimeBindings } from './character_select_runtime_progression_bindings.js';
import { buildCharacterSelectUiRuntimeBindings } from './character_select_runtime_ui_bindings.js';

export function createCharacterSelectRuntimeBindings() {
  return {
    ...buildCharacterSelectProgressionRuntimeBindings(),
    ...buildCharacterSelectFlowRuntimeBindings(),
    ...buildCharacterSelectUiRuntimeBindings(),
  };
}
