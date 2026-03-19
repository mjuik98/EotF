import { createRunCanvasBindings } from './public_runtime_capabilities.js';

export function createRunBindingCapabilities() {
  return {
    createCanvas: createRunCanvasBindings,
  };
}

export { createRunCanvasBindings };
