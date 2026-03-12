import fs from 'node:fs';
import path from 'node:path';

import { describe, expect, it } from 'vitest';

const EXACT_REEXPORTS = new Map([
  [
    'game/ui/map/map_navigation_ui.js',
    "export { MapNavigationUI } from '../../features/run/presentation/browser/map_navigation_ui.js';\n",
  ],
  [
    'game/ui/map/map_ui.js',
    "export { MapUI } from '../../features/run/presentation/browser/map_ui.js';\n",
  ],
  [
    'game/ui/map/maze_system_ui.js',
    "export { MazeSystem } from '../../features/run/presentation/browser/maze_system_ui.js';\n",
  ],
  [
    'game/ui/map/world_canvas_ui.js',
    "export { WorldCanvasUI } from '../../features/run/presentation/browser/world_canvas_ui.js';\n",
  ],
  [
    'game/ui/map/world_render_loop_ui.js',
    "export { WorldRenderLoopUI } from '../../features/run/presentation/browser/world_render_loop_ui.js';\n",
  ],
  [
    'game/ui/hud/dom_value_ui.js',
    "export { DomValueUI } from '../../features/combat/presentation/browser/dom_value_ui.js';\n",
  ],
  [
    'game/ui/hud/feedback_ui.js',
    "export { FeedbackUI } from '../../features/combat/presentation/browser/feedback_ui.js';\n",
  ],
  [
    'game/ui/hud/hud_update_ui.js',
    "export { HudUpdateUI } from '../../features/combat/presentation/browser/hud_update_ui.js';\n",
  ],
]);

describe('ui feature entry compat reexports', () => {
  it('keeps moved ui entrypoints as thin feature-local reexports', () => {
    for (const [file, expected] of EXACT_REEXPORTS) {
      const source = fs.readFileSync(path.join(process.cwd(), file), 'utf8');
      expect(source).toBe(expected);
    }
  });
});
