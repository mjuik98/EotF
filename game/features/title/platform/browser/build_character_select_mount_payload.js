import { createCharacterSelectMountActions } from '../../application/character_select_actions.js';

export function buildCharacterSelectMountPayload({ gs, audioEngine, saveSystem, deps, fns, doc }) {
  const mountActions = createCharacterSelectMountActions({ fns });
  const gameBootDeps = deps.getGameBootDeps?.() || {};
  const saveSystemDeps = deps.getSaveSystemDeps?.();

  return {
    doc,
    gs,
    audioEngine,
    data: gameBootDeps.data || null,
    onProgressConsumed: () => {
      const status = saveSystem?.saveMeta?.(saveSystemDeps);
      saveSystem?.showSaveStatus?.(status, saveSystemDeps);
      return status;
    },
    onConfirm: mountActions.onConfirm,
    onBack: mountActions.onBack,
    onStart: mountActions.onStart,
  };
}
