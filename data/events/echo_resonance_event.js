export const echoResonanceEvent = {
  id: 'echo_resonance',
  layer: 1,
  title: '잔향 공명',
  eyebrow: 'LAYER 1 · 우발적 이벤트',
  desc: '공기가 진동한다. 누군가 이 길을 걸었다 — 아마 당신 자신이. 에너지는 발걸음을 기억하고, 기억은 에너지가 된다.',
  choices: [
    {
      text: '⚡ 흡수당한다',
      effectId: 'echo_resonance_gain_echo',
    },
    {
      text: '🃏 에너지가 카드를 원한다',
      effectId: 'echo_resonance_gain_rare_card',
    },
  ]
};
