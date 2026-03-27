export function sanitizeLoadedSaveEntry(raw, {
  key,
  label,
  logErrors = true,
  queued = false,
  isUnsupportedFutureVersion = () => false,
  dropOutboxKey = () => {},
  removePersistedKey = () => {},
  logWarn = () => {},
} = {}) {
  if (!raw) return null;
  if (!isUnsupportedFutureVersion(raw)) return raw;

  if (queued) {
    dropOutboxKey(key);
  } else {
    removePersistedKey(key);
  }

  if (logErrors) {
    logWarn(`[SaveSystem] Dropped unsupported future-version ${queued ? 'queued ' : ''}${label} save.`);
  }
  return null;
}

export function readRunSaveRecord({
  outbox = [],
  saveAdapter,
  saveKey,
  logErrors = true,
  isUnsupportedFutureVersion = () => false,
  migrateSave = (value) => value,
  validateSaveData = () => true,
  dropOutboxKey = () => {},
  removePersistedKey = () => {},
  logWarn = () => {},
  logError = () => {},
} = {}) {
  try {
    const raw = sanitizeLoadedSaveEntry(saveAdapter?.load?.(saveKey) || null, {
      key: saveKey,
      label: 'run',
      logErrors,
      isUnsupportedFutureVersion,
      dropOutboxKey,
      removePersistedKey,
      logWarn,
    });
    const queued = sanitizeLoadedSaveEntry(
      (Array.isArray(outbox) ? outbox : []).find((entry) => entry.key === saveKey)?.data || null,
      {
        key: saveKey,
        label: 'run',
        logErrors,
        queued: true,
        isUnsupportedFutureVersion,
        dropOutboxKey,
        removePersistedKey,
        logWarn,
      },
    );
    const saveState = raw ? 'saved' : (queued ? 'queued' : null);
    const data = migrateSave(raw || queued);
    if (!data) return null;

    if (!validateSaveData(data)) {
      if (logErrors) logError('[SaveSystem] Save data validation failed');
      return null;
    }

    return {
      data,
      saveState,
    };
  } catch (error) {
    if (logErrors) logError('[SaveSystem] Run load failed:', error);
    return null;
  }
}

export function readMetaSaveData({
  outbox = [],
  saveAdapter,
  metaKey,
  logErrors = true,
  isUnsupportedFutureVersion = () => false,
  migrateSave = (value) => value,
  ensureMetaRunConfig = () => {},
  dropOutboxKey = () => {},
  removePersistedKey = () => {},
  logWarn = () => {},
  logError = () => {},
} = {}) {
  try {
    const raw = sanitizeLoadedSaveEntry(saveAdapter?.load?.(metaKey) || null, {
      key: metaKey,
      label: 'meta',
      logErrors,
      isUnsupportedFutureVersion,
      dropOutboxKey,
      removePersistedKey,
      logWarn,
    });
    const queued = sanitizeLoadedSaveEntry(
      (Array.isArray(outbox) ? outbox : []).find((entry) => entry.key === metaKey)?.data || null,
      {
        key: metaKey,
        label: 'meta',
        logErrors,
        queued: true,
        isUnsupportedFutureVersion,
        dropOutboxKey,
        removePersistedKey,
        logWarn,
      },
    );
    const data = migrateSave(raw || queued);
    if (!data) return null;

    ensureMetaRunConfig(data);
    return data;
  } catch (error) {
    if (logErrors) logError('[SaveSystem] Meta preview load failed:', error);
    return null;
  }
}
