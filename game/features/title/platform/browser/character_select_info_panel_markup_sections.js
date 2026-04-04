export function buildLockedStateMarkup({ unlockLabel, message, unlocked = false } = {}) {
  return `
    <div class="char-locked-state${unlocked ? '' : ' is-locked'}" ${unlocked ? '' : 'aria-disabled="true"'}>
      <div class="char-locked-state-head">
        <span class="char-feature-badge${unlocked ? '' : ' is-locked'}">${unlockLabel}</span>
      </div>
      <div class="char-info-text">${message}</div>
    </div>
  `;
}

export function buildFeatureSectionMarkup({
  title,
  badgeLabel,
  body,
  locked = false,
} = {}) {
  return `
    <div class="char-feature-panel${locked ? ' is-locked' : ''}" ${locked ? 'aria-disabled="true"' : ''}>
      <div class="char-feature-panel-head">
        <div class="char-feature-panel-title">${title}</div>
        <span class="char-feature-badge${locked ? ' is-locked' : ''}">${badgeLabel}</span>
      </div>
      ${body}
    </div>
  `;
}

export function buildRoadmapSummaryMarkup(roadmapPreviewText, summaryHint) {
  return `
    <span class="csm-roadmap-summary-copy">
      <span class="csm-roadmap-summary-stack">
        <span class="csm-roadmap-summary-title">마스터리 로드맵</span>
        <span class="csm-roadmap-summary-preview">${roadmapPreviewText}</span>
        <span class="csm-roadmap-summary-hint">${summaryHint}</span>
      </span>
      <span class="csm-roadmap-summary-caret">+</span>
    </span>
  `;
}
