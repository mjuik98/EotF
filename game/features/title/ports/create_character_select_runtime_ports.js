import {
  getTitleCancelAnimationFrame,
  getTitleClearInterval,
  getTitleDoc,
  getTitleRequestAnimationFrame,
  getTitleSetTimeout,
  getTitleWin,
} from './title_runtime_ports.js';

export function createCharacterSelectRuntimePorts(deps = {}) {
  const doc = getTitleDoc(deps);
  const win = getTitleWin({ ...deps, doc });
  const runtimeDeps = { ...deps, doc, win };

  return {
    doc,
    win,
    requestAnimationFrameImpl: getTitleRequestAnimationFrame(runtimeDeps),
    cancelAnimationFrameImpl: getTitleCancelAnimationFrame(runtimeDeps),
    setTimeoutImpl: getTitleSetTimeout(runtimeDeps),
    clearIntervalImpl: getTitleClearInterval(runtimeDeps),
  };
}
