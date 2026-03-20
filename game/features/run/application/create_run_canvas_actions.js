import { createCanvasLifecycleActions } from '../platform/browser/run_canvas_lifecycle_actions.js';
import { createWorldRenderActions } from './world_render_actions.js';
import { createRunMapActions } from './run_map_actions.js';

export function createRunCanvasActions(modules, fns, ports) {
  const context = { modules, fns, ports };

  return {
    ...createCanvasLifecycleActions(context),
    ...createWorldRenderActions(context),
    ...createRunMapActions(context),
  };
}
