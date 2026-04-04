export function createFrontdoorRuntimePorts(context = {}) {
  const { modules = {}, ports = {} } = context;

  return {
    getSelectedSlot({ gs = null, saveSystemDeps = {} } = {}) {
      return (
        modules.SaveSystem?.getSelectedSlot?.()
        || saveSystemDeps.gs?.meta?.activeSaveSlot
        || gs?.meta?.activeSaveSlot
        || 1
      );
    },

    getSelectedClass() {
      return modules.ClassSelectUI?.getSelectedClass?.();
    },

    loadRun(slot, saveSystemDeps = {}) {
      return modules.SaveSystem?.loadRun?.({ ...saveSystemDeps, slot });
    },

    onCharacterSelectEnter() {
      modules.CharacterSelectUI?.onEnter?.();
    },

    openCodex(state) {
      modules.CodexUI?.openCodex?.(state);
    },

    readRunPreview(slot) {
      return modules.SaveSystem?.readRunPreview?.({ slot });
    },

    resolveTitleState(overrides = {}) {
      const gameBootDeps = overrides.gameBootDeps || ports.getGameBootDeps?.() || {};
      const saveSystemDeps = overrides.saveSystemDeps || {};
      const runSetupDeps = overrides.runSetupDeps || {};

      return {
        data: runSetupDeps.data || saveSystemDeps.data || gameBootDeps.data || modules.DATA,
        gs: runSetupDeps.gs || saveSystemDeps.gs || gameBootDeps.gs || modules.GS,
      };
    },

    selectClass(target, classSelectDeps) {
      if (typeof target === 'string' || typeof target === 'number') {
        modules.ClassSelectUI?.selectClassById?.(target, classSelectDeps);
        return;
      }

      modules.ClassSelectUI?.selectClass?.(target, classSelectDeps);
    },

    startRunSetup(runSetupDeps = {}) {
      if (typeof runSetupDeps.startGame === 'function') {
        return runSetupDeps.startGame();
      }

      return modules.RunSetupUI?.startGame?.(runSetupDeps);
    },
  };
}
