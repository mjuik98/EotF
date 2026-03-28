import fs from 'node:fs';
import path from 'node:path';

import { describe, expect, it } from 'vitest';

const ROOT = process.cwd();

function read(file) {
  return fs.readFileSync(path.join(ROOT, file), 'utf8');
}

describe('state flow boundary contracts', () => {
  it('keeps shared player state commands free of inline legacy mutation bodies', () => {
    const playerStateCommands = read('game/shared/state/player_state_commands.js');

    expect(playerStateCommands).toContain('../../platform/legacy/state/player_state_command_legacy_adapter.js');
    expect(playerStateCommands).not.toContain('../../platform/legacy/state/legacy_player_state_command_mutations.js');
    expect(playerStateCommands).not.toContain('player.hp = Math.min(');
    expect(playerStateCommands).not.toContain('player.shield = Math.max(');
    expect(playerStateCommands).not.toContain('player.echo = nextEcho');
    expect(playerStateCommands).not.toContain('player.gold = Number(player.gold || 0) + (Number(amount) || 0)');
    expect(playerStateCommands).not.toContain('player.maxHp = Math.max(1');
    expect(playerStateCommands).not.toContain('player.maxEnergy = Math.min(cap, requestedMax)');
    expect(playerStateCommands).not.toContain('player.energy = Math.max(0, Math.min(');
    expect(playerStateCommands).not.toContain('statusEffects[statusId] = 0');
  });

  it('keeps event and reward player fallback ownership on shared compat state-command bridges', () => {
    const eventCommands = read('game/features/event/state/event_state_commands.js');
    const rewardCommands = read('game/features/reward/state/reward_state_commands.js');
    const classProgressionEffects = read('game/features/title/domain/class_progression/class_progression_runtime_effects.js');
    const playerStateEffects = read('game/shared/state/player_state_effects.js');

    expect(eventCommands).toContain('../../../shared/state/player_state_effects.js');
    expect(eventCommands).not.toContain('../../../platform/legacy/state/legacy_player_state_command_fallback.js');
    expect(eventCommands).toContain('applyPlayerGoldDeltaState');
    expect(eventCommands).toContain('applyPlayerMaxEnergyGrowthState');
    expect(eventCommands).not.toContain('state.player.gold = Number(state.player.gold || 0) + (Number(amount) || 0);');
    expect(eventCommands).not.toContain('player.maxEnergy = Math.min(cap, requestedMax);');
    expect(eventCommands).not.toContain('player.energy = Math.min(player.maxEnergy, previousEnergy + actualIncrease);');

    expect(rewardCommands).toContain('../../../shared/state/player_state_effects.js');
    expect(rewardCommands).not.toContain('../../../platform/legacy/state/legacy_player_state_command_fallback.js');
    expect(rewardCommands).toContain('applyPlayerGoldDeltaState');
    expect(rewardCommands).toContain('applyPlayerHealDeltaState');
    expect(rewardCommands).toContain('applyPlayerMaxEnergyGrowthState');
    expect(rewardCommands).toContain('applyPlayerMaxHpGrowthState');
    expect(rewardCommands).not.toContain('state.player.hp = Math.min(state.player.maxHp || 1, hpBefore + amount);');
    expect(rewardCommands).not.toContain('state.player.gold = (state.player.gold || 0) + amount;');
    expect(rewardCommands).not.toContain('state.player.maxHp = (state.player.maxHp || 0) + blessing.amount;');
    expect(rewardCommands).not.toContain('state.player.maxEnergy = (state.player.maxEnergy || 0) + blessing.amount;');

    expect(classProgressionEffects).toContain('../../../../shared/state/player_state_effects.js');
    expect(classProgressionEffects).toContain('registerPlayerDeckCardsState');
    expect(classProgressionEffects).not.toContain('../../../../shared/codex/codex_record_state_use_case.js');
    expect(classProgressionEffects).not.toContain('registerCardDiscovered(');

    expect(playerStateEffects).toContain('./player_state_command_compat.js');
    expect(playerStateEffects).toContain('../codex/codex_record_state_use_case.js');
    expect(playerStateEffects).toContain('applyPlayerGoldCompatState');
    expect(playerStateEffects).toContain('applyPlayerHealCompatState');
    expect(playerStateEffects).toContain('applyPlayerMaxEnergyGrowthCompatState');
    expect(playerStateEffects).toContain('applyPlayerMaxHpGrowthCompatState');
  });

  it('keeps combat domain policies free of inline state mutation fallbacks', () => {
    const startPolicy = read('game/features/combat/domain/turn/start_player_turn_policy.js');
    const endPolicy = read('game/features/combat/domain/turn/end_player_turn_policy.js');

    expect(startPolicy).not.toContain('state.combat.turn += 1');
    expect(startPolicy).not.toContain('state.combat.playerTurn = true');
    expect(startPolicy).not.toContain('state.player.energy = isStunned ? 0 : state.player.maxEnergy');
    expect(startPolicy).not.toContain('state.player.shield = 0');
    expect(startPolicy).not.toContain('state.player.exhausted.push(cardId)');
    expect(startPolicy).not.toContain('state.player.energy = Math.max(0, state.player.energy - amount)');
    expect(startPolicy).not.toContain('state.player.maxEcho = Math.max(50');

    expect(endPolicy).not.toContain('state.player.silenceGauge = Math.max(0');
    expect(endPolicy).not.toContain('state.player.timeRiftGauge = 0');
    expect(endPolicy).not.toContain('state.player.graveyard.push(...state.player.hand)');
    expect(endPolicy).not.toContain('state.player.hand = []');
    expect(endPolicy).not.toContain('state.combat.playerTurn = false');
  });

  it('keeps combat application and class domain files on state-command writes only', () => {
    const cardMethodsFacade = read('game/features/combat/application/card_methods_facade.js');
    const damageSideEffects = read('game/features/combat/application/combat_damage_side_effects.js');
    const deathFlowActions = read('game/features/combat/application/death_flow_actions.js');
    const deathFlowEnemyRuntime = read('game/features/combat/application/death_flow_enemy_runtime.js');
    const deathFlowPlayerRuntime = read('game/features/combat/application/death_flow_player_runtime.js');
    const deathFlowRuntimeSupport = read('game/features/combat/application/death_flow_runtime_support.js');
    const enemyDeathState = read('game/features/combat/application/enemy_death_state.js');
    const helpPauseAbandonCombat = read('game/features/combat/application/help_pause_abandon_combat_actions.js');
    const playCardService = read('game/features/combat/application/play_card_service.js');
    const runEnemyTurnUseCase = read('game/features/combat/application/run_enemy_turn_use_case.js');
    const startCombatFlowUseCase = read('game/features/combat/application/start_combat_flow_use_case.js');
    const classMechanicRules = read('game/shared/class/class_mechanic_rules.js');
    const eventRestService = read('game/features/event/application/rest_service.js');
    const eventShopService = read('game/features/event/application/shop_service.js');

    expect(cardMethodsFacade).toContain('../platform/combat_card_runtime_ports.js');
    expect(cardMethodsFacade).not.toContain('../../../platform/legacy/adapters/create_legacy_game_state_card_ports.js');
    expect(damageSideEffects).not.toContain('gs.player.echoChain = prevChain + 1');
    expect(deathFlowActions).toContain("./death_flow_enemy_runtime.js");
    expect(deathFlowActions).toContain("./death_flow_player_runtime.js");
    expect(deathFlowEnemyRuntime).toContain("./death_flow_runtime_support.js");
    expect(deathFlowPlayerRuntime).toContain("./death_flow_runtime_support.js");
    expect(deathFlowRuntimeSupport).toContain("from '../../../../data/death_quotes.js'");
    expect(deathFlowRuntimeSupport).toContain("from '../../ui/ports/public_audio_support_capabilities.js'");
    expect(deathFlowRuntimeSupport).toContain('../../../shared/combat/public_combat_runtime_effects.js');
    expect(deathFlowRuntimeSupport).not.toContain('../../../domain/combat/public_combat_runtime_capabilities.js');
    expect(deathFlowActions).not.toContain('../../../../data/game_data.js');
    expect(deathFlowActions).not.toContain('../../../shared/audio/audio_event_helpers.js');
    expect(deathFlowActions).not.toContain('../../../shared/codex/codex_record_state_use_case.js');
    expect(deathFlowActions).not.toContain('../../../shared/state/runtime_session_commands.js');
    expect(enemyDeathState).not.toContain('gs.player.kills += 1');
    expect(enemyDeathState).not.toContain('gs.meta.totalKills += 1');
    expect(enemyDeathState).not.toContain('gs.combat.bossDefeated = true');
    expect(enemyDeathState).not.toContain('gs.combat.miniBossDefeated = true');
    expect(helpPauseAbandonCombat).toContain('../ports/public_state_capabilities.js');
    expect(helpPauseAbandonCombat).not.toContain('../../../shared/state/runtime_flow_controls.js');
    expect(playCardService).toContain('../../run/ports/public_rule_capabilities.js');
    expect(playCardService).toContain('../../../shared/combat/public_combat_runtime_effects.js');
    expect(playCardService).not.toContain('../../../domain/combat/public_combat_runtime_capabilities.js');
    expect(playCardService).not.toContain('../../../domain/run/region_service.js');
    expect(playCardService).not.toContain('../../../shared/codex/codex_record_state_use_case.js');
    expect(playCardService).not.toContain('../../../shared/state/game_state_runtime_compat.js');
    expect(playCardService).not.toContain('combat._isPlayingCard = true');
    expect(playCardService).not.toContain('player.hand.splice(handIdx, 1)');
    expect(playCardService).not.toContain('player.hand = handBefore');
    expect(playCardService).not.toContain('player._nextCardDiscount = Math.max(0, player._nextCardDiscount - 1)');
    expect(playCardService).not.toContain('stats.cardsPlayed++');
    expect(runEnemyTurnUseCase).toContain('../../run/ports/public_rule_capabilities.js');
    expect(runEnemyTurnUseCase).toContain('../domain/turn/start_player_turn_policy.js');
    expect(runEnemyTurnUseCase).toContain('../ports/public_state_capabilities.js');
    expect(runEnemyTurnUseCase).not.toContain('../../../domain/combat/public_combat_runtime_capabilities.js');
    expect(runEnemyTurnUseCase).not.toContain('../../../domain/run/region_service.js');
    expect(runEnemyTurnUseCase).not.toContain('../../../shared/state/runtime_session_commands.js');
    expect(startCombatFlowUseCase).toContain('../ports/public_state_capabilities.js');
    expect(startCombatFlowUseCase).not.toContain('../../../shared/state/runtime_flow_controls.js');
    expect(eventRestService).toContain("../domain/rest/build_rest_options.js");
    expect(eventRestService).not.toContain("../../../domain/event/rest/build_rest_options.js");
    expect(eventShopService).toContain("../domain/shop/build_shop_config.js");
    expect(eventShopService).not.toContain("../../../domain/event/shop/build_shop_config.js");
    expect(classMechanicRules).not.toContain('state.player.buffs.resonance.stacks = 99');
    expect(classMechanicRules).not.toContain('res.stacks = 99');
    expect(classMechanicRules).not.toContain('state.player._mageCastCounter = 0');
    expect(classMechanicRules).not.toContain('state.player._traitCardDiscounts = {}');
    expect(classMechanicRules).not.toContain('player._mageCastCounter = (player._mageCastCounter || 0) + 1');
    expect(classMechanicRules).not.toContain('player._hunterHitCounts[targetIdx] = (player._hunterHitCounts[targetIdx] || 0) + 1');
    expect(classMechanicRules).not.toContain('state.player._preservedShield = Math.floor(state.player.shield / 2)');
    expect(classMechanicRules).not.toContain('state.player._preservedShield = 0');
  });
});
