import {
  createEventUiCallbacks,
  createEventUiRuntime,
} from '../../application/create_event_ui_runtime.js';

export function createEventUiFacadeRuntime(api, deps = {}) {
  return createEventUiRuntime(deps, createEventUiCallbacks(api, deps));
}
