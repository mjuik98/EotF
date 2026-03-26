export function buildSaveSystemContract(ctx) {
  const {
    getRefs,
    buildBaseDeps,
  } = ctx;
  const refs = getRefs();

  return {
    ...buildBaseDeps('run'),
    runRules: refs.RunRules,
    isGameStarted: () => refs._gameStarted?.(),
  };
}
