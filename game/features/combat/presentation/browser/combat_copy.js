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
