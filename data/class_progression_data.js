export const MAX_CLASS_MASTERY_LEVEL = 10;

// Cumulative XP required to reach each level index (1..10).
// Level 1 starts at 0 XP.
export const CLASS_MASTERY_LEVEL_XP = Object.freeze([
  0,    // unused (level 0)
  0,    // level 1
  100,  // level 2
  220,  // level 3
  360,  // level 4
  520,  // level 5
  700,  // level 6
  900,  // level 7
  1120, // level 8
  1360, // level 9
  1620, // level 10
]);

export const CLASS_MASTERY_ROADMAP = Object.freeze([
  { lv: 2, icon: 'ATK', desc: '시작 공격 카드 1장 강화' },
  { lv: 3, icon: 'HP', desc: '최대 체력 +20' },
  { lv: 4, icon: 'GOLD', desc: '소지금 +50으로 시작' },
  { lv: 5, icon: 'ARM', desc: '전투 시작 시 방어막 10 획득' },
  { lv: 6, icon: 'ENG', desc: '최대 에너지 +1' },
  { lv: 7, icon: 'UP', desc: '무작위 시작 카드 1장 강화' },
  { lv: 8, icon: 'REL', desc: '보상에서 유물 선택지 +1' },
  { lv: 9, icon: 'SPD', desc: '전투 시작 시 카드 1장 추가 드로우' },
  { lv: 10, icon: 'AWK', desc: '클래스 각성 보너스 해제' },
]);

export const CLASS_MASTERY_ULTIMATE_TEXT = Object.freeze({
  swordsman: '공명 각성: 전투 시작 시 공명 +3 획득.',
  mage: '에코 각성: 매 전투 첫 무작위 카드의 비용 1 감소.',
  hunter: '추적 각성: 매 전투 첫 공격 시 표식 2 부여.',
  paladin: '성소 각성: 전투 시작 시 체력 6 회복.',
  berserker: '광분 각성: 전투 시작 시 공격력 +2 획득.',
  guardian: '보루 각성: 전투 시작 시 방어막 10 획득.',
});

export function getClassMasteryRoadmap(classId) {
  return CLASS_MASTERY_ROADMAP.map((entry) => {
    if (entry.lv !== MAX_CLASS_MASTERY_LEVEL) return { ...entry };
    return {
      ...entry,
      desc: CLASS_MASTERY_ULTIMATE_TEXT[classId] || entry.desc,
    };
  });
}
