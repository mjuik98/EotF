export const CURSES = Object.freeze({
  none: {
    id: 'none',
    name: '없음',
    desc: '적용되는 저주가 없습니다.',
    difficultyWeight: 0,
  },
  tax: {
    id: 'tax',
    name: '탐욕의 저주',
    icon: '💰',
    desc: '상점 비용이 +20% 증가합니다.',
    difficultyWeight: 5,
    shopCostMultiplier: 1.2,
  },
  fatigue: {
    id: 'fatigue',
    name: '피로의 저주',
    icon: '😫',
    desc: '회복량이 -25% 감소하며, 최대 방어막이 -10 감소합니다.',
    difficultyWeight: 10,
    healMultiplier: 0.75,
  },
  frail: {
    id: 'frail',
    name: '허약의 저주',
    icon: '🩹',
    desc: '최대 HP -10 상태로 시작합니다.',
    difficultyWeight: 8,
    runStartMaxHpPenalty: 10,
  },
  decay: {
    id: 'decay',
    name: '부식의 저주',
    icon: '☣️',
    desc: '전투 종료 시 최대 HP가 2 감소합니다.',
    difficultyWeight: 10,
    combatEndMaxHpPenalty: 2,
  },
  silence: {
    id: 'silence',
    name: '침묵의 저주',
    icon: '🤐',
    desc: '전투 첫 3턴 동안 최대 에너지가 1로 제한됩니다.',
    difficultyWeight: 8,
    limitsEarlyTurnEnergy: true,
  },
  blood_moon: {
    id: 'blood_moon',
    name: '핏빛 월식',
    icon: '🌒',
    desc: '적의 HP와 공격력이 12% 증가합니다.',
    difficultyWeight: 12,
    enemyScaleMultiplier: 1.12,
  },
  void_oath: {
    id: 'void_oath',
    name: '공허의 맹세',
    icon: '🜂',
    desc: '회복량이 40% 감소하고 적의 HP와 공격력이 6% 증가합니다.',
    difficultyWeight: 14,
    enemyScaleMultiplier: 1.06,
    healMultiplier: 0.6,
  },
  shadow_burden: {
    id: 'shadow_burden',
    name: '그림자 굴레',
    icon: '🌘',
    desc: '적의 HP와 공격력이 15% 증가하고 상점 비용이 15% 증가합니다.',
    difficultyWeight: 16,
    enemyScaleMultiplier: 1.15,
    shopCostMultiplier: 1.15,
  },
  ruinous_tide: {
    id: 'ruinous_tide',
    name: '파멸의 조류',
    icon: '🌊',
    desc: '회복량이 25% 감소하고 전투 종료 시 최대 HP가 1 감소합니다. 적의 HP와 공격력이 8% 증가합니다.',
    difficultyWeight: 18,
    enemyScaleMultiplier: 1.08,
    healMultiplier: 0.75,
    combatEndMaxHpPenalty: 1,
  },
});

export function getRunCurseDefinition(curseId = 'none', source = CURSES) {
  if (source?.[curseId]) return source[curseId];
  return source?.none || CURSES.none;
}

export function getRunCurseLabel(curseId = 'none', source = CURSES) {
  return getRunCurseDefinition(curseId, source)?.name || String(curseId || 'none');
}
