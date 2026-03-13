import { createRunCanvasBindings } from './runtime/public_run_runtime_surface.js';

export function createRunBindingCapabilities() {
  return {
    createCanvas: createRunCanvasBindings,
  };
}
