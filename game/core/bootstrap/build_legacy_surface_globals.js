import { buildLegacySurfaceGlobalGroups } from './build_legacy_surface_global_groups.js';

export function buildLegacySurfaceGlobals({ modules, fns }) {
  const groups = buildLegacySurfaceGlobalGroups({ modules, fns });

  return {
    ...groups.engine,
    ...groups.system,
    ...groups.ui,
    ...groups.binding,
  };
}
