export const merchantLostEvent = {
  id: 'merchant_lost',
  layer: 2,
  title: '길 잃은 상인',
  eyebrow: 'LAYER 2 · 연속 이벤트',
  desc: '상인이 주저앉아 있다. 잔향 에너지에 방향을 잃었다. 눈이 흐리다. 당신을 보자 입술이 떨렸다 — 두려움인지, 안도인지.',
  choices: [
    {
      text: '🤝 손을 내민다',
      effectId: 'merchant_help',
    },
    {
      text: '💰 빼앗는다',
      effectId: 'merchant_rob',
    },
  ]
};
