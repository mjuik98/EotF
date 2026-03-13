let activeSaveStorage = null;

export function bindSaveStorage(adapter) {
  activeSaveStorage = adapter || null;
  return activeSaveStorage;
}

export function getSaveStorage() {
  return activeSaveStorage;
}
