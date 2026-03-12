import { buildTitleCanvasPublicModules, buildTitlePublicModules } from '../../../features/title/public.js';

export function registerTitleModules() {
  return {
    ...buildTitleCanvasPublicModules(),
    ...buildTitlePublicModules(),
  };
}
