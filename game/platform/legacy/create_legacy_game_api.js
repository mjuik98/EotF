export function createLegacyGameApi({
  codexActions = {},
  combatActions = {},
  queryBindings = {},
  rewardActions = {},
  runActions = {},
  settingsActions = {},
  uiActions = {},
} = {}) {
  return {
    ...queryBindings,
    ...combatActions,
    ...codexActions,
    ...rewardActions,
    ...runActions,
    ...settingsActions,
    ...uiActions,
  };
}
