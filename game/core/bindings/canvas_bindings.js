import { createRunCanvasBindings } from '../../features/run/bindings/public_run_bindings.js';

export function createCanvasBindings(modules, fns) {
    Object.assign(fns, createRunCanvasBindings(modules, fns));
}
