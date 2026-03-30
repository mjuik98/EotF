import { getDoc as getRuntimeDoc, getWin as getRuntimeWin } from '../../../ui/ports/public_dom_support_capabilities.js';
import { buildAchievementRoadmap } from '../../../meta_progression/ports/public_roadmap_capabilities.js';
import { buildRunAnalyticsSnapshot } from '../../../run/ports/public_analytics_capabilities.js';
import { buildSaveRecoveryMeta } from '../../../../shared/save/save_status_formatters.js';
import { bindTitleDisclosurePanels } from './title_disclosure_panels.js';

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
  abandon: '런 중단',
});

function resolveTitleClassName(classId) {
  return TITLE_CLASS_NAMES[String(classId || '')] || String(classId || '-');
}

function buildTitleAssetPreviewUrl(data, domain, id) {
  return data?.assetPreview?.resolveUrl?.(domain, id) || '';
}

function buildTitleClassAssetMarkup(classId, data) {
  const previewId = String(classId || '');
  if (!previewId) return '';
  const previewUrl = buildTitleAssetPreviewUrl(data, 'characters', previewId);
  if (!previewUrl) return '';
  return `<span class="title-class-preview" data-asset-preview="characters.${escapeHtml(previewId)}" style="display:inline-flex;width:26px;height:26px;border-radius:9px;background-image:url('${previewUrl}');background-size:cover;background-position:center;box-shadow:0 8px 16px rgba(0,0,0,0.28), inset 0 0 0 1px rgba(255,255,255,0.12);flex-shrink:0;"></span>`;
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

function buildRunArchiveSummary(entries = []) {
  const totalRuns = entries.length;
  const victories = entries.filter((entry) => entry?.outcome === 'victory').length;
  const highestAscension = entries.reduce((best, entry) => Math.max(best, Number(entry?.ascension || 0)), 0);
  const maxKills = entries.reduce((best, entry) => Math.max(best, Number(entry?.kills || 0)), 0);
  const winRate = totalRuns > 0 ? Math.round((victories / totalRuns) * 100) : 0;

  return [
    `최근 ${totalRuns}런`,
    `승률 ${winRate}%`,
    `최고 승천 A${highestAscension}`,
    `최다 처치 ${maxKills}`,
  ];
}

function buildRunAnalyticsRows(meta = {}) {
  const snapshot = buildRunAnalyticsSnapshot(meta);
  if (!snapshot.totalRuns) return '';

  const rows = [
    `평균 층 ${snapshot.avgFloor}`,
    `평균 처치 ${snapshot.avgKills}`,
  ];
  if (snapshot.favoriteClassId) {
    rows.push(`주력 클래스 ${resolveTitleClassName(snapshot.favoriteClassId)} · ${snapshot.favoriteClassRuns}런`);
  }
  if (snapshot.bestClassId) {
    rows.push(`최고 승률 ${resolveTitleClassName(snapshot.bestClassId)} · ${snapshot.bestClassWinRate}%`);
  }
  if (snapshot.currentStreakCount > 0 && snapshot.currentStreakOutcome) {
    rows.push(`현재 흐름 ${snapshot.currentStreakCount}${TITLE_OUTCOME_LABELS[snapshot.currentStreakOutcome]}`);
  }
  if (Array.isArray(snapshot.recentOutcomeLabels) && snapshot.recentOutcomeLabels.length > 0) {
    rows.push(`최근 흐름 ${snapshot.recentOutcomeLabels.join(' · ')}`);
  }

  const classBreakdown = Array.isArray(snapshot.classBreakdown)
    ? snapshot.classBreakdown.slice(0, 3)
    : [];

  return `
    <div class="title-run-archive-roadmap">
      <div class="title-run-archive-label">전술 분석</div>
      <div class="title-run-archive-summary">
        ${rows.map((badge) => `<span class="title-run-archive-badge">${escapeHtml(badge)}</span>`).join('')}
      </div>
      ${classBreakdown.length > 0 ? `
        <div class="title-run-archive-label">클래스별 전적</div>
        <div class="title-run-archive-list">
          ${classBreakdown.map((entry) => `
            <div class="title-run-archive-row">
              <strong>${escapeHtml(resolveTitleClassName(entry.classId))}</strong>
              <span>${escapeHtml(`런 ${entry.runs} · 승률 ${entry.winRate}%`)}</span>
              <span>${escapeHtml(`최고 ${entry.bestFloor}층 · 평균 ${entry.avgFloor}층`)}</span>
            </div>
          `).join('')}
        </div>
      ` : ''}
    </div>
  `;
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

function buildRecoveryMeta(metrics = {}) {
  return buildSaveRecoveryMeta(metrics);
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

export function renderTitleRecentRuns(doc, gs, data = null) {
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
          ${buildTitleClassAssetMarkup(entry?.classId, data)}
          <span class="title-recent-run-outcome">${escapeHtml(TITLE_OUTCOME_LABELS[entry?.outcome] || '기록')}</span>
          <strong>${escapeHtml(resolveTitleClassName(entry?.classId))}</strong>
          <span>${escapeHtml(buildRecentRunSubtitle(entry))}</span>
        </div>
      `).join('')}
    </div>
  `;
}

export function renderTitleRunArchive(doc, gs, data = null) {
  const disclosureEl = doc.getElementById('titleArchiveDisclosure');
  const summaryEl = doc.getElementById('titleArchiveSummary');
  const detailEl = doc.getElementById('titleRunArchive');
  if (!summaryEl || !detailEl) return;

  const entries = Array.isArray(gs?.meta?.recentRuns)
    ? gs.meta.recentRuns.slice(-5).reverse()
    : [];
  if (entries.length === 0) {
    if (disclosureEl) disclosureEl.style.display = 'none';
    summaryEl.innerHTML = '';
    detailEl.innerHTML = '';
    return;
  }

  const achievementRows = buildAchievementRoadmapRows(buildAchievementRoadmap(gs?.meta).account);
  const summaryBadges = buildRunArchiveSummary(entries);
  const analyticsRows = buildRunAnalyticsRows(gs?.meta);

  if (disclosureEl) disclosureEl.style.display = 'grid';
  summaryEl.innerHTML = summaryBadges
    .map((badge) => `<span class="title-run-archive-badge">${escapeHtml(badge)}</span>`)
    .join('');

  detailEl.innerHTML = `
    <div class="title-run-archive-list">
      ${entries.map((entry) => `
        <div class="title-run-archive-row">
          <strong>${buildTitleClassAssetMarkup(entry?.classId, data)} Run ${escapeHtml(entry?.runNumber || 0)}</strong>
          <span>${escapeHtml(TITLE_OUTCOME_LABELS[entry?.outcome] || '기록')} · ${escapeHtml(resolveTitleClassName(entry?.classId))}</span>
          <span>${escapeHtml(buildRunArchiveMeta(entry))}</span>
        </div>
      `).join('')}
    </div>
    ${analyticsRows}
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
  const data = options.data || null;

  renderTitleRecentRuns(doc, displayState, data);
  renderTitleRunArchive(doc, displayState, data);
  renderTitleRecoveryPanel(doc, saveSystem, gs);
  bindTitleDisclosurePanels(doc);

  return hasSave;
}
