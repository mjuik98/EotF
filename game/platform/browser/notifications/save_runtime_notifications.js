import {
  buildNoticeStyle,
  resolveStorageFailureText,
} from './notice_surface.js';

function getDoc(deps = {}) {
  return deps.doc || deps.win?.document || null;
}

function presentStorageFailure(payload = {}, deps = {}) {
  const doc = getDoc(deps);
  if (!doc?.body) return false;

  const el = doc.createElement('div');
  el.textContent = resolveStorageFailureText(payload);
  el.style.cssText = buildNoticeStyle('error');
  doc.body.appendChild(el);
  (deps.setTimeoutFn || setTimeout)(() => el.remove(), 4000);
  return true;
}

export function createSaveRuntimeNotifications(deps = {}) {
  const presentSaveStatus = deps.presentSaveStatus;
  return {
    saveStatus(status, notificationDeps = {}) {
      return presentSaveStatus?.(status, notificationDeps) || false;
    },

    storageFailure(payload, notificationDeps = {}) {
      return presentStorageFailure(payload, notificationDeps);
    },
  };
}
