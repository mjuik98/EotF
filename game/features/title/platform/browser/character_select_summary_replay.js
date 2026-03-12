export function createCharacterSummaryReplay({
  progressionSystem,
  meta,
  classIds,
  resolveClass,
  levelUpPopup,
  runEndScreen,
  saveProgressMeta,
  updateAll,
  setReplaying,
  isReplaying,
  setTimeoutImpl = setTimeout,
  fallbackBonusText = '',
} = {}) {
  function finishSummaryReplay() {
    setReplaying?.(false);
    saveProgressMeta?.();
    updateAll?.();
    setTimeoutImpl?.(() => consumePendingSummaries(), 10);
  }

  function showLevelUpChain(summary, index = 0) {
    const levelUps = Array.isArray(summary?.levelUps) ? summary.levelUps : [];
    if (index >= levelUps.length) {
      finishSummaryReplay();
      return;
    }

    const selectedClass = resolveClass?.(summary.classId);
    const level = levelUps[index];
    const roadmap = progressionSystem?.getRoadmap?.(summary.classId) || [];
    const roadmapEntry = roadmap.find((row) => row.lv === level);
    const bonusText = roadmapEntry?.desc || fallbackBonusText;

    levelUpPopup.onClose = () => showLevelUpChain(summary, index + 1);
    levelUpPopup.show({
      classTitle: selectedClass?.title || selectedClass?.name || 'CLASS',
      newLevel: level,
      bonusText,
      accent: selectedClass?.accent || '#8b6dff',
    });
  }

  function playRunSummary(summary) {
    const selectedClass = resolveClass?.(summary?.classId);
    setReplaying?.(true);
    runEndScreen.onClose = () => {
      if (Array.isArray(summary?.levelUps) && summary.levelUps.length > 0) {
        showLevelUpChain(summary, 0);
        return;
      }
      finishSummaryReplay();
    };
    runEndScreen.show(summary, {
      title: selectedClass?.title,
      name: selectedClass?.name,
      accent: selectedClass?.accent,
    });
  }

  function consumePendingSummaries() {
    if (isReplaying?.()) return;
    const next = progressionSystem?.consumePendingSummary?.(meta, classIds);
    if (!next) return;
    saveProgressMeta?.();
    playRunSummary(next);
  }

  return {
    consumePendingSummaries,
    finishSummaryReplay,
    playRunSummary,
    showLevelUpChain,
  };
}
