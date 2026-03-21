let combatTooltipModulesPromise = null;

export async function ensureCombatTooltipBrowserModules() {
  if (!combatTooltipModulesPromise) {
    combatTooltipModulesPromise = import('./combat_tooltip_browser_modules.js')
      .then((mod) => mod.createCombatTooltipBrowserModules())
      .catch((error) => {
        combatTooltipModulesPromise = null;
        throw error;
      });
  }

  return combatTooltipModulesPromise;
}
