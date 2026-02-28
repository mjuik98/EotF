import { Logger } from '../utils/logger.js';
import { ErrorCodes, ErrorSeverity } from './error_codes.js';
import { reportError } from './error_reporter.js';

export const SaveAdapter = {
  load(key) {
    try {
      const raw = window.localStorage.getItem(key);
      return raw !== null ? JSON.parse(raw) : null;
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
      window.localStorage.setItem(key, JSON.stringify(data));
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
    if (typeof document === 'undefined') return;
    const el = document.createElement('div');
    el.textContent = `Save failed: ${reason}`;
    el.style.cssText =
      'position:fixed;bottom:24px;right:24px;background:#ff3366;color:white;padding:12px 20px;border-radius:8px;z-index:9999;font-family:sans-serif;font-size:14px;box-shadow:0 4px 12px rgba(0,0,0,0.5);';
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 4000);
  },

  remove(key) {
    try {
      window.localStorage.removeItem(key);
    } catch {
      // Best-effort cleanup.
    }
  },

  has(key) {
    try {
      return window.localStorage.getItem(key) !== null;
    } catch {
      return false;
    }
  },
};
