import {
  createUiSurfaceStateController,
} from '../state/ui_surface_state_controller.js';

const PANEL_VARIANTS = {
  combat: {
    panelStyle: 'width:min(320px,calc(100vw-36px));margin-top:10px;padding:12px;border:1px solid rgba(123,47,255,.24);border-radius:14px;background:linear-gradient(180deg,rgba(8,8,24,.96),rgba(6,6,18,.92));box-shadow:0 18px 40px rgba(0,0,0,.28);backdrop-filter:blur(18px)',
    gap: '8px',
    titleSize: '14px',
    boxPadding: '8px 10px',
    rowRadius: '10px',
    textSize: '11px',
    sectionSize: '10px',
    enterTransform: 'translateY(4px)',
  },
  compact: {
    panelStyle: 'width:100%;margin-top:10px;padding:10px;border:1px solid rgba(123,47,255,.16);border-radius:12px;background:linear-gradient(180deg,rgba(9,9,24,.92),rgba(6,6,18,.86));box-shadow:inset 0 1px 0 rgba(255,255,255,.04),0 12px 28px rgba(0,0,0,.18)',
    gap: '6px',
    titleSize: '12px',
    boxPadding: '7px 9px',
    rowRadius: '9px',
    textSize: '10px',
    sectionSize: '9px',
    enterTransform: 'translateY(3px)',
  },
  inline: {
    panelStyle: 'width:100%;margin-top:12px;padding:9px 10px;border:1px solid rgba(123,47,255,.16);border-radius:12px;background:linear-gradient(180deg,rgba(10,10,24,.9),rgba(7,7,18,.84));box-shadow:0 10px 24px rgba(0,0,0,.18)',
    gap: '6px',
    titleSize: '12px',
    boxPadding: '7px 9px',
    rowRadius: '9px',
    textSize: '10px',
    sectionSize: '9px',
    enterTransform: 'translateY(3px)',
  },
};

function resolveVariant(options = {}) {
  const variantName = options?.variant && PANEL_VARIANTS[options.variant] ? options.variant : 'combat';
  return {
    name: variantName,
    ...PANEL_VARIANTS[variantName],
  };
}

