import { buildBindingStateHelpers } from './build_binding_state_helpers.js';
import { buildBindingUiHelpers } from './build_binding_ui_helpers.js';

export function buildBindingDepsHelpers({ modules, deps }) {
  return {
    ...buildBindingStateHelpers({ modules }),
    ...buildBindingUiHelpers({ modules, deps }),
  };
}
