export function renderCodexSection(doc, container, options = {}) {
  const {
    title,
    icon,
    entries = [],
    buildCard,
    seenCount = 0,
  } = options;
  const section = doc.createElement('div');
  section.className = 'cx-section';
  section.innerHTML = `
    <div class="cx-section-hdr">
      <span class="cx-section-icon">${icon}</span>
      <span class="cx-section-title">${title}</span>
      <span class="cx-section-count">${seenCount} / ${entries.length}</span>
    </div>`;

  const grid = doc.createElement('div');
  grid.className = 'cx-grid';
  entries.forEach((entry, index) => {
    const card = buildCard(entry, index, doc);
    grid.appendChild(card);
  });
  section.appendChild(grid);
  container.appendChild(section);
}
