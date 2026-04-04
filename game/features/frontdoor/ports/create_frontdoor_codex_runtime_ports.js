import { createCodexBrowserModuleCapabilities } from '../../codex/ports/public_browser_modules.js';

const codexBrowserModules = createCodexBrowserModuleCapabilities();

export function createFrontdoorCodexRuntimePorts({ moduleRegistry } = {}) {
  return {
    async openCodex(state, openCodex) {
      await codexBrowserModules.ensurePrimary(moduleRegistry);
      return openCodex?.(state);
    },
  };
}
