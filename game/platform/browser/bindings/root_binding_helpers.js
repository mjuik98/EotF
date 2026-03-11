export function isEscapeKey(event) {
  return event?.key === 'Escape' || event?.key === 'Esc';
}

export function isVisibleModal(element, doc = null) {
  const fallbackDoc = typeof document !== 'undefined' ? document : null;
  const resolvedDoc = doc || fallbackDoc;
  if (!element) return false;
  if (element.classList?.contains('active')) return true;

  const inlineDisplay = String(element.style?.display || '').trim().toLowerCase();
  if (inlineDisplay === 'none') return false;
  if (inlineDisplay) return true;

  const fallbackView = typeof window !== 'undefined' ? window : null;
  const view = resolvedDoc?.defaultView || fallbackView;
  if (typeof view?.getComputedStyle !== 'function') return true;
  return view.getComputedStyle(element).display !== 'none';
}
