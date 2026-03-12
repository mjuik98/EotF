import { createEventUiRuntime } from '../../features/event/public.js';

export function createEventUiFacadeRuntime(api, deps = {}) {
  return createEventUiRuntime(api, deps);
}
