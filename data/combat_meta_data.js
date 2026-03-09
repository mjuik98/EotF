'use strict';

export const INTENT_DESCRIPTIONS = Object.freeze({
  attack: { type: '공격', desc: '플레이어에게 피해' },
  heavy: { type: '강공격', desc: '단일 대상에게 큰 피해' },
  double: { type: '연속 공격', desc: '여러 번 피해' },
  aoe: { type: '광역 공격', desc: '모든 대상에게 피해' },
  guard: { type: '방어', desc: '방어막 획득' },
  barrier: { type: '방벽', desc: '강력한 방벽 생성' },
  shield: { type: '보호막', desc: '방어막으로 피해 경감' },
  curse: { type: '저주', desc: '해로운 효과 부여' },
  poison: { type: '중독', desc: '턴 시작 시 독 중첩 × 5 피해' },
  weaken: { type: '약화', desc: '공격력 감소' },
  debuff: { type: '약화 효과', desc: '해로운 상태이상 부여' },
  stun: { type: '기절', desc: '행동 불가' },
  mark: { type: '표식', desc: '추가 피해 표식 부여' },
  burning: { type: '화상', desc: '지속적인 화상 피해' },
  heal: { type: '치유', desc: '체력 회복' },
  life: { type: '흡혈', desc: '피해 및 체력 회복' },
  drain: { type: '흡수', desc: '자원 흡수' },
  summon: { type: '소환', desc: '추가 적 소환' },
  enrage: { type: '격노', desc: '공격력 증가' },
});
