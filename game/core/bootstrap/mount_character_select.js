export function mountCharacterSelect({ modules, deps, fns, doc }) {
  if (!modules.CharacterSelectUI) return;

  modules.CharacterSelectUI.mount({
    doc,
    gs: modules.GS,
    audioEngine: modules.AudioEngine,
    onProgressConsumed: () => modules.SaveSystem?.saveMeta?.(deps.getSaveSystemDeps()),
    onConfirm: (char) => {
      if (fns.selectClass) fns.selectClass(char.id);
    },
    onBack: () => {
      if (fns.backToTitle) fns.backToTitle();
    },
    onStart: (char) => {
      if (fns.startGame) fns.startGame(char.id);
    },
  });
}
