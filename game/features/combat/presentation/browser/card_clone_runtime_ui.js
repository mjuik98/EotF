import { setDatasetValue } from '../../../../shared/ui/state/ui_state_dataset.js';

export function createCardCloneRuntime(options = {}) {
  const {
    cloneWidth = 200,
    cloneHeight = 292,
    cloneGap = 16,
    keywordPanelGap = 12,
    keywordPanelWidth = 176,
    viewportMargin = 14,
  } = options;

  let requestFrame = options.requestFrame || ((callback) => setTimeout(callback, 16));
  let view = options.view || null;
  let getAvoidRects = typeof options.getAvoidRects === 'function' ? options.getAvoidRects : (() => []);

  let layer = null;
  let active = null;
  const cloneMap = new WeakMap();

  function setLayer(el) {
    layer = el;
  }

  function setView(nextView) {
    view = nextView || null;
  }

  function setRequestFrame(nextRequestFrame) {
    requestFrame = nextRequestFrame || ((callback) => setTimeout(callback, 16));
  }

  function setAvoidRectsResolver(resolver) {
    getAvoidRects = typeof resolver === 'function' ? resolver : (() => []);
  }

  function register(cardEl, cloneEl) {
    cloneMap.set(cardEl, cloneEl);
  }

  function calcPosition(cardEl) {
    const rect = cardEl.getBoundingClientRect();
    const viewportWidth = Number(view?.innerWidth) || 1280;
    const viewportHeight = Number(view?.innerHeight) || 720;
    const centerX = rect.left + rect.width / 2;

    let left = centerX - cloneWidth / 2;
    let arrowLeft = cloneWidth / 2;

    if (left + cloneWidth > viewportWidth - viewportMargin) {
      const overflow = (left + cloneWidth) - (viewportWidth - viewportMargin);
      left -= overflow;
      arrowLeft += overflow;
    }
    if (left < viewportMargin) {
      const overflow = viewportMargin - left;
      left += overflow;
      arrowLeft -= overflow;
    }

    arrowLeft = Math.max(20, Math.min(cloneWidth - 20, arrowLeft));

    const avoidRects = getAvoidRects().filter(Boolean);
    const candidates = [
      { cardPlacement: 'above', top: rect.top - cloneHeight - cloneGap },
      { cardPlacement: 'below', top: rect.bottom + cloneGap },
    ].map((candidate) => {
      const topOverflow = Math.max(0, viewportMargin - candidate.top);
      const bottomOverflow = Math.max(0, (candidate.top + cloneHeight + viewportMargin) - viewportHeight);
      const box = {
        left,
        top: candidate.top,
        right: left + cloneWidth,
        bottom: candidate.top + cloneHeight,
      };
      const overlapPenalty = avoidRects.reduce((total, avoidRect) => {
        const overlapW = Math.max(0, Math.min(box.right, avoidRect.right) - Math.max(box.left, avoidRect.left));
        const overlapH = Math.max(0, Math.min(box.bottom, avoidRect.bottom) - Math.max(box.top, avoidRect.top));
        return total + (overlapW * overlapH);
      }, 0);
      return {
        ...candidate,
        score: (topOverflow + bottomOverflow) * 1000 + overlapPenalty,
      };
    });
    const bestCandidate = candidates.sort((leftCandidate, rightCandidate) => leftCandidate.score - rightCandidate.score)[0];
    const safeTop = Math.max(viewportMargin, Math.min(bestCandidate.top, viewportHeight - cloneHeight - viewportMargin));
    const canPlaceKeywordRight = left + cloneWidth + keywordPanelGap + keywordPanelWidth + viewportMargin <= viewportWidth;
    const canPlaceKeywordLeft = left - keywordPanelGap - keywordPanelWidth >= viewportMargin;

    return {
      left,
      top: safeTop,
      arrowLeft,
      cardPlacement: bestCandidate.cardPlacement,
      keywordPlacement: canPlaceKeywordRight ? 'right' : canPlaceKeywordLeft ? 'left' : 'bottom',
    };
  }

  function hide(handZoneEl) {
    if (!active) return;
    const cloneEl = cloneMap.get(active);
    if (cloneEl) {
      cloneEl.classList.remove('card-clone-visible');
      const onEnd = () => {
        cloneEl.removeEventListener('transitionend', onEnd);
        if (cloneEl.parentNode === layer) layer.removeChild(cloneEl);
      };
      cloneEl.addEventListener('transitionend', onEnd);
    }
    active.classList.remove('card-clone-dimmed');
    handZoneEl?.classList.remove('has-active-clone');
    active = null;
  }

  function show(cardEl, cloneEl, handZoneEl) {
    if (!layer) return;
    if (active && active !== cardEl) hide();

    active = cardEl;
    const position = calcPosition(cardEl);
    const { left, top, arrowLeft } = position;
    cloneEl.style.left = `${left}px`;
    cloneEl.style.top = `${top}px`;
    if (cloneEl.dataset) {
      setDatasetValue(cloneEl, 'cardPlacement', position.cardPlacement);
      setDatasetValue(cloneEl, 'keywordPlacement', position.keywordPlacement);
    }

    const arrow = cloneEl.querySelector('.card-clone-arrow');
    if (arrow) arrow.style.left = `${arrowLeft}px`;
    cloneEl.__onClonePositionChange?.(position);

    layer.appendChild(cloneEl);
    requestFrame(() => requestFrame(() => cloneEl.classList.add('card-clone-visible')));

    cardEl.classList.add('card-clone-dimmed');
    handZoneEl?.classList.add('has-active-clone');
  }

  function hideImmediate(handZoneEl) {
    if (!layer) return;
    while (layer.firstChild) layer.removeChild(layer.firstChild);
    if (active) {
      active.classList.remove('card-clone-dimmed');
      active = null;
    }
    handZoneEl?.classList.remove('has-active-clone');
  }

  function reposition() {
    if (!active || !layer) return;
    const cloneEl = cloneMap.get(active);
    if (!cloneEl?.parentNode) return;
    const position = calcPosition(active);
    const { left, top, arrowLeft } = position;
    cloneEl.style.left = `${left}px`;
    cloneEl.style.top = `${top}px`;
    if (cloneEl.dataset) {
      setDatasetValue(cloneEl, 'cardPlacement', position.cardPlacement);
      setDatasetValue(cloneEl, 'keywordPlacement', position.keywordPlacement);
    }
    const arrow = cloneEl.querySelector('.card-clone-arrow');
    if (arrow) arrow.style.left = `${arrowLeft}px`;
    cloneEl.__onClonePositionChange?.(position);
  }

  return {
    calcPosition,
    hide,
    hideImmediate,
    register,
    reposition,
    setAvoidRectsResolver,
    setRequestFrame,
    setLayer,
    setView,
    show,
  };
}
