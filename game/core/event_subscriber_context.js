import { GAME } from './global_bridge.js';
import { EventBus } from './event_bus.js';
import { Actions } from './state_actions.js';
import { playUiCard } from './audio_feedback_support_capabilities.js';
import { resolveLegacyAction } from '../platform/legacy/public.js';
import { resolveBrowserRuntime } from './runtime_environment.js';

export function createEventSubscriberContext(uiRefs = {}) {
  const ui = uiRefs || {};
  const actions = ui.actions || {};
  const { doc, win } = resolveBrowserRuntime(ui);
  const legacyRoot = ui.legacyRoot || GAME;

  const resolveAction = (name) => {
    return resolveLegacyAction(name, {
      actions,
      root: legacyRoot,
      win,
    });
  };

  const callAction = (name, ...args) => {
    const fn = resolveAction(name);
    if (!fn) return undefined;
    return fn(...args);
  };

  const subscribeAction = (actionName, callback) => {
    const action = Actions[actionName];
    if (!action || typeof callback !== 'function') return () => {};
    return EventBus.on(action, callback);
  };

  const playUiCardAudio = () => {
    return playUiCard(ui.AudioEngine || legacyRoot.Audio);
  };

  const createFloatingGold = (delta) => {
    if (!doc?.body) return;
    const el = doc.createElement('div');
    el.style.cssText = `position:fixed;left:50%;top:${40 + Math.random() * 20}%;transform:translate(-50%,-50%);font-family:'Share Tech Mono',monospace;font-size:24px;font-weight:900;color:var(--gold);text-shadow:0 0 20px rgba(240,180,41,0.9);pointer-events:none;z-index:9500;animation:goldPop 1.4s ease forwards;`;
    el.textContent = `+${delta} Gold`;
    doc.body.appendChild(el);
    setTimeout(() => el.remove(), 1400);
  };

  return {
    actions,
    callAction,
    createFloatingGold,
    doc,
    legacyRoot,
    playUiCardAudio,
    resolveAction,
    subscribeAction,
    ui,
    win,
  };
}
