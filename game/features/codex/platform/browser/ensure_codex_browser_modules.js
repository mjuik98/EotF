import { publishLegacyModuleBag } from '../../../../platform/legacy/game_module_registry.js';

const LAZY_MODULE_MARKER = '__lazyModule';

let codexModulesPromise = null;

function resolveCodexRuntimeModule(modules = {}, key, scopeNames = []) {
  for (const scopeName of scopeNames) {
    const scopedRefs = modules?.featureScopes?.[scopeName] || {};
    if (scopedRefs[key] !== undefined && scopedRefs[key]?.[LAZY_MODULE_MARKER] !== true) {
      return scopedRefs[key];
    }
  }

  if (modules?.legacyModules?.[key] !== undefined && modules.legacyModules[key]?.[LAZY_MODULE_MARKER] !== true) {
    return modules.legacyModules[key];
  }

  if (modules?.[key] !== undefined && modules[key]?.[LAZY_MODULE_MARKER] !== true) {
    return modules[key];
  }

  return undefined;
}

function assignCodexModules(modules, codexModules) {
  return publishLegacyModuleBag(modules, codexModules);
}

export async function ensureCodexBrowserModules(modules) {
  const codexUI = resolveCodexRuntimeModule(modules, 'CodexUI', ['codex', 'screen']);
  if (codexUI) {
    return { CodexUI: codexUI };
  }

  if (!codexModulesPromise) {
    codexModulesPromise = import('../../presentation/browser/codex_ui.js')
      .then((mod) => ({ CodexUI: mod.CodexUI }))
      .catch((error) => {
        codexModulesPromise = null;
        throw error;
      });
  }

  const codexModules = await codexModulesPromise;
  if (modules) {
    modules.CodexUI = codexModules.CodexUI;
  }
  return assignCodexModules(modules, codexModules);
}
