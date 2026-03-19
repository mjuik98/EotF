import { buildCodexPrimaryBrowserModules } from './codex_browser_modules.js';
import { publishLegacyModuleBag } from '../../../../platform/legacy/game_module_registry.js';

function assignCodexModules(modules, codexModules) {
  return publishLegacyModuleBag(modules, codexModules);
}

export async function ensureCodexBrowserModules(modules) {
  if (modules?.CodexUI) {
    return { CodexUI: modules.CodexUI };
  }

  const codexModules = buildCodexPrimaryBrowserModules();
  return assignCodexModules(modules, codexModules);
}
