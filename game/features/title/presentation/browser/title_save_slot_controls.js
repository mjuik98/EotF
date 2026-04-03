import { buildSaveRecoveryMeta } from '../../../../shared/save/save_status_formatters.js';
import {
  bindEventOnce,
  escapeHtml,
  getWin,
} from './title_boot_ui_shared.js';
import {
  buildSaveSlotPreviewMeta,
  resolveSelectedSaveSlot,
  resolveSlotSummaries,
} from './title_save_slot_preview.js';

function downloadTextFile(filename, text, options = {}) {
  const doc = options.doc || (typeof document !== 'undefined' ? document : null);
  const win = options.win || (typeof window !== 'undefined' ? window : null);
  if (!doc || !win?.URL?.createObjectURL) return false;

  const blob = new Blob([text], { type: options.type || 'application/json;charset=utf-8' });
  const url = win.URL.createObjectURL(blob);
  const anchor = doc.createElement?.('a');
  if (!anchor) {
    win.URL.revokeObjectURL?.(url);
    return false;
  }

  anchor.href = url;
  anchor.download = filename;
  anchor.style.display = 'none';
  doc.body?.appendChild?.(anchor);
  anchor.click?.();
  anchor.remove?.();
  win.URL.revokeObjectURL?.(url);
  return true;
}

async function readImportFileText(file) {
  if (typeof file?.text === 'function') {
    return file.text();
  }
  return '';
}

export function renderTitleRecoveryPanel(doc, saveSystem, gs, options = {}) {
  const panel = doc.getElementById('titleRecoveryPanel');
  const retryBtn = doc.getElementById('titleRecoveryRetryBtn');
  if (!panel) return;

  const metrics = saveSystem?.getOutboxMetrics?.() || {};
  const queueDepth = Number(metrics?.queueDepth || 0);

  if (queueDepth <= 0) {
    panel.innerHTML = '';
    if (retryBtn) retryBtn.style.display = 'none';
    return;
  }

  panel.innerHTML = `
    <div class="title-recovery-kicker">복구 대기 저장</div>
    <div class="title-recovery-copy">저장 ${queueDepth}건이 브라우저에 남아 있다.</div>
    <div class="title-recovery-meta">${escapeHtml(buildSaveRecoveryMeta(metrics))}</div>
  `;

  if (!retryBtn) return;
  retryBtn.style.display = 'inline-flex';
  retryBtn.textContent = '지금 복구';

  if (retryBtn.__titleRecoveryHandler && typeof retryBtn.removeEventListener === 'function') {
    retryBtn.removeEventListener('click', retryBtn.__titleRecoveryHandler);
  }

  const handleRetry = () => {
    const remaining = Number(saveSystem?.flushOutbox?.() || 0);
    saveSystem?.showSaveStatus?.(
      remaining > 0
        ? { status: 'queued', persisted: false, queueDepth: remaining }
        : { status: 'saved', persisted: true, queueDepth: 0 },
      { doc, gs },
    );
    options.refreshTitleSaveState?.(doc, saveSystem, gs, { skipFlushOutbox: true });
  };

  retryBtn.__titleRecoveryHandler = handleRetry;
  retryBtn.addEventListener('click', handleRetry);
}

export function renderTitleSaveSlotControls(doc, saveSystem, gs, options = {}) {
  const slotBar = doc.getElementById('titleSaveSlotBar');
  if (!slotBar) return;

  const selectedSlot = resolveSelectedSaveSlot(saveSystem, gs);
  const slotSummaries = options.slotSummaries || resolveSlotSummaries(saveSystem, selectedSlot);
  slotBar.innerHTML = slotSummaries.map((summary) => {
    const slot = Number(summary?.slot || 1);
    const active = slot === selectedSlot;
    const hasSave = !!summary?.hasSave;
    const previewMeta = buildSaveSlotPreviewMeta(summary);
    return `
      <button class="title-save-slot-btn ${active ? 'active' : ''} ${hasSave ? 'has-save' : 'empty'}" type="button" data-save-slot="${slot}">
        <span class="title-save-slot-label">슬롯 ${slot}</span>
        <span class="title-save-slot-state">${hasSave ? '저장됨' : '비어 있음'}</span>
        ${previewMeta ? `<span class="title-save-slot-meta">${escapeHtml(previewMeta.primary)}</span>` : ''}
        ${previewMeta ? `<span class="title-save-slot-meta">${escapeHtml(previewMeta.secondary)}</span>` : ''}
      </button>
    `;
  }).join('');

  bindEventOnce(slotBar, 'click', (event) => {
    const nextSlot = Number(event?.target?.closest?.('[data-save-slot]')?.dataset?.saveSlot || 0);
    if (!nextSlot) return;
    saveSystem?.selectSlot?.(nextSlot, { gs });
    saveSystem?.loadMeta?.({ gs, slot: nextSlot });
    options.refreshTitleSaveState?.(doc, saveSystem, gs, {
      ...options,
      skipFlushOutbox: true,
    });
  }, '__titleSaveSlotHandler');

  const downloadText = options.downloadText || downloadTextFile;
  const readImportText = options.readImportText || readImportFileText;
  const exportBtn = doc.getElementById('titleSaveExportBtn');
  const importBtn = doc.getElementById('titleSaveImportBtn');
  const deleteBtn = doc.getElementById('titleSaveDeleteBtn');
  const importInput = doc.getElementById('titleSaveImportInput');

  bindEventOnce(exportBtn, 'click', () => {
    const bundle = saveSystem?.exportBundle?.({ slot: selectedSlot });
    if (!bundle) return;
    downloadText(
      `echo-of-the-fallen-slot-${selectedSlot}.json`,
      JSON.stringify(bundle, null, 2),
      { doc, win: getWin({ doc }), type: 'application/json;charset=utf-8' },
    );
  }, '__titleSaveExportHandler');

  bindEventOnce(importBtn, 'click', () => {
    importInput?.click?.();
  }, '__titleSaveImportTriggerHandler');

  bindEventOnce(importInput, 'change', async (event) => {
    const file = event?.target?.files?.[0];
    if (!file) return;
    const raw = await readImportText(file);
    const bundle = JSON.parse(raw);
    saveSystem?.importBundle?.(bundle, { slot: selectedSlot, gs });
    saveSystem?.loadMeta?.({ gs, slot: selectedSlot });
    if (event?.target) event.target.value = '';
    options.refreshTitleSaveState?.(doc, saveSystem, gs, {
      ...options,
      skipFlushOutbox: true,
    });
  }, '__titleSaveImportHandler');

  bindEventOnce(deleteBtn, 'click', () => {
    saveSystem?.clearSave?.({ slot: selectedSlot });
    options.refreshTitleSaveState?.(doc, saveSystem, gs, {
      ...options,
      skipFlushOutbox: true,
    });
  }, '__titleSaveDeleteHandler');
}
