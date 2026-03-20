import {
  createRunCanvasBindings,
  registerRunEntryBindings,
} from './public_runtime_capabilities.js';

export function createRunBindingCapabilities() {
  return {
    createCanvas: createRunCanvasBindings,
    registerEntry: registerRunEntryBindings,
  };
}

export { createRunCanvasBindings, registerRunEntryBindings };
