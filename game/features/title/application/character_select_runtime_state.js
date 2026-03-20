export function createCharacterSelectRuntimeState() {
  return { idx: 0, phase: 'select', activeSkill: null, typingTimer: null };
}

export function createCharacterSelectModalController({
  state,
  resolveById,
  openSkillModal,
  closeSkillModal,
}) {
  function closeModal() {
    closeSkillModal({
      state,
      resolveById,
    });
  }

  function openModal(skill, accent) {
    openSkillModal({
      skill,
      accent,
      state,
      resolveById,
      onClose: closeModal,
    });
  }

  return {
    closeModal,
    openModal,
  };
}

export function stopCharacterSelectTyping(state, clearIntervalImpl) {
  if (!state.typingTimer) return;
  clearIntervalImpl(state.typingTimer);
  state.typingTimer = null;
}
