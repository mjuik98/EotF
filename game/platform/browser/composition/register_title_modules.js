import { buildTitleCanvasModules } from './build_title_canvas_modules.js';
import { buildTitleFlowModules } from './build_title_flow_modules.js';

export function registerTitleModules() {
  return {
    ...buildTitleCanvasModules(),
    ...buildTitleFlowModules(),
  };
}
