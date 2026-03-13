import { createRunCanvasBindings } from '../../features/run/public.js';

export function createCanvasBindings(modules, fns) {
    Object.assign(fns, createRunCanvasBindings(modules, fns));
}
