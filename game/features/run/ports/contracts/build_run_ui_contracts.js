export function buildRunUiContractBuilders(ctx) {
  const { getRefs, buildBaseDeps } = ctx;

  return {
    worldCanvas: () => {
      const refs = getRefs();
      return {
        ...buildBaseDeps('canvas'),
        getRegionData: refs.getRegionData,
        setBonusSystem: refs.SetBonusSystem,
      };
    },
  };
}
