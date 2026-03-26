import { pickDefinedRefs } from '../../ui/ports/public_shared_support_capabilities.js';

const COMBAT_BINDING_REF_KEYS = Object.freeze([
  'CombatUI',
  'CombatHudUI',
  'CombatActionsUI',
  'CardUI',
  'CardTargetUI',
  'DeckModalUI',
  'FeedbackUI',
  'TooltipUI',
  'HudUpdateUI',
  'StatusEffectsUI',
  'ClassMechanics',
  'CardCostUtils',
  'playCard',
  'drawCard',
  'useEchoSkill',
  'endPlayerTurn',
  'endCombat',
  'handleCardDragStart',
  'handleCardDragEnd',
  'handleCardDropOnEnemy',
  'selectTarget',
  'renderCombatEnemies',
  'renderCombatCards',
  'renderHand',
  'updateCombatLog',
  'updateUI',
  'updateChainUI',
  'showDmgPopup',
  'showEchoBurstOverlay',
  'showCombatSummary',
]);

export function pickCombatBindingRefs(refs = {}) {
  return pickDefinedRefs(refs, COMBAT_BINDING_REF_KEYS);
}
