import {
  buildRunFlowBrowserModules,
  buildRunMapBrowserModules,
} from './run_browser_modules.js';

export function buildRunMapModuleCapabilities() {
  return buildRunMapBrowserModules();
}

export function buildRunFlowModuleCapabilities() {
  return buildRunFlowBrowserModules();
}
