export function buildRoadmapRows(roadmap = [], classProgress = {}) {
  return (roadmap || []).map((row) => {
    const earned = row.lv <= classProgress.level;
    const current = row.lv === classProgress.level + 1;
    const classes = ['csm-roadmap-row', earned ? 'earned' : '', current ? 'current' : '']
      .filter(Boolean)
      .join(' ');
    return `
      <div class="${classes}">
        <span class="csm-roadmap-lv">Lv.${row.lv}</span>
        <span class="csm-roadmap-icon">${row.icon}</span>
        <span class="csm-roadmap-desc">${row.desc}</span>
      </div>
    `;
  }).join('');
}

export function buildRecentSummaryRows(recentSummaries = []) {
  if (!Array.isArray(recentSummaries) || recentSummaries.length === 0) {
    return '<div class="char-info-text">아직 기록된 최근 런이 없습니다.</div>';
  }

  return recentSummaries.map((summary) => {
    const outcomeLabel = summary?.outcome === 'victory' ? '승리' : '패배';
    const levelLabel = Array.isArray(summary?.levelUps) && summary.levelUps.length > 0
      ? ` · 레벨 ${summary.levelUps.join(', ')}`
      : '';
    return `
      <div class="char-info-text char-info-text--summary-row">
        <span class="char-info-text--summary-primary">${outcomeLabel} · +${summary?.totalGain || 0} XP${levelLabel}</span>
        <span class="char-info-text--summary-secondary">누적 ${summary?.after?.totalXp || 0} XP · Lv.${summary?.after?.level || 1}</span>
      </div>
    `;
  }).join('');
}

export function buildLoadoutSlotButtons(loadoutCustomization = {}, _accent = '#ffffff') {
  const slots = Array.isArray(loadoutCustomization?.availableSlots)
    ? loadoutCustomization.availableSlots
    : [];
  if (!slots.length) return '';

  return `
    <div class="char-start-deck char-loadout-slot-row">
      ${slots.map((slot) => `
        <button
          class="char-loadout-slot-btn char-chip-button${slot.active ? ' is-active' : ''}${slot.hasPreset ? ' has-preset' : ''}"
          type="button"
          data-loadout-slot="${slot.id}"
          aria-pressed="${slot.active ? 'true' : 'false'}"
        >${slot.label}${slot.hasPreset ? ' ●' : ''}</button>
      `).join('')}
    </div>
  `;
}
