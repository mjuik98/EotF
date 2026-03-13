const num = (value, fallback = 0) => (Number.isFinite(Number(value)) ? Number(value) : fallback);

export function buildEndingFragmentChoiceViewModel({
  choices = [],
  gs,
  outcome = 'victory',
} = {}) {
  if (!gs?.meta || outcome === 'victory') return null;

  const shardCount = Math.max(0, Math.floor(num(gs.meta.echoFragments, 0)));
  if (!shardCount) return null;

  return {
    title: `메아리 조각 ${shardCount}개 - 각인을 선택하라`,
    choices: choices.map((entry) => ({
      desc: entry.desc,
      effect: entry.effect,
      icon: entry.icon,
      name: entry.name,
    })),
  };
}

export function presentEndingFragmentChoices({
  anchor,
  doc,
  onChoose,
  session,
  viewModel,
} = {}) {
  if (!anchor?.parentNode || !doc || !viewModel) return null;

  const wrap = doc.createElement('div');
  wrap.id = 's6b';
  wrap.className = 'frag-wrap sc';

  const title = doc.createElement('div');
  title.className = 'frag-title';
  title.textContent = viewModel.title;

  const grid = doc.createElement('div');
  grid.className = 'frag-grid';
  const buttons = [];

  viewModel.choices.forEach((entry) => {
    const button = doc.createElement('button');
    button.type = 'button';
    button.className = 'frag-card';
    button.innerHTML = `<div class="frag-icon">${entry.icon}</div><div class="frag-name">${entry.name}</div><div class="frag-desc">${entry.desc}</div>`;

    const onPick = () => onChoose?.(entry.effect, { button, buttons, grid, wrap });
    button.addEventListener('click', onPick);
    session?.cleanups?.push?.(() => button.removeEventListener('click', onPick));

    buttons.push(button);
    grid.appendChild(button);
  });

  wrap.append(title, grid);
  anchor.parentNode.insertBefore(wrap, anchor);

  return { buttons, grid, wrap };
}
