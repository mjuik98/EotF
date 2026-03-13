import { createCodexModuleCapabilities } from './ports/public_module_capabilities.js';
import { createCodexBrowserModuleCapabilities } from './ports/public_browser_modules.js';

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

export { ensureCodexBrowserModules } from './ports/public_browser_modules.js';
