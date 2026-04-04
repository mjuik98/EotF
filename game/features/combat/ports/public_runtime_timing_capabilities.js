import { getSetTimeout as getRuntimeSetTimeout } from '../../../platform/browser/dom/public.js';

export function getCombatSetTimeout(deps = {}) {
  if (typeof deps.getCombatSetTimeout === 'function') {
    return deps.getCombatSetTimeout(deps);
  }

  return getRuntimeSetTimeout(deps);
}
