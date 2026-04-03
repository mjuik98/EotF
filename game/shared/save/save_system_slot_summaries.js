import {
  buildSlotKey,
  DEFAULT_SAVE_SLOT,
  normalizeSaveSlot,
  SAVE_SLOT_COUNT,
  syncActiveSaveSlot,
} from './save_slot_keys.js';

export function resolveSaveSlot(system, deps = {}) {
  return normalizeSaveSlot(
    deps?.slot
    ?? deps?.gs?.meta?.activeSaveSlot
    ?? system?._selectedSlot
    ?? DEFAULT_SAVE_SLOT,
  );
}

export function getSaveSlotKeys(system, slot) {
  const resolvedSlot = normalizeSaveSlot(slot);
  return {
    slot: resolvedSlot,
    saveKey: buildSlotKey(system.SAVE_KEY, resolvedSlot),
    metaKey: buildSlotKey(system.META_KEY, resolvedSlot),
  };
}

export function getSelectedSaveSlot(system) {
  return system.resolveSlot();
}

export function selectSaveSlot(system, slot, deps = {}) {
  const selectedSlot = normalizeSaveSlot(slot);
  system._selectedSlot = selectedSlot;
  syncActiveSaveSlot(deps?.gs, selectedSlot);
  return selectedSlot;
}

export function getSaveSlotSummaries(system, { slots = null } = {}) {
  const resolvedSlots = Array.isArray(slots) && slots.length
    ? slots.map((slot) => normalizeSaveSlot(slot))
    : Array.from({ length: SAVE_SLOT_COUNT }, (_, index) => index + 1);

  return resolvedSlots.map((slot) => ({
    slot,
    hasSave: system.hasSave({ slot }),
    preview: system.readRunPreview({ slot }),
    meta: system.readMetaPreview({ slot }),
  }));
}
