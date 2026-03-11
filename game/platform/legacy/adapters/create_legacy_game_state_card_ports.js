import { GAME } from '../global_bridge.js';

export function createLegacyGameStateCardPorts() {
  return {
    getRunRuntimeDeps: () => GAME.getRunDeps?.() || {},
    getCombatRuntimeDeps: () => GAME.getCombatDeps?.() || {},
    getCurrentCard: (cardId) => GAME.Data?.cards?.[cardId],
    getCardCostUtils: () => GAME.Modules?.CardCostUtils,
    getClassMechanics: () => GAME.Modules?.ClassMechanics,
    getHudUpdateUI: () => GAME.Modules?.HudUpdateUI,
    getAudioEngine: () => GAME.Audio,
  };
}
