import { buildScreenFeaturePrimaryModules } from './build_screen_feature_primary_modules.js';

export function registerEventModules() {
  const { EventUI } = buildScreenFeaturePrimaryModules();
  return EventUI ? { EventUI } : {};
}
