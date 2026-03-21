import { createCharacterSelectMountActions } from '../../application/character_select_actions.js';

export function buildCharacterSelectMountPayload({ gs, audioEngine, saveSystem, deps, fns, doc }) {
  const mountActions = createCharacterSelectMountActions({ fns });
  const gameBootDeps = deps.getGameBootDeps?.() || {};

  return {
    doc,
    gs,
    audioEngine,
    data: gameBootDeps.data || null,
    onProgressConsumed: () => saveSystem?.saveMeta?.(deps.getSaveSystemDeps()),
    onConfirm: mountActions.onConfirm,
    onBack: mountActions.onBack,
    onStart: mountActions.onStart,
  };
}
