export function renderCodexFilterBar(doc, options = {}) {
  const {
    definitions = [],
    filter = 'all',
    showUnknown = true,
    onFilterChange = () => {},
    onToggleUnknown = () => {},
  } = options;
  const bar = doc.getElementById('cxFilterBar');
  if (!bar) return;

  bar.textContent = '';

  const label = doc.createElement('span');
  label.className = 'cx-filter-label';
  label.textContent = 'FILTER';
  bar.appendChild(label);

  definitions.forEach((definition) => {
    if (!definition) {
      const sep = doc.createElement('div');
      sep.className = 'cx-filter-sep';
      bar.appendChild(sep);
      return;
    }
    const btn = doc.createElement('button');
    btn.className = 'cx-filter-pill' + (filter === definition.k ? ` ${definition.c || 'f-all'}` : '');
    btn.textContent = definition.l;
    btn.addEventListener('click', () => onFilterChange(definition.k));
    bar.appendChild(btn);
  });

  const endSep = doc.createElement('div');
  endSep.className = 'cx-filter-sep';
  bar.appendChild(endSep);

  const toggle = doc.createElement('button');
  toggle.className = 'cx-unknown-toggle';
  toggle.innerHTML = `<span>미발견 표시</span><div class="cx-toggle-track ${showUnknown ? 'on' : ''}"></div>`;
  toggle.addEventListener('click', () => onToggleUnknown());
  bar.appendChild(toggle);
}
