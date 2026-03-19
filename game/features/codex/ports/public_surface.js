import { createCodexBrowserModuleCapabilities, ensureCodexBrowserModules } from './public_browser_modules.js';
import { createCodexModuleCapabilities } from './public_module_capabilities.js';

export function createCodexFeatureFacade() {
  return {
    moduleCapabilities: createCodexModuleCapabilities(),
    browserModules: createCodexBrowserModuleCapabilities(),
  };
}

export const CodexPublicSurface = Object.freeze({
  createCodexBrowserModuleCapabilities,
  createCodexFeatureFacade,
  createCodexModuleCapabilities,
});

export { ensureCodexBrowserModules };
