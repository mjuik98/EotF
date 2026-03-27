import {
  calcDiffScore,
  getActiveInscriptionCount,
  getActiveSynergies,
  getDiffLevel,
} from './run_mode_ui_helpers.js';
import { highlightRunModeText } from './run_mode_text_highlight.js';

function buildUnlockRoadmapRows(entries = []) {
  return entries.slice(0, 4).map((entry) => `
    <div class="char-info-text" style="display:grid;gap:3px;padding:8px 10px;border:1px solid rgba(255,255,255,0.1);border-radius:10px;background:rgba(255,255,255,0.03);">
      <span style="color:#edf4ff">${entry.contentLabel}</span>
      <span style="color:rgba(213,221,242,0.76)">${entry.requirementLabel}</span>
      <span style="color:rgba(213,221,242,0.68)">${entry.achievementTitle}${entry.progressLabel ? ` · ${entry.progressLabel}` : ''}</span>
      ${entry.focusLabel ? `<span style="color:rgba(160,214,198,0.74)">${entry.focusLabel}</span>` : ''}
    </div>
  `).join('');
}

function buildChallengeTags(tags = []) {
  return tags.map((tag) => `<span class="rm-summary-tag neutral">${tag}</span>`).join('');
}

export function renderChallengePanel(doc, challenge = null) {
  const zone = doc.getElementById('rmChallengeZone');
  if (!zone) return;

  if (!challenge) {
    zone.innerHTML = '';
    return;
  }

  zone.innerHTML = `
    <div class="rm-challenge-panel">
      <div class="rm-section-label" style="margin-bottom:8px;">${challenge.label}</div>
      <div class="rm-challenge-date">${challenge.dateLabel}</div>
      <div class="rm-challenge-summary">${challenge.summary}</div>
      <div class="rm-challenge-tags">${buildChallengeTags(challenge.tags)}</div>
      <div class="rm-challenge-reward">${challenge.rewardLabel || ''}</div>
      <button type="button" class="rm-apply-challenge-btn" data-action="apply-daily-challenge">${challenge.buttonLabel || '구성 적용'}</button>
    </div>
  `;
}

export function renderUnlockRoadmap(doc, roadmap = {}) {
  const zone = doc.getElementById('rmUnlockRoadmapZone');
  if (!zone) return;

  const entries = [
    ...(roadmap?.account || []),
    ...(roadmap?.class || []),
  ];

  if (entries.length === 0) {
    zone.innerHTML = '';
    return;
  }

  zone.innerHTML = `
    <div class="char-info-block" style="margin-top:14px;">
      <div class="rm-section-label" style="margin-bottom:8px;">다음 해금</div>
      <div style="display:grid;gap:8px;">
        ${buildUnlockRoadmapRows(entries)}
      </div>
    </div>
  `;
}

export function renderSummaryBar(doc, cfg, meta, runRules, gs, data) {
  const zone = doc.getElementById('rmSummaryBarZone');
  if (!zone) return;

  const tags = [];
  const curse = runRules?.curses?.[cfg?.curse || 'none'];
  const score = calcDiffScore(runRules, gs);
  const reward = typeof runRules?.getRewardMultiplier === 'function'
    ? runRules.getRewardMultiplier(gs)
    : +(1 + score * 0.015).toFixed(2);
  const activeSyn = getActiveSynergies(meta, cfg, data);
  const earned = Object.entries(meta?.inscriptions || {}).filter(([, value]) => Number(value) > 0);
  const allOff = earned.length > 0 && earned.every(([key]) => (cfg?.disabledInscriptions || []).includes(key));

  tags.push({ tone: 'neutral', text: `A${cfg?.ascension || 0}` });
  if (cfg?.endless) tags.push({ tone: 'echo', text: '무한 모드' });
  if (curse && curse.id !== 'none') tags.push({ tone: 'danger', text: `${curse.icon || ''} ${curse.name}`.trim() });
  if (getActiveInscriptionCount(meta, cfg) > 0) tags.push({ tone: 'echo', text: `활성 각인 ${getActiveInscriptionCount(meta, cfg)}` });
  if (activeSyn.length > 0) tags.push({ tone: 'purple', text: `시너지 ${activeSyn.length}` });
  if (allOff) tags.push({ tone: 'secret', text: '각인 없이 시작' });

  zone.innerHTML = `
    <div class="rm-summary-bar${cfg?.curse && cfg.curse !== 'none' ? ' cursed' : ''}">
      <div class="rm-summary-title">현재 구성</div>
      <div class="rm-summary-tags">
        ${tags.map((tag) => `<span class="rm-summary-tag ${tag.tone}">${tag.text}</span>`).join('')}
      </div>
      <div class="rm-summary-reward-wrap">
        <span class="rm-summary-tag gold reward">보상 x${reward}</span>
      </div>
    </div>
  `;
}

