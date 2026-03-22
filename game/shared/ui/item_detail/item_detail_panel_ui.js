function isCompactVariant(options = {}) {
  return options?.variant === 'compact';
}

export function applyItemDetailPanelStyles(detailPanel, panelList, options = {}) {
  const compact = isCompactVariant(options);
  if (detailPanel) {
    detailPanel.style.cssText = compact
      ? 'width:100%;margin-top:10px;padding:10px;border:1px solid rgba(123,47,255,0.16);border-radius:12px;background:linear-gradient(180deg,rgba(9,9,24,0.92),rgba(6,6,18,0.86));box-shadow:inset 0 1px 0 rgba(255,255,255,0.04),0 12px 28px rgba(0,0,0,0.18);'
      : 'width:min(320px,calc(100vw - 36px));margin-top:10px;padding:12px;border:1px solid rgba(123,47,255,0.24);border-radius:14px;background:linear-gradient(180deg,rgba(8,8,24,0.96),rgba(6,6,18,0.92));box-shadow:0 18px 40px rgba(0,0,0,0.28);backdrop-filter:blur(18px);';
  }
  if (panelList) {
    panelList.style.cssText = `display:flex;flex-direction:column;gap:${compact ? '6px' : '8px'};`;
  }
}

function createElement(doc, className, text = '', style = '') {
  const el = doc.createElement('div');
  el.className = className;
  if (text) el.textContent = text;
  if (style) el.style.cssText = style;
  return el;
}

function createBadge(doc, text, tone) {
  const toneStyle = tone === 'is-rarity'
    ? 'color:#efe5ff;background:rgba(123,47,255,0.16);border-color:rgba(167,139,250,0.28);'
    : 'color:var(--cyan);background:rgba(0,255,204,0.08);border-color:rgba(0,255,204,0.18);';
  return createElement(doc, `crp-badge ${tone}`, text, `padding:2px 8px;border-radius:999px;font-size:8px;letter-spacing:0.14em;text-transform:uppercase;border:1px solid rgba(255,255,255,0.08);${toneStyle}`);
}

export function renderItemDetailPanelContent(doc, panelList, detail, options = {}) {
  if (!doc || !panelList || !detail) return;
  const compact = isCompactVariant(options);
  const titleSize = compact ? '12px' : '14px';
  const boxPadding = compact ? '7px 9px' : '8px 10px';
  const rowRadius = compact ? '9px' : '10px';
  const textSize = compact ? '10px' : '11px';
  const sectionSize = compact ? '9px' : '10px';

  panelList.textContent = '';

  const head = createElement(doc, 'crp-head', '', 'display:flex;flex-direction:column;gap:4px;');
  head.append(
    createElement(doc, 'crp-title', `${detail.icon || '?'} ${detail.title || ''}`.trim(), `font-family:'Cinzel',serif;font-size:${titleSize};font-weight:700;color:var(--white);`),
  );
  const meta = createElement(doc, 'crp-meta', '', 'display:flex;align-items:center;gap:6px;flex-wrap:wrap;');
  meta.append(
    createBadge(doc, detail.rarityLabel || '', 'is-rarity'),
    createBadge(doc, detail.triggerText || '', 'is-trigger'),
  );
  head.append(meta);
  panelList.appendChild(head);

  if (detail.desc) {
    panelList.appendChild(createElement(doc, 'crp-box', detail.desc, `padding:${boxPadding};border-radius:${rowRadius};border:1px solid rgba(255,255,255,0.06);background:rgba(255,255,255,0.03);color:var(--text);font-size:${textSize};line-height:1.6;`));
  }

  if (detail.charge) {
    panelList.appendChild(
      createElement(doc, `crp-box ${detail.charge.tone === 'accent' ? 'is-accent' : ''}`.trim(), `${detail.charge.label}: ${detail.charge.value}`, `padding:${boxPadding};border-radius:${rowRadius};border:1px solid ${detail.charge.tone === 'accent' ? 'rgba(0,255,204,0.14)' : 'rgba(255,255,255,0.06)'};background:${detail.charge.tone === 'accent' ? 'rgba(0,255,204,0.05)' : 'rgba(255,255,255,0.03)'};color:var(--text);font-size:${textSize};line-height:1.6;`),
    );
  }

  if (!detail.set) return;

  const setHeader = createElement(doc, 'crp-section', '', 'display:flex;align-items:center;justify-content:space-between;gap:6px;margin-top:2px;');
  setHeader.append(
    createElement(doc, 'crp-section-title', `세트 · ${detail.set.name}`, `font-family:'Cinzel',serif;font-size:${sectionSize};letter-spacing:0.14em;color:#c4b5fd;`),
    createElement(doc, 'crp-count', `${detail.set.count}/${detail.set.total}`, `font-family:'Share Tech Mono',monospace;font-size:${sectionSize};color:var(--white);`),
  );
  panelList.appendChild(setHeader);

  detail.set.members.forEach((member) => {
    panelList.appendChild(
      createElement(
        doc,
        `crp-row ${member.owned ? 'is-owned' : ''}`.trim(),
        `${member.owned ? '보유 ' : ''}${member.icon || '?'} ${member.name || member.id}`,
        `padding:${boxPadding};border-radius:${rowRadius};border:1px solid ${member.owned ? 'rgba(0,255,204,0.14)' : 'rgba(255,255,255,0.06)'};background:${member.owned ? 'rgba(0,255,204,0.05)' : 'rgba(255,255,255,0.03)'};color:${member.owned ? '#ebfffb' : 'var(--text)'};font-size:${textSize};line-height:1.6;`,
      ),
    );
  });

  detail.set.bonuses.forEach((bonus) => {
    const row = createElement(doc, `crp-bonus ${bonus.active ? 'is-active' : ''}`.trim(), '', `display:grid;grid-template-columns:auto auto minmax(0,1fr);align-items:center;gap:8px;padding:${boxPadding};border-radius:${rowRadius};border:1px solid rgba(255,255,255,0.06);background:rgba(255,255,255,0.03);color:var(--text);font-size:${textSize};line-height:1.6;`);
    row.append(
      createElement(doc, 'crp-tier', `${bonus.tier}세트`, `font-family:'Share Tech Mono',monospace;font-size:${sectionSize};color:var(--white);`),
      createElement(doc, 'crp-state', bonus.active ? '활성' : '대기', `padding:2px 8px;border-radius:999px;font-size:8px;letter-spacing:0.14em;text-transform:uppercase;border:1px solid ${bonus.active ? 'rgba(0,255,204,0.18)' : 'rgba(255,255,255,0.08)'};background:${bonus.active ? 'rgba(0,255,204,0.08)' : 'transparent'};color:${bonus.active ? 'var(--cyan)' : 'var(--text-dim)'};`),
      createElement(doc, 'crp-text', bonus.label || '', 'min-width:0;'),
    );
    panelList.appendChild(row);
  });
}
