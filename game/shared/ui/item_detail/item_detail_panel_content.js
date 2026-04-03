import {
  createItemDetailBadge,
  createItemDetailElement,
  createSetMemberRow,
} from './item_detail_markup.js';
import { resolveItemDetailPanelVariant } from './item_detail_panel_variants.js';

export function renderItemDetailPanelContent(doc, panelList, detail, options = {}) {
  if (!doc || !panelList || !detail) return;
  const variant = resolveItemDetailPanelVariant(options);
  const titleSize = variant.titleSize;
  const boxPadding = variant.boxPadding;
  const rowRadius = variant.rowRadius;
  const textSize = variant.textSize;
  const sectionSize = variant.sectionSize;

  panelList.style.opacity = '0';
  panelList.style.transform = variant.enterTransform;
  panelList.textContent = '';

  const head = createItemDetailElement(doc, 'crp-head', '', 'display:flex;flex-direction:column;gap:4px');
  head.append(
    createItemDetailElement(doc, 'crp-title', `${detail.icon || '?'} ${detail.title || ''}`.trim(), `font-family:Cinzel;font-size:${titleSize};color:var(--white)`),
  );
  const meta = createItemDetailElement(doc, 'crp-meta', '', 'display:flex;align-items:center;gap:6px;flex-wrap:wrap');
  meta.append(
    createItemDetailBadge(doc, detail.rarityLabel || '', 'is-rarity'),
    createItemDetailBadge(doc, detail.triggerText || '', 'is-trigger'),
  );
  head.append(meta);
  panelList.appendChild(head);

  if (detail.desc) {
    panelList.appendChild(createItemDetailElement(doc, 'crp-box', detail.desc, `padding:${boxPadding};border-radius:${rowRadius};border:1px solid rgba(255,255,255,.06);background:rgba(255,255,255,.03);color:var(--text);font-size:${textSize};line-height:1.6`));
  }

  if (detail.charge) {
    panelList.appendChild(
      createItemDetailElement(doc, detail.charge.tone === 'accent' ? 'crp-box is-accent' : 'crp-box', `${detail.charge.label}: ${detail.charge.value}`, `padding:${boxPadding};border-radius:${rowRadius};border:1px solid ${detail.charge.tone === 'accent' ? 'rgba(0,255,204,.14)' : 'rgba(255,255,255,.06)'};background:${detail.charge.tone === 'accent' ? 'rgba(0,255,204,.05)' : 'rgba(255,255,255,.03)'};color:var(--text);font-size:${textSize};line-height:1.6`),
    );
  }

  if (detail.set) {
    const setHeader = createItemDetailElement(doc, 'crp-section', '', 'display:flex;align-items:center;justify-content:space-between;gap:6px');
    setHeader.append(
      createItemDetailElement(doc, 'crp-section-title', `세트 · ${detail.set.name}`, `font-family:Cinzel;font-size:${sectionSize};letter-spacing:.14em;color:#c4b5fd`),
      createItemDetailElement(doc, 'crp-count', `${detail.set.count}/${detail.set.total}`, `font-family:'Share Tech Mono';font-size:${sectionSize};color:var(--white)`),
    );
    panelList.appendChild(setHeader);

    detail.set.members.forEach((member) => {
      panelList.appendChild(createSetMemberRow(doc, member, boxPadding, rowRadius, textSize));
    });

    detail.set.bonuses.forEach((bonus) => {
      const row = createItemDetailElement(doc, bonus.active ? 'crp-bonus is-active' : 'crp-bonus', '', `display:grid;grid-template-columns:auto auto minmax(0,1fr);align-items:center;gap:8px;padding:${boxPadding};border-radius:${rowRadius};border:1px solid rgba(255,255,255,.06);background:rgba(255,255,255,.03);color:var(--text);font-size:${textSize};line-height:1.6`);
      row.append(
        createItemDetailElement(doc, 'crp-tier', `${bonus.tier}세트`, `font-family:'Share Tech Mono';font-size:${sectionSize};color:var(--white)`),
        createItemDetailElement(doc, 'crp-state', bonus.active ? '활성' : '대기', `padding:2px 8px;border-radius:999px;font-size:8px;letter-spacing:.14em;text-transform:uppercase;border:1px solid ${bonus.active ? 'rgba(0,255,204,.18)' : 'rgba(255,255,255,.08)'};background:${bonus.active ? 'rgba(0,255,204,.08)' : 'transparent'};color:${bonus.active ? 'var(--cyan)' : 'var(--text-dim)'}`),
        createItemDetailElement(doc, 'crp-text', bonus.label || '', 'min-width:0;'),
      );
      panelList.appendChild(row);
    });
  }

  const schedule = doc?.defaultView?.requestAnimationFrame
    ? doc.defaultView.requestAnimationFrame.bind(doc.defaultView)
    : (callback) => callback();
  schedule(() => {
    panelList.style.opacity = '1';
    panelList.style.transform = 'translateY(0)';
  });
}
