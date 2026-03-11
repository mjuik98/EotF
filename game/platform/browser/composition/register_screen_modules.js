import { buildScreenPrimaryModules } from './build_screen_primary_modules.js';
import { buildScreenOverlayModules } from './build_screen_overlay_modules.js';

export function registerScreenModules() {
  return {
    ...buildScreenPrimaryModules(),
    ...buildScreenOverlayModules(),
  };
}
