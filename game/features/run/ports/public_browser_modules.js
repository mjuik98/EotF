import { ensureRunFlowBrowserModules } from '../platform/browser/ensure_run_flow_browser_modules.js';

export function createRunBrowserModuleCapabilities() {
  return {
    ensureFlow: ensureRunFlowBrowserModules,
  };
}

export { ensureRunFlowBrowserModules };
