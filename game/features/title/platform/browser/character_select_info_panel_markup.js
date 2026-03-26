export {
  arraysEqual,
  buildFeaturedCardMarkup,
  buildPlayStyleMarkup,
  inferFeaturedCardTag,
  normalizeRelicIds,
  resolveFeaturedCardIds,
  resolveFeaturedCardTags,
  resolvePlayStyle,
} from './character_select_info_panel_featured_content.js';

function escapeAttr(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

export function buildLevel11PresetSummary(preset, cards) {
  if (!preset) return '없음';
  if (preset.type === 'upgrade') {
    const cardName = cards?.[preset.cardId]?.name || preset.cardId;
    return `강화: ${cardName}`;
  }
  if (preset.type === 'swap') {
    const fromName = cards?.[preset.removeCardId]?.name || preset.removeCardId;
    const toName = cards?.[preset.addCardId]?.name || preset.addCardId;
    return `교체: ${fromName} -> ${toName}`;
  }
  return '없음';
}

export function buildDeckCardMarkup(deck, cards, accent) {
  return `<div class="char-start-deck">${(deck || []).map((cardId) => {
    const card = cards?.[cardId] || { name: cardId };
    const cardLabel = [card.name, card.desc].filter(Boolean).join('. ');
    return `<span class="deck-card" data-cid="${escapeAttr(cardId)}" data-card-label="${escapeAttr(cardLabel)}" style="border:1px solid ${accent}1a;padding:4px 10px;font-size:11px;background:${accent}05;cursor:help">${card.name}</span>`;
  }).join('')}</div>`;
}

export function buildInteractiveDeckCardMarkup(deck, cards, accent, options = {}) {
  const upgradeIndices = new Set((options.upgradeIndices || []).map((entry) => Number(entry)));
  const swapIndices = new Set((options.swapIndices || []).map((entry) => Number(entry)));
  const mode = options.mode === 'swap' ? 'swap' : 'upgrade';
  const selectedIndex = mode === 'swap' ? options.selectedSwapIndex : options.selectedUpgradeIndex;

  return `<div class="char-start-deck">${(deck || []).map((cardId, index) => {
    const card = cards?.[cardId] || { name: cardId };
    const selectable = mode === 'swap' ? swapIndices.has(index) : upgradeIndices.has(index);
    const selected = selectedIndex !== null && selectedIndex !== undefined && Number(selectedIndex) === index;
    const stateLabel = selected ? (mode === 'swap' ? '교체 대상' : '강화 예정') : '';
    const borderColor = selected ? `${accent}99` : (selectable ? `${accent}44` : `${accent}1a`);
    const background = selected ? `${accent}12` : (selectable ? `${accent}08` : `${accent}05`);
    const boxShadow = selected ? `0 0 0 1px ${accent}66 inset, 0 6px 14px rgba(0, 0, 0, 0.16)` : 'none';
    const cardLabel = [card.name, card.desc].filter(Boolean).join('. ');
    return `
      <span
        class="deck-card level11-edit-card"
        data-cid="${escapeAttr(cardId)}"
        data-card-label="${escapeAttr(cardLabel)}"
        data-level11-index="${index}"
        data-level11-selectable="${selectable ? 'true' : 'false'}"
        style="display:inline-flex;flex-direction:column;align-items:flex-start;gap:4px;border:1px solid ${borderColor};padding:6px 10px;font-size:11px;background:${background};cursor:${selectable ? 'pointer' : 'help'};box-shadow:${boxShadow}"
      >
        <span>${card.name}</span>
        ${stateLabel ? `<span class="level11-card-state" style="display:inline-flex;align-items:center;padding:1px 6px;border-radius:999px;border:1px solid ${accent}55;background:${accent}16;color:${accent};font-size:9px;letter-spacing:0.06em;">${stateLabel}</span>` : ''}
      </span>
    `;
  }).join('')}</div>`;
}

export function buildRelicMarkup(relics, accent, options = {}) {
  const slotOffset = Number(options.slotOffset) || 0;
  return `
    <div class="relic-wrap">
      ${(relics || []).map((relic, index) => `
        <div
          class="relic-inner"
          data-relic-index="${index}"
          data-relic-title="${relic.icon} ${relic.name}"
          data-relic-desc="${relic.desc || ''}"
          style="border:1px solid ${accent}33;background:${accent}08;padding:10px 16px"
        >
          <span style="font-size:24px">${relic.icon}</span>
          <div>
            <div style="font-size:13px;color:${accent};font-family:'Share Tech Mono',monospace;letter-spacing:.5px">${relic.name}</div>
            <div style="font-size:11px;color:${accent}66;font-family:'Share Tech Mono',monospace">${index + slotOffset === 0 ? '기본 유물' : '추가 유물'}</div>
          </div>
        </div>
      `).join('')}
    </div>
  `;
}

export function buildRoadmapPreviewMeta(roadmap = [], classProgress = {}) {
  const nextReward = (roadmap || []).find((row) => row?.lv > classProgress.level);
  if (!nextReward) {
    return {
      previewText: '모든 마스터리 보상 해금 완료',
      summaryHint: '획득한 보상 다시 보기',
    };
  }
  return {
    previewText: `다음 해금: Lv.${nextReward.lv} ${nextReward.desc}`,
    summaryHint: '펼쳐서 전체 해금 보상 보기',
  };
}

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

export function buildLevel12PresetSummary(loadoutCustomization = {}) {
  return loadoutCustomization.level12Preset?.bonusRelicId
    ? (loadoutCustomization.eligibleBonusRelics?.find(
      (entry) => entry.id === loadoutCustomization.level12Preset.bonusRelicId,
    )?.name
      || loadoutCustomization.previewRelics?.find(
        (entry) => entry.id === loadoutCustomization.level12Preset.bonusRelicId,
      )?.name
      || loadoutCustomization.level12Preset.bonusRelicId)
    : '미선택';
}
