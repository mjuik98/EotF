import { createEventUiCallbacks, createEventUiRuntime } from '../../features/event/public.js';

export function createEventUiFacadeRuntime(api, deps = {}) {
  return createEventUiRuntime(deps, createEventUiCallbacks(api, deps));
}
