import { buildCoreProgressionModules } from './build_core_progression_modules.js';
import { buildCoreRunSystemModules } from './build_core_run_system_modules.js';
import { buildCoreUtilityModules } from './build_core_utility_modules.js';

export function buildCoreSystemModules() {
  const groups = {
    progression: buildCoreProgressionModules(),
    run: buildCoreRunSystemModules(),
    utility: buildCoreUtilityModules(),
  };

  return {
    ...groups.progression,
    ...groups.run,
    ...groups.utility,
  };
}
