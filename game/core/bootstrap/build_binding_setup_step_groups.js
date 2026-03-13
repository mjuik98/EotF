import { registerBootstrapBindings } from './register_bootstrap_bindings.js';

export function buildBindingSetupStepGroups() {
  return {
    gameplay: [
      registerBootstrapBindings,
    ],
    bootstrap: [],
  };
}
