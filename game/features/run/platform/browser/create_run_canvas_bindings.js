import { createRunCanvasActions } from '../../app/create_run_canvas_actions.js';
import { createRunCanvasPorts } from '../../ports/create_run_canvas_ports.js';

export function createRunCanvasBindings(modules, fns) {
  return createRunCanvasActions(modules, fns, createRunCanvasPorts(modules));
}
