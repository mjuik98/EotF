export const CURSES = Object.freeze({
  none: { id: 'none', name: '없음', desc: '적용되는 저주가 없습니다.' },
  tax: { id: 'tax', name: '탐욕의 저주', icon: '💰', desc: '상점 비용이 +20% 증가합니다.' },
  fatigue: { id: 'fatigue', name: '피로의 저주', icon: '😫', desc: '회복량이 -25% 감소하며, 최대 방어막이 -10 감소합니다.' },
  frail: { id: 'frail', name: '허약의 저주', icon: '🩹', desc: '최대 HP -10 상태로 시작합니다.' },
  decay: { id: 'decay', name: '부식의 저주', icon: '☣️', desc: '전투 종료 시 최대 HP가 2 감소합니다.' },
  silence: { id: 'silence', name: '침묵의 저주', icon: '🤐', desc: '전투 첫 3턴 동안 최대 에너지가 1로 제한됩니다.' },
});
