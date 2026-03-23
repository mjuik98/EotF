function getRectArea(rect = {}) {
  return Math.max(0, (rect.right || 0) - (rect.left || 0)) * Math.max(0, (rect.bottom || 0) - (rect.top || 0));
}

function getOverlapArea(leftRect, rightRect) {
  const overlapW = Math.max(0, Math.min(leftRect.right, rightRect.right) - Math.max(leftRect.left, rightRect.left));
  const overlapH = Math.max(0, Math.min(leftRect.bottom, rightRect.bottom) - Math.max(leftRect.top, rightRect.top));
  return overlapW * overlapH;
}

function applyArrowPlacement(cloneEl, cardPlacement) {
  const arrow = cloneEl?.querySelector?.('.card-clone-arrow');
  if (!arrow) return;

  if (cardPlacement === 'below') {
    arrow.style.top = '-10px';
    arrow.style.bottom = 'auto';
    arrow.style.borderTop = '0';
    arrow.style.borderBottom = '10px solid rgba(80, 70, 130, 0.45)';
    return;
  }

  arrow.style.top = 'auto';
  arrow.style.bottom = '-10px';
  arrow.style.borderBottom = '0';
  arrow.style.borderTop = '10px solid rgba(80, 70, 130, 0.45)';
}

export function collectAvoidRects(doc, avoidSelector) {
  return Array.from(doc?.querySelectorAll?.(avoidSelector) || [])
    .filter((element) => typeof element?.getBoundingClientRect === 'function')
    .map((element) => element.getBoundingClientRect())
    .filter((rect) => getRectArea(rect) > 0);
}

export function applyKeywordPanelPlacement(cardEl, cloneEl, deps = {}) {
  const keywordPanel = cloneEl?.querySelector?.('.card-clone-keyword-panel');
  if (!keywordPanel) return;

  const {
    cloneHeight,
    clonePosition = null,
    cloneRuntime,
    cloneWidth,
    createSurfaceStateController,
    doc,
    hoverKeywordLayout,
    avoidSelector,
    viewportMargin,
    win,
  } = deps;
  const cloneState = createSurfaceStateController?.({ element: cloneEl });
  if (!cloneState) return;
  const position = clonePosition || cloneRuntime?.calcPosition?.(cardEl);
  if (!position) return;

  const {
    left,
    top,
    cardPlacement,
    keywordPlacement: preferredPlacement = 'right',
  } = position;
  const viewportWidth = Number(win?.innerWidth) || 0;
  const viewportHeight = Number(win?.innerHeight) || 0;
  const avoidRects = collectAvoidRects(doc, avoidSelector);
  const cloneBox = {
    left,
    top,
    right: left + cloneWidth,
    bottom: top + cloneHeight,
  };
  const candidates = [
    {
      placement: 'right',
      rect: {
        left: cloneBox.right + hoverKeywordLayout.panelGap,
        top: cloneBox.top + (cloneHeight - hoverKeywordLayout.panelEstimatedHeight) / 2,
        right: cloneBox.right + hoverKeywordLayout.panelGap + hoverKeywordLayout.panelWidth,
        bottom: cloneBox.top + (cloneHeight - hoverKeywordLayout.panelEstimatedHeight) / 2 + hoverKeywordLayout.panelEstimatedHeight,
      },
    },
    {
      placement: 'left',
      rect: {
        left: cloneBox.left - hoverKeywordLayout.panelGap - hoverKeywordLayout.panelWidth,
        top: cloneBox.top + (cloneHeight - hoverKeywordLayout.panelEstimatedHeight) / 2,
        right: cloneBox.left - hoverKeywordLayout.panelGap,
        bottom: cloneBox.top + (cloneHeight - hoverKeywordLayout.panelEstimatedHeight) / 2 + hoverKeywordLayout.panelEstimatedHeight,
      },
    },
    {
      placement: 'bottom',
      rect: {
        left: cloneBox.left + (cloneWidth - hoverKeywordLayout.panelWidth) / 2,
        top: cloneBox.bottom + hoverKeywordLayout.panelGap + hoverKeywordLayout.bottomOffset,
        right: cloneBox.left + (cloneWidth - hoverKeywordLayout.panelWidth) / 2 + hoverKeywordLayout.panelWidth,
        bottom: cloneBox.bottom + hoverKeywordLayout.panelGap + hoverKeywordLayout.bottomOffset + hoverKeywordLayout.panelEstimatedHeight,
      },
    },
  ].map((candidate) => {
    const overflowPenalty = Math.max(0, viewportMargin - candidate.rect.left)
      + Math.max(0, viewportMargin - candidate.rect.top)
      + Math.max(0, candidate.rect.right + viewportMargin - viewportWidth)
      + Math.max(0, candidate.rect.bottom + viewportMargin - viewportHeight);
    const overlapPenalty = avoidRects.reduce((total, rect) => total + getOverlapArea(candidate.rect, rect), 0);
    const preferenceBias = candidate.placement === preferredPlacement
      ? 0
      : candidate.placement === 'right'
        ? 10
        : candidate.placement === 'left'
          ? 20
          : 40;
    return {
      ...candidate,
      score: overflowPenalty * 1000 + overlapPenalty + preferenceBias,
    };
  }).sort((leftCandidate, rightCandidate) => leftCandidate.score - rightCandidate.score);

  const best = candidates[0];
  cloneState.setValue('cardPlacement', cardPlacement);
  cloneState.setValue('keywordPlacement', best.placement);
  applyArrowPlacement(cloneEl, cardPlacement);
}
