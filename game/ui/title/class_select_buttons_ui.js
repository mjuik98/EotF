function getDoc(deps) {
  return deps?.doc || document;
}

export function renderClassSelectButtons(container, deps = {}) {
  if (!container) {
    console.error('[ClassSelectUI] No container found for rendering buttons');
    return;
  }

  const data = deps.data;
  if (!data?.classes) return;

  const doc = getDoc(deps);
  const showTooltip = deps.showTooltip;
  const hideTooltip = deps.hideTooltip;
  const rarityLabels = deps.rarityLabels || {};
  container.innerHTML = '';

  Object.values(data.classes).forEach((cls) => {
    const startItemKey = cls.startRelic;
    const startItem = data.items?.[startItemKey];
    const itemInfo = startItem ? `${startItem.icon} 시작 유물: ${startItem.name}` : '';

    const btn = doc.createElement('button');
    btn.id = `class_${cls.id}`;
    btn.className = 'class-btn';
    btn.dataset.class = cls.id;

    btn.innerHTML = `
      <div class="class-btn-icon-container">
        <span class="class-btn-emoji">${cls.emoji}</span>
      </div>
      <div class="class-btn-name">${cls.name}</div>
      <div class="class-btn-style">${cls.style}</div>
      <div class="class-btn-desc">${cls.desc}</div>
      <div class="class-btn-trait class-btn-starting-relic">✦ 고유 특성: ${cls.traitName}</div>
      <div class="class-btn-relic class-btn-starting-relic">${itemInfo}</div>
    `;

    const traitEl = btn.querySelector('.class-btn-trait');
    if (traitEl) {
      traitEl.style.cursor = 'help';
      traitEl.addEventListener('mouseenter', (event) => {
        event.stopPropagation();
        showTooltip?.(event, cls.traitTitle, cls.traitDesc);
      });
      traitEl.addEventListener('mouseleave', () => hideTooltip?.());
    }

    const relicEl = btn.querySelector('.class-btn-relic');
    if (relicEl && startItem) {
      relicEl.style.cursor = 'help';
      relicEl.addEventListener('mouseenter', (event) => {
        event.stopPropagation();
        const rarityLabel = rarityLabels[startItem.rarity] || rarityLabels.common;
        showTooltip?.(event, `${startItem.icon} ${startItem.name} (${rarityLabel})`, startItem.desc || '시작 유물');
      });
      relicEl.addEventListener('mouseleave', () => hideTooltip?.());
    }

    container.appendChild(btn);
  });
}
