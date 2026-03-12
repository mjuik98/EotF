import { startCombatFlowUseCase } from '../../app/combat/use_cases/start_combat_flow_use_case.js';
import { endPlayerTurnUseCase } from '../../app/combat/use_cases/end_player_turn_use_case.js';
import { runEnemyTurnUseCase } from '../../app/combat/use_cases/run_enemy_turn_use_case.js';
import { executePlayerDrawService } from '../../app/combat/card_draw_service.js';
import { endCombatUseCase } from './app/use_cases/end_combat_use_case.js';
import { buildCombatRuntimeSubscriberActions } from './app/build_runtime_subscriber_actions.js';
import { createCombatActions } from './app/combat_actions.js';
import {
  discardStateCard,
  drawStateCards,
  playStateCard,
} from './app/game_state_card_actions.js';
import { buildCombatUiContractBuilders } from './ports/contracts/build_combat_ui_contracts.js';
import { createCombatPorts } from './ports/create_combat_ports.js';
import { CombatStartUI } from '../../ui/combat/combat_start_ui.js';
import { CombatUI } from '../../ui/combat/combat_ui.js';
import { CombatHudUI } from '../../ui/combat/combat_hud_ui.js';
import { EchoSkillUI } from '../../ui/combat/echo_skill_ui.js';
import { CombatTurnUI } from '../../presentation/combat/combat_turn_ui.js';
import { StatusEffectsUI } from '../../ui/combat/status_effects_ui.js';
import { CombatInfoUI } from '../../ui/combat/combat_info_ui.js';
import { CombatActionsUI } from '../../ui/combat/combat_actions_ui.js';
import { CardUI } from '../../ui/cards/card_ui.js';
import { CardTargetUI } from '../../ui/cards/card_target_ui.js';
import { TooltipUI } from '../../ui/cards/tooltip_ui.js';
import { DeckModalUI } from '../../ui/cards/deck_modal_ui.js';
import { HudUpdateUI } from '../../ui/hud/hud_update_ui.js';
import { FeedbackUI } from '../../ui/hud/feedback_ui.js';
import { DomValueUI } from '../../ui/hud/dom_value_ui.js';

export function buildCombatPublicModules() {
  return {
    CombatStartUI,
    CombatUI,
    CombatHudUI,
    EchoSkillUI,
    CombatTurnUI,
    StatusEffectsUI,
    CombatInfoUI,
    CombatActionsUI,
  };
}

export function buildCombatCardPublicModules() {
  return {
    CardUI,
    CardTargetUI,
    TooltipUI,
    DeckModalUI,
  };
}

export function buildCombatHudPublicModules() {
  return {
    HudUpdateUI,
    FeedbackUI,
    DomValueUI,
  };
}

export function createCombatBindingsActions(modules, fns) {
  return createCombatActions(modules, fns, createCombatPorts(modules));
}

export function buildCombatRuntimeSubscriberPublicActions(fns) {
  return buildCombatRuntimeSubscriberActions(fns);
}

export function buildCombatUiContractPublicBuilders(ctx) {
  return buildCombatUiContractBuilders(ctx);
}

export {
  CardTargetUI,
  CardUI,
  CombatActionsUI,
  CombatHudUI,
  CombatInfoUI,
  CombatStartUI,
  CombatTurnUI,
  CombatUI,
  DeckModalUI,
  DomValueUI,
  EchoSkillUI,
  FeedbackUI,
  HudUpdateUI,
  StatusEffectsUI,
  TooltipUI,
  buildCombatUiContractBuilders,
  buildCombatRuntimeSubscriberActions,
  createCombatActions,
  createCombatPorts,
  discardStateCard,
  drawStateCards,
  endCombatUseCase,
  endPlayerTurnUseCase,
  executePlayerDrawService,
  playStateCard,
  runEnemyTurnUseCase,
  startCombatFlowUseCase,
};
