import { buildAchievementRoadmap } from '../../integration/meta_progression_capabilities.js';
import { buildRunAnalyticsSnapshot } from '../../integration/run_capabilities.js';
import {
  buildTitleClassAssetMarkup,
  escapeHtml,
  formatClearTime,
  resolveTitleClassName,
  TITLE_OUTCOME_LABELS,
} from './title_boot_ui_shared.js';

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
