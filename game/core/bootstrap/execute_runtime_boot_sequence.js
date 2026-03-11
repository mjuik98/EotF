export function executeRuntimeBootSequence(bindings) {
  bindings.registerBindings();
  bindings.configureMaze();
  bindings.scheduleCharacterSelectMount();
  bindings.exposeRuntimeGlobals();
  bindings.bootGameInit();
  return { StorySystem: bindings.StorySystem };
}
