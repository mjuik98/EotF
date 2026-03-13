import { buildRunBootActions } from '../application/build_run_boot_actions.js';
import { buildRunReturnRuntimeActions } from '../application/build_run_return_runtime_actions.js';

export function buildRunBootPublicActions(fns) {
  return buildRunBootActions(fns);
}

export function buildRunReturnRuntimePublicActions() {
  return buildRunReturnRuntimeActions();
}
