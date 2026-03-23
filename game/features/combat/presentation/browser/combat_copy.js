export const COMBAT_TEXT = Object.freeze({
  echoSkillLabel: '⚡ 잔향 스킬 ✦',
  drawButton: Object.freeze({
    availableLabel: '🃏 카드 드로우 (1 에너지)',
    availableTitle: '카드 1장을 드로우합니다 (에너지 1).',
    combatOnlyTitle: '전투 중에만 사용할 수 있습니다.',
    enemyTurnLabel: '적 턴',
    enemyTurnTitle: '적 턴에는 카드를 뽑을 수 없습니다.',
    handFullLabel: '손패 가득 참',
    noEnergyLabel: '에너지 부족',
    noEnergyTitle: '카드를 드로우하려면 에너지 1이 필요합니다.',
  }),
  cardTypeLabels: Object.freeze({
    attack: '공격',
    skill: '스킬',
    power: '파워',
  }),
  shieldLabel: '방어막',
  targetLabel: '대상',
  noSpecial: '없음',
  emptyItemSlot: '비어 있음',
  runModifiers: Object.freeze({
    ascension: '승천',
    endless: '무한 모드',
    inscriptions: '각인',
  }),
  regionFallback: Object.freeze({
    name: '미확인 지역',
    rule: '-',
    floors: 5,
    ruleDesc: '지역 규칙이 적용 중입니다.',
  }),
  enemyStatusSource: Object.freeze({
    label: '적',
    name: '적 상태',
  }),
});

export const COMBAT_INTENT_LABEL_TRANSLATIONS = Object.freeze({
  attack: '공격',
  'no intent': '행동 없음',
  'intent pending': '행동 준비 중',
  stunned: '기절',
  heal: '치유',
  guard: '방어',
  barrier: '방벽',
  shield: '보호막',
  curse: '저주',
  poison: '중독',
  weaken: '약화',
  debuff: '약화 효과',
  drain: '흡수',
  summon: '소환',
  enrage: '격노',
});

export const COMBAT_KEYWORD_MAP = Object.freeze({
  '[소진]': { title: '소진', text: '사용 후 이번 전투에서 영구 제거됩니다. 소모 더미로 가지 않습니다.' },
  '[지속]': { title: '지속', text: '전투가 끝날 때까지 계속 효과가 발동되는 능력 카드입니다.' },
  '[즉시]': { title: '즉시', text: '사용 즉시 발동되는 강력한 일회성 효과입니다.' },
  잔향: { title: '잔향', text: '특수 능력을 발동하는 에너지 자원. 0~100 사이를 유지하며, 게이지에 따라 효과가 달라집니다.' },
  연쇄: { title: '연쇄', text: '연속 공격 횟수를 나타냅니다. 5회 이상 쌓이면 다음 공격에 추가 피해가 적용됩니다.' },
  침묵: { title: '침묵', text: '침묵사냥꾼 전용 게이지. 최대치(10) 도달 시 다음 공격이 대폭 강화됩니다.' },
  약화: { title: '약화', text: '대상의 공격력이 50% 감소합니다. 지속 시간이 만료되면 해제됩니다.' },
  '기절 면역': { title: '기절 면역', text: '적의 기절 효과를 지정된 횟수만큼 완전히 무효화합니다.' },
  기절: { title: '기절', text: '다음 턴에 행동하지 못합니다. 기절 턴에는 공격과 방어 모두 불가합니다.' },
  독: { title: '독', text: '중독된 대상의 턴 시작 시 독 스택 × 5 피해를 입힙니다. 매 턴 독 스택이 1씩 감소합니다.' },
  화염: { title: '화염', text: '매 턴 시작 시 피해 5를 입습니다. 지속 시간이 끝나면 소멸합니다.' },
  '처형 표식': { title: '처형 표식', text: '3턴 후 표식이 폭발하여 피해 30을 입힙니다. 시간이 얼마 남지 않았을 때 더욱 위험합니다.' },
  면역: { title: '면역', text: '모든 피해와 상태이상을 완전히 무효화합니다. 지속 시간 동안 무적 상태입니다.' },
  회피: { title: '회피', text: '다음 적의 공격 1회를 완전히 무효화합니다. 회피 후 즉시 소모됩니다.' },
  은신: { title: '은신', text: '다음에 사용하는 공격 카드가 치명타로 적중합니다. 공격 즉시 은신이 해제됩니다.' },
  반사: { title: '반사', text: '피해를 받을 때 해당 피해를 공격자에게 되돌립니다.' },
  '시간 왜곡': { title: '시간 왜곡', text: '매 턴 시작 시 에너지를 1 추가로 획득합니다. 전투가 끝날 때까지 지속됩니다.' },
  드로우: { title: '드로우', text: '덱에서 카드를 손패로 가져옵니다. 덱이 비면 소모 더미를 섞어 새 덱을 만듭니다.' },
});

