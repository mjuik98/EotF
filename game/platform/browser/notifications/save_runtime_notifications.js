function getDoc(deps = {}) {
  return deps.doc || deps.win?.document || null;
}

function presentStorageFailure(payload = {}, deps = {}) {
  const doc = getDoc(deps);
  if (!doc?.body) return false;

  const el = doc.createElement('div');
  el.textContent = `Save failed: ${payload.reason || 'Unknown error'}`;
  el.style.cssText =
    'position:fixed;bottom:24px;right:24px;background:#ff3366;color:white;padding:12px 20px;border-radius:8px;z-index:9999;font-family:sans-serif;font-size:14px;box-shadow:0 4px 12px rgba(0,0,0,0.5);';
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
