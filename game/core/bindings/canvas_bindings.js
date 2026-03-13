import { createRunFeatureFacade } from '../../features/run/public.js';

export function createCanvasBindings(modules, fns) {
  const { bindings } = createRunFeatureFacade();
  Object.assign(fns, bindings.createCanvas(modules, fns));
}