export function applyItemDetailPanelStyles(detailPanel, panelList, options = {}) {
  const variant = resolveVariant(options);
  if (detailPanel) {
    detailPanel.style.cssText = variant.panelStyle;
    if (detailPanel.dataset) detailPanel.dataset.detailVariant = variant.name;
  }
  if (panelList) {
    panelList.style.cssText = `display:flex;flex-direction:column;gap:${variant.gap};opacity:1;transform:translateY(0);transition:opacity .14s ease,transform .18s ease;will-change:opacity,transform`;
    if (panelList.dataset) panelList.dataset.detailVariant = variant.name;
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
    ? 'color:#efe5ff;background:rgba(123,47,255,.16);border-color:rgba(167,139,250,.28)'
    : tone === 'is-owned'
      ? 'color:var(--cyan);background:rgba(0,255,204,.08);border-color:rgba(0,255,204,.18)'
      : 'color:var(--cyan);background:rgba(0,255,204,.08);border-color:rgba(0,255,204,.18)';
  return createElement(doc, `crp-badge ${tone}`, text, `padding:2px 8px;border-radius:999px;font-size:8px;letter-spacing:.14em;text-transform:uppercase;border:1px solid rgba(255,255,255,.08);${toneStyle}`);
}

function createSetMemberRow(doc, member, boxPadding, rowRadius, textSize) {
  const row = createElement(
    doc,
    member.owned ? 'crp-row is-owned' : 'crp-row',
    '',
    `display:flex;align-items:center;justify-content:space-between;gap:10px;padding:${boxPadding};border-radius:${rowRadius};border:1px solid ${member.owned ? 'rgba(0,255,204,.14)' : 'rgba(255,255,255,.06)'};background:${member.owned ? 'rgba(0,255,204,.05)' : 'rgba(255,255,255,.03)'};color:${member.owned ? '#ebfffb' : 'var(--text)'};font-size:${textSize};line-height:1.6`,
  );
  const label = createElement(
    doc,
    'crp-row-label',
    `${member.icon || '?'} ${member.name || member.id}`,
    'min-width:0;flex:1 1 auto;',
  );
  row.appendChild(label);
  if (member.owned) {
    row.appendChild(createBadge(doc, '보유', 'is-owned'));
  }
  return row;
}

function getEntries(entriesRoot, entries) {
  if (Array.isArray(entries)) return entries.filter(Boolean);
  return Array.from(entriesRoot?.children || []).filter(Boolean);
}

function resolveSurfaceEntries(entriesRoot, entries) {
  return typeof entries === 'function'
    ? getEntries(entriesRoot, entries())
    : getEntries(entriesRoot, entries);
}

export function setItemDetailPanelState(detailPanel, {
  open = false,
  itemId = '',
  pinned = false,
} = {}) {
  const controller = createUiSurfaceStateController({ element: detailPanel });
  if (open) {
    controller.open({
      pinned,
      values: { itemId },
    });
    return;
  }
  controller.close({ clearKeys: ['itemId'] });
}

export function markItemDetailActiveEntry({
  entriesRoot,
  entries,
  activeEntry = null,
} = {}) {
  getEntries(entriesRoot, entries).forEach((entry) => {
    if (entry === activeEntry) {
      if (entry.dataset) entry.dataset.active = 'true';
      entry.setAttribute?.('aria-pressed', 'true');
      return;
    }
    if (entry?.dataset) delete entry.dataset.active;
    entry?.setAttribute?.('aria-pressed', 'false');
  });
}

export function clearItemDetailSurface({
  detailPanel,
  detailPanelList,
  entriesRoot,
  entries,
} = {}) {
  if (detailPanelList) detailPanelList.textContent = '';
  setItemDetailPanelState(detailPanel, { open: false });
  markItemDetailActiveEntry({ entriesRoot, entries, activeEntry: null });
}

export function createItemDetailSurfaceController({
  doc,
  detailPanel,
  detailPanelList,
  entriesRoot,
  entries,
  variant = 'combat',
  strategy = {},
} = {}) {
  const buildBaseContext = (context = {}) => ({
    doc,
    detailPanel,
    detailPanelList,
    entriesRoot,
    entries: resolveSurfaceEntries(entriesRoot, entries),
    variant,
    ...context,
  });

  return {
    clear(context = {}) {
      const nextContext = buildBaseContext(context);
      strategy.beforeClear?.(nextContext);
      clearItemDetailSurface(nextContext);
      strategy.afterClear?.(nextContext);
      return nextContext;
    },

    show(context = {}) {
      const nextContext = buildBaseContext(context);
      if (!nextContext.detailPanelList || !nextContext.detail) {
        return this.clear(nextContext);
      }

      const showContext = strategy.resolveShowState
        ? { ...nextContext, ...strategy.resolveShowState(nextContext) }
        : nextContext;

      renderItemDetailSurface(showContext);
      strategy.afterShow?.(showContext);
      return showContext;
    },
  };
}

export function bindItemDetailDismissStrategy({
  doc,
  win,
  detailPanel,
  shouldDismiss,
  onDismiss,
} = {}) {
  if (!detailPanel || typeof onDismiss !== 'function') return () => {};

  const pointerdown = (event) => {
    if (!shouldDismiss?.({ event, reason: 'pointerdown', detailPanel })) return;
    onDismiss({ event, reason: 'pointerdown', detailPanel });
  };
  const keydown = (event) => {
    if (!shouldDismiss?.({ event, reason: 'keydown', detailPanel })) return;
    onDismiss({ event, reason: 'keydown', detailPanel });
  };

  doc?.addEventListener?.('pointerdown', pointerdown, true);
  win?.addEventListener?.('keydown', keydown);

  return () => {
    doc?.removeEventListener?.('pointerdown', pointerdown, true);
    win?.removeEventListener?.('keydown', keydown);
  };
}

export function createManagedItemDetailSurface({
  doc,
  win,
  detailPanel,
  detailPanelList,
  entriesRoot,
  entries,
  variant = 'combat',
  strategy = {},
  } = {}) {
  const controller = createItemDetailSurfaceController({
    doc,
    detailPanel,
    detailPanelList,
    entriesRoot,
    entries,
    variant,
    strategy,
  });
  controller.bindDismiss = (context = {}) => {
    if (!strategy.shouldDismiss && !strategy.onDismiss) return () => {};

    const buildDismissContext = (payload = {}) => ({
      doc,
      win,
      detailPanel,
      entriesRoot,
      entries: resolveSurfaceEntries(entriesRoot, entries),
      clear: () => controller.clear(context),
      ...context,
      ...payload,
    });

    return bindItemDetailDismissStrategy({
      doc,
      win,
      detailPanel,
      shouldDismiss: strategy.shouldDismiss
        ? (payload) => strategy.shouldDismiss(buildDismissContext(payload))
        : undefined,
      onDismiss: strategy.onDismiss
        ? (payload) => strategy.onDismiss(buildDismissContext(payload))
        : () => controller.clear(context),
    });
  };
  return controller;
}

export function renderItemDetailPanelContent(doc, panelList, detail, options = {}) {
  if (!doc || !panelList || !detail) return;
  const variant = resolveVariant(options);
  const titleSize = variant.titleSize;
  const boxPadding = variant.boxPadding;
  const rowRadius = variant.rowRadius;
  const textSize = variant.textSize;
  const sectionSize = variant.sectionSize;

  panelList.style.opacity = '0';
  panelList.style.transform = variant.enterTransform;
  panelList.textContent = '';

  const head = createElement(doc, 'crp-head', '', 'display:flex;flex-direction:column;gap:4px');
  head.append(
    createElement(doc, 'crp-title', `${detail.icon || '?'} ${detail.title || ''}`.trim(), `font-family:Cinzel;font-size:${titleSize};color:var(--white)`),
  );
  const meta = createElement(doc, 'crp-meta', '', 'display:flex;align-items:center;gap:6px;flex-wrap:wrap');
  meta.append(
    createBadge(doc, detail.rarityLabel || '', 'is-rarity'),
    createBadge(doc, detail.triggerText || '', 'is-trigger'),
  );
  head.append(meta);
  panelList.appendChild(head);

  if (detail.desc) {
    panelList.appendChild(createElement(doc, 'crp-box', detail.desc, `padding:${boxPadding};border-radius:${rowRadius};border:1px solid rgba(255,255,255,.06);background:rgba(255,255,255,.03);color:var(--text);font-size:${textSize};line-height:1.6`));
  }

  if (detail.charge) {
    panelList.appendChild(
      createElement(doc, detail.charge.tone === 'accent' ? 'crp-box is-accent' : 'crp-box', `${detail.charge.label}: ${detail.charge.value}`, `padding:${boxPadding};border-radius:${rowRadius};border:1px solid ${detail.charge.tone === 'accent' ? 'rgba(0,255,204,.14)' : 'rgba(255,255,255,.06)'};background:${detail.charge.tone === 'accent' ? 'rgba(0,255,204,.05)' : 'rgba(255,255,255,.03)'};color:var(--text);font-size:${textSize};line-height:1.6`),
    );
  }

  if (detail.set) {
    const setHeader = createElement(doc, 'crp-section', '', 'display:flex;align-items:center;justify-content:space-between;gap:6px');
    setHeader.append(
      createElement(doc, 'crp-section-title', `세트 · ${detail.set.name}`, `font-family:Cinzel;font-size:${sectionSize};letter-spacing:.14em;color:#c4b5fd`),
      createElement(doc, 'crp-count', `${detail.set.count}/${detail.set.total}`, `font-family:'Share Tech Mono';font-size:${sectionSize};color:var(--white)`),
    );
    panelList.appendChild(setHeader);

    detail.set.members.forEach((member) => {
      panelList.appendChild(createSetMemberRow(doc, member, boxPadding, rowRadius, textSize));
    });

    detail.set.bonuses.forEach((bonus) => {
      const row = createElement(doc, bonus.active ? 'crp-bonus is-active' : 'crp-bonus', '', `display:grid;grid-template-columns:auto auto minmax(0,1fr);align-items:center;gap:8px;padding:${boxPadding};border-radius:${rowRadius};border:1px solid rgba(255,255,255,.06);background:rgba(255,255,255,.03);color:var(--text);font-size:${textSize};line-height:1.6`);
      row.append(
        createElement(doc, 'crp-tier', `${bonus.tier}세트`, `font-family:'Share Tech Mono';font-size:${sectionSize};color:var(--white)`),
        createElement(doc, 'crp-state', bonus.active ? '활성' : '대기', `padding:2px 8px;border-radius:999px;font-size:8px;letter-spacing:.14em;text-transform:uppercase;border:1px solid ${bonus.active ? 'rgba(0,255,204,.18)' : 'rgba(255,255,255,.08)'};background:${bonus.active ? 'rgba(0,255,204,.08)' : 'transparent'};color:${bonus.active ? 'var(--cyan)' : 'var(--text-dim)'}`),
        createElement(doc, 'crp-text', bonus.label || '', 'min-width:0;'),
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

export function renderItemDetailSurface({
  doc,
  detailPanel,
  detailPanelList,
  entriesRoot,
  entries,
  activeEntry = null,
  detail,
  variant = 'combat',
  itemId = '',
  pinned = false,
} = {}) {
  if (!detailPanelList || !detail) {
    clearItemDetailSurface({ detailPanel, detailPanelList, entriesRoot, entries });
    return;
  }

  renderItemDetailPanelContent(doc, detailPanelList, detail, { variant });
  setItemDetailPanelState(detailPanel, {
    open: true,
    itemId,
    pinned,
  });
  markItemDetailActiveEntry({ entriesRoot, entries, activeEntry });
}
