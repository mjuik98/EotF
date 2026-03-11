import { Logger } from '../../utils/logger.js';
import { ErrorCodes, ErrorSeverity } from '../../core/error_codes.js';
import { reportError } from '../../core/error_reporter.js';

function getHostRoot() {
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
  const hostWindow = getHostWindow();
  return hostWindow?.localStorage || null;
}

function getDocument() {
  return getHostWindow()?.document || null;
}

export const SaveAdapter = {
  load(key) {
    try {
      const raw = getStorage()?.getItem(key);
      return raw !== null && raw !== undefined ? JSON.parse(raw) : null;
    } catch (error) {
      reportError(error, {
        code: ErrorCodes.SAVE_LOAD_FAILED,
        severity: ErrorSeverity.WARN,
        context: 'SaveAdapter.load',
        meta: { key },
      });
      return null;
    }
  },

  save(key, data) {
    try {
      getStorage()?.setItem(key, JSON.stringify(data));
      return true;
    } catch (error) {
      if (error?.name === 'QuotaExceededError') {
        Logger.warn('[SaveAdapter] Quota exceeded while saving.');
        this._notifySaveFailed('Storage quota exceeded');
      } else {
        reportError(error, {
          code: ErrorCodes.SAVE_WRITE_FAILED,
          severity: ErrorSeverity.ERROR,
          context: 'SaveAdapter.save',
          meta: { key },
        });
      }
      return false;
    }
  },

  _notifySaveFailed(reason) {
    const doc = getDocument();
    if (!doc?.body) return;
    const el = doc.createElement('div');
    el.textContent = `Save failed: ${reason}`;
    el.style.cssText =
      'position:fixed;bottom:24px;right:24px;background:#ff3366;color:white;padding:12px 20px;border-radius:8px;z-index:9999;font-family:sans-serif;font-size:14px;box-shadow:0 4px 12px rgba(0,0,0,0.5);';
    doc.body.appendChild(el);
    setTimeout(() => el.remove(), 4000);
  },

  remove(key) {
    try {
      getStorage()?.removeItem(key);
    } catch {
      // Best-effort cleanup.
    }
  },

  has(key) {
    try {
      return getStorage()?.getItem(key) !== null;
    } catch {
      return false;
    }
  },
};
