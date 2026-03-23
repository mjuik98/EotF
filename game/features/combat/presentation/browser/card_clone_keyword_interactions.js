function isWithinElement(target, root) {
  let current = target || null;
  while (current) {
    if (current === root) return true;
    current = current.parentNode || null;
  }
  return false;
}

export function bindCardCloneKeywordPanelInteractions(cloneEl, deps = {}) {
  const mechanicsRow = cloneEl?.querySelector?.('.card-hover-mechanics');
  const keywordPanel = cloneEl?.querySelector?.('.card-clone-keyword-panel');
  if (!mechanicsRow || !keywordPanel) return;
  const { createSurfaceStateController } = deps;
  const cloneState = createSurfaceStateController?.({ element: cloneEl });
  const keywordPanelState = createSurfaceStateController?.({ element: keywordPanel });
  if (!cloneState || !keywordPanelState) return;

  const triggers = Array.from(mechanicsRow.children || []);
  const setOpen = (open) => {
    cloneState.setBoolean('keywordPanelOpen', open);
    keywordPanelState.setOpen(open);
  };
  const isTriggerTarget = (target) => triggers.includes(target);
  const activateTrigger = (trigger) => {
    const index = Number(trigger?.dataset?.keywordIndex || 0);
    keywordPanel.__setActiveKeyword?.(index);
    setOpen(true);
  };

  setOpen(false);

  triggers.forEach((trigger) => {
    const closeIfLeaving = (event = {}) => {
      if (isWithinElement(event.relatedTarget, keywordPanel) || isTriggerTarget(event.relatedTarget)) return;
      setOpen(false);
    };
    trigger.addEventListener('mouseenter', () => activateTrigger(trigger));
    trigger.addEventListener('focus', () => activateTrigger(trigger));
    trigger.addEventListener('click', () => activateTrigger(trigger));
    trigger.addEventListener('mouseleave', closeIfLeaving);
    trigger.addEventListener('blur', closeIfLeaving);
  });

  keywordPanel.addEventListener('mouseenter', () => setOpen(true));
  keywordPanel.addEventListener('focusin', () => setOpen(true));
  keywordPanel.addEventListener('mouseleave', (event = {}) => {
    if (isTriggerTarget(event.relatedTarget) || isWithinElement(event.relatedTarget, keywordPanel)) return;
    setOpen(false);
  });
  keywordPanel.addEventListener('focusout', (event = {}) => {
    if (isTriggerTarget(event.relatedTarget) || isWithinElement(event.relatedTarget, keywordPanel)) return;
    setOpen(false);
  });
}
