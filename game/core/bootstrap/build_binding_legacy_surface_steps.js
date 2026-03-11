import { buildBindingLegacySurfaceStepGroups } from './build_binding_legacy_surface_step_groups.js';

export function buildBindingLegacySurfaceSteps() {
  const groups = buildBindingLegacySurfaceStepGroups();
  return [...groups.window, ...groups.api, ...groups.modules];
}
