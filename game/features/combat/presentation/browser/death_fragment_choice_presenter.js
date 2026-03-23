const DEFAULT_FRAGMENT_CHOICES = [
  { icon: '⚡', name: '잔향 강화', desc: '다음 런 시작 시 잔향 +30', effect: 'echo_boost' },
  { icon: '🛡️', name: '회복력', desc: '최대 체력 +10', effect: 'resilience' },
  { icon: '💰', name: '행운', desc: '시작 골드 +25', effect: 'fortune' },
];

export function buildDeathFragmentChoices(random = Math.random) {
  const choices = DEFAULT_FRAGMENT_CHOICES.map((choice) => ({ ...choice }));

  for (let i = choices.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1));
    [choices[i], choices[j]] = [choices[j], choices[i]];
  }

  return choices;
}

export function renderDeathFragmentChoices({ choices, doc, onSelect }) {
  const fragList = doc.getElementById('fragmentChoices');
  if (!fragList) return [];

  fragList.textContent = '';

  choices.forEach((choice) => {
    const btn = doc.createElement('div');
    btn.className = 'fragment-btn';
    btn.onclick = () => onSelect?.(choice.effect);

    const icon = doc.createElement('div');
    icon.className = 'fragment-icon';
    icon.textContent = choice.icon;

    const name = doc.createElement('div');
    name.className = 'fragment-name';
    name.textContent = choice.name;

    const desc = doc.createElement('div');
    desc.className = 'fragment-desc';
    desc.textContent = choice.desc;

    btn.append(icon, name, desc);
    fragList.appendChild(btn);
  });

  return choices;
}
