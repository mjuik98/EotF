import { LogUtils } from '../ports/combat_logging.js';
import {
  advancePlayerPoisonDurationState,
  consumePlayerBuffStackState,
  reducePlayerTurnEnergyState,
} from '../state/player_turn_state_commands.js';

export function processPlayerStatusTicks(gs, { shuffleArrayFn } = {}) {
  if (!gs?.combat?.active || !gs?.player?.buffs) return { alive: true, actions: [] };

  const buffs = gs.player.buffs;
  const actions = [];

  if ((buffs.burning?.stacks || 0) > 0) {
    gs.takeDamage(5, { name: '화염', type: 'enemy' });
    consumePlayerBuffStackState(gs, 'burning');
    if (!gs.combat.active || gs.player.hp <= 0) return { alive: false, actions };
  }

  if ((buffs.poisoned?.stacks || 0) > 0) {
    const poisonDmg = Math.max(0, Number(buffs.poisoned.stacks || 0)) * 5;
    gs.takeDamage(poisonDmg, { name: '독', type: 'enemy' });
    advancePlayerPoisonDurationState(gs);
    if (!gs.combat.active || gs.player.hp <= 0) return { alive: false, actions };
  }

  if ((buffs.slowed?.stacks || 0) > 0) {
    reducePlayerTurnEnergyState(gs, 1);
    gs.addLog?.(LogUtils.formatStatChange('플레이어', '에너지', -1, false), 'damage');
    consumePlayerBuffStackState(gs, 'slowed');
  }

  if ((buffs.confusion?.stacks || 0) > 0) {
    if (gs.player.hand.length > 1 && shuffleArrayFn) {
      shuffleArrayFn(gs.player.hand);
      gs.addLog?.(LogUtils.formatAura('혼란: 손패가 뒤섞였다'), 'damage');
      actions.push('renderCombatCards');
    }
    consumePlayerBuffStackState(gs, 'confusion');
  }

  actions.push('updateStatusDisplay', 'updateUI');
  return { alive: true, actions };
}
