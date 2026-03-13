import { renderCodexEmpty } from './codex_ui_render.js';

export function renderCodexInscriptions(doc, container, inscriptions = [], gs, options = {}) {
  const {
    emptyMessage = '각인을 발견하면 기록됩니다',
    seenTitle = '해금됨',
    unseenTitle = '미해금',
    seenIcon = '✦',
    unseenIcon = '◌',
  } = options;

  const seenEntries = inscriptions.filter((entry) => Number(gs?.meta?.inscriptions?.[entry.id] || 0) > 0);
  const unseenEntries = inscriptions.filter((entry) => Number(gs?.meta?.inscriptions?.[entry.id] || 0) <= 0);

  if (!seenEntries.length && !unseenEntries.length) {
    renderCodexEmpty(container, emptyMessage);
    return;
  }

  [
    { title: seenTitle, icon: seenIcon, entries: seenEntries, unlocked: true },
    { title: unseenTitle, icon: unseenIcon, entries: unseenEntries, unlocked: false },
  ].forEach((sectionDef) => {
    if (!sectionDef.entries.length) return;

    const section = doc.createElement('div');
    section.className = 'cx-section';
    section.innerHTML = `
      <div class="cx-section-hdr">
        <span class="cx-section-icon">${sectionDef.icon}</span>
        <span class="cx-section-title">${sectionDef.title}</span>
        <span class="cx-section-count">${sectionDef.entries.length}</span>
      </div>`;

    const grid = doc.createElement('div');
    grid.className = 'cx-grid';

    sectionDef.entries.forEach((inscription, index) => {
      const card = doc.createElement('article');
      card.className = `cx-card t-item${sectionDef.unlocked ? '' : ' is-unknown'}`;
      card.style.animationDelay = `${(index % 12) * 0.03}s`;
      card.innerHTML = `
        <div class="cx-num">#${String(index + 1).padStart(3, '0')}</div>
        <div class="cx-icon-area"><div class="cx-icon-bg"></div>
          ${sectionDef.unlocked
            ? `<div class="cx-icon">${inscription.icon || '?'}</div>`
            : `<div class="cx-silhouette">${inscription.icon || '?'}</div>`}
        </div>
        <div class="cx-info">
          <div class="cx-name">${sectionDef.unlocked ? inscription.name : '???'}</div>
          <div class="cx-sub">${sectionDef.unlocked ? `Lv.${gs?.meta?.inscriptions?.[inscription.id] ?? 0}` : '미해금'}</div>
        </div>`;
      grid.appendChild(card);
    });

    section.appendChild(grid);
    container.appendChild(section);
  });
}
