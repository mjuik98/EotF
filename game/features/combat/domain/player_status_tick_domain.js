import { LogUtils } from '../../../utils/log_utils.js';
import {
  decrementStackedBuff,
  reducePlayerEnergy,
} from '../../../domain/combat/turn/turn_state_mutators.js';

export function processPlayerStatusTicks(gs, { shuffleArrayFn } = {}) {
  if (!gs?.combat?.active || !gs?.player?.buffs) return { alive: true, actions: [] };

  const buffs = gs.player.buffs;
  const actions = [];

  if ((buffs.burning?.stacks || 0) > 0) {
    gs.takeDamage(5, { name: '화염', type: 'enemy' });
    decrementStackedBuff(buffs, 'burning');
    if (!gs.combat.active || gs.player.hp <= 0) return { alive: false, actions };
  }

  if ((buffs.poisoned?.stacks || 0) > 0) {
    const poisonDmg = Math.max(0, Number(buffs.poisoned.stacks || 0)) * 5;
    gs.takeDamage(poisonDmg, { name: '독', type: 'enemy' });
    buffs.poisoned.poisonDuration = (buffs.poisoned.poisonDuration || 1) - 1;
    if (buffs.poisoned.poisonDuration <= 0) {
      delete buffs.poisoned;
    }
    if (!gs.combat.active || gs.player.hp <= 0) return { alive: false, actions };
  }

  if ((buffs.slowed?.stacks || 0) > 0) {
    reducePlayerEnergy(gs, 1);
    gs.addLog?.(LogUtils.formatStatChange('플레이어', '에너지', -1, false), 'damage');
    decrementStackedBuff(buffs, 'slowed');
  }

  if ((buffs.confusion?.stacks || 0) > 0) {
    if (gs.player.hand.length > 1 && shuffleArrayFn) {
      shuffleArrayFn(gs.player.hand);
      gs.addLog?.(LogUtils.formatAura('혼란: 손패가 뒤섞였다'), 'damage');
      actions.push('renderCombatCards');
    }
    decrementStackedBuff(buffs, 'confusion');
  }

  actions.push('updateStatusDisplay', 'updateUI');
  return { alive: true, actions };
}