export function getCombatCardTypeLabel(type) {
  if (!type) return '';
  const normalized = String(type).toLowerCase();
  return COMBAT_TEXT.cardTypeLabels[normalized] || String(type);
}

export function getCombatDrawCopy(drawState = {}) {
  if (!drawState.inCombat) {
    return {
      label: COMBAT_TEXT.drawButton.availableLabel,
      title: COMBAT_TEXT.drawButton.combatOnlyTitle,
    };
  }

  if (!drawState.playerTurn) {
    return {
      label: COMBAT_TEXT.drawButton.enemyTurnLabel,
      title: COMBAT_TEXT.drawButton.enemyTurnTitle,
    };
  }

  if (drawState.handFull) {
    return {
      label: COMBAT_TEXT.drawButton.handFullLabel,
      title: `손패가 가득 찼습니다 (최대 ${drawState.maxHand}장)`,
    };
  }

  if (!drawState.hasEnergy) {
    return {
      label: COMBAT_TEXT.drawButton.noEnergyLabel,
      title: COMBAT_TEXT.drawButton.noEnergyTitle,
    };
  }

  return {
    label: COMBAT_TEXT.drawButton.availableLabel,
    title: COMBAT_TEXT.drawButton.availableTitle,
  };
}

export function getCombatKeywordTooltip(keyword) {
  return COMBAT_KEYWORD_MAP[keyword] || null;
}

export function resolveCombatKeywordTooltips(card) {
  const seen = new Set();
  const desc = String(card?.desc || '');
  const sortedKeys = Object.keys(COMBAT_KEYWORD_MAP).sort((a, b) => b.length - a.length);

  const matches = sortedKeys
    .map((keyword) => {
      const index = desc.indexOf(keyword);
      if (index >= 0) return { keyword, index };
      if (card?.exhaust && keyword === '[소진]') return { keyword, index: Number.MAX_SAFE_INTEGER - 1 };
      return null;
    })
    .filter(Boolean)
    .sort((left, right) => left.index - right.index);

  return matches
    .map(({ keyword }) => {
      const keywordData = getCombatKeywordTooltip(keyword);
      if (!keywordData) return null;
      if (seen.has(keywordData.title)) return null;
      seen.add(keywordData.title);
      return {
        keyword,
        title: keywordData.title,
        text: keywordData.text,
      };
    })
    .filter(Boolean);
}

export function resolvePrimaryCombatKeywordTooltip(card) {
  return resolveCombatKeywordTooltips(card)[0] || null;
}

function setKeywordTabActive(tab, active) {
  tab.className = active ? 'card-clone-keyword-tab is-active' : 'card-clone-keyword-tab';
  tab.style.borderColor = active ? 'rgba(123, 47, 255, 0.46)' : 'rgba(255, 255, 255, 0.1)';
  tab.style.background = active ? 'rgba(123, 47, 255, 0.18)' : 'rgba(255, 255, 255, 0.04)';
  tab.style.color = active ? '#efe5ff' : 'rgba(216, 210, 238, 0.82)';
}

export function createCombatCloneKeywordPanel(doc, card) {
  const keywordItems = resolveCombatKeywordTooltips(card);
  if (keywordItems.length === 0) return { link: null, panel: null };

  const link = doc.createElement('div');
  link.className = 'card-clone-keyword-link';
  link.style.borderRadius = '999px';
  link.style.boxShadow = '0 0 10px rgba(123, 47, 255, 0.24)';
  link.style.pointerEvents = 'none';

  const panel = doc.createElement('div');
  panel.className = 'card-clone-keyword-panel';
  panel.style.width = '176px';
  panel.style.padding = '12px 14px';
  panel.style.borderRadius = '14px';
  panel.style.border = '1px solid rgba(123, 47, 255, 0.42)';
  panel.style.background = 'linear-gradient(180deg, rgba(18, 12, 40, 0.96), rgba(10, 8, 24, 0.94))';
  panel.style.boxShadow = '0 18px 34px rgba(0, 0, 0, 0.42), 0 0 0 1px rgba(123, 47, 255, 0.08)';
  panel.style.color = 'rgba(232, 225, 255, 0.94)';
  panel.style.pointerEvents = 'auto';
  const chipRow = doc.createElement('div');
  chipRow.className = 'card-clone-keyword-tabs';
  chipRow.style.display = 'flex';
  chipRow.style.flexWrap = 'wrap';
  chipRow.style.gap = '6px';
  chipRow.style.marginBottom = '10px';
  const activeBody = doc.createElement('div');
  activeBody.className = 'card-clone-keyword-body';
  const activeTitle = doc.createElement('div');
  activeTitle.className = 'card-clone-keyword-body-title';
  activeTitle.style.marginBottom = '8px';
  activeTitle.style.fontFamily = "'Cinzel', serif";
  activeTitle.style.fontSize = '12px';
  activeTitle.style.letterSpacing = '0.08em';
  activeTitle.style.color = '#9f7bff';
  const activeContent = doc.createElement('div');
  activeContent.className = 'card-clone-keyword-body-content';
  activeContent.style.fontSize = '11px';
  activeContent.style.lineHeight = '1.55';
  activeContent.style.color = 'rgba(216, 210, 238, 0.88)';
  activeBody.appendChild(activeTitle);
  activeBody.appendChild(activeContent);

  const setActive = (index) => {
    keywordItems.forEach((item, itemIndex) => {
      const chip = chipRow.children[itemIndex];
      if (chip) setKeywordTabActive(chip, itemIndex === index);
      if (itemIndex === index) {
        activeTitle.textContent = item.title;
        activeContent.textContent = item.text;
      }
    });
  };

  keywordItems.forEach((item, index) => {
    const chip = doc.createElement('button');
    chip.type = 'button';
    chip.textContent = item.title;
    chip.style.padding = '4px 8px';
    chip.style.borderRadius = '999px';
    chip.style.border = '1px solid rgba(255, 255, 255, 0.1)';
    chip.style.background = 'rgba(255, 255, 255, 0.04)';
    chip.style.color = 'rgba(216, 210, 238, 0.82)';
    chip.style.fontFamily = "'Share Tech Mono', monospace";
    chip.style.fontSize = '9px';
    chip.style.letterSpacing = '0.04em';
    chip.style.cursor = 'pointer';
    setKeywordTabActive(chip, index === 0);
    chip.addEventListener('mouseenter', () => setActive(index));
    chip.addEventListener('click', () => setActive(index));
    chipRow.appendChild(chip);
  });

  setActive(0);
  panel.appendChild(chipRow);
  panel.appendChild(activeBody);
  return { link, panel };
}

