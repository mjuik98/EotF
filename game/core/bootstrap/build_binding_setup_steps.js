import { buildBindingSetupStepGroups } from './build_binding_setup_step_groups.js';

export function buildBindingSetupSteps() {
  const groups = buildBindingSetupStepGroups();
  return [...groups.gameplay, ...groups.bootstrap];
}
