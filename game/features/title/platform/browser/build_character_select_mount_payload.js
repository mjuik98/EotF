import { createCharacterSelectMountActions } from '../../application/character_select_actions.js';

export function buildCharacterSelectMountPayload({ modules, deps, fns, doc }) {
  const mountActions = createCharacterSelectMountActions({ fns });

  return {
    doc,
    gs: modules.GS,
    audioEngine: modules.AudioEngine,
    onProgressConsumed: () => modules.SaveSystem?.saveMeta?.(deps.getSaveSystemDeps()),
    onConfirm: mountActions.onConfirm,
    onBack: mountActions.onBack,
    onStart: mountActions.onStart,
  };
}
