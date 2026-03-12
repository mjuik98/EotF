export function buildEventFlowContractBuilders(ctx) {
  const { buildBaseDeps, getRefs } = ctx;

  return {
    eventFlow: () => {
      const refs = getRefs();
      return {
        ...buildBaseDeps('run'),
        openEvent: () => refs.triggerRandomEvent?.(),
        openShop: () => refs.showShop?.(),
        openRestSite: () => refs.showRestSite?.(),
      };
    },
  };
}
