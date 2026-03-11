import { LogUtils } from '../../../utils/log_utils.js';

const ENEMY_EFFECTS = {
  self_atk_up(gs, enemy) {
    enemy.atk += 3;
    gs.addLog(LogUtils.formatStatChange(enemy.name, '공격력', 3), 'system');
  },
  self_shield(gs, enemy) {
    enemy.shield = (enemy.shield || 0) + 8;
    gs.addLog(LogUtils.formatShield(enemy.name, 8), 'shield');
  },
  self_shield_15(gs, enemy) {
    enemy.shield = (enemy.shield || 0) + 15;
    gs.addLog(LogUtils.formatShield(enemy.name, 15), 'shield');
  },
  self_shield_20(gs, enemy) {
    enemy.shield = (enemy.shield || 0) + 20;
    gs.addLog(LogUtils.formatShield(enemy.name, 20), 'shield');
  },
  add_noise_5(gs, _enemy, _deps, regionId) {
    if (regionId === 1) gs.addSilence(5);
  },
  mass_debuff(gs) {
    const debuffs = ['weakened', 'slowed', 'burning'];
    debuffs.forEach((d) => {
      gs.player.buffs[d] = { stacks: 1 };
    });
    gs.addLog(LogUtils.formatAura('전체 디버프 부여!'), 'damage');
    return { uiAction: 'updateStatusDisplay' };
  },
  curse(gs, enemy) {
    gs.player.buffs.cursed = { stacks: 2 };
    gs.addLog(LogUtils.formatStatus(gs.player.name || '플레이어', '저주', 2), 'damage');
    return { uiAction: 'updateStatusDisplay' };
  },
  drain_echo(gs, enemy) {
    gs.drainEcho(20);
    gs.addLog(LogUtils.formatEcho(`${enemy.name}: 잔향 흡수! (-20)`), 'damage');
  },
  nullify_echo(gs) {
    gs.player.echo = 0;
    gs.player.echoChain = 0;
    gs.addLog(LogUtils.formatEcho('잔향 완전 무효화!'), 'damage');
    return { uiAction: 'updateChainUI', value: 0 };
  },
  add_noise(gs, _enemy, _deps, regionId) {
    if (regionId === 1) gs.addSilence(3);
  },
  exhaust_card(gs, _enemy, _deps, _baseRegion, data) {
    if (gs.player.hand.length > 0) {
      const ci = Math.floor(Math.random() * gs.player.hand.length);
      const c = gs.player.hand.splice(ci, 1)[0];
      gs.player.exhausted.push(c);
      gs.addLog(`💀 ${data.cards[c]?.name} 소각!`, 'damage');
      return { uiAction: 'renderCombatCards' };
    }
    return undefined;
  },
  drain_energy(gs) {
    gs.player.energy = Math.max(0, gs.player.energy - 1);
    gs.addLog(LogUtils.formatStatChange('플레이어', '에너지', -1, false), 'damage');
    return { uiAction: 'updateUI' };
  },
  drain_energy_2(gs) {
    gs.player.energy = Math.max(0, gs.player.energy - 2);
    gs.addLog(LogUtils.formatStatChange('플레이어', '에너지', -2, false), 'damage');
    return { uiAction: 'updateUI' };
  },
  drain_energy_all(gs) {
    gs.addLog(LogUtils.formatSystem('에너지 완전 [소진]!'), 'damage');
    return { uiAction: 'updateUI' };
  },
  confusion(gs) {
    gs.addLog(LogUtils.formatAura('카드 뒤섞임!'), 'damage');
    return { uiAction: 'shuffleAndRender' };
  },
  weaken(gs, enemy) {
    gs.player.buffs.weakened = { stacks: (gs.player.buffs.weakened?.stacks || 0) + 1 };
    gs.addLog(LogUtils.formatStatus('플레이어', '약화', 1), 'damage');
    return { uiAction: 'updateStatusDisplay' };
  },
  dodge(gs, enemy) {
    if (!enemy.statusEffects) enemy.statusEffects = {};
    enemy.statusEffects.dodge = (enemy.statusEffects.dodge || 0) + 1;
    gs.addLog(LogUtils.formatSystem(`${enemy.name}: 회피 태세!`), 'system');
  },
  lifesteal(gs, enemy) {
    enemy.hp = Math.min(enemy.maxHp || enemy.hp, (enemy.hp || 0) + 4);
    gs.addLog(LogUtils.formatHeal(enemy.name, 4), 'heal');
    return { uiAction: 'updateUI' };
  },
  poison_3(gs, enemy) {
    gs.player.buffs.poisoned = { stacks: 3 };
    gs.addLog(LogUtils.formatStatus('플레이어', '맹독', 3), 'damage');
    return { uiAction: 'updateStatusDisplay' };
  },
  self_heal_15(gs, enemy) {
    enemy.hp = Math.min(enemy.maxHp, (enemy.hp || 0) + 15);
    gs.addLog(LogUtils.formatHeal(enemy.name, 15), 'heal');
  },
  self_atk_up_4(gs, enemy) {
    enemy.atk += 4;
    gs.addLog(LogUtils.formatStatChange(enemy.name, '공격력', 4), 'system');
  },
  all_atk_up(gs) {
    gs.combat.enemies.forEach((enemy) => {
      if (enemy.hp > 0) {
        enemy.atk += 2;
        gs.addLog(LogUtils.formatStatChange(enemy.name, '공격력', 2), 'system');
      }
    });
  },
  heal_12(gs, enemy) {
    enemy.hp = Math.min(enemy.maxHp, enemy.hp + 12);
    gs.addLog(LogUtils.formatHeal(enemy.name, 12), 'heal');
  },
  heal_15(gs, enemy) {
    enemy.hp = Math.min(enemy.maxHp, enemy.hp + 15);
    gs.addLog(LogUtils.formatHeal(enemy.name, 15), 'heal');
  },
  heal_20(gs, enemy) {
    enemy.hp = Math.min(enemy.maxHp, enemy.hp + 20);
    gs.addLog(LogUtils.formatHeal(enemy.name, 20), 'heal');
  },
  heal_30(gs, enemy) {
    enemy.hp = Math.min(enemy.maxHp, enemy.hp + 30);
    gs.addLog(LogUtils.formatHeal(enemy.name, 30), 'heal');
  },
  phase_shift(gs, enemy) {
    gs.addLog(LogUtils.formatSystem(`${enemy.name}: 위상 전환!`), 'system');
  },
  stun(gs, enemy) {
    gs.player.energy = 0;
    gs.player.buffs.stunned = { stacks: 1 };
    gs.addLog(LogUtils.formatStatus('플레이어', '기절', 1), 'damage');
    return { uiAction: 'updateStatusDisplay' };
  },
  thorns(gs, enemy) {
    enemy.statusEffects = enemy.statusEffects || {};
    enemy.statusEffects.thorns = (enemy.statusEffects.thorns || 0) + 4;
    gs.addLog(`🌵 ${enemy.name}: 가시 반격 준비`, 'system');
  },
  doom_3(gs, enemy) {
    enemy.statusEffects = enemy.statusEffects || {};
    enemy.statusEffects.doom = 3;
    gs.addLog(`☠️ ${enemy.name}: 파멸의 선고! 3턴 후 폭발`, 'damage');
  },
  vulnerable(gs, enemy) {
    gs.player.buffs.vulnerable = { stacks: (gs.player.buffs.vulnerable?.stacks || 0) + 2 };
    gs.addLog(`💢 ${enemy.name}: 취약 부여!`, 'damage');
    return { uiAction: 'updateStatusDisplay' };
  },
  weaken_vulnerable(gs, enemy) {
    gs.player.buffs.weakened = { stacks: (gs.player.buffs.weakened?.stacks || 0) + 1 };
    gs.player.buffs.vulnerable = { stacks: (gs.player.buffs.vulnerable?.stacks || 0) + 1 };
    gs.addLog(`💫 ${enemy.name}: 약화 및 취약 부여!`, 'damage');
    return { uiAction: 'updateStatusDisplay' };
  },
};

export function handleEnemyEffectLogic(effect, gs, enemy, { regionId, data } = {}) {
  if (!effect || !gs || !enemy) return undefined;
  if (enemy.hp <= 0) return undefined;
  if (!(gs.combat?.active ?? true)) return undefined;
  const playerHp = Number(gs.player?.hp);
  if (Number.isFinite(playerHp) && playerHp < 1) return undefined;
  const handler = ENEMY_EFFECTS[effect];
  if (handler) return handler(gs, enemy, {}, regionId, data);
  console.warn('[TurnManager] 알 수 없는 효과:', effect);
  return undefined;
}
