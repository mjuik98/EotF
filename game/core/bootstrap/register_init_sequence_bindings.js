export function registerInitSequenceBindings({ game, modules, fns }) {
  game.register('advanceToNextRegion', fns.advanceToNextRegion);
  game.register('finalizeRunOutcome', modules.finalizeRunOutcome);
  game.register('switchScreen', fns.switchScreen);
  game.register('updateUI', fns.updateUI);
  game.register('updateNextNodes', fns.updateNextNodes);
  game.register('renderMinimap', fns.renderMinimap);
}

export function configureMazeSystem({ mazeSystem, gs, fovEngine, fns, doc, win }) {
  mazeSystem?.configure?.({
    gs,
    doc,
    win,
    fovEngine,
    showWorldMemoryNotice: (text) => fns.showWorldMemoryNotice(text),
    startCombat: (isBoss) => fns.startCombat(isBoss),
  });
}
