import { getDoc as getRuntimeDoc, getWin as getRuntimeWin } from '../../../ui/ports/public_dom_support_capabilities.js';
import { buildAchievementRoadmap } from '../../../meta_progression/public.js';

export function getDoc(deps) {
  return getRuntimeDoc(deps);
}

export function getWin(deps) {
  return getRuntimeWin(deps);
}

export function setText(doc, id, value) {
  const el = doc.getElementById(id);
  if (el) el.textContent = value;
}

function bindEventOnce(element, eventName, handler, cacheKey) {
  if (!element || typeof handler !== 'function') return;
  if (element[cacheKey] && typeof element.removeEventListener === 'function') {
    element.removeEventListener(eventName, element[cacheKey]);
  }
  element[cacheKey] = handler;
  element.addEventListener?.(eventName, handler);
}

const TITLE_CLASS_NAMES = Object.freeze({
  swordsman: '검사',
  mage: '마법사',
  hunter: '사냥꾼',
  paladin: '성기사',
  berserker: '광전사',
  guardian: '수호자',
  rogue: '도적',
});

const TITLE_OUTCOME_LABELS = Object.freeze({
  victory: '승리',
  defeat: '패배',
  abandon: '중단',
});

function resolveTitleClassName(classId) {
  return TITLE_CLASS_NAMES[String(classId || '')] || String(classId || '-');
}

function resolveSelectedSlot(saveSystem, gs) {
  return Number(
    saveSystem?.getSelectedSlot?.()
    || gs?.meta?.activeSaveSlot
    || 1,
  );
}

function createFallbackSlotSummaries(saveSystem, slot) {
  const preview = saveSystem?.readRunPreview?.({ slot }) || null;
  return [
    {
      slot,
      hasSave: !!preview,
      preview,
      meta: saveSystem?.readMetaPreview?.({ slot }) || null,
    },
  ];
}

function resolveSlotSummaries(saveSystem, slot) {
  const summaries = saveSystem?.getSlotSummaries?.() || createFallbackSlotSummaries(saveSystem, slot);
  return Array.isArray(summaries) && summaries.length ? summaries : createFallbackSlotSummaries(saveSystem, slot);
}