export function renderHiddenEnding(meta, cfg, doc) {
  const zone = doc.getElementById('rmHiddenEndingZone');
  if (!zone) return;

  const insc = meta.inscriptions || {};
  const earned = Object.entries(insc).filter(([, v]) => Number(v) > 0);
  const disabled = new Set(cfg.disabledInscriptions || []);
  const allOff = earned.length > 0 && earned.every(([key]) => disabled.has(key));

  if (!allOff) {
    zone.innerHTML = '';
    return;
  }

  zone.innerHTML = `
    <div class="rm-hidden-banner">
      <div class="rm-hidden-icon">*</div>
      <div class="rm-hidden-body">
        <div class="rm-hidden-title">히든 엔딩 조건 충족</div>
        <div class="rm-hidden-desc">${highlightRunModeText('각인을 모두 비활성화한 채 시작하면 숨겨진 결말에 도달할 수 있습니다.')}</div>
        <div class="rm-hidden-tag">각인 없는 런</div>
      </div>
    </div>
  `;
}

export function renderDifficultyPanel(panel, cfg, meta, runRules, gs) {
  const maxAsc = Math.max(0, meta.maxAscension || 0);
  const ascUnlocked = !!meta.unlocks?.ascension;
  const endlessUnlocked = !!meta.unlocks?.endless;

  const score = calcDiffScore(runRules, gs);
  const diff = getDiffLevel(score);
  const rewardMultiplier = typeof runRules?.getRewardMultiplier === 'function'
    ? runRules.getRewardMultiplier(gs)
    : +(1 + score * 0.015).toFixed(2);

  const ascColor = cfg.ascension === 0
    ? 'var(--rm-echo, #00ffcc)'
    : `hsl(${Math.round(60 - ((cfg.ascension || 0) / Math.max(1, maxAsc)) * 60)}, 90%, 62%)`;

  panel.innerHTML = `
    <div id="rmPresetZone"></div>

    <div class="rm-top-row">
      <div class="rm-top-card">
        <div class="rm-card-label">승천 단계</div>
        <div class="rm-stepper">
          <button class="rm-step-btn" type="button" data-action="shift-asc" data-delta="-1" ${!ascUnlocked || cfg.ascension <= 0 ? 'disabled' : ''} aria-label="승천 감소">-</button>
          <span class="rm-asc-val" style="color:${ascColor}">A${cfg.ascension}</span>
          <button class="rm-step-btn" type="button" data-action="shift-asc" data-delta="1" ${!ascUnlocked || cfg.ascension >= maxAsc ? 'disabled' : ''} aria-label="승천 증가">+</button>
        </div>
        <div class="rm-sub-text">${cfg.ascension === 0 ? '기본 난이도입니다' : `적 능력치 +${cfg.ascension * 20}%`}</div>
        <div class="rm-lock-badge" style="display:${ascUnlocked ? 'none' : ''}">챕터 2 클리어 시 해금</div>
      </div>

      <div class="rm-top-card">
        <div class="rm-card-label">무한 모드</div>
        <div class="rm-endless-row">
          <button id="endlessToggleBtn" type="button" role="switch" class="rm-toggle${cfg.endless ? ' on' : ''}${!endlessUnlocked ? ' locked' : ''}" data-action="toggle-endless" aria-checked="${cfg.endless}" aria-label="무한 모드 토글" ${!endlessUnlocked ? 'disabled' : ''}></button>
          <span class="rm-toggle-label${cfg.endless ? ' on' : ''}">${cfg.endless ? '켜짐' : '꺼짐'}</span>
        </div>
        <div class="rm-sub-text">보스 처치 후 다음 순환으로 진행</div>
        <div class="rm-lock-badge" style="display:${endlessUnlocked ? 'none' : ''}">메타 진행도로 해금</div>
      </div>

      <div class="rm-top-card">
        <div class="rm-card-label">난이도 점수</div>
        <div class="rm-diff-header">
          <span class="rm-diff-num" style="color:${diff.color};text-shadow:0 0 20px ${diff.color}55">${score}</span>
          <span class="rm-diff-label" style="color:${diff.color}">${diff.label}</span>
        </div>
        <div class="rm-diff-bar-track">
          <div class="rm-diff-bar-fill" style="width:${Math.min(100, score * 1.4)}%;background:linear-gradient(90deg,${diff.color}88,${diff.color})"></div>
        </div>
        <div class="rm-diff-bottom">
          <span class="rm-diff-desc">${highlightRunModeText(diff.desc)}</span>
          <span class="rm-diff-reward">보상 x${rewardMultiplier}</span>
        </div>
      </div>
    </div>

    <div id="rmChallengeZone"></div>
    <div class="rm-section-label">저주 선택 <span class="rm-section-hint">난이도 상승</span></div>
    <div id="rmCurseGrid" class="rm-option-grid" role="radiogroup" aria-label="저주 선택"></div>

    <div id="rmInscriptionZone"></div>
    <div id="rmUnlockRoadmapZone"></div>

    <div id="rmHiddenEndingZone"></div>
    <div id="rmSummaryBarZone"></div>
  `;
}
