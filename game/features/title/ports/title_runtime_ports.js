import {
  getDoc as getRuntimeDoc,
  getSetTimeout as getRuntimeSetTimeout,
  getWin as getRuntimeWin,
} from '../../../platform/browser/dom/public.js';

function bindBrowserFn(fn, context) {
  if (typeof fn !== 'function') return null;
  if (typeof fn.bind !== 'function') return fn;
  return fn.bind(context);
}

export function getTitleDoc(deps = {}) {
  if (typeof deps.getTitleDoc === 'function') return deps.getTitleDoc(deps);
  return getRuntimeDoc(deps);
}

export function getTitleWin(deps = {}) {
  if (typeof deps.getTitleWin === 'function') return deps.getTitleWin(deps);
  return getRuntimeWin(deps);
}

export function getTitleSetTimeout(deps = {}, scheduleFn = null) {
  if (typeof scheduleFn === 'function') return scheduleFn;
  if (typeof deps.scheduleTitleTask === 'function') return deps.scheduleTitleTask;
  return getRuntimeSetTimeout(deps);
}

export function getTitleRequestAnimationFrame(deps = {}, requestAnimationFrameImpl = null) {
  if (typeof requestAnimationFrameImpl === 'function') return requestAnimationFrameImpl;
  if (typeof deps.requestAnimationFrame === 'function') return deps.requestAnimationFrame;

  const win = getTitleWin(deps);
  return bindBrowserFn(win?.requestAnimationFrame, win);
}

export function getTitleCancelAnimationFrame(deps = {}, cancelAnimationFrameImpl = null) {
  if (typeof cancelAnimationFrameImpl === 'function') return cancelAnimationFrameImpl;
  if (typeof deps.cancelAnimationFrame === 'function') return deps.cancelAnimationFrame;

  const win = getTitleWin(deps);
  return bindBrowserFn(win?.cancelAnimationFrame, win);
}

export function getTitleClearInterval(deps = {}, clearIntervalImpl = null) {
  if (typeof clearIntervalImpl === 'function') return clearIntervalImpl;
  if (typeof deps.clearInterval === 'function') return deps.clearInterval;

  const win = getTitleWin(deps);
  return bindBrowserFn(win?.clearInterval, win) || clearInterval;
}

export function resolveTitleReload(deps = {}) {
  if (typeof deps.resolveTitleReload === 'function') {
    return deps.resolveTitleReload(deps);
  }
  if (typeof deps.reload === 'function') return deps.reload;

  const win = getTitleWin(deps);
  const location = win?.location || null;
  return bindBrowserFn(location?.reload, location);
}
