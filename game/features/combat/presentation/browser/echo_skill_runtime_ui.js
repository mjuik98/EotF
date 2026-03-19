import { CONSTANTS } from '../../../../data/constants.js';
import { Trigger } from '../../../../data/triggers.js';
import { playEventResonanceBurst } from '../../../../domain/audio/audio_event_helpers.js';

export function resolveEchoSkillTier(echoVal, constants = CONSTANTS) {
  if (echoVal >= constants.ECHO.SKILL_COST_HIGH) {
    return { tier: 3, cost: constants.ECHO.SKILL_COST_HIGH };
  }
  if (echoVal >= constants.ECHO.SKILL_COST_MID) {
    return { tier: 2, cost: constants.ECHO.SKILL_COST_MID };
  }
  if (echoVal >= constants.ECHO.SKILL_COST_LOW) {
    return { tier: 1, cost: constants.ECHO.SKILL_COST_LOW };
  }
  return null;
}

export function applyEchoSkillEffect(gs, skillDef, deps = {}) {
  if (!gs || !skillDef) return;
  if (skillDef.dmg) {
    if (typeof deps.applyEnemyDamage === 'function') {
      deps.applyEnemyDamage(skillDef.dmg, null, true, null, deps);
    }
  }
  if (skillDef.aoedmg) {
    if (typeof deps.applyEnemyAreaDamage === 'function') {
      deps.applyEnemyAreaDamage(skillDef.aoedmg, deps);
    }
  }
  if (skillDef.shield) gs.addShield(skillDef.shield);
  if (skillDef.weaken) gs.applyEnemyStatus('weakened', skillDef.weaken);
  if (skillDef.draw) {
    if (typeof deps.drawCardsState === 'function') deps.drawCardsState(gs, skillDef.draw);
    else gs.drawCards?.(skillDef.draw);
  }
  if (skillDef.echo) gs.addEcho(skillDef.echo);
  if (skillDef.vanish) gs.addBuff('vanish', skillDef.vanish, {});
  if (skillDef.heal) gs.heal(skillDef.heal);
  if (skillDef.atkGrowth) gs.addBuff('echo_berserk', 99, { atkGrowth: skillDef.atkGrowth });
  if (skillDef.maxHpGrowth) gs.increaseMaxHp(skillDef.maxHpGrowth);
  if (skillDef.immune) gs.addBuff('immune', skillDef.immune, {});
  gs.addLog?.(skillDef.log, 'echo');
}

export function flashEchoSkillButton(deps = {}) {
  const doc = deps.doc || document;
  const echoBtn = doc.getElementById('useEchoSkillBtn');
  if (!echoBtn) return false;

  echoBtn.style.transition = 'opacity 0.2s, background 0.2s';
  echoBtn.style.background = 'linear-gradient(135deg,rgba(0,255,204,0.2),rgba(123,47,255,0.2))';
  setTimeout(() => {
    echoBtn.style.background = '';
  }, 800);
  return true;
}

export function useEchoSkillRuntime(deps = {}) {
  const gs = deps.gs;
  if (!gs?.player) return false;
  if (!gs.combat?.active || !gs.combat.playerTurn) return false;

  const tierInfo = resolveEchoSkillTier(gs.player.echo, deps.constants || CONSTANTS);
  if (!tierInfo) {
    gs.addLog?.('⚠️ 잔향 게이지 부족! (30 필요)', 'damage');
    return false;
  }

  gs.drainEcho(tierInfo.cost);
  gs.triggerItems?.(Trigger.ECHO_SKILL, { cost: tierInfo.cost });

  const constants = deps.constants || CONSTANTS;
  const skillDef = constants.ECHO_SKILLS[gs.player.class]?.[tierInfo.tier];
  applyEchoSkillEffect(gs, skillDef, deps);

  deps.showEchoBurstOverlay?.();
  playEventResonanceBurst(deps.audioEngine);
  deps.renderCombatEnemies?.();
  deps.renderCombatCards?.();
  flashEchoSkillButton(deps);
  return true;
}
