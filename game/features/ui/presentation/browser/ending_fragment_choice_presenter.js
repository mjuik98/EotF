const num = (value, fallback = 0) => (Number.isFinite(Number(value)) ? Number(value) : fallback);

function escapeHtml(text) {
  return String(text ?? '').replace(/[&<>"']/g, (char) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  }[char] || char));
}

function highlightFragmentChoiceDesc(text) {
  if (!text) return '';

  const placeholders = [];
  let html = escapeHtml(text);

  function protect(regex, render) {
    html = html.replace(regex, (match) => {
      const token = `__FRAG_${placeholders.length}__`;
      placeholders.push(render(match));
      return token;
    });
  }

  protect(/[\[【]\s*(소진|지속|즉시|치명타|독|낙인|지역 규칙)\s*[\]】]/g, (match) => {
    const keyword = match.replace(/^[\[【]\s*|\s*[\]】]$/g, '');
    const className = keyword === '소진'
      ? 'kw-exhaust'
      : keyword === '지속'
        ? 'kw-buff'
        : keyword === '즉시'
          ? 'kw-burst'
          : keyword === '치명타'
            ? 'kw-crit'
            : 'kw-special';
    return `<span class="${className} kw-block">[${keyword}]</span>`;
  });
  protect(/피해\s*\d+|\d+\s*피해/g, (match) => `<span class="kw-dmg">${match}</span>`);
  protect(/방어막\s*\d+|\d+\s*방어막/g, (match) => `<span class="kw-shield">${match}</span>`);
  protect(/잔향\s*\d+\s*충전|잔향\s*\d+|잔향\s*충전/g, (match) => `<span class="kw-echo">${match}</span>`);
  protect(/에너지\s*\d+\s*획득|에너지\s*\d+\s*소모|에너지\s*\+\d+|에너지\s*\d+/g, (match) => (
    `<span class="kw-energy">${match}</span>`
  ));
  protect(/\b\d+\b/g, (match) => `<span class="kw-num">${match}</span>`);

  for (let index = placeholders.length - 1; index >= 0; index -= 1) {
    html = html.split(`__FRAG_${index}__`).join(placeholders[index]);
  }

  return html.replace(/\r?\n/g, '<br>');
}

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
    button.innerHTML = `<div class="frag-icon">${entry.icon}</div><div class="frag-name">${entry.name}</div><div class="frag-desc">${highlightFragmentChoiceDesc(entry.desc || '')}</div>`;

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
