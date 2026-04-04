import { getRaf as getRuntimeRaf, getSetTimeout as getRuntimeSetTimeout } from '../../../platform/browser/dom/public.js';

export function getRunSetTimeout(deps = {}) {
  if (typeof deps.getRunSetTimeout === 'function') return deps.getRunSetTimeout(deps);
  return getRuntimeSetTimeout(deps);
}

export function getRunRaf(deps = {}) {
  if (typeof deps.getRunRaf === 'function') return deps.getRunRaf(deps);
  return getRuntimeRaf(deps);
}
