import { ensureCodexBrowserModules } from '../platform/browser/ensure_codex_browser_modules.js';

export function createCodexBrowserModuleCapabilities() {
  return {
    ensurePrimary: ensureCodexBrowserModules,
  };
}

export { ensureCodexBrowserModules };
