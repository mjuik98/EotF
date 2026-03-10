export function createCardCloneRuntime(options = {}) {
  const {
    cloneWidth = 200,
    cloneHeight = 292,
    cloneGap = 16,
    viewportMargin = 14,
    requestFrame = (callback) => globalThis.requestAnimationFrame(callback),
    view = globalThis.window || globalThis,
  } = options;

  let layer = null;
  let active = null;
  const cloneMap = new WeakMap();

  function setLayer(el) {
    layer = el;
  }

  function register(cardEl, cloneEl) {
    cloneMap.set(cardEl, cloneEl);
  }

  function calcPosition(cardEl) {
    const rect = cardEl.getBoundingClientRect();
    const viewportWidth = view.innerWidth;
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
    return {
      left,
      top: rect.top - cloneHeight - cloneGap,
      arrowLeft,
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
    const { left, top, arrowLeft } = calcPosition(cardEl);
    cloneEl.style.left = `${left}px`;
    cloneEl.style.top = `${top}px`;

    const arrow = cloneEl.querySelector('.card-clone-arrow');
    if (arrow) arrow.style.left = `${arrowLeft}px`;

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
    const { left, top, arrowLeft } = calcPosition(active);
    cloneEl.style.left = `${left}px`;
    cloneEl.style.top = `${top}px`;
    const arrow = cloneEl.querySelector('.card-clone-arrow');
    if (arrow) arrow.style.left = `${arrowLeft}px`;
  }

  return {
    calcPosition,
    hide,
    hideImmediate,
    register,
    reposition,
    setLayer,
    show,
  };
}
