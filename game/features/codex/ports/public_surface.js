import { createCodexBrowserModuleCapabilities, ensureCodexBrowserModules } from './public_browser_modules.js';
import { createCodexModuleCapabilities } from './public_module_capabilities.js';

export const CodexPublicSurface = Object.freeze({
  createCodexBrowserModuleCapabilities,
  createCodexModuleCapabilities,
});

export {
  createCodexBrowserModuleCapabilities,
  createCodexModuleCapabilities,
  ensureCodexBrowserModules,
};
