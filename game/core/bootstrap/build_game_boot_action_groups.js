import { buildRunBootPublicActions } from '../../features/run/public.js';
import { buildTitleBootPublicActions } from '../../features/title/public.js';

export function buildGameBootActionGroups(fns) {
  return {
    title: buildTitleBootPublicActions(fns),
    run: buildRunBootPublicActions(fns),
  };
}
