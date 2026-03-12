export function createLegacyGameApi({
  playerActions = {},
  codexActions = {},
  combatActions = {},
  queryBindings = {},
  rewardActions = {},
  runActions = {},
  screenActions = {},
  settingsActions = {},
  uiActions = {},
} = {}) {
  return {
    ...queryBindings,
    ...playerActions,
    ...combatActions,
    ...codexActions,
    ...rewardActions,
    ...runActions,
    ...screenActions,
    ...settingsActions,
    ...uiActions,
  };
}
