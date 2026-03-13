import {
  buildTitleCanvasBrowserModules,
  buildTitleFlowBrowserModules,
} from './title_browser_modules.js';

export function buildTitleCanvasModuleCapabilities() {
  return buildTitleCanvasBrowserModules();
}

export function buildTitleFlowModuleCapabilities() {
  return buildTitleFlowBrowserModules();
}
