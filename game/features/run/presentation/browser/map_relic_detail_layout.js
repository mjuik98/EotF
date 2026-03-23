const FLOATING_RELIC_DETAIL_BREAKPOINT = 1180;
const FLOATING_RELIC_DETAIL_WIDTH = 240;
const FLOATING_RELIC_DETAIL_GAP = 14;
const FLOATING_RELIC_DETAIL_MIN_TOP = 56;
const FLOATING_RELIC_DETAIL_EDGE_PADDING = 12;

function getElementRect(element) {
  return typeof element?.getBoundingClientRect === 'function'
    ? element.getBoundingClientRect()
    : null;
}

export function resolveRelicDetailPlacement(panel, detailPanel, win) {
  const viewportWidth = Number(win?.innerWidth) || 0;
  if (viewportWidth <= FLOATING_RELIC_DETAIL_BREAKPOINT) return 'inline';

  const panelRect = getElementRect(panel);
  const detailRect = getElementRect(detailPanel);
  const detailWidth = detailRect?.width || FLOATING_RELIC_DETAIL_WIDTH;
  if (!panelRect?.left) return 'floating-left';
  return panelRect.left >= detailWidth + 24 ? 'floating-left' : 'inline';
}

export function resolveFloatingRelicDetailTop(panel, detailPanel, activeSlot) {
  const panelRect = getElementRect(panel);
  const detailRect = getElementRect(detailPanel);
  const slotRect = getElementRect(activeSlot);
  const detailHeight = detailRect?.height || detailPanel?.offsetHeight || 0;
  const panelHeight = panelRect?.height || panel?.clientHeight || 0;

  if (!panelRect || !slotRect || !detailHeight || !panelHeight) return FLOATING_RELIC_DETAIL_MIN_TOP;

  const idealTop = slotRect.top - panelRect.top + ((slotRect.height || 0) - detailHeight) / 2;
  const maxTop = Math.max(FLOATING_RELIC_DETAIL_MIN_TOP, panelHeight - detailHeight - FLOATING_RELIC_DETAIL_EDGE_PADDING);
  return Math.max(FLOATING_RELIC_DETAIL_MIN_TOP, Math.min(Math.round(idealTop), Math.round(maxTop)));
}

export function applyRelicDetailLayout(panel, detailPanel, win, activeSlot = null) {
  if (!panel || !detailPanel) return;

  panel.style.position = 'relative';
  panel.style.overflow = 'visible';
  const placement = resolveRelicDetailPlacement(panel, detailPanel, win);
  if (detailPanel.dataset) detailPanel.dataset.placement = placement;
  detailPanel.style.transition = placement === 'floating-left'
    ? 'opacity .16s ease, transform .22s cubic-bezier(.22, 1, .36, 1)'
    : 'opacity .18s ease, transform .2s ease';
  detailPanel.style.transformOrigin = placement === 'floating-left' ? '100% 24px' : '50% 0';

  if (placement === 'floating-left') {
    detailPanel.style.position = 'absolute';
    detailPanel.style.top = `${resolveFloatingRelicDetailTop(panel, detailPanel, activeSlot)}px`;
    detailPanel.style.right = `calc(100% + ${FLOATING_RELIC_DETAIL_GAP}px)`;
    detailPanel.style.left = 'auto';
    detailPanel.style.bottom = 'auto';
    detailPanel.style.width = 'min(240px, calc(100vw - 48px))';
    detailPanel.style.marginTop = '0';
    detailPanel.style.zIndex = '12';
    return;
  }

  detailPanel.style.position = 'static';
  detailPanel.style.top = 'auto';
  detailPanel.style.right = 'auto';
  detailPanel.style.left = 'auto';
  detailPanel.style.bottom = 'auto';
  detailPanel.style.width = '100%';
  detailPanel.style.marginTop = '10px';
  detailPanel.style.zIndex = 'auto';
}
