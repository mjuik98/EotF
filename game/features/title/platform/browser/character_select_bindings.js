export function bindCharacterSelectKeyboard(doc, {
  state,
  closeModal,
  stopTyping,
  renderPhase,
  onBack,
  go,
  handleConfirm,
} = {}) {
  if (!doc) return () => {};

  const onKeyDown = (event) => {
    if (event.key === 'Escape') {
      if (state?.activeSkill) {
        closeModal?.();
      } else if (state?.phase === 'done') {
        state.phase = 'select';
        stopTyping?.();
        renderPhase?.();
      } else if (state?.phase === 'select') {
        onBack?.();
      }
      return;
    }

    if (event.key === 'ArrowLeft') {
      go?.(-1);
      return;
    }

    if (event.key === 'ArrowRight') {
      go?.(1);
      return;
    }

    if (event.key === 'Enter' && state?.phase === 'select' && !state?.activeSkill) {
      handleConfirm?.();
    }
  };

  doc.addEventListener('keydown', onKeyDown);
  return () => doc.removeEventListener('keydown', onKeyDown);
}

export function bindCharacterSelectDrag(doc, {
  isModalOpen,
  go,
} = {}) {
  if (!doc) return () => {};

  let dragX = null;
  let touchX = null;

  const onMouseDown = (event) => {
    if (!isModalOpen?.()) dragX = event.clientX;
  };
  const onMouseUp = (event) => {
    if (dragX === null) return;
    const dx = event.clientX - dragX;
    dragX = null;
    if (Math.abs(dx) > 80) go?.(dx < 0 ? 1 : -1);
  };
  const onTouchStart = (event) => {
    touchX = event.touches?.[0]?.clientX ?? null;
  };
  const onTouchEnd = (event) => {
    if (touchX === null) return;
    const dx = (event.changedTouches?.[0]?.clientX ?? touchX) - touchX;
    touchX = null;
    if (Math.abs(dx) > 50) go?.(dx < 0 ? 1 : -1);
  };

  doc.addEventListener('mousedown', onMouseDown);
  doc.addEventListener('mouseup', onMouseUp);
  doc.addEventListener('touchstart', onTouchStart, { passive: true });
  doc.addEventListener('touchend', onTouchEnd);

  return () => {
    doc.removeEventListener('mousedown', onMouseDown);
    doc.removeEventListener('mouseup', onMouseUp);
    doc.removeEventListener('touchstart', onTouchStart, { passive: true });
    doc.removeEventListener('touchend', onTouchEnd);
  };
}

export function bindCharacterSelectArrows(resolveById, {
  hover,
  getAccent,
  go,
} = {}) {
  if (!resolveById) return () => {};

  const cleanups = [];
  const setup = (id, dir) => {
    const button = resolveById(id);
    if (!button) return;

    const onClick = () => go?.(dir);
    const onMouseEnter = () => {
      hover?.();
      const accent = getAccent?.();
      button.style.background = `${accent}22`;
      button.style.transform = 'scale(1.1)';
      button.style.boxShadow = `0 0 30px ${accent}55`;
    };
    const onMouseLeave = () => {
      const accent = getAccent?.();
      button.style.background = `${accent}08`;
      button.style.transform = 'scale(1)';
      button.style.boxShadow = `0 0 16px ${accent}22`;
    };

    button.addEventListener('click', onClick);
    button.addEventListener('mouseenter', onMouseEnter);
    button.addEventListener('mouseleave', onMouseLeave);
    button.addEventListener('focus', onMouseEnter);
    button.addEventListener('blur', onMouseLeave);

    cleanups.push(() => button.removeEventListener('click', onClick));
    cleanups.push(() => button.removeEventListener('mouseenter', onMouseEnter));
    cleanups.push(() => button.removeEventListener('mouseleave', onMouseLeave));
    cleanups.push(() => button.removeEventListener('focus', onMouseEnter));
    cleanups.push(() => button.removeEventListener('blur', onMouseLeave));
  };

  setup('btnLeft', -1);
  setup('btnRight', 1);
  return () => cleanups.forEach((cleanup) => cleanup());
}

export function setupCharacterSelectBindings({
  doc,
  resolveById,
  isModalOpen,
  state,
  closeModal,
  stopTyping,
  renderPhase,
  onBack,
  go,
  handleConfirm,
  hover,
  getAccent,
} = {}) {
  const cleanups = [
    bindCharacterSelectKeyboard(doc, {
      state,
      closeModal,
      stopTyping,
      renderPhase,
      onBack,
      go,
      handleConfirm,
    }),
    bindCharacterSelectDrag(doc, {
      isModalOpen,
      go,
    }),
    bindCharacterSelectArrows(resolveById, {
      hover,
      getAccent,
      go,
    }),
  ];

  return () => cleanups.forEach((cleanup) => cleanup?.());
}
