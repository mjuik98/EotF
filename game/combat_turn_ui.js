'use strict';

(function initCombatTurnUI(globalObj) {
  function _getDoc(deps) {
    return deps?.doc || document;
  }

  function _getWin(deps) {
    return deps?.win || window;
  }

  const CombatTurnUI = {
    endPlayerTurn(deps = {}) {
      const gs = deps.gs || globalObj.GS;
      const data = deps.data || globalObj.DATA;
      if (!gs?.combat?.active || !gs.combat.playerTurn) return;

      if (gs.player.hand.length > 0) {
        const playable = gs.player.hand.filter(id => {
          const card = data?.cards?.[id];
          if (!card) return false;
          const cost = gs.player.zeroCost ? 0 : Math.max(0, card.cost - (gs.player.costDiscount || 0));
          return gs.player.energy >= cost;
        });
        if (playable.length > 0) {
          gs.addLog?.(`💡 사용 가능한 카드 ${playable.length}장을 남기고 턴 종료`, 'system');
        }
      }

      Object.keys(gs.player.buffs).forEach(buffId => {
        const buff = gs.player.buffs[buffId];
        if (buff.echoRegen) gs.addEcho(buff.echoRegen);
        buff.stacks--;
        if (buff.stacks <= 0) delete gs.player.buffs[buffId];
      });

      if (gs.player.class === 'hunter' && gs.player.silenceGauge > 0) {
        gs.player.silenceGauge = Math.max(0, gs.player.silenceGauge - 1);
      }

      gs.player.graveyard.push(...gs.player.hand);
      gs.player.hand = [];
      gs.player.echoChain = 0;
      gs.player.zeroCost = false;
      gs.player.costDiscount = 0;
      gs.player._cascadeCards = null;
      deps.updateChainUI?.(0);

      gs.combat.playerTurn = false;
      const doc = _getDoc(deps);
      const turnIndicator = doc.getElementById('turnIndicator');
      if (turnIndicator) {
        turnIndicator.className = 'turn-indicator turn-enemy';
        turnIndicator.textContent = '적의 턴';
      }
      deps.showTurnBanner?.('enemy');
      doc.querySelectorAll('.action-btn').forEach(btn => { btn.disabled = true; });

      setTimeout(() => {
        deps.enemyTurn?.();
      }, 700);
    },

    enemyTurn(deps = {}) {
      const gs = deps.gs || globalObj.GS;
      if (!gs?.combat?.active) return;

      gs.combat.turn++;
      this.processEnemyStatusTicks(deps);

      gs.combat.enemies.forEach((enemy, index) => {
        if (enemy.hp <= 0) return;

        if (enemy.statusEffects?.stunned > 0) {
          enemy.statusEffects.stunned--;
          gs.addLog?.(`🌀 ${enemy.name}: 기절 상태!`, 'echo');
          return;
        }

        let action;
        try {
          action = enemy.ai(gs.combat.turn);
        } catch (e) {
          action = { type: 'strike', intent: `공격 ${enemy.atk}`, dmg: enemy.atk };
        }

        if (action.type === 'phase_shift' || action.effect === 'phase_shift') {
          this.handleBossPhaseShift(enemy, index, deps);
        } else if (action.dmg > 0) {
          let dmg = action.dmg;
          if (enemy.statusEffects?.weakened > 0) {
            dmg = Math.floor(dmg * 0.5);
            enemy.statusEffects.weakened--;
            gs.addLog?.(`💫 ${enemy.name}: 약화 (피해 감소)`, 'echo');
          }
          gs.takeDamage(dmg);
          gs.addLog?.(`💢 ${enemy.name}: ${action.intent}`, 'damage');

          const doc = _getDoc(deps);
          const card = doc.getElementById(`enemy_${index}`);
          if (card) {
            card.classList.add('hit');
            setTimeout(() => card.classList.remove('hit'), 400);
          }
        }

        this.handleEnemyEffect(action.effect, enemy, index, deps);
        deps.renderCombatEnemies?.();
      });

      setTimeout(() => {
        if (!gs.combat.active) return;

        gs.combat.playerTurn = true;
        gs.player.energy = gs.player.maxEnergy;
        gs.player.shield = 0;

        const doc = _getDoc(deps);
        const turnIndicator = doc.getElementById('turnIndicator');
        if (turnIndicator) {
          turnIndicator.className = 'turn-indicator turn-player';
          turnIndicator.textContent = '플레이어 턴';
        }
        deps.showTurnBanner?.('player');
        doc.querySelectorAll('.action-btn').forEach(btn => {
          btn.disabled = false;
          btn.style.pointerEvents = '';
        });

        gs.drawCards(5);
        deps.renderCombatCards?.();
        gs.addLog?.('─── 새 턴 ───', 'system');
        deps.runRules?.onTurnStart?.(gs);
        gs.triggerItems?.('turn_start');
        deps.updateStatusDisplay?.();
        deps.updateClassSpecialUI?.();
        deps.updateUI?.();
      }, 800);
    },

    processEnemyStatusTicks(deps = {}) {
      const gs = deps.gs || globalObj.GS;
      if (!gs?.combat?.enemies) return;

      const win = _getWin(deps);
      gs.combat.enemies.forEach((enemy, index) => {
        if (!enemy.statusEffects || enemy.hp <= 0) return;

        const se = enemy.statusEffects;
        const ex = win.innerWidth / 2 + (index - 0.5) * 200;

        if (se.poisoned > 0) {
          const dmg = 3 + Math.floor((3 - se.poisoned) * 0.5);
          enemy.hp = Math.max(0, enemy.hp - dmg);
          gs.addLog?.(`🐍 ${enemy.name}: 독 ${dmg}`, 'damage');
          deps.showDmgPopup?.(dmg, ex, 200, '#44ff88');
          deps.particleSystem?.emit?.(ex, 200, { count: 5, color: '#00ff44', size: 2, speed: 2, life: 0.5 });
          se.poisoned--;
          if (se.poisoned <= 0) delete se.poisoned;
          if (enemy.hp <= 0) {
            gs.onEnemyDeath?.(enemy, index);
            return;
          }
        }

        if (se.burning > 0) {
          const dmg = 5;
          enemy.hp = Math.max(0, enemy.hp - dmg);
          gs.addLog?.(`🔥 ${enemy.name}: 화염 ${dmg}`, 'damage');
          deps.showDmgPopup?.(dmg, ex, 220, '#ff8844');
          deps.particleSystem?.emit?.(ex, 180, { count: 6, color: '#ff6600', size: 3, speed: 3, life: 0.4 });
          se.burning--;
          if (se.burning <= 0) delete se.burning;
          if (enemy.hp <= 0) {
            gs.onEnemyDeath?.(enemy, index);
            return;
          }
        }

        if (se.marked !== undefined) {
          se.marked--;
          if (se.marked <= 0) {
            const dmg = 30;
            enemy.hp = Math.max(0, enemy.hp - dmg);
            gs.addLog?.(`💢 ${enemy.name}: 처형 표식 폭발! ${dmg}!`, 'echo');
            deps.showDmgPopup?.(dmg, ex, 200, '#ff2255');
            deps.screenShake?.shake?.(10, 0.5);
            deps.particleSystem?.burstEffect?.(ex, 200);
            deps.audioEngine?.playChain?.(4);
            delete se.marked;
            if (enemy.hp <= 0) {
              gs.onEnemyDeath?.(enemy, index);
              return;
            }
          }
        }

        if (gs.player.buffs.mirror && se.incoming > 0) {
          const reflected = se.incoming;
          enemy.hp = Math.max(0, enemy.hp - reflected);
          gs.addLog?.(`🪞 반사! ${reflected} 피해`, 'echo');
          delete gs.player.buffs.mirror;
          delete se.incoming;
          if (enemy.hp <= 0) {
            gs.onEnemyDeath?.(enemy, index);
          }
        }
      });

      deps.renderCombatEnemies?.();
    },

    handleBossPhaseShift(enemy, idx, deps = {}) {
      const gs = deps.gs || globalObj.GS;
      if (!gs || !enemy) return;

      const doc = _getDoc(deps);
      const win = _getWin(deps);
      const sprite = doc.getElementById(`enemy_sprite_${idx}`);
      if (sprite) {
        sprite.style.animation = 'none';
        setTimeout(() => { sprite.style.animation = 'enemyHit 0.8s ease 3'; }, 10);
      }

      deps.screenShake?.shake?.(15, 1.0);
      deps.audioEngine?.playBossPhase?.();
      deps.particleSystem?.burstEffect?.(
        win.innerWidth / 2 + (idx - (gs.combat.enemies.length / 2 - 0.5)) * 200,
        220,
      );

      gs.addBuff?.('immune', 1, {});
      gs.addLog?.('🛡️ 페이즈 전환: 1턴 무적!', 'echo');

      if (enemy.phase === 2) {
        gs.addLog?.(`⚠️ ${enemy.name} 2페이즈 각성!`, 'echo');
        gs.player.buffs = { immune: { stacks: 1 } };
        gs.addLog?.('💀 다른 버프 해제!', 'damage');
      } else if (enemy.phase === 3) {
        gs.addLog?.(`💀 ${enemy.name} 최종 페이즈!`, 'damage');
        enemy.atk = Math.floor(enemy.atk * 1.3);
      }

      setTimeout(() => {
        deps.renderCombatEnemies?.();
        deps.updateStatusDisplay?.();
      }, 50);
      deps.showEchoBurstOverlay?.();
    },

    handleEnemyEffect(effect, enemy, idx, deps = {}) {
      if (!effect) return;

      const gs = deps.gs || globalObj.GS;
      const data = deps.data || globalObj.DATA;
      const baseRegion = deps.getBaseRegionIndex?.(gs.currentRegion);
      switch (effect) {
        case 'self_atk_up':
          enemy.atk += 3;
          gs.addLog(`💪 ${enemy.name}: 공격 강화 (+3)`, 'system');
          break;
        case 'self_shield':
          enemy.shield = (enemy.shield || 0) + 8;
          gs.addLog(`🛡️ ${enemy.name}: 방어막 8`, 'system');
          break;
        case 'self_shield_15':
          enemy.shield = (enemy.shield || 0) + 15;
          gs.addLog(`🛡️ ${enemy.name}: 신성 방어막 15`, 'system');
          break;
        case 'self_shield_20':
          enemy.shield = (enemy.shield || 0) + 20;
          gs.addLog(`🛡️ ${enemy.name}: 방어막 20`, 'system');
          break;
        case 'add_noise_5':
          if (baseRegion === 1) gs.addSilence(5);
          break;
        case 'mass_debuff': {
          const debuffs = ['weakened', 'slowed', 'burning'];
          debuffs.forEach(d => { gs.player.buffs[d] = { stacks: 1 }; });
          gs.addLog('⚠️ 전체 디버프 부여!', 'damage');
          deps.updateStatusDisplay?.();
          break;
        }
        case 'curse':
          gs.player.buffs.cursed = { stacks: 2 };
          gs.addLog(`💀 ${enemy.name}: 저주 부여!`, 'damage');
          deps.updateStatusDisplay?.();
          break;
        case 'drain_echo':
          gs.drainEcho(20);
          gs.addLog(`🌑 ${enemy.name}: Echo 흡수!`, 'damage');
          break;
        case 'nullify_echo':
          gs.player.echo = 0;
          gs.player.echoChain = 0;
          deps.updateChainUI?.(0);
          gs.addLog('🌑 Echo 완전 무효화!', 'damage');
          break;
        case 'add_noise':
          if (baseRegion === 1) gs.addSilence(3);
          break;
        case 'exhaust_card':
          if (gs.player.hand.length > 0) {
            const ci = Math.floor(Math.random() * gs.player.hand.length);
            const c = gs.player.hand.splice(ci, 1)[0];
            gs.player.exhausted.push(c);
            gs.addLog(`💀 ${data.cards[c]?.name} 소각!`, 'damage');
            deps.renderCombatCards?.();
          }
          break;
        case 'drain_energy':
          gs.player.energy = Math.max(0, gs.player.energy - 1);
          gs.addLog('⚡ 에너지 -1!', 'damage');
          deps.updateUI?.();
          break;
        case 'drain_energy_2':
          gs.player.energy = Math.max(0, gs.player.energy - 2);
          gs.addLog('⚡ 에너지 -2!', 'damage');
          deps.updateUI?.();
          break;
        case 'drain_energy_all':
          gs.player.energy = 0;
          gs.addLog('⚡ 에너지 완전 소진!', 'damage');
          deps.updateUI?.();
          break;
        case 'confusion':
          deps.shuffleArray?.(gs.player.hand);
          gs.addLog('🌀 카드 뒤섞임!', 'damage');
          deps.renderCombatCards?.();
          break;
        case 'weaken':
          gs.applyEnemyStatus('weakened', 1);
          break;
        case 'dodge':
          gs.addLog(`${enemy.name}: 회피 준비`, 'system');
          break;
        case 'lifesteal':
          gs.player.hp = Math.min(gs.player.maxHp, gs.player.hp + 4);
          deps.updateUI?.();
          break;
        case 'poison_3':
          gs.player.buffs.poisoned = { stacks: 3 };
          gs.addLog(`☠️ ${enemy.name}: 맹독 부여!`, 'damage');
          deps.updateStatusDisplay?.();
          break;
        case 'self_heal_15':
          enemy.hp = Math.min(enemy.maxHp, (enemy.hp || 0) + 15);
          gs.addLog(`💚 ${enemy.name}: 체력 회복 (+15)`, 'heal');
          break;
        case 'self_atk_up_4':
          enemy.atk += 4;
          gs.addLog(`💪 ${enemy.name}: 공격 대폭 강화 (+4)`, 'system');
          break;
        case 'phase_shift':
          gs.addLog(`⚠️ ${enemy.name}: 위상 전환!`, 'system');
          break;
        default:
          break;
      }
    },
  };

  globalObj.CombatTurnUI = CombatTurnUI;
})(window);
