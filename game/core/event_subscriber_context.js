import { GAME } from './global_bridge.js';

export function createEventSubscriberContext(uiRefs = {}) {
  const ui = uiRefs || {};
  const actions = ui.actions || {};
  const doc = ui.doc || (typeof document !== 'undefined' ? document : null);
  const win = ui.win || (typeof window !== 'undefined' ? window : null);

  const resolveAction = (name) => {
    const injected = actions?.[name];
    if (typeof injected === 'function') return injected;

    const api = GAME.API?.[name];
    if (typeof api === 'function') return api;

    const globalFn = win?.[name];
    if (typeof globalFn === 'function') return globalFn;

    return null;
  };

  const callAction = (name, ...args) => {
    const fn = resolveAction(name);
    if (!fn) return undefined;
    return fn(...args);
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
    resolveAction,
    ui,
    win,
  };
}