export function applyCombatRelicSlotVisuals(slot, rarity, setState, doc) {
  const visualStyle = rarity === 'legendary'
    ? 'border-color:rgba(192,132,252,.42);background:linear-gradient(180deg,rgba(28,12,40,.96),rgba(12,8,26,.98));box-shadow:inset 0 0 0 1px rgba(192,132,252,.1),0 0 18px rgba(192,132,252,.12);color:rgba(245,235,255,.96);'
    : rarity === 'rare'
      ? 'border-color:rgba(240,180,41,.34);background:linear-gradient(180deg,rgba(30,20,6,.94),rgba(14,10,6,.96));box-shadow:inset 0 0 0 1px rgba(240,180,41,.08),0 0 14px rgba(240,180,41,.08);color:rgba(255,236,186,.96);'
      : rarity === 'uncommon'
        ? 'border-color:rgba(74,243,204,.28);background:linear-gradient(180deg,rgba(7,23,24,.92),rgba(9,12,24,.94));box-shadow:inset 0 0 0 1px rgba(74,243,204,.05),0 0 12px rgba(74,243,204,.06);color:rgba(226,255,248,.95);'
        : 'border-color:rgba(155,138,184,.16);background:linear-gradient(180deg,rgba(20,18,34,.9),rgba(10,10,22,.92));color:rgba(232,234,255,.9);';
  slot.style.cssText = `${slot.style.cssText || ''}${visualStyle}`;

  if (!setState) return;
  const badge = doc?.createElement?.('span');
  if (!badge) return;
  badge.setAttribute?.('aria-hidden', 'true');
  badge.style.cssText = `position:absolute;top:4px;left:4px;width:6px;height:6px;border-radius:999px;pointer-events:none;background:${setState === 'active' ? 'rgba(74,243,204,.96)' : 'rgba(74,243,204,.76)'};box-shadow:0 0 0 1px rgba(4,10,18,.84),0 0 ${setState === 'active' ? '10px' : '8px'} rgba(74,243,204,${setState === 'active' ? '.5' : '.3'});`;
  slot.appendChild(badge);
}

export function applyCombatRelicPanelVisuals(detailPanel, rarity) {
  if (!detailPanel?.style) return;
  if (rarity === 'legendary') {
    detailPanel.style.borderColor = 'rgba(192,132,252,.34)';
    detailPanel.style.boxShadow = '0 18px 40px rgba(0,0,0,.28),0 0 22px rgba(192,132,252,.1)';
    return;
  }
  if (rarity === 'rare') {
    detailPanel.style.borderColor = 'rgba(240,180,41,.28)';
    detailPanel.style.boxShadow = '0 18px 40px rgba(0,0,0,.28),0 0 18px rgba(240,180,41,.08)';
    return;
  }
  if (rarity === 'uncommon') {
    detailPanel.style.borderColor = 'rgba(74,243,204,.24)';
    detailPanel.style.boxShadow = '0 18px 40px rgba(0,0,0,.28),0 0 18px rgba(74,243,204,.08)';
    return;
  }
  detailPanel.style.borderColor = 'rgba(123,47,255,.24)';
  detailPanel.style.boxShadow = '0 18px 40px rgba(0,0,0,.28)';
}
