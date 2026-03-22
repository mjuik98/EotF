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

function buildRelicMarkup(relics, accent) {
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
            <div style="font-size:11px;color:${accent}66;font-family:'Share Tech Mono',monospace">${index === 0 ? '기본 유물' : '추가 유물'}</div>
          </div>
        </div>
      `).join('')}
    </div>
  `;
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
  const playStyleLines = resolvePlayStyle(selectedChar);
  const featuredCardIds = resolveFeaturedCardIds(selectedChar);
  const featuredCardTags = resolveFeaturedCardTags(selectedChar);

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
              <summary class="csm-roadmap-summary">마스터리 로드맵</summary>
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
              ${hasCustomizedLoadout ? `
                <div class="char-info-text">기본 시작 유물</div>
                ${buildRelicMarkup(baseRelics, selectedChar.accent)}
                <div class="char-info-text" style="margin-top:10px">적용 후 시작 유물</div>
                ${buildRelicMarkup(previewRelics, selectedChar.accent)}
              ` : buildRelicMarkup(previewRelics, selectedChar.accent)}
            </div>
          </div>

          <div class="char-info-block">
            ${buildSectionLabel('시작 덱', selectedChar.accent)}
            ${hasCustomizedLoadout ? `
              <div class="char-info-text">기본 시작 덱</div>
              ${buildDeckCardMarkup(baseDeck, cards, selectedChar.accent)}
              <div class="char-info-text" style="margin-top:10px">적용 후 시작 덱</div>
              ${buildDeckCardMarkup(previewDeck, cards, selectedChar.accent)}
            ` : buildDeckCardMarkup(previewDeck, cards, selectedChar.accent)}
          </div>

          ${loadoutCustomization ? `
            <div class="char-info-block">
              ${buildSectionLabel('마스터리 커스터마이즈', selectedChar.accent)}
              ${(loadoutCustomization.invalidWarnings || []).map((warning) => (
                `<div class="char-info-text" style="color:#ffb347">${warning}</div>`
              )).join('')}
              <div class="char-info-text">Lv.11 현재 설정: ${buildLevel11PresetSummary(loadoutCustomization.level11Preset, cards)}</div>
              <div class="char-info-text">Lv.12 현재 설정: ${loadoutCustomization.level12Preset?.bonusRelicId
                ? (loadoutCustomization.eligibleBonusRelics?.find((entry) => entry.id === loadoutCustomization.level12Preset.bonusRelicId)?.name
                  || loadoutCustomization.previewRelics?.find((entry) => entry.id === loadoutCustomization.level12Preset.bonusRelicId)?.name
                  || loadoutCustomization.level12Preset.bonusRelicId)
                : '없음'}</div>
              ${loadoutCustomization.level11Unlocked ? `
                <div class="char-info-text">Lv.11 강화 저장</div>
                <div class="char-start-deck" style="margin-bottom:8px">
                  <select id="level11UpgradeTarget">${(loadoutCustomization.eligibleUpgradeTargets || []).map((entry) => {
                    const cardName = cards?.[entry.cardId]?.name || entry.cardId;
                    return `<option value="${entry.index}">${cardName}</option>`;
                  }).join('')}</select>
                  <button id="saveLevel11Upgrade" type="button">강화로 저장</button>
                </div>
                <div class="char-info-text">Lv.11 교체 저장</div>
                <div class="char-start-deck" style="margin-bottom:8px">
                  <select id="level11SwapRemove">${(loadoutCustomization.eligibleSwapRemoveTargets || []).map((entry) => {
                    const cardName = cards?.[entry.cardId]?.name || entry.cardId;
                    return `<option value="${entry.index}">${cardName}</option>`;
                  }).join('')}</select>
                  <select id="level11SwapAdd">${(loadoutCustomization.eligibleSwapAddCards || []).map((entry) => (
                    `<option value="${entry.cardId}">${entry.name || entry.cardId}</option>`
                  )).join('')}</select>
                  <button id="saveLevel11Swap" type="button">교체로 저장</button>
                  <button id="clearLevel11Preset" type="button">해제</button>
                </div>
              ` : '<div class="char-info-text">Lv.11 달성 시 시작 덱 프리셋이 해금됩니다.</div>'}
              ${loadoutCustomization.level12Unlocked ? `
                <div class="char-info-text">Lv.12 추가 시작 유물</div>
                <div class="char-start-deck">
                  <select id="level12BonusRelic">${(loadoutCustomization.eligibleBonusRelics || []).map((entry) => (
                    `<option value="${entry.id}">${entry.name || entry.id}</option>`
                  )).join('')}</select>
                  <button id="saveLevel12Preset" type="button">유물 저장</button>
                  <button id="clearLevel12Preset" type="button">해제</button>
                </div>
              ` : '<div class="char-info-text">Lv.12 달성 시 추가 시작 유물 프리셋이 해금됩니다.</div>'}
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

  const saveLevel11Upgrade = panel.querySelector('#saveLevel11Upgrade');
  if (saveLevel11Upgrade) {
    saveLevel11Upgrade.addEventListener('click', () => {
      const targetIndex = Number(panel.querySelector('#level11UpgradeTarget')?.value);
      if (Number.isInteger(targetIndex)) {
        onSaveLoadoutPreset?.({
          slot: 'level11',
          type: 'upgrade',
          targetIndex,
        });
      }
    });
  }

  const saveLevel11Swap = panel.querySelector('#saveLevel11Swap');
  if (saveLevel11Swap) {
    saveLevel11Swap.addEventListener('click', () => {
      const removeIndex = Number(panel.querySelector('#level11SwapRemove')?.value);
      const addCardId = String(panel.querySelector('#level11SwapAdd')?.value || '');
      if (Number.isInteger(removeIndex) && addCardId) {
        onSaveLoadoutPreset?.({
          slot: 'level11',
          type: 'swap',
          removeIndex,
          addCardId,
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
