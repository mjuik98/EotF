import { buildScreenOverlayBrowserModules } from '../platform/browser/screen_overlay_browser_modules.js';
import { buildScreenPrimaryBrowserModules } from '../platform/browser/screen_primary_browser_modules.js';

export function buildScreenScenePrimaryModules() {
  return buildScreenPrimaryBrowserModules();
}

export function buildScreenSceneOverlayModules() {
  return buildScreenOverlayBrowserModules();
}
