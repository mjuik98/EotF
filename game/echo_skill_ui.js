import { CONSTANTS } from './constants/constants.js';
import { Trigger } from './constants/triggers.js';
import { GS } from './game_state.js';


export const EchoSkillUI = {
  useEchoSkill(deps = {}) {
    const gs = deps.gs || window.GS;
    if (!gs?.player) return;
    if (!gs.combat?.active || !gs.combat.playerTurn) return;

    const echoVal = gs.player.echo;
    let tier;
    let cost;
    if (echoVal >= 100) {
      tier = 3;
      cost = 100;
    } else if (echoVal >= 60) {
      tier = 2;
      cost = 60;
    } else if (echoVal >= 30) {
      tier = 1;
      cost = 30;
    } else {
      gs.addLog?.('⚠️ Echo 게이지 부족! (30 필요)', 'damage');
      return;
    }

    console.log('[EchoSkill] Before drain - echo:', echoVal, 'cost:', cost);
    gs.drainEcho(cost);
    console.log('[EchoSkill] After drain - echo:', gs.player.echo);

    gs.triggerItems?.(Trigger.ECHO_SKILL, { cost });

    const cls = gs.player.class;
    const skillDef = CONSTANTS.ECHO_SKILLS[cls]?.[tier];
    if (skillDef) {
      if (skillDef.dmg) gs.dealDamage(skillDef.dmg, null, true); // noChain=true
      if (skillDef.aoedmg) gs.dealDamageAll(skillDef.aoedmg, true); // noChain=true
      if (skillDef.shield) gs.addShield(skillDef.shield);
      if (skillDef.weaken) gs.applyEnemyStatus('weakened', skillDef.weaken);
      if (skillDef.draw) gs.drawCards(skillDef.draw);
      if (skillDef.echo) gs.addEcho(skillDef.echo);
      if (skillDef.vanish) gs.addBuff('vanish', skillDef.vanish, {});
      if (skillDef.heal) gs.heal(skillDef.heal);
      if (skillDef.atkGrowth) gs.addBuff('berserk_mode', 99, { atkGrowth: skillDef.atkGrowth });
      if (skillDef.immune) gs.addBuff('immune', skillDef.immune, {});
      gs.addLog?.(skillDef.log, 'echo');
    }

    deps.showEchoBurstOverlay?.();
    deps.audioEngine?.playResonanceBurst?.();
    deps.renderCombatEnemies?.();
    deps.renderCombatCards?.();

    const doc = deps.doc || document;
    const echoBtn = doc.getElementById('useEchoSkillBtn');
    if (echoBtn) {
      echoBtn.style.transition = 'opacity 0.2s, background 0.2s';
      echoBtn.style.background = 'linear-gradient(135deg,rgba(0,255,204,0.2),rgba(123,47,255,0.2))';
      setTimeout(() => { echoBtn.style.background = ''; }, 800);
    }
  },
};
