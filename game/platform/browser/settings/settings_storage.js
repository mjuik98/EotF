let activeSettingsStorage = null;

export function bindSettingsStorage(adapter) {
  activeSettingsStorage = adapter || null;
  return activeSettingsStorage;
}

export function getSettingsStorage() {
  if (activeSettingsStorage) return activeSettingsStorage;
  if (typeof localStorage !== 'undefined') return localStorage;
  return null;
}