function resolveMetaPreview(saveSystem, gs, slot) {
  const metaPreview = saveSystem?.readMetaPreview?.({ slot });
  if (metaPreview && typeof metaPreview === 'object') return metaPreview;
  return gs?.meta || null;
}

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function formatClearTime(ms) {
  const totalSeconds = Math.max(0, Math.floor(Number(ms || 0) / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

function buildRecentRunSubtitle(entry) {
  const tags = [`A${entry?.ascension || 0}`];
  if (Number(entry?.floor || 0) > 0) tags.push(`${entry.floor}층`);
  if (Number(entry?.clearTimeMs || 0) > 0) tags.push(formatClearTime(entry.clearTimeMs));
  if (entry?.endless) tags.push('무한');
  if (entry?.curseId && entry.curseId !== 'none') tags.push(entry.curseId);
  const milestones = Array.isArray(entry?.milestones) ? entry.milestones.filter(Boolean) : [];
  milestones.slice(0, 2).forEach((milestone) => tags.push(String(milestone)));
  if (Number(entry?.maxChain || 0) > 0) tags.push(`연쇄 ${entry.maxChain}`);
  return tags.join(' · ');
}

function buildRunArchiveMeta(entry) {
  return [
    `층 ${entry?.floor || 1}`,
    Number(entry?.clearTimeMs || 0) > 0 ? formatClearTime(entry.clearTimeMs) : '',
    Number(entry?.storyCount || 0) > 0 ? `기억 ${entry.storyCount}` : '',
    Number(entry?.kills || 0) > 0 ? `처치 ${entry.kills}` : '',
    Number(entry?.unlockCount || 0) > 0 ? `해금 ${entry.unlockCount}` : '',
    Number(entry?.achievementCount || 0) > 0 ? `업적 ${entry.achievementCount}` : '',
    ...(Array.isArray(entry?.milestones) ? entry.milestones.slice(0, 2).map((milestone) => String(milestone)) : []),
  ].filter(Boolean).join(' · ');
}

function buildAchievementRoadmapRows(entries = []) {
  if (!Array.isArray(entries) || entries.length === 0) return '';
  return `
    <div class="title-run-archive-roadmap">
      <div class="title-run-archive-label">다음 업적</div>
      <div class="title-run-archive-list">
        ${entries.map((entry) => `
          <div class="title-run-archive-row">
            <strong>${escapeHtml(`${entry.icon || '✦'} ${entry.title || ''}`.trim())}</strong>
            <span>${escapeHtml(entry.progressLabel || '')}${entry.focusLabel ? ` · ${escapeHtml(entry.focusLabel)}` : ''}</span>
            <span>${escapeHtml(entry.rewardLabel || entry.description || '')}</span>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

function formatRetryTiming(nextRetryAt) {
  const retryAt = Number(nextRetryAt || 0);
  if (!retryAt) return '';
  const diffMs = retryAt - Date.now();
  if (diffMs <= 0) return '곧 재시도';
  return `${Math.max(1, Math.ceil(diffMs / 1000))}초 후 재시도`;
}

function formatElapsedTiming(timestamp) {
  const value = Number(timestamp || 0);
  if (!value) return '';
  const diffMs = Math.max(0, Date.now() - value);
  const diffSeconds = Math.max(1, Math.floor(diffMs / 1000));
  if (diffSeconds < 60) return `${diffSeconds}초 전`;
  const diffMinutes = Math.floor(diffSeconds / 60);
  if (diffMinutes < 60) return `${diffMinutes}분 전`;
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}시간 전`;
  return `${Math.floor(diffHours / 24)}일 전`;
}

function buildRecoveryMeta(metrics = {}) {
  const parts = [];
  const retryFailures = Number(metrics?.retryFailures || 0);
  if (retryFailures > 0) parts.push(`재시도 실패 ${retryFailures}회`);
  const lastFailureLabel = formatElapsedTiming(metrics?.lastFailureAt);
  if (lastFailureLabel) parts.push(`마지막 실패 ${lastFailureLabel}`);
  const retryTiming = formatRetryTiming(metrics?.nextRetryAt);
  if (retryTiming) parts.push(retryTiming);
  return parts.join(' · ');
}

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

export function renderTitleRecentRuns(doc, gs) {
  const el = doc.getElementById('titleRecentRuns');
  if (!el) return;

  const entries = Array.isArray(gs?.meta?.recentRuns)
    ? gs.meta.recentRuns.slice(-3).reverse()
    : [];

  if (entries.length === 0) {
    el.innerHTML = '';
    return;
  }

  el.innerHTML = `
    <div class="title-recent-runs-label">최근 귀환</div>
    <div class="title-recent-runs-list">
      ${entries.map((entry) => `
        <div class="title-recent-run-chip ${escapeHtml(entry?.outcome || 'defeat')}">
          <span class="title-recent-run-outcome">${escapeHtml(TITLE_OUTCOME_LABELS[entry?.outcome] || '기록')}</span>
          <strong>${escapeHtml(resolveTitleClassName(entry?.classId))}</strong>
          <span>${escapeHtml(buildRecentRunSubtitle(entry))}</span>
        </div>
      `).join('')}
    </div>
  `;
}

export function renderTitleRunArchive(doc, gs) {
  const el = doc.getElementById('titleRunArchive');
  if (!el) return;

  const entries = Array.isArray(gs?.meta?.recentRuns)
    ? gs.meta.recentRuns.slice(-5).reverse()
    : [];
  if (entries.length === 0) {
    el.innerHTML = '';
    return;
  }

  const achievementRows = buildAchievementRoadmapRows(buildAchievementRoadmap(gs?.meta).account);

  el.innerHTML = `
    <div class="title-run-archive-label">귀환 기록실</div>
    <div class="title-run-archive-list">
      ${entries.map((entry) => `
        <div class="title-run-archive-row">
          <strong>Run ${escapeHtml(entry?.runNumber || 0)}</strong>
          <span>${escapeHtml(TITLE_OUTCOME_LABELS[entry?.outcome] || '기록')} · ${escapeHtml(resolveTitleClassName(entry?.classId))}</span>
          <span>${escapeHtml(buildRunArchiveMeta(entry))}</span>
        </div>
      `).join('')}
    </div>
    ${achievementRows}
  `;
}

export function renderTitleRecoveryPanel(doc, saveSystem, gs) {
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
    <div class="title-recovery-meta">${escapeHtml(buildRecoveryMeta(metrics))}</div>
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
    refreshTitleSaveState(doc, saveSystem, gs, { skipFlushOutbox: true });
  };

  retryBtn.__titleRecoveryHandler = handleRetry;
  retryBtn.addEventListener('click', handleRetry);
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

function resolveRunPreview(saveSystem, gs, slot) {
  const preview = saveSystem?.readRunPreview?.({ slot });
  if (preview?.player) return preview;

  const saveLoaded = saveSystem?.loadRun?.({ gs, slot });
  if (!saveLoaded || !gs?.player) return null;
  return gs;
}

function resolvePreviewAscension(preview, gs) {
  const savedAscension = preview?.meta?.runConfig?.ascension;
  if (savedAscension !== undefined && savedAscension !== null) {
    return savedAscension;
  }
  return gs?.meta?.runConfig?.ascension ?? 0;
}

function buildSaveSlotPreviewMeta(summary = {}) {
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

export function populateSaveTooltip(doc, saveSystem, gs, slot) {
  try {
    const preview = resolveRunPreview(saveSystem, gs, slot);
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
    setText(doc, 'titleContinueMeta', `${preview.currentFloor || 1}층 · ${className} · A${ascension}${queuedSuffix}`);

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
        const title = item?.name || item?.id || '';
        const icon = item?.icon || '★';
        return `<span class="title-stt-relic" title="${title}">${icon}</span>`;
      }).join('');
    }

    return true;
  } catch (error) {
    console.warn('[GameBootUI] Save tooltip populate failed:', error);
    return false;
  }
}

function renderTitleSaveSlotControls(doc, saveSystem, gs, options = {}) {
  const slotBar = doc.getElementById('titleSaveSlotBar');
  if (!slotBar) return;

  const selectedSlot = resolveSelectedSlot(saveSystem, gs);
  const slotSummaries = resolveSlotSummaries(saveSystem, selectedSlot);
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
    refreshTitleSaveState(doc, saveSystem, gs, {
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
    refreshTitleSaveState(doc, saveSystem, gs, {
      ...options,
      skipFlushOutbox: true,
    });
  }, '__titleSaveImportHandler');

  bindEventOnce(deleteBtn, 'click', () => {
    saveSystem?.clearSave?.({ slot: selectedSlot });
    refreshTitleSaveState(doc, saveSystem, gs, {
      ...options,
      skipFlushOutbox: true,
    });
  }, '__titleSaveDeleteHandler');
}

export function refreshTitleSaveState(doc, saveSystem, gs, options = {}) {
  if (!options?.skipFlushOutbox) {
    saveSystem?.flushOutbox?.();
  }
  const selectedSlot = resolveSelectedSlot(saveSystem, gs);
  saveSystem?.selectSlot?.(selectedSlot, { gs });
  renderTitleSaveSlotControls(doc, saveSystem, gs, options);

  let hasSave = saveSystem?.hasSave?.({ slot: selectedSlot }) ?? false;
  const continueWrap = doc.getElementById('titleContinueWrap');
  const menuDivider = doc.getElementById('titleMenuDivider');
  const continueBtn = doc.getElementById('mainContinueBtn');

  if (hasSave) {
    hasSave = populateSaveTooltip(doc, saveSystem, gs, selectedSlot);
  }

  if (continueWrap) continueWrap.style.display = hasSave ? 'block' : 'none';
  if (menuDivider) menuDivider.style.display = hasSave ? 'block' : 'none';
  if (continueBtn) continueBtn.disabled = !hasSave;

  if (!hasSave) {
    clearSavePreview(doc);
  }

  const metaPreview = resolveMetaPreview(saveSystem, gs, selectedSlot);
  const displayState = metaPreview ? { ...gs, meta: metaPreview } : gs;

  renderTitleRecentRuns(doc, displayState);
  renderTitleRunArchive(doc, displayState);
  renderTitleRecoveryPanel(doc, saveSystem, gs);

  return hasSave;
}
