export function buildShopConfig(gs, runRules) {
  const savedMerchant = (gs.worldMemory?.savedMerchant || 0) > 0;
  return {
    savedMerchant,
    costPotion: runRules.getShopCost(gs, savedMerchant ? 8 : 12),
    costCard: runRules.getShopCost(gs, 15),
    costUpgrade: runRules.getShopCost(gs, 20),
  };
}
