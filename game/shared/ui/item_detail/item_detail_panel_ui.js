import {
  createUiSurfaceStateController,
} from '../state/ui_surface_state_controller.js';
import { registerEscapeSurface } from '../../runtime/overlay_escape_support.js';
import {
  createItemDetailBadge,
  createItemDetailElement,
  createSetMemberRow,
} from './item_detail_markup.js';
import { resolveItemDetailPanelVariant } from './item_detail_panel_variants.js';

export function applyItemDetailPanelStyles(detailPanel, panelList, options = {}) {
  const variant = resolveItemDetailPanelVariant(options);
  if (detailPanel) {
    detailPanel.style.cssText = variant.panelStyle;
    if (detailPanel.dataset) detailPanel.dataset.detailVariant = variant.name;
  }
  if (panelList) {
    panelList.style.cssText = `display:flex;flex-direction:column;gap:${variant.gap};opacity:1;transform:translateY(0);transition:opacity .14s ease,transform .18s ease;will-change:opacity,transform`;
    if (panelList.dataset) panelList.dataset.detailVariant = variant.name;
  }
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
  escapeHotkeyKey = detailPanel?.id || 'detail',
  escapePriority = 300,
  escapeScopes = ['run'],
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
  let closeSurface = () => controller.clear();
  const registerSurface = () => {
    if (!detailPanel || !doc) return () => {};
    return registerEscapeSurface(doc, detailPanel, {
      close: () => closeSurface(),
      hotkeyKey: escapeHotkeyKey,
      isVisible: () => detailPanel?.dataset?.open === 'true',
      priority: escapePriority,
      scopes: escapeScopes,
    });
  };
  let resetEscapeSurface = registerSurface();
  controller.closeSurface = () => closeSurface();
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

    closeSurface = () => {
      const payload = buildDismissContext({ event: null, reason: 'escape-surface' });
      if (strategy.onDismiss) {
        strategy.onDismiss(payload);
        return;
      }
      controller.clear(context);
    };
    resetEscapeSurface();
    resetEscapeSurface = registerSurface();

    const cleanup = bindItemDetailDismissStrategy({
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
    return () => {
      cleanup();
      closeSurface = () => controller.clear(context);
      resetEscapeSurface();
      resetEscapeSurface = registerSurface();
    };
  };
  return controller;
}

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
