export const shrineEvent = {
  id: 'shrine',
  layer: 1,
  title: '잔향의 사당',
  eyebrow: 'LAYER 1 · 우발적 이벤트',
  desc: '사당 앞에 잔향이 고여 있다. 오래된 것들이 기도하다 흘린 에너지가 이곳에 남아 있다. 신은 없다. 잔향만 있다.',
  choices: [
    {
      text: '❤️ 피를 바친다 (체력 -10 → 잔향 +50)',
      effectId: 'shrine_blood_echo',
    },
    {
      text: '💰 동전을 떨어뜨린다 (15골드 → 체력 +20)',
      effectId: 'shrine_gold_heal',
    },
    {
      text: '🚶 등을 보인다',
      effect() {
        return '사당을 등졌다. 뒤에서 무언가 보는 느낌이 있었지만, 돌아보지 않았다.';
      }
    },
  ]
};
