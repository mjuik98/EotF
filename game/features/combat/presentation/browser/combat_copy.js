export {
  COMBAT_KEYWORD_MAP,
  createCombatCloneKeywordPanel,
  getCombatKeywordTooltip,
  resolveCombatKeywordTooltips,
  resolvePrimaryCombatKeywordTooltip,
} from './combat_keyword_copy.js';
export {
  applyCombatRelicPanelVisuals,
  applyCombatRelicSlotVisuals,
} from './combat_relic_visuals.js';

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
