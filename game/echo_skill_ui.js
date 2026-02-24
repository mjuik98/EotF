'use strict';

(function initEchoSkillUI(globalObj) {
  const EchoSkillUI = {
    useEchoSkill(deps = {}) {
      const gs = deps.gs || globalObj.GS;
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

      gs.drainEcho(cost);
      gs.triggerItems?.(Trigger.ECHO_SKILL, { cost });

      const cls = gs.player.class;
      if (cls === 'swordsman') {
        if (tier === 3) {
          gs.dealDamageAll(40);
          gs.addShield(20);
          gs.addLog?.('⚔️ 잔향 폭발! 전체 40 + 방어막 20', 'echo');
        } else if (tier === 2) {
          gs.dealDamage(30);
          gs.addShield(12);
          gs.addLog?.('⚔️ 잔향 강타! 30 + 방어막 12', 'echo');
        } else {
          gs.dealDamage(20);
          gs.addShield(8);
          gs.addLog?.('⚔️ Echo 스킬! 20 + 방어막 8', 'echo');
        }
      } else if (cls === 'mage') {
        if (tier === 3) {
          gs.dealDamageAll(30);
          gs.addEcho(30);
          gs.drawCards(3);
          gs.addLog?.('🔮 비전 폭풍! 전체 30 + Echo 30 + 드로우 3', 'echo');
        } else if (tier === 2) {
          gs.dealDamageAll(18);
          gs.addEcho(15);
          gs.drawCards(2);
          gs.addLog?.('🔮 잔향파! 전체 18 + 드로우 2', 'echo');
        } else {
          gs.applyEnemyStatus('weakened', 2);
          gs.drawCards(1);
          gs.addLog?.('🔮 예지! 약화 2턴 + 드로우 1', 'echo');
        }
      } else {
        if (tier === 3) {
          gs.dealDamage(50);
          gs.addBuff('vanish', 2, {});
          gs.addLog?.('🗡️ 암살! 50 피해 + 은신 2턴', 'echo');
        } else if (tier === 2) {
          gs.dealDamage(32);
          gs.addBuff('vanish', 1, {});
          gs.addLog?.('🗡️ 기습! 32 + 은신', 'echo');
        } else {
          gs.dealDamage(20);
          gs.addLog?.('🗡️ 숨격! 20 피해', 'echo');
        }
      }

      deps.showEchoBurstOverlay?.();
      deps.audioEngine?.playResonanceBurst?.();
      deps.renderCombatEnemies?.();
      deps.renderCombatCards?.();

      const doc = deps.doc || document;
      const echoBtn = doc.getElementById('echoSkillBtn');
      if (echoBtn) {
        echoBtn.style.transition = 'opacity 0.2s, background 0.2s';
        echoBtn.style.background = 'linear-gradient(135deg,rgba(0,255,204,0.2),rgba(123,47,255,0.2))';
        setTimeout(() => { echoBtn.style.background = ''; }, 800);
      }
    },
  };

  globalObj.EchoSkillUI = EchoSkillUI;
})(window);
