import { Logger } from '../utils/logger.js';
import { ErrorCodes, ErrorSeverity } from './error_codes.js';

export class AppError extends Error {
  constructor(code, message, options = {}) {
    super(message || 'Application error');
    this.name = 'AppError';
    this.code = code || ErrorCodes.UNKNOWN;
    this.severity = options.severity || ErrorSeverity.ERROR;
    this.context = options.context || 'app';
    this.details = options.meta || {};
    if (options.cause) this.cause = options.cause;
  }
}

export function toAppError(input, options = {}) {
  if (input instanceof AppError) return input;

  const message =
    input instanceof Error
      ? input.message
      : typeof input === 'string'
        ? input
        : options.message || 'Unknown error';

  return new AppError(options.code || ErrorCodes.UNKNOWN, message, {
    severity: options.severity || ErrorSeverity.ERROR,
    context: options.context || 'app',
    meta: options.meta || {},
    cause: input instanceof Error ? input : options.cause,
  });
}

export function reportError(input, options = {}) {
  const appError = toAppError(input, options);
  const logPayload = {
    code: appError.code,
    context: appError.context,
    severity: appError.severity,
    message: appError.message,
    ...appError.details,
  };

  if (appError.severity === ErrorSeverity.INFO) {
    Logger.info('[ErrorReporter]', logPayload);
  } else if (appError.severity === ErrorSeverity.WARN) {
    Logger.warn('[ErrorReporter]', logPayload);
  } else {
    Logger.error('[ErrorReporter]', logPayload);
  }

  return appError;
}
