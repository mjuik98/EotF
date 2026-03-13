import { createTitleBindings } from './runtime/public_title_runtime_surface.js';

export function createTitleBindingCapabilities() {
  return {
    createTitle: createTitleBindings,
  };
}
