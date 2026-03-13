import {
  createUiBindingContext,
  createUiBindingsActions,
  setScreenService,
} from './runtime/public_ui_runtime_surface.js';

export function createUiBindingCapabilities() {
  return {
    createUiBindingContext,
    createUiBindings: createUiBindingsActions,
    setScreenService,
  };
}
