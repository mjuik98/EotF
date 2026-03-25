import { Logger } from '../../utils/logger.js';
import { ErrorCodes, ErrorSeverity } from '../../core/error_codes.js';
import { reportError } from '../../core/error_reporter.js';

function getHostRoot() {
  if (typeof globalThis !== 'undefined') {
    return globalThis;
  }
  try {
    return Function('return this')();
  } catch {
    return null;
  }
}

function getHostWindow() {
  const hostRoot = getHostRoot();
  if (!hostRoot) return null;
  return hostRoot.window || hostRoot;
}

function getStorage() {
  try {
    const hostWindow = getHostWindow();
    return hostWindow?.localStorage || null;
  } catch {
    return null;
  }
}

function getDocument() {
  try {
    return getHostWindow()?.document || null;
  } catch {
    return null;
  }
}

function resolveSaveAdapterDeps(deps = {}) {
  return {
    storage: deps.storage || getStorage(),
    doc: deps.doc || getDocument(),
    setTimeoutFn: typeof deps.setTimeoutFn === 'function' ? deps.setTimeoutFn : setTimeout,
    reportErrorFn: deps.reportErrorFn || reportError,
    logger: deps.logger || Logger,
  };
}

export const SaveAdapter = {
  load(key, deps = {}) {
    const { storage, reportErrorFn } = resolveSaveAdapterDeps(deps);
    try {
      const raw = storage?.getItem(key);
      return raw !== null && raw !== undefined ? JSON.parse(raw) : null;
    } catch (error) {
      reportErrorFn(error, {
        code: ErrorCodes.SAVE_LOAD_FAILED,
        severity: ErrorSeverity.WARN,
        context: 'SaveAdapter.load',
        meta: { key },
      });
      return null;
    }
  },

  save(key, data, deps = {}) {
    const { storage, logger } = resolveSaveAdapterDeps(deps);
    if (!storage || typeof storage.setItem !== 'function') {
      logger.warn('[SaveAdapter] Storage unavailable while saving.');
      return false;
    }
    try {
      storage.setItem(key, JSON.stringify(data));
      return true;
    } catch (error) {
      if (error?.name === 'QuotaExceededError') {
        logger.warn('[SaveAdapter] Quota exceeded while saving.');
        this._notifySaveFailed('Storage quota exceeded', deps);
      } else {
        resolveSaveAdapterDeps(deps).reportErrorFn(error, {
          code: ErrorCodes.SAVE_WRITE_FAILED,
          severity: ErrorSeverity.ERROR,
          context: 'SaveAdapter.save',
          meta: { key },
        });
      }
      return false;
    }
  },

  _notifySaveFailed(reason, deps = {}) {
    const { doc, setTimeoutFn } = resolveSaveAdapterDeps(deps);
    if (!doc?.body) return;
    const el = doc.createElement('div');
    el.textContent = `Save failed: ${reason}`;
    el.style.cssText =
      'position:fixed;bottom:24px;right:24px;background:#ff3366;color:white;padding:12px 20px;border-radius:8px;z-index:9999;font-family:sans-serif;font-size:14px;box-shadow:0 4px 12px rgba(0,0,0,0.5);';
    doc.body.appendChild(el);
    setTimeoutFn(() => el.remove(), 4000);
  },

  remove(key, deps = {}) {
    const { storage } = resolveSaveAdapterDeps(deps);
    try {
      storage?.removeItem?.(key);
    } catch {
      // Best-effort cleanup.
    }
  },

  has(key, deps = {}) {
    const { storage } = resolveSaveAdapterDeps(deps);
    try {
      return storage?.getItem(key) !== null;
    } catch {
      return false;
    }
  },
};
