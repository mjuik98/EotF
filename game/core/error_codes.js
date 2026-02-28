export const ErrorCodes = Object.freeze({
  UNKNOWN: 'unknown',
  INVALID_ACTION: 'invalid_action',
  EVENT_CONTRACT_MISMATCH: 'event_contract_mismatch',
  EVENT_LISTENER_FAILED: 'event_listener_failed',
  DEPS_CONTRACT_MISSING: 'deps_contract_missing',
  SAVE_WRITE_FAILED: 'save_write_failed',
  SAVE_LOAD_FAILED: 'save_load_failed',
});

export const ErrorSeverity = Object.freeze({
  INFO: 'info',
  WARN: 'warn',
  ERROR: 'error',
  FATAL: 'fatal',
});
