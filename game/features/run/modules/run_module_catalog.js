import {
  buildRunFlowBrowserModules,
  buildRunMapBrowserModules,
} from '../platform/browser/run_browser_modules.js';

export function buildRunMapModuleCatalog() {
  return buildRunMapBrowserModules();
}

export function buildRunFlowModuleCatalog() {
  return buildRunFlowBrowserModules();
}
