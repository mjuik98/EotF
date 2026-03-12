import {
  buildTitleCanvasBrowserModules,
  buildTitleFlowBrowserModules,
} from '../platform/browser/title_browser_modules.js';

export function buildTitleCanvasModuleCatalog() {
  return buildTitleCanvasBrowserModules();
}

export function buildTitleFlowModuleCatalog() {
  return buildTitleFlowBrowserModules();
}
