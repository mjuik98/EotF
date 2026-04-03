export function isEscapeKey(event) {
  return event?.key === 'Escape' || event?.key === 'Esc';
}

export function defaultSwallowEscape(event) {
  event?.preventDefault?.();
  event?.stopPropagation?.();
  event?.stopImmediatePropagation?.();
}

export function isVisibleOverlayElement(element, doc = null) {
  const fallbackDoc = typeof document !== 'undefined' ? document : null;
  const resolvedDoc = doc || fallbackDoc;
  if (!element) return false;
  if (element.id === 'settingsModal') {
    return !!element.classList?.contains?.('active');
  }
  if (element.hidden) return false;

  const inlineDisplay = String(element.style?.display || '').trim().toLowerCase();
  if (inlineDisplay === 'none') return false;

  if (element.dataset?.open === 'true') return true;
  if (element.classList?.contains?.('active')) return true;
  if (element.classList?.contains?.('open')) return true;

  const fallbackView = typeof window !== 'undefined' ? window : null;
  const view = resolvedDoc?.defaultView || fallbackView;
  if (typeof view?.getComputedStyle !== 'function') {
    return Boolean(inlineDisplay);
  }

  const computed = view.getComputedStyle(element);
  if (computed.display === 'none') return false;
  if (computed.visibility === 'hidden') return false;

  const opacity = Number.parseFloat(computed.opacity || '1');
  const pointerEvents = String(computed.pointerEvents || '').toLowerCase();
  if (
    !element.classList?.contains?.('active')
    && !element.classList?.contains?.('open')
    && element.dataset?.open !== 'true'
    && opacity <= 0
    && pointerEvents === 'none'
  ) {
    return false;
  }

  return true;
}
