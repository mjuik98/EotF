const DEFAULT_SAVE_NOTIFICATIONS = Object.freeze({
  saveStatus: null,
  storageFailure: null,
});

const activeSaveRuntimeState = {
  saveSystem: null,
  storage: null,
  notifications: {
    ...DEFAULT_SAVE_NOTIFICATIONS,
  },
};

function hasOwnValue(target, key) {
  return Object.prototype.hasOwnProperty.call(target || {}, key);
}

function normalizeSaveNotifications(notifications = null) {
  return {
    saveStatus: notifications?.saveStatus || null,
    storageFailure: notifications?.storageFailure || null,
  };
}

function cloneSaveNotifications(notifications = null) {
  return {
    ...DEFAULT_SAVE_NOTIFICATIONS,
    ...normalizeSaveNotifications(notifications),
  };
}

export const SaveRuntimeContext = {
  configure(nextContext = {}) {
    return configureSaveRuntimeContext(nextContext);
  },

  get saveSystem() {
    return activeSaveRuntimeState.saveSystem;
  },

  get storage() {
    return activeSaveRuntimeState.storage;
  },

  get notifications() {
    return cloneSaveNotifications(activeSaveRuntimeState.notifications);
  },

  snapshot() {
    return {
      saveSystem: this.saveSystem,
      storage: this.storage,
      notifications: this.notifications,
    };
  },
};

export function configureSaveRuntimeContext(nextContext = {}) {
  if (hasOwnValue(nextContext, 'saveSystem')) {
    activeSaveRuntimeState.saveSystem = nextContext.saveSystem || null;
  }
  if (hasOwnValue(nextContext, 'storage')) {
    activeSaveRuntimeState.storage = nextContext.storage || null;
  }
  if (hasOwnValue(nextContext, 'notifications')) {
    activeSaveRuntimeState.notifications = normalizeSaveNotifications(nextContext.notifications);
  }

  return SaveRuntimeContext;
}

export function bindSaveRuntimeContext(nextContext = {}) {
  return configureSaveRuntimeContext(nextContext);
}

export function getSaveRuntimeContext() {
  return SaveRuntimeContext;
}

export function resolveSaveRuntimeContext(deps = {}) {
  return deps.saveRuntimeContext || deps.SaveRuntimeContext || SaveRuntimeContext;
}

export function bindSaveStorage(adapter) {
  configureSaveRuntimeContext({ storage: adapter || null });
  return getSaveStorage();
}

export function getSaveStorage(deps = {}) {
  return resolveSaveRuntimeContext(deps)?.storage || null;
}

export function bindSaveNotifications(notifications = null) {
  configureSaveRuntimeContext({ notifications });
  return getSaveNotifications();
}

export function getSaveNotifications(deps = {}) {
  return cloneSaveNotifications(resolveSaveRuntimeContext(deps)?.notifications);
}
