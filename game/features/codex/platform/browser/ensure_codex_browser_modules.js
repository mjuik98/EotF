import { buildCodexPrimaryBrowserModules } from './codex_browser_modules.js';
import { publishLegacyModuleBag } from '../../../../platform/legacy/game_module_registry.js';

function resolveCodexRuntimeModule(modules = {}, key, scopeNames = []) {
  for (const scopeName of scopeNames) {
    const scopedRefs = modules?.featureScopes?.[scopeName] || {};
    if (scopedRefs[key] !== undefined) {
      return scopedRefs[key];
    }
  }

  if (modules?.legacyModules?.[key] !== undefined) {
    return modules.legacyModules[key];
  }

  if (modules?.[key] !== undefined) {
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

  const codexModules = buildCodexPrimaryBrowserModules();
  return assignCodexModules(modules, codexModules);
}
