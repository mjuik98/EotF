import {
  escapeHtml,
  resolveTitleClassName,
  setText,
} from './title_boot_ui_shared.js';

export function resolveSelectedSaveSlot(saveSystem, gs) {
  return Number(
    saveSystem?.getSelectedSlot?.()
    || gs?.meta?.activeSaveSlot
    || 1,
  );
}

function createFallbackSlotSummaries(saveSystem, slot) {
  const hasSave = saveSystem?.hasSave?.({ slot }) ?? false;
  const preview = hasSave ? (saveSystem?.readRunPreview?.({ slot }) || null) : null;
  return [
    {
      slot,
      hasSave,
      preview,
      meta: saveSystem?.readMetaPreview?.({ slot }) || null,
    },
  ];
}

export function resolveSlotSummaries(saveSystem, slot) {
  const summaries = saveSystem?.getSlotSummaries?.() || createFallbackSlotSummaries(saveSystem, slot);
  return Array.isArray(summaries) && summaries.length ? summaries : createFallbackSlotSummaries(saveSystem, slot);
}

export function resolveMetaPreview(saveSystem, gs, slot) {
  const metaPreview = saveSystem?.readMetaPreview?.({ slot });
  if (metaPreview && typeof metaPreview === 'object') return metaPreview;
  return gs?.meta || null;
}

export function clearSavePreview(doc) {
  setText(doc, 'sttClass', '-');
  setText(doc, 'sttFloor', '-');
  setText(doc, 'sttAscension', '-');
  setText(doc, 'sttHp', '- / -');
  setText(doc, 'sttGold', '0');
  setText(doc, 'titleContinueMeta', '');

  const pillsEl = doc.getElementById('sttDeckPills');
  if (pillsEl) pillsEl.innerHTML = '';

  const relicsEl = doc.getElementById('sttRelics');
  if (relicsEl) relicsEl.innerHTML = '';
}

function resolvePreviewSaveState(preview) {
  return preview?.saveState === 'queued' ? 'queued' : 'saved';
}

function resolveRunPreview(saveSystem, slot) {
  return saveSystem?.readRunPreview?.({ slot }) || null;
}

function resolvePreviewAscension(preview, gs) {
  const savedAscension = preview?.meta?.runConfig?.ascension;
  if (savedAscension !== undefined && savedAscension !== null) {
    return savedAscension;
  }
  return gs?.meta?.runConfig?.ascension ?? 0;
}

function resolveSaveSlotLogger(saveSystem) {
  return saveSystem?.logger || null;
}

export function buildSaveSlotPreviewMeta(summary = {}) {
  const preview = summary?.preview;
  if (!preview?.player) return null;

  const className = resolveTitleClassName(preview.player.class);
  const floor = Number(preview?.currentFloor || 1);
  const ascension = resolvePreviewAscension(preview, { meta: summary?.meta });
  const queued = preview?.saveState === 'queued';

  return {
    primary: `${className} · ${floor}층`,
    secondary: `A${ascension}${queued ? ' · 복구 대기' : ''}`,
  };
}

export function populateSaveTooltip(doc, saveSystem, gs, slot, previewOverride = null) {
  try {
    const preview = previewOverride?.player ? previewOverride : resolveRunPreview(saveSystem, slot);
    if (!preview?.player) return false;

    const player = preview.player;
    const saveState = resolvePreviewSaveState(preview);
    const className = resolveTitleClassName(player.class);
    const ascension = resolvePreviewAscension(preview, gs);
    const queuedSuffix = saveState === 'queued' ? ' · 복구 대기' : '';
    setText(doc, 'sttClass', className);
    setText(doc, 'sttFloor', `${preview.currentFloor || 1}층 · ${preview.currentRegion || 0}구역`);
    setText(doc, 'sttAscension', `A${ascension}`);
    setText(doc, 'sttHp', `${player.hp ?? '-'} / ${player.maxHp ?? '-'}`);
    setText(doc, 'sttGold', `${player.gold ?? 0}`);
    setText(doc, 'titleContinueMeta', `저장된 런 · ${preview.currentFloor || 1}층 · ${className} · A${ascension}${queuedSuffix}`);

    const pillsEl = doc.getElementById('sttDeckPills');
    if (pillsEl) {
      const deckSize = Array.isArray(player.deck) ? player.deck.length : 0;
      const pills = [
        `<span class="title-stt-pill title-stt-pill--attack">덱 ${deckSize}장</span>`,
        `<span class="title-stt-pill title-stt-pill--skill">손패 ${player.hand?.length || 0}장</span>`,
      ];
      if (saveState === 'queued') {
        pills.unshift('<span class="title-stt-pill title-stt-pill--queued">복구 대기</span>');
      }
      pillsEl.innerHTML = pills.join('');
    }

    const relicsEl = doc.getElementById('sttRelics');
    if (relicsEl) {
      const items = Array.isArray(player.items) ? player.items.slice(0, 6) : [];
      relicsEl.innerHTML = items.map((item) => {
        const title = escapeHtml(item?.name || item?.id || '');
        const icon = item?.icon || '★';
        return `<span class="title-stt-relic" title="${title}">${icon}</span>`;
      }).join('');
    }

    return true;
  } catch (error) {
    resolveSaveSlotLogger(saveSystem)?.warn?.('[GameBootUI] Save tooltip populate failed:', error);
    return false;
  }
}
