import { createLegacyRuntimePorts } from './create_legacy_runtime_ports.js';

export function createLegacyGameStateCardPorts() {
  const runtimePorts = createLegacyRuntimePorts();

  return {
    getRunRuntimeDeps: () => runtimePorts.getRunRuntimeDeps(),
    getCombatRuntimeDeps: () => runtimePorts.getCombatRuntimeDeps(),
    getCurrentCard: (cardId) => runtimePorts.getCurrentCard(cardId),
    getCardCostUtils: () => runtimePorts.getModule('CardCostUtils'),
    getClassMechanics: () => runtimePorts.getModule('ClassMechanics'),
    getHudUpdateUI: () => runtimePorts.getModule('HudUpdateUI'),
    getAudioEngine: () => runtimePorts.getAudioEngine(),
  };
}
