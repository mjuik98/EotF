import { buildScreenFeaturePrimaryModules } from './build_screen_feature_primary_modules.js';

export function registerCodexModules() {
  const { CodexUI } = buildScreenFeaturePrimaryModules();
  return CodexUI ? { CodexUI } : {};
}
