import {
  ROOT_ID,
  docOf,
  winOf,
} from './ending_screen_helpers.js';
import {
  bindEndingRestartButton,
  bindEndingSigilCycle,
  prepareEndingScreenSession,
} from './ending_screen_runtime_helpers.js';
import { burstEndingWisps, runEndingScene } from './ending_screen_fx.js';

export function cleanupEndingSession(session, deps = {}) {
  const doc = docOf(deps);
  if (session) {
    session.timers.forEach((timer) => winOf(deps).clearTimeout(timer));
    session.cleanups.forEach((fn) => {
      try {
        fn?.();
      } catch {}
    });
  }
  doc?.getElementById?.(ROOT_ID)?.remove?.();
}

export function showOutcomeScreenRuntime(outcome = 'victory', deps = {}, hooks = {}) {
  const doc = docOf(deps);
  const gs = deps?.gs;
  const data = deps?.data;
  if (!doc?.body || !gs?.meta || !gs?.player || !gs?.stats) return null;

  const { payload, session, wisps } = prepareEndingScreenSession(outcome, deps, hooks);
  bindEndingSigilCycle(doc, deps, payload, session, wisps);
  bindEndingRestartButton(doc, deps, session, wisps, hooks);
  runEndingScene(doc, deps, payload, wisps, session, burstEndingWisps);
  return session;
}
