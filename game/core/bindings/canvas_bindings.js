import { createRunBindingCapabilities } from '../../features/run/public.js';

export function createCanvasBindings(modules, fns) {
  const bindings = createRunBindingCapabilities();
  Object.assign(fns, bindings.createCanvas(modules, fns));
}
