import { hydrateMetaState } from './save_repository.js';
import { SAVE_BUNDLE_SCHEMA_VERSION, syncActiveSaveSlot } from './save_slot_keys.js';

export function exportSaveBundle(system, deps = {}) {
  const slot = system.resolveSlot(deps);
  return {
    schemaVersion: SAVE_BUNDLE_SCHEMA_VERSION,
    slot,
    exportedAt: Date.now(),
    meta: system.readMetaPreview({ ...deps, slot }),
    run: system._readRunSaveData({ ...deps, slot, logErrors: false }),
  };
}

export function importSaveBundle(system, bundle, deps = {}) {
  if (!bundle || typeof bundle !== 'object') {
    throw new Error('[SaveSystem] Invalid save bundle.');
  }

  const slot = system.resolveSlot(deps);
  const { saveKey, metaKey } = system._getSlotKeys(slot);
  const nextMeta = bundle.meta && typeof bundle.meta === 'object'
    ? { ...bundle.meta, activeSaveSlot: slot }
    : null;
  const nextRun = bundle.run && typeof bundle.run === 'object'
    ? bundle.run
    : null;

  if (nextMeta) system._persistWithOutbox(metaKey, nextMeta, deps);
  if (nextRun) system._persistWithOutbox(saveKey, nextRun, deps);
  system.selectSlot(slot, deps);

  if (deps?.gs?.meta && nextMeta) {
    hydrateMetaState(deps.gs, nextMeta);
    syncActiveSaveSlot(deps.gs, slot);
  }
  return { status: 'imported', slot };
}
