import {
  Logger,
  getWin as getRuntimeWin,
} from '../../../utils/public_feature_support.js';
import { ErrorCodes, ErrorSeverity } from '../../../core/error_codes.js';
import { reportError } from '../../../core/error_reporter.js';

function getStorage() {
  try {
    const hostWindow = getRuntimeWin();
    return hostWindow?.localStorage || null;
  } catch {
    return null;
  }
}

function resolveSaveAdapterDeps(deps = {}) {
  return {
    storage: deps.storage || getStorage(),
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
        this._notifySaveFailed({ key, reason: 'Storage quota exceeded' }, deps);
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

  _notifySaveFailed(payload, deps = {}) {
    const notifyStorageFailure = deps.notifyStorageFailure;
    return notifyStorageFailure?.(payload, deps) || false;
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
