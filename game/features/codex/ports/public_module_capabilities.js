import { buildCodexPrimaryModuleCatalog } from '../modules/codex_module_catalog.js';

export function createCodexModuleCapabilities() {
  return {
    primary: buildCodexPrimaryModuleCatalog(),
  };
}
