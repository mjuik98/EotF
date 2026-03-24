export function createItemDetailElement(doc, className, text = '', style = '') {
  const el = doc.createElement('div');
  el.className = className;
  if (text) el.textContent = text;
  if (style) el.style.cssText = style;
  return el;
}

export function createItemDetailBadge(doc, text, tone) {
  const toneStyle = tone === 'is-rarity'
    ? 'color:#efe5ff;background:rgba(123,47,255,.16);border-color:rgba(167,139,250,.28)'
    : tone === 'is-owned'
      ? 'color:var(--cyan);background:rgba(0,255,204,.08);border-color:rgba(0,255,204,.18)'
      : 'color:var(--cyan);background:rgba(0,255,204,.08);border-color:rgba(0,255,204,.18)';
  return createItemDetailElement(
    doc,
    `crp-badge ${tone}`,
    text,
    `padding:2px 8px;border-radius:999px;font-size:8px;letter-spacing:.14em;text-transform:uppercase;border:1px solid rgba(255,255,255,.08);${toneStyle}`,
  );
}

export function createSetMemberRow(doc, member, boxPadding, rowRadius, textSize) {
  const row = createItemDetailElement(
    doc,
    member.owned ? 'crp-row is-owned' : 'crp-row',
    '',
    `display:flex;align-items:center;justify-content:space-between;gap:10px;padding:${boxPadding};border-radius:${rowRadius};border:1px solid ${member.owned ? 'rgba(0,255,204,.14)' : 'rgba(255,255,255,.06)'};background:${member.owned ? 'rgba(0,255,204,.05)' : 'rgba(255,255,255,.03)'};color:${member.owned ? '#ebfffb' : 'var(--text)'};font-size:${textSize};line-height:1.6`,
  );
  const label = createItemDetailElement(
    doc,
    'crp-row-label',
    `${member.icon || '?'} ${member.name || member.id}`,
    'min-width:0;flex:1 1 auto;',
  );
  row.appendChild(label);
  if (member.owned) {
    row.appendChild(createItemDetailBadge(doc, '보유', 'is-owned'));
  }
  return row;
}
