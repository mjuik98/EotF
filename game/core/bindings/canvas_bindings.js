import { createRunBindingCapabilities } from '../../features/run/ports/public_binding_capabilities.js';

export function createCanvasBindings(modules, fns) {
  const bindings = createRunBindingCapabilities();
  Object.assign(fns, bindings.createCanvas(modules, fns));
}
