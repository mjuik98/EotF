import { buildCodexPrimaryModuleCatalog } from './modules/codex_module_catalog.js';

export function createCodexModuleCapabilities() {
  return {
    primary: buildCodexPrimaryModuleCatalog(),
  };
}

export function createCodexFeatureFacade() {
  return {
    moduleCapabilities: createCodexModuleCapabilities(),
  };
}

export const CodexPublicSurface = Object.freeze({
  createCodexFeatureFacade,
  createCodexModuleCapabilities,
});
