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

    expect(playerStateCommands).toContain('../../platform/legacy/state/legacy_player_state_command_mutations.js');
    expect(playerStateCommands).not.toContain('player.hp = Math.min(');
    expect(playerStateCommands).not.toContain('player.shield = Math.max(');
    expect(playerStateCommands).not.toContain('player.echo = nextEcho');
    expect(playerStateCommands).not.toContain('player.gold = Number(player.gold || 0) + (Number(amount) || 0)');
    expect(playerStateCommands).not.toContain('player.maxHp = Math.max(1');
    expect(playerStateCommands).not.toContain('player.maxEnergy = Math.min(cap, requestedMax)');
    expect(playerStateCommands).not.toContain('player.energy = Math.max(0, Math.min(');
    expect(playerStateCommands).not.toContain('statusEffects[statusId] = 0');
  });

  it('keeps event and reward player fallback mutations inside legacy adapters', () => {
    const eventCommands = read('game/features/event/state/event_state_commands.js');
    const rewardCommands = read('game/features/reward/state/reward_state_commands.js');

    expect(eventCommands).toContain('applyLegacyPlayerGoldState');
    expect(eventCommands).toContain('applyLegacyPlayerMaxEnergyGrowthState');
    expect(eventCommands).not.toContain('state.player.gold = Number(state.player.gold || 0) + (Number(amount) || 0);');
    expect(eventCommands).not.toContain('player.maxEnergy = Math.min(cap, requestedMax);');
    expect(eventCommands).not.toContain('player.energy = Math.min(player.maxEnergy, previousEnergy + actualIncrease);');

    expect(rewardCommands).toContain('applyLegacyPlayerGoldState');
    expect(rewardCommands).toContain('applyLegacyPlayerHealState');
    expect(rewardCommands).toContain('applyLegacyPlayerMaxEnergyGrowthState');
    expect(rewardCommands).toContain('applyLegacyPlayerMaxHpGrowthState');
    expect(rewardCommands).not.toContain('state.player.hp = Math.min(state.player.maxHp || 1, hpBefore + amount);');
    expect(rewardCommands).not.toContain('state.player.gold = (state.player.gold || 0) + amount;');
    expect(rewardCommands).not.toContain('state.player.maxHp = (state.player.maxHp || 0) + blessing.amount;');
    expect(rewardCommands).not.toContain('state.player.maxEnergy = (state.player.maxEnergy || 0) + blessing.amount;');
  });

  it('keeps combat domain policies free of inline state mutation fallbacks', () => {
    const startPolicy = read('game/domain/combat/turn/start_player_turn_policy.js');
    const endPolicy = read('game/domain/combat/turn/end_player_turn_policy.js');

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
    const damageSideEffects = read('game/features/combat/application/combat_damage_side_effects.js');
    const enemyDeathState = read('game/features/combat/application/enemy_death_state.js');
    const playCardService = read('game/features/combat/application/play_card_service.js');
    const classMechanicRules = read('game/domain/class/class_mechanic_rules.js');

    expect(damageSideEffects).not.toContain('gs.player.echoChain = prevChain + 1');
    expect(enemyDeathState).not.toContain('gs.player.kills += 1');
    expect(enemyDeathState).not.toContain('gs.meta.totalKills += 1');
    expect(enemyDeathState).not.toContain('gs.combat.bossDefeated = true');
    expect(enemyDeathState).not.toContain('gs.combat.miniBossDefeated = true');
    expect(playCardService).not.toContain('combat._isPlayingCard = true');
    expect(playCardService).not.toContain('player.hand.splice(handIdx, 1)');
    expect(playCardService).not.toContain('player.hand = handBefore');
    expect(playCardService).not.toContain('player._nextCardDiscount = Math.max(0, player._nextCardDiscount - 1)');
    expect(playCardService).not.toContain('stats.cardsPlayed++');
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
