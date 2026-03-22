function createNullGeneralTooltipApi() {
  return {
    hideGeneralTooltip() {},
    showGeneralTooltip() {},
  };
}

function createNullCardTooltipApi() {
  return {
    hideTooltip() {},
    showTooltip() {},
  };
}

function buildLevel11PresetSummary(preset, cards) {
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

function buildDeckCardMarkup(deck, cards, accent) {
  return `<div class="char-start-deck">${(deck || []).map((cardId) => {
    const card = cards?.[cardId] || { name: cardId };
    return `<span class="deck-card" data-cid="${cardId}" style="border:1px solid ${accent}1a;padding:4px 10px;font-size:11px;background:${accent}05;cursor:help">${card.name}</span>`;
  }).join('')}</div>`;
}

function buildInteractiveDeckCardMarkup(deck, cards, accent, options = {}) {
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
    return `
      <span
        class="deck-card level11-edit-card"
        data-cid="${cardId}"
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

function buildRelicMarkup(relics, accent, options = {}) {
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

function buildRoadmapPreviewMeta(roadmap = [], classProgress = {}) {
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

function buildLockedStateMarkup({ accent, unlockLabel, message, unlocked = false } = {}) {
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

function buildFeatureSectionMarkup({
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
  const marginStyle = locked ? 'margin-top:10px;' : 'margin-top:10px;';
  return `
    <div class="char-feature-panel${locked ? ' is-locked' : ''}" ${locked ? 'aria-disabled="true"' : ''} style="${wrapperStyle}${marginStyle}">
      <div class="char-feature-panel-head" style="${headStyle}">
        <div class="char-feature-panel-title" style="${titleStyle}">${title}</div>
        <span class="char-feature-badge${locked ? ' is-locked' : ''}" style="${badgeBaseStyle}${badgeStyle}">${badgeLabel}</span>
      </div>
      ${body}
    </div>
  `;
}

function buildRoadmapSummaryMarkup(roadmapPreviewText, summaryHint) {
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

function buildLevel12PresetSummary(loadoutCustomization = {}) {
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

function buildPlayStyleMarkup(lines = []) {
  const resolvedLines = Array.isArray(lines) ? lines.filter(Boolean) : [];
  if (resolvedLines.length === 0) {
    return '<div class="char-info-text">운영 감각 정보 없음</div>';
  }

  return `<div class="char-playstyle-list">${resolvedLines
    .slice(0, 3)
    .map((line) => `<div class="char-playstyle-item">${line}</div>`)
    .join('')}</div>`;
}

function inferFeaturedCardTag(card = {}) {
  const desc = String(card?.desc || '');
  if (card?.type === 'POWER') return '지속';
  if (desc.includes('드로우')) return '순환';
  if (desc.includes('회복')) return '회복';
  if (desc.includes('방어막')) return '방벽';
  if (desc.includes('독')) return '누적';
  if (desc.includes('기절')) return '마무리';
  if (desc.includes('에너지')) return '엔진';
  if (desc.includes('잔향')) return '연계';
  if (card?.type === 'ATTACK') return '압박';
  if (card?.type === 'SKILL') return '유틸';
  return '핵심';
}

function buildFeaturedCardMarkup(cardIds, cards, accent, tagMap = {}) {
  const resolvedCards = Array.isArray(cardIds) ? cardIds.filter(Boolean) : [];
  if (resolvedCards.length === 0) {
    return '<div class="char-info-text">대표 카드 정보 없음</div>';
  }

  return `<div class="char-start-deck char-featured-cards">${resolvedCards.slice(0, 3).map((cardId) => {
    const card = cards?.[cardId] || { name: cardId };
    const tag = tagMap?.[cardId] || inferFeaturedCardTag(card);
    return `
      <span class="deck-card deck-card-featured" data-cid="${cardId}" style="border:1px solid ${accent}26;background:linear-gradient(180deg,${accent}10,${accent}04);cursor:help">
        <span class="deck-card-name">${card.name}</span>
        <span class="deck-card-role">${tag}</span>
      </span>
    `;
  }).join('')}</div>`;
}

function resolvePlayStyle(selectedChar) {
  const explicitLines = Array.isArray(selectedChar?.playStyle)
    ? selectedChar.playStyle.filter(Boolean)
    : [];
  if (explicitLines.length > 0) return explicitLines;

  return [
    selectedChar?.summaryText,
    selectedChar?.selectionSummary,
    selectedChar?.desc,
    selectedChar?.traitDesc,
  ].filter(Boolean).slice(0, 2);
}

function resolveFeaturedCardIds(selectedChar) {
  const explicitCards = Array.isArray(selectedChar?.featuredCardIds)
    ? selectedChar.featuredCardIds.filter(Boolean)
    : [];
  if (explicitCards.length > 0) return explicitCards;

  const starterDeck = Array.isArray(selectedChar?.startDeck) ? selectedChar.startDeck : [];
  const uniqueStarterCards = [...new Set(starterDeck)];
  const signatureCards = uniqueStarterCards.filter((cardId) => cardId !== 'strike' && cardId !== 'defend');
  return (signatureCards.length > 0 ? signatureCards : uniqueStarterCards).slice(0, 3);
}

function resolveFeaturedCardTags(selectedChar) {
  return selectedChar?.featuredCardTags && typeof selectedChar.featuredCardTags === 'object'
    ? selectedChar.featuredCardTags
    : {};
}

function normalizeRelicIds(relics, fallbackId = '') {
  return (relics || []).map((relic, index) => String(
    relic?.id
      || relic?.itemId
      || relic?.name
      || (index === 0 ? fallbackId : `${fallbackId}_${index}`)
      || '',
  ));
}

function arraysEqual(left, right) {
  if (left.length !== right.length) return false;
  return left.every((value, index) => value === right[index]);
}

export function renderCharacterInfoPanel({
  panel,
  selectedChar,
  classProgress,
  roadmap,
  buildSectionLabel,
  buildRadar,
  cards,
  generalTooltipUI,
  cardTooltipUI,
  doc,
  win,
  hover,
  echo,
  openModal,
  loadoutCustomization,
  onSaveLoadoutPreset,
  onClearLoadoutPreset,
} = {}) {
  if (!panel || !selectedChar || !classProgress) return;

  const generalTooltip = generalTooltipUI || createNullGeneralTooltipApi();
  const cardTooltip = cardTooltipUI || createNullCardTooltipApi();
  generalTooltip.hideGeneralTooltip({ doc, win });

  const baseDeck = Array.isArray(selectedChar.startDeck) ? selectedChar.startDeck : [];
  const previewDeck = loadoutCustomization?.previewDeck || selectedChar.startDeck;
  const baseRelics = [selectedChar.startRelic];
  const previewRelics = Array.isArray(loadoutCustomization?.previewRelics) && loadoutCustomization.previewRelics.length > 0
    ? loadoutCustomization.previewRelics
    : baseRelics;
  const baseRelicId = String(selectedChar.startRelicId || selectedChar.startRelic?.id || selectedChar.startRelic?.name || '');
  const hasCustomizedLoadout = !!loadoutCustomization && (
    !arraysEqual(baseDeck, previewDeck)
    || !arraysEqual(normalizeRelicIds(baseRelics, baseRelicId), normalizeRelicIds(previewRelics, baseRelicId))
  );
  const roadmapRows = (roadmap || []).map((row) => {
    const earned = row.lv <= classProgress.level;
    const current = row.lv === classProgress.level + 1;
    const classes = ['csm-roadmap-row', earned ? 'earned' : '', current ? 'current' : ''].filter(Boolean).join(' ');
    return `
      <div class="${classes}">
        <span class="csm-roadmap-lv">Lv.${row.lv}</span>
        <span class="csm-roadmap-icon">${row.icon}</span>
        <span class="csm-roadmap-desc">${row.desc}</span>
      </div>
    `;
  }).join('');
  const progressPct = Math.round(classProgress.progress * 100);
  const echoSkill = selectedChar.echoSkill;
  const summaryRelics = Array.isArray(loadoutCustomization?.previewRelics) && loadoutCustomization.previewRelics.length > 0
    ? loadoutCustomization.previewRelics
    : baseRelics;
  const bonusRelics = previewRelics.slice(baseRelics.length);
  const playStyleLines = resolvePlayStyle(selectedChar);
  const featuredCardIds = resolveFeaturedCardIds(selectedChar);
  const featuredCardTags = resolveFeaturedCardTags(selectedChar);
  const { previewText: roadmapPreviewText, summaryHint: roadmapSummaryHint } = buildRoadmapPreviewMeta(roadmap, classProgress);
  const level11Unlocked = !!loadoutCustomization?.level11Unlocked;
  const level12Unlocked = !!loadoutCustomization?.level12Unlocked;
  const level12Summary = buildLevel12PresetSummary(loadoutCustomization);
  const eligibleUpgradeIndices = (loadoutCustomization?.eligibleUpgradeTargets || []).map((entry) => entry.index);
  const eligibleSwapIndices = (loadoutCustomization?.eligibleSwapRemoveTargets || []).map((entry) => entry.index);
  const initialLevel11Mode = loadoutCustomization?.level11Preset?.type === 'swap' ? 'swap' : 'upgrade';
  const initialLevel11UpgradeIndex = null;
  const initialLevel11SwapIndex = null;

  panel.style.setProperty('--char-accent', selectedChar.accent);
  panel.style.setProperty('--char-color', selectedChar.color);
  panel.innerHTML = `
    <div class="char-info-shell">
      <div class="char-info-tabs" role="tablist" aria-label="캐릭터 상세">
        <button class="char-info-tab is-active" type="button" role="tab" aria-selected="true" data-tab="summary">
          요약
        </button>
        <button class="char-info-tab" type="button" role="tab" aria-selected="false" data-tab="details">
          자세히
        </button>
      </div>
      <div class="char-info-body">
        <section class="char-info-pane is-active" data-pane="summary" role="tabpanel">
          <div class="char-info-block" style="border-color:${selectedChar.accent}22;background:${selectedChar.accent}06;">
            ${buildSectionLabel('고유 특성', selectedChar.accent)}
            <p class="char-info-heading" style="color:${selectedChar.accent}">${selectedChar.traitTitle}</p>
            <p class="char-info-text">${selectedChar.traitDesc}</p>
          </div>

          <div class="char-info-block">
            ${buildSectionLabel('에코 스킬', selectedChar.accent)}
            <button id="echoBadge" class="echo-badge char-echo-badge" style="background:linear-gradient(135deg,${selectedChar.accent}0e,${selectedChar.color}08);border:1px solid ${selectedChar.accent}44;">
              <div class="char-echo-icon" style="border-color:${selectedChar.accent}55;background:${selectedChar.accent}14;">${echoSkill.icon}</div>
              <div class="char-echo-copy">
                <div class="char-echo-name" style="color:${selectedChar.accent}">${echoSkill.name}</div>
                <div class="char-echo-desc">${echoSkill.desc}</div>
              </div>
              <div class="char-echo-cost" style="border-color:${selectedChar.accent}33;color:${selectedChar.accent}99;background:${selectedChar.accent}0a;">${echoSkill.echoCost}</div>
            </button>
          </div>

          <div class="char-info-block">
            ${buildSectionLabel('플레이 감각', selectedChar.accent)}
            ${buildPlayStyleMarkup(playStyleLines)}
          </div>

          <div class="char-info-block">
            ${buildSectionLabel('시작 장비', selectedChar.accent)}
            <div class="char-info-text">시작 유물</div>
            ${buildRelicMarkup(summaryRelics, selectedChar.accent)}
          </div>

          <div class="char-info-block">
            ${buildSectionLabel('시작 핵심 카드', selectedChar.accent)}
            ${buildFeaturedCardMarkup(featuredCardIds, cards, selectedChar.accent, featuredCardTags)}
          </div>

          <div class="char-info-block">
            ${buildSectionLabel('다음 마스터리 해금', selectedChar.accent)}
            <div class="char-info-text">${roadmapPreviewText}</div>
          </div>
        </section>

        <section class="char-info-pane" data-pane="details" role="tabpanel">
          <div class="csm-mastery-panel" style="border-color:${selectedChar.accent}2f;background:${selectedChar.accent}0a;">
            <div class="csm-mastery-head">
              <div>
                <div class="csm-mastery-title" style="color:${selectedChar.accent}">CLASS MASTERY</div>
                <div class="csm-mastery-level">${classProgress.nextLevelXp === null ? 'MAX' : `Lv.${classProgress.level}`}</div>
              </div>
              <div class="csm-mastery-xp">
                ${classProgress.nextLevelXp === null ? 'MAX LEVEL' : `${classProgress.totalXp} / ${classProgress.nextLevelXp} XP`}
              </div>
            </div>
            <div class="csm-mastery-bar">
              <div class="csm-mastery-fill" style="width:${progressPct}%;background:${selectedChar.accent};box-shadow:0 0 10px ${selectedChar.accent}55"></div>
            </div>
            <details class="csm-roadmap-details">
              <summary class="csm-roadmap-summary">${buildRoadmapSummaryMarkup(roadmapPreviewText, roadmapSummaryHint)}</summary>
              <div class="csm-roadmap">${roadmapRows}</div>
            </details>
          </div>

          <div class="char-loadout-grid">
            <div class="char-info-block">
              ${buildSectionLabel('스탯', selectedChar.accent)}
              <div class="char-radar-wrap">${buildRadar(selectedChar.stats, selectedChar.accent, null, 210)}</div>
            </div>

            <div class="char-info-block">
              ${buildSectionLabel('시작 유물', selectedChar.accent)}
              <div class="char-info-text">기본 시작 유물</div>
              ${buildRelicMarkup(baseRelics, selectedChar.accent)}
              <div class="char-info-text" style="margin-top:10px">추가 유물</div>
              ${level12Unlocked
    ? (bonusRelics.length > 0
      ? buildRelicMarkup(bonusRelics, selectedChar.accent, { slotOffset: 1 })
      : buildLockedStateMarkup({
        accent: selectedChar.accent,
        unlockLabel: '선택 가능',
        message: '추가 유물을 아직 선택하지 않았습니다.',
        unlocked: true,
      }))
    : buildLockedStateMarkup({
      accent: selectedChar.accent,
      unlockLabel: 'Lv.12 해금',
      message: 'Lv.12 달성 시 추가 유물이 해금됩니다.',
    })}
            </div>
          </div>

          <div class="char-info-block">
            ${buildSectionLabel('시작 덱', selectedChar.accent)}
            ${level11Unlocked ? `
              <div class="char-info-text">카드를 클릭해 대상을 지정하세요.</div>
              <div class="char-start-deck" style="margin:8px 0 10px">
                <button id="level11ModeUpgrade" class="level11-mode-btn" type="button" style="border:1px solid ${initialLevel11Mode === 'upgrade' ? `${selectedChar.accent}66` : 'rgba(255,255,255,0.14)'};background:${initialLevel11Mode === 'upgrade' ? `${selectedChar.accent}14` : 'rgba(255,255,255,0.04)'};color:${initialLevel11Mode === 'upgrade' ? selectedChar.accent : '#d5ddf2'};border-radius:999px;padding:4px 10px;font-size:10px;letter-spacing:0.06em;cursor:pointer">강화</button>
                <button id="level11ModeSwap" class="level11-mode-btn" type="button" style="border:1px solid ${initialLevel11Mode === 'swap' ? `${selectedChar.accent}66` : 'rgba(255,255,255,0.14)'};background:${initialLevel11Mode === 'swap' ? `${selectedChar.accent}14` : 'rgba(255,255,255,0.04)'};color:${initialLevel11Mode === 'swap' ? selectedChar.accent : '#d5ddf2'};border-radius:999px;padding:4px 10px;font-size:10px;letter-spacing:0.06em;cursor:pointer">교체</button>
              </div>
              <div id="level11SelectionNote" class="char-info-text level11-selection-note" style="margin-bottom:8px">${initialLevel11Mode === 'swap' ? '교체할 카드를 선택한 뒤 추가 카드를 골라 저장하세요.' : '강화할 카드를 선택한 뒤 저장하세요.'}</div>
              ${buildInteractiveDeckCardMarkup(baseDeck, cards, selectedChar.accent, {
    upgradeIndices: eligibleUpgradeIndices,
    swapIndices: eligibleSwapIndices,
    mode: initialLevel11Mode,
    selectedUpgradeIndex: initialLevel11UpgradeIndex,
    selectedSwapIndex: initialLevel11SwapIndex,
  })}
              <div class="char-info-text" style="margin-top:10px">추가 카드 선택</div>
              <div class="char-start-deck" style="margin:8px 0 10px">
                ${(loadoutCustomization.eligibleSwapAddCards || []).map((entry) => `
                  <button
                    class="level11-add-card-btn"
                    type="button"
                    data-level11-add-card-id="${entry.cardId}"
                    style="border:1px solid rgba(255,255,255,0.14);background:rgba(255,255,255,0.04);color:#d5ddf2;border-radius:999px;padding:4px 10px;font-size:10px;letter-spacing:0.06em;cursor:pointer"
                  >${entry.name || entry.cardId}</button>
                `).join('')}
              </div>
              <div class="char-start-deck" style="margin-top:8px">
                <button id="saveLevel11Upgrade" type="button">강화로 저장</button>
                <button id="saveLevel11Swap" type="button">교체로 저장</button>
                <button id="clearLevel11Preset" type="button">해제</button>
              </div>
            ` : buildDeckCardMarkup(baseDeck, cards, selectedChar.accent)}
          </div>

          ${loadoutCustomization ? `
            <div class="char-info-block">
              ${buildSectionLabel('마스터리 커스터마이즈', selectedChar.accent)}
              ${(loadoutCustomization.invalidWarnings || []).map((warning) => (
                `<div class="char-info-text" style="color:#ffb347">${warning}</div>`
              )).join('')}
              ${buildFeatureSectionMarkup({
    accent: selectedChar.accent,
    title: '시작 덱 커스터마이즈',
    badgeLabel: level11Unlocked ? '사용 가능' : 'Lv.11 해금',
    locked: !level11Unlocked,
    body: level11Unlocked ? `
      <div class="char-info-text">현재 설정: ${buildLevel11PresetSummary(loadoutCustomization.level11Preset, cards)}</div>
      <div class="char-info-text">시작 덱 블록에서 바로 수정할 수 있습니다.</div>
    ` : `
      <div class="char-info-text">현재 설정: ${buildLevel11PresetSummary(loadoutCustomization.level11Preset, cards)}</div>
      <div class="char-info-text">Lv.11 달성 시 시작 덱 커스터마이즈가 해금됩니다.</div>
    `,
  })}
              ${buildFeatureSectionMarkup({
    accent: selectedChar.accent,
    title: '추가 유물 선택',
    badgeLabel: level12Unlocked ? '선택 가능' : 'Lv.12 해금',
    locked: !level12Unlocked,
    body: level12Unlocked ? `
      <div class="char-info-text">현재 설정: ${level12Summary}</div>
      <div class="char-info-text">Lv.12 추가 유물 저장</div>
      <div class="char-start-deck">
        <select id="level12BonusRelic">${(loadoutCustomization.eligibleBonusRelics || []).map((entry) => (
      `<option value="${entry.id}">${entry.name || entry.id}</option>`
    )).join('')}</select>
        <button id="saveLevel12Preset" type="button">유물 저장</button>
        <button id="clearLevel12Preset" type="button">해제</button>
      </div>
    ` : `
      <div class="char-info-text">현재 설정: ${level12Summary}</div>
      <div class="char-info-text">Lv.12 달성 시 추가 유물이 해금됩니다.</div>
    `,
  })}
            </div>
          ` : ''}
        </section>
      </div>
    </div>`;

  const tabButtons = panel.querySelectorAll('.char-info-tab');
  const tabPanes = panel.querySelectorAll('.char-info-pane');
  const activateTab = (tabName) => {
    tabButtons.forEach((btn) => {
      const active = btn.dataset.tab === tabName;
      btn.classList.toggle('is-active', active);
      btn.setAttribute('aria-selected', active ? 'true' : 'false');
    });
    tabPanes.forEach((pane) => pane.classList.toggle('is-active', pane.dataset.pane === tabName));
  };
  tabButtons.forEach((btn) => {
    btn.addEventListener('click', () => {
      if (!btn.classList.contains('is-active')) hover?.();
      activateTab(btn.dataset.tab);
    });
  });

  const echoBadge = panel.querySelector('#echoBadge');
  if (echoBadge) {
    echoBadge.addEventListener('mouseenter', () => {
      hover?.();
      echoBadge.style.borderColor = `${selectedChar.accent}aa`;
      echoBadge.style.background = `linear-gradient(135deg,${selectedChar.accent}1e,${selectedChar.color}1a)`;
      echoBadge.style.boxShadow = `0 0 16px ${selectedChar.accent}33`;
    });
    echoBadge.addEventListener('mouseleave', () => {
      echoBadge.style.borderColor = `${selectedChar.accent}44`;
      echoBadge.style.background = `linear-gradient(135deg,${selectedChar.accent}0e,${selectedChar.color}08)`;
      echoBadge.style.boxShadow = 'none';
    });
    echoBadge.addEventListener('click', () => {
      echo?.();
      openModal?.(selectedChar.echoSkill, selectedChar.accent);
    });
  }

  const relicBadges = typeof panel.querySelectorAll === 'function'
    ? Array.from(panel.querySelectorAll('.relic-inner') || [])
    : [];
  const fallbackRelicBadge = relicBadges.length === 0 ? panel.querySelector('.relic-inner') : null;
  (fallbackRelicBadge ? [fallbackRelicBadge] : relicBadges).forEach((relicBadge) => {
    if (!relicBadge) return;
    relicBadge.addEventListener('mouseenter', (event) => {
      hover?.();
      generalTooltip.showGeneralTooltip(
        event,
        relicBadge.dataset.relicTitle || '',
        relicBadge.dataset.relicDesc || '',
        { doc, win },
      );
    });
    relicBadge.addEventListener('mouseleave', () => generalTooltip.hideGeneralTooltip({ doc, win }));
  });

  const mockGs = { getBuff: () => null, player: { echoChain: 0 } };
  panel.querySelectorAll('.deck-card').forEach((element) => {
    element.addEventListener('mouseenter', (event) => {
      hover?.();
      cardTooltip.showTooltip(event, element.dataset.cid, { data: { cards }, gs: mockGs });
    });
    element.addEventListener('mouseleave', () => cardTooltip.hideTooltip());
  });

  let level11Mode = initialLevel11Mode;
  let selectedLevel11UpgradeIndex = initialLevel11UpgradeIndex;
  let selectedLevel11SwapIndex = initialLevel11SwapIndex;
  let selectedLevel11AddCardId = '';

  const level11ModeUpgrade = panel.querySelector('#level11ModeUpgrade');
  const level11ModeSwap = panel.querySelector('#level11ModeSwap');
  const level11SelectionNote = panel.querySelector('#level11SelectionNote');
  const level11EditableCards = Array.from(panel.querySelectorAll('.level11-edit-card') || []);
  const level11AddCardButtons = Array.from(panel.querySelectorAll('.level11-add-card-btn') || []);
  const saveLevel11Upgrade = panel.querySelector('#saveLevel11Upgrade');
  const saveLevel11Swap = panel.querySelector('#saveLevel11Swap');

  const applyLevel11CardSelectionVisuals = () => {
    level11EditableCards.forEach((element) => {
      const cardIndex = Number(element.dataset.level11Index);
      const selectable = element.dataset.level11Selectable === 'true';
      const selected = level11Mode === 'swap'
        ? cardIndex === selectedLevel11SwapIndex
        : cardIndex === selectedLevel11UpgradeIndex;
      element.style.borderColor = selected
        ? `${selectedChar.accent}99`
        : (selectable ? `${selectedChar.accent}44` : `${selectedChar.accent}1a`);
      element.style.background = selected
        ? `${selectedChar.accent}12`
        : (selectable ? `${selectedChar.accent}08` : `${selectedChar.accent}05`);
      element.style.boxShadow = selected
        ? `0 0 0 1px ${selectedChar.accent}66 inset, 0 6px 14px rgba(0, 0, 0, 0.16)`
        : 'none';
      element.setAttribute('aria-pressed', selected ? 'true' : 'false');
      const stateBadge = typeof element.querySelector === 'function' ? element.querySelector('.level11-card-state') : null;
      if (stateBadge) {
        stateBadge.textContent = selected ? (level11Mode === 'swap' ? '교체 대상' : '강화 예정') : '';
        stateBadge.style.display = selected ? 'inline-flex' : 'none';
      }
    });
  };

  const applyLevel11ModeVisuals = () => {
    if (level11ModeUpgrade) {
      level11ModeUpgrade.style.borderColor = level11Mode === 'upgrade' ? `${selectedChar.accent}66` : 'rgba(255,255,255,0.14)';
      level11ModeUpgrade.style.background = level11Mode === 'upgrade' ? `${selectedChar.accent}14` : 'rgba(255,255,255,0.04)';
      level11ModeUpgrade.style.color = level11Mode === 'upgrade' ? selectedChar.accent : '#d5ddf2';
    }
    if (level11ModeSwap) {
      level11ModeSwap.style.borderColor = level11Mode === 'swap' ? `${selectedChar.accent}66` : 'rgba(255,255,255,0.14)';
      level11ModeSwap.style.background = level11Mode === 'swap' ? `${selectedChar.accent}14` : 'rgba(255,255,255,0.04)';
      level11ModeSwap.style.color = level11Mode === 'swap' ? selectedChar.accent : '#d5ddf2';
    }
    if (level11SelectionNote) {
      level11SelectionNote.textContent = level11Mode === 'swap'
        ? '교체할 카드를 선택한 뒤 추가 카드를 골라 저장하세요.'
        : '강화할 카드를 선택한 뒤 저장하세요.';
    }
    level11AddCardButtons.forEach((button) => {
      const active = button.dataset.level11AddCardId === selectedLevel11AddCardId;
      button.style.borderColor = active ? `${selectedChar.accent}66` : 'rgba(255,255,255,0.14)';
      button.style.background = active ? `${selectedChar.accent}14` : 'rgba(255,255,255,0.04)';
      button.style.color = active ? selectedChar.accent : '#d5ddf2';
      button.setAttribute('aria-pressed', active ? 'true' : 'false');
    });
    if (saveLevel11Upgrade) saveLevel11Upgrade.disabled = !Number.isInteger(selectedLevel11UpgradeIndex);
    if (saveLevel11Swap) saveLevel11Swap.disabled = !(Number.isInteger(selectedLevel11SwapIndex) && selectedLevel11AddCardId);
    applyLevel11CardSelectionVisuals();
  };

  if (level11ModeUpgrade) {
    level11ModeUpgrade.addEventListener('click', () => {
      level11Mode = 'upgrade';
      applyLevel11ModeVisuals();
    });
  }

  if (level11ModeSwap) {
    level11ModeSwap.addEventListener('click', () => {
      level11Mode = 'swap';
      applyLevel11ModeVisuals();
    });
  }

  level11EditableCards.forEach((element) => {
    element.addEventListener('click', () => {
      if (element.dataset.level11Selectable !== 'true') return;
      const selectedIndex = Number(element.dataset.level11Index);
      if (!Number.isInteger(selectedIndex)) return;
      if (level11Mode === 'swap') selectedLevel11SwapIndex = selectedIndex;
      else selectedLevel11UpgradeIndex = selectedIndex;
      applyLevel11ModeVisuals();
    });
  });

  level11AddCardButtons.forEach((button) => {
    button.addEventListener('click', () => {
      selectedLevel11AddCardId = String(button.dataset.level11AddCardId || '');
      applyLevel11ModeVisuals();
    });
  });

  applyLevel11ModeVisuals();

  if (saveLevel11Upgrade) {
    saveLevel11Upgrade.addEventListener('click', () => {
      if (Number.isInteger(selectedLevel11UpgradeIndex)) {
        onSaveLoadoutPreset?.({
          slot: 'level11',
          type: 'upgrade',
          targetIndex: selectedLevel11UpgradeIndex,
        });
      }
    });
  }

  if (saveLevel11Swap) {
    saveLevel11Swap.addEventListener('click', () => {
      if (Number.isInteger(selectedLevel11SwapIndex) && selectedLevel11AddCardId) {
        onSaveLoadoutPreset?.({
          slot: 'level11',
          type: 'swap',
          removeIndex: selectedLevel11SwapIndex,
          addCardId: selectedLevel11AddCardId,
        });
      }
    });
  }

  const clearLevel11Preset = panel.querySelector('#clearLevel11Preset');
  if (clearLevel11Preset) {
    clearLevel11Preset.addEventListener('click', () => onClearLoadoutPreset?.('level11'));
  }

  const saveLevel12Preset = panel.querySelector('#saveLevel12Preset');
  if (saveLevel12Preset) {
    saveLevel12Preset.addEventListener('click', () => {
      const bonusRelicId = String(panel.querySelector('#level12BonusRelic')?.value || '');
      if (bonusRelicId) {
        onSaveLoadoutPreset?.({
          slot: 'level12',
          bonusRelicId,
        });
      }
    });
  }

  const clearLevel12Preset = panel.querySelector('#clearLevel12Preset');
  if (clearLevel12Preset) {
    clearLevel12Preset.addEventListener('click', () => onClearLoadoutPreset?.('level12'));
  }
}
