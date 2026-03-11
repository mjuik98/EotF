export const forgeEvent = {
  id: 'forge',
  layer: 1,
  title: '잔향의 대장간',
  eyebrow: 'LAYER 1 · 우발적 이벤트',
  desc: '대장간은 아무도 없는데 불이 켜져 있다. 잔향 에너지로 달구어진 화로가 무언가를 기다린다. 아니면 — 당신을 기억하고 있다.',
  choices: [
    {
      text: '⚒️ 화로가 원하는 것을 준다',
      effectId: 'forge_upgrade_random_card',
    },
    {
      text: '🔥 흡수당한다',
      effectId: 'forge_gain_echo',
    },
    {
      text: '🚶 보지 않은 척 지나간다',
      effect() {
        return '화로를 지나치며 장갑끈만 고쳐 맸다. 오늘은 강철보다 침묵을 택했다.';
      }
    },
  ]
};
