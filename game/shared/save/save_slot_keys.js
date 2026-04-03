export const SAVE_KEY = 'echo_fallen_save';
export const META_KEY = 'echo_fallen_meta';
export const OUTBOX_KEY = 'echo_fallen_outbox';
export const SAVE_ERROR_QUEUED = 'persist queued in outbox';
export const DEFAULT_SAVE_SLOT = 1;
export const SAVE_SLOT_COUNT = 3;
export const SAVE_BUNDLE_SCHEMA_VERSION = 1;

export function normalizeSaveSlot(slot) {
  const resolved = Number(slot);
  if (!Number.isInteger(resolved) || resolved < 1) return DEFAULT_SAVE_SLOT;
  return resolved;
}

export function buildSlotKey(baseKey, slot) {
  const normalizedSlot = normalizeSaveSlot(slot);
  if (normalizedSlot === DEFAULT_SAVE_SLOT) return baseKey;
  return `${baseKey}_slot${normalizedSlot}`;
}

export function hasExplicitSlot(options = {}) {
  return Object.prototype.hasOwnProperty.call(options || {}, 'slot');
}

export function isRunSaveStorageKey(baseKey, key) {
  const value = String(key || '');
  return value === baseKey || value.startsWith(`${baseKey}_slot`);
}

export function syncActiveSaveSlot(gs, slot) {
  if (!gs?.meta) return;
  Object.assign(gs.meta, { activeSaveSlot: normalizeSaveSlot(slot) });
}
