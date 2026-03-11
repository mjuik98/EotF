import { createRunCanvasActions } from '../../features/run/app/create_run_canvas_actions.js';
import { createRunCanvasPorts } from '../../features/run/ports/create_run_canvas_ports.js';

export function createCanvasBindings(modules, fns) {
    Object.assign(fns, createRunCanvasActions(modules, fns, createRunCanvasPorts(modules)));
}
