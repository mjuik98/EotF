export function createTooltipTriggerEvent(event, currentTarget) {
  const nextEvent = event && typeof event === 'object'
    ? { ...event }
    : {};
  nextEvent.currentTarget = currentTarget;
  if (!nextEvent.target) nextEvent.target = currentTarget;
  return nextEvent;
}

export function applyTooltipTriggerA11y(element, {
  label = '',
  role = 'button',
  tabIndex = '0',
} = {}) {
  if (!element) return element;

  const resolvedTabIndex = String(tabIndex);
  element.setAttribute?.('tabindex', resolvedTabIndex);
  element.setAttribute?.('role', role);
  if (label) element.setAttribute?.('aria-label', label);

  element.tabIndex = resolvedTabIndex;
  element.role = role;
  if (label) element['aria-label'] = label;
  return element;
}

export function bindTooltipTrigger(element, {
  label = '',
  role = 'button',
  tabIndex = '0',
  show = null,
  hide = null,
  move = null,
  bindMode = 'listener',
  eventFactory = createTooltipTriggerEvent,
} = {}) {
  if (!element) return () => {};

  applyTooltipTriggerA11y(element, { label, role, tabIndex });

  const toEvent = (event) => eventFactory(event, element);
  const onShow = (event) => show?.(toEvent(event));
  const onHide = (event) => hide?.(toEvent(event));
  const onMove = (event) => move?.(toEvent(event));

  if (bindMode === 'property') {
    element.onmouseenter = onShow;
    element.onfocus = onShow;
    element.onmouseleave = onHide;
    element.onblur = onHide;
    if (typeof move === 'function') element.onmousemove = onMove;
    return () => {
      element.onmouseenter = null;
      element.onfocus = null;
      element.onmouseleave = null;
      element.onblur = null;
      if (typeof move === 'function') element.onmousemove = null;
    };
  }

  if (!element.addEventListener) return () => {};
  element.addEventListener('mouseenter', onShow);
  element.addEventListener('focus', onShow);
  element.addEventListener('mouseleave', onHide);
  element.addEventListener('blur', onHide);
  if (typeof move === 'function') element.addEventListener('mousemove', onMove);

  return () => {
    element.removeEventListener?.('mouseenter', onShow);
    element.removeEventListener?.('focus', onShow);
    element.removeEventListener?.('mouseleave', onHide);
    element.removeEventListener?.('blur', onHide);
    if (typeof move === 'function') element.removeEventListener?.('mousemove', onMove);
  };
}
