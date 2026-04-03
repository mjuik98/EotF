import { bindTitleDisclosurePanels } from './title_disclosure_panels.js';
import {
  renderTitleRecentRuns,
  renderTitleRunArchive,
} from './title_run_archive_helpers.js';
import {
  renderTitleRecoveryPanel,
  renderTitleSaveSlotControls,
} from './title_save_slot_controls.js';
import {
  clearSavePreview,
  populateSaveTooltip,
  resolveMetaPreview,
  resolveSelectedSaveSlot,
  resolveSlotSummaries,
} from './title_save_slot_preview.js';

export {
  clearSavePreview,
  populateSaveTooltip,
  renderTitleRecoveryPanel,
};

export function refreshTitleSaveState(doc, saveSystem, gs, options = {}) {
  if (!options?.skipFlushOutbox) {
    saveSystem?.flushOutbox?.();
  }
  const selectedSlot = resolveSelectedSaveSlot(saveSystem, gs);
  saveSystem?.selectSlot?.(selectedSlot, { gs });
  const slotSummaries = resolveSlotSummaries(saveSystem, selectedSlot);
  renderTitleSaveSlotControls(doc, saveSystem, gs, {
    ...options,
    slotSummaries,
    refreshTitleSaveState,
  });
  const selectedSummary = slotSummaries.find((summary) => Number(summary?.slot || 0) === selectedSlot) || null;

  let hasSave = saveSystem?.hasSave?.({ slot: selectedSlot }) ?? false;
  const runSection = doc.getElementById('titleRunSection');
  const continueWrap = doc.getElementById('titleContinueWrap');
  const menuDivider = doc.getElementById('titleMenuDivider');
  const continueBtn = doc.getElementById('mainContinueBtn');

  if (hasSave) {
    hasSave = populateSaveTooltip(doc, saveSystem, gs, selectedSlot, selectedSummary?.preview || null);
  }

  const hasAnyOtherSavedSlot = slotSummaries.some((summary) => {
    const slot = Number(summary?.slot || 0);
    return slot !== selectedSlot && !!summary?.hasSave;
  });
  const hasAnySave = hasSave || hasAnyOtherSavedSlot;

  if (runSection) runSection.style.display = hasAnySave ? 'flex' : 'none';
  if (continueWrap) continueWrap.style.display = hasSave ? 'block' : 'none';
  if (menuDivider) menuDivider.style.display = hasSave ? 'block' : 'none';
  if (continueBtn) continueBtn.disabled = !hasSave;

  if (!hasSave) {
    clearSavePreview(doc);
  }

  const metaPreview = resolveMetaPreview(saveSystem, gs, selectedSlot);
  const displayState = metaPreview ? { ...gs, meta: metaPreview } : gs;
  const data = options.data || null;

  renderTitleRecentRuns(doc, displayState, data);
  renderTitleRunArchive(doc, displayState, data);
  renderTitleRecoveryPanel(doc, saveSystem, gs, { refreshTitleSaveState });
  bindTitleDisclosurePanels(doc);

  return hasSave;
}
