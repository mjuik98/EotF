let combatChronicleModulesPromise = null;

export async function ensureCombatChronicleBrowserModules() {
  if (!combatChronicleModulesPromise) {
    combatChronicleModulesPromise = import('../../presentation/browser/combat_hud_chronicle.js')
      .then((mod) => ({
        closeBattleChronicleOverlay: mod.closeBattleChronicleOverlay,
        isChronicleOverlayOpen: mod.isChronicleOverlayOpen,
        openBattleChronicleOverlay: mod.openBattleChronicleOverlay,
      }))
      .catch((error) => {
        combatChronicleModulesPromise = null;
        throw error;
      });
  }

  return combatChronicleModulesPromise;
}
