export function buildLockedStateMarkup({ accent, unlockLabel, message, unlocked = false } = {}) {
  const badgeStyle = unlocked
    ? `border-color:${accent}55;color:${accent};background:${accent}14;`
    : 'border-color:rgba(255,255,255,0.16);background:rgba(255,255,255,0.06);color:rgba(213,221,242,0.76);';
  const wrapperStyle = unlocked
    ? 'border:1px solid rgba(255,255,255,0.12);border-radius:10px;background:rgba(255,255,255,0.035);padding:10px 12px;'
    : 'border:1px solid rgba(255,255,255,0.12);border-radius:10px;background:rgba(255,255,255,0.02);padding:10px 12px;opacity:0.72;';
  const headStyle = 'display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:8px;';
  const badgeBaseStyle = 'display:inline-flex;align-items:center;justify-content:center;padding:2px 8px;border-radius:999px;border:1px solid;font-size:9px;letter-spacing:0.08em;white-space:nowrap;';
  return `
    <div class="char-locked-state${unlocked ? '' : ' is-locked'}" ${unlocked ? '' : 'aria-disabled="true"'} style="${wrapperStyle}">
      <div class="char-locked-state-head" style="${headStyle}">
        <span class="char-feature-badge${unlocked ? '' : ' is-locked'}" style="${badgeBaseStyle}${badgeStyle}">${unlockLabel}</span>
      </div>
      <div class="char-info-text">${message}</div>
    </div>
  `;
}

export function buildFeatureSectionMarkup({
  accent,
  title,
  badgeLabel,
  body,
  locked = false,
} = {}) {
  const wrapperStyle = locked
    ? 'border:1px solid rgba(255,255,255,0.12);border-radius:10px;background:rgba(255,255,255,0.02);padding:10px 12px;opacity:0.72;'
    : 'border:1px solid rgba(255,255,255,0.12);border-radius:10px;background:rgba(255,255,255,0.035);padding:10px 12px;';
  const headStyle = 'display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:8px;';
  const titleStyle = "font-size:11px;letter-spacing:0.08em;color:#edf4ff;font-family:'Share Tech Mono',monospace;";
  const badgeStyle = locked
    ? 'border-color:rgba(255,255,255,0.16);background:rgba(255,255,255,0.06);color:rgba(213,221,242,0.76);'
    : `border-color:${accent}55;color:${accent};background:${accent}14;`;
  const badgeBaseStyle = 'display:inline-flex;align-items:center;justify-content:center;padding:2px 8px;border-radius:999px;border:1px solid;font-size:9px;letter-spacing:0.08em;white-space:nowrap;';
  return `
    <div class="char-feature-panel${locked ? ' is-locked' : ''}" ${locked ? 'aria-disabled="true"' : ''} style="${wrapperStyle}margin-top:10px;">
      <div class="char-feature-panel-head" style="${headStyle}">
        <div class="char-feature-panel-title" style="${titleStyle}">${title}</div>
        <span class="char-feature-badge${locked ? ' is-locked' : ''}" style="${badgeBaseStyle}${badgeStyle}">${badgeLabel}</span>
      </div>
      ${body}
    </div>
  `;
}

export function buildRoadmapSummaryMarkup(roadmapPreviewText, summaryHint) {
  return `
    <span class="csm-roadmap-summary-copy" style="display:flex;align-items:flex-start;justify-content:space-between;gap:10px;width:100%;">
      <span style="display:grid;gap:3px;">
        <span class="csm-roadmap-summary-title" style="font-size:10px;letter-spacing:0.12em;">마스터리 로드맵</span>
        <span class="csm-roadmap-summary-preview" style="font-size:11px;letter-spacing:0.02em;color:#edf4ff;">${roadmapPreviewText}</span>
        <span class="csm-roadmap-summary-hint" style="font-size:10px;letter-spacing:0.04em;color:rgba(213,221,242,0.68);">${summaryHint}</span>
      </span>
      <span class="csm-roadmap-summary-caret" style="flex-shrink:0;font-size:16px;line-height:1;color:rgba(239,239,255,0.58);">+</span>
    </span>
  `;
}
