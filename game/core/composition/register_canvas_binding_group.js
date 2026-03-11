import { createCanvasBindings } from '../bindings/canvas_bindings.js';

export function registerCanvasBindingGroup(modules, fns) {
  createCanvasBindings(modules, fns);
}
