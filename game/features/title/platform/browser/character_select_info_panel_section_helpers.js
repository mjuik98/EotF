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
      <div class="char-info-text" style="display:grid;gap:3px;padding:8px 10px;border:1px solid rgba(255,255,255,0.1);border-radius:10px;background:rgba(255,255,255,0.03);">
        <span style="color:#edf4ff">${outcomeLabel} · +${summary?.totalGain || 0} XP${levelLabel}</span>
        <span style="color:rgba(213,221,242,0.68)">누적 ${summary?.after?.totalXp || 0} XP · Lv.${summary?.after?.level || 1}</span>
      </div>
    `;
  }).join('');
}

export function buildLoadoutSlotButtons(loadoutCustomization = {}, accent = '#ffffff') {
  const slots = Array.isArray(loadoutCustomization?.availableSlots)
    ? loadoutCustomization.availableSlots
    : [];
  if (!slots.length) return '';

  return `
    <div class="char-start-deck" style="margin:0 0 10px">
      ${slots.map((slot) => `
        <button
          class="char-loadout-slot-btn"
          type="button"
          data-loadout-slot="${slot.id}"
          style="border:1px solid ${slot.active ? `${accent}66` : 'rgba(255,255,255,0.14)'};background:${slot.active ? `${accent}14` : 'rgba(255,255,255,0.04)'};color:${slot.active ? accent : '#d5ddf2'};border-radius:999px;padding:4px 10px;font-size:10px;letter-spacing:0.06em;cursor:pointer"
        >${slot.label}${slot.hasPreset ? ' ●' : ''}</button>
      `).join('')}
    </div>
  `;
}
