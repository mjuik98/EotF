'use strict';

(function initCombatTurnUI(globalObj) {
  function _getDoc(deps) {
    return deps?.doc || document;
  }

  function _getWin(deps) {
    return deps?.win || window;
  }

  const TURN_START_DEBUFFS = new Set(['poisoned', 'burning', 'slowed', 'confusion']);
  const ENEMY_TURN_BUFFS = new Set(['mirror', 'immune']);

  const ENEMY_EFFECTS = {
    self_atk_up: (gs, enemy) => {
      enemy.atk += 3;
      gs.addLog(`💪 ${enemy.name}: 공격 강화 (+3)`, 'system');
    },
    self_shield: (gs, enemy) => {
      enemy.shield = (enemy.shield || 0) + 8;
      gs.addLog(`🛡️ ${enemy.name}: 방어막 8`, 'system');
    },
    self_shield_15: (gs, enemy) => {
      enemy.shield = (enemy.shield || 0) + 15;
      gs.addLog(`🛡️ ${enemy.name}: 신성 방어막 15`, 'system');
    },
    self_shield_20: (gs, enemy) => {
      enemy.shield = (enemy.shield || 0) + 20;
      gs.addLog(`🛡️ ${enemy.name}: 방어막 20`, 'system');
    },
    add_noise_5: (gs, enemy, deps, baseRegion) => {
      if (baseRegion === 1) gs.addSilence(5);
    },
    mass_debuff: (gs, enemy, deps) => {
      const debuffs = ['weakened', 'slowed', 'burning'];
      debuffs.forEach(d => { gs.player.buffs[d] = { stacks: 1 }; });
      gs.addLog('⚠️ 전체 디버프 부여!', 'damage');
      deps.updateStatusDisplay?.();
    },
    curse: (gs, enemy, deps) => {
      gs.player.buffs.cursed = { stacks: 2 };
      gs.addLog(`💀 ${enemy.name}: 저주 부여!`, 'damage');
      deps.updateStatusDisplay?.();
    },
    drain_echo: (gs, enemy) => {
      gs.drainEcho(20);
      gs.addLog(`🌑 ${enemy.name}: Echo 흡수!`, 'damage');
    },
    nullify_echo: (gs, enemy, deps) => {
      gs.player.echo = 0;
      gs.player.echoChain = 0;
      deps.updateChainUI?.(0);
      gs.addLog('🌑 Echo 완전 무효화!', 'damage');
    },
    add_noise: (gs, enemy, deps, baseRegion) => {
      if (baseRegion === 1) gs.addSilence(3);
    },
    exhaust_card: (gs, enemy, deps, baseRegion, data) => {
      if (gs.player.hand.length > 0) {
        const ci = Math.floor(Math.random() * gs.player.hand.length);
        const c = gs.player.hand.splice(ci, 1)[0];
        gs.player.exhausted.push(c);
        gs.addLog(`💀 ${data.cards[c]?.name} 소각!`, 'damage');
        deps.renderCombatCards?.();
      }
    },
    drain_energy: (gs, enemy, deps) => {
      gs.player.energy = Math.max(0, gs.player.energy - 1);
      gs.addLog('⚡ 에너지 -1!', 'damage');
      deps.updateUI?.();
    },
    drain_energy_2: (gs, enemy, deps) => {
      gs.player.energy = Math.max(0, gs.player.energy - 2);
      gs.addLog('⚡ 에너지 -2!', 'damage');
      deps.updateUI?.();
    },
    drain_energy_all: (gs, enemy, deps) => {
      gs.player.energy = 0;
      gs.addLog('⚡ 에너지 완전 소진!', 'damage');
      deps.updateUI?.();
    },
    confusion: (gs, enemy, deps) => {
      deps.shuffleArray?.(gs.player.hand);
      gs.addLog('🌀 카드 뒤섞임!', 'damage');
      deps.renderCombatCards?.();
    },
    weaken: (gs, enemy, deps) => {
      gs.player.buffs.weakened = { stacks: (gs.player.buffs.weakened?.stacks || 0) + 1 };
      gs.addLog(`💫 ${enemy.name}: 약화 부여`, 'damage');
      deps.updateStatusDisplay?.();
    },
    dodge: (gs, enemy) => {
      gs.addLog(`${enemy.name}: 회피 준비`, 'system');
    },
    lifesteal: (gs, enemy, deps) => {
      enemy.hp = Math.min(enemy.maxHp || enemy.hp, (enemy.hp || 0) + 4);
      gs.addLog(`💚 ${enemy.name}: 생명력 흡수 (+4)`, 'heal');
      deps.updateUI?.();
    },
    poison_3: (gs, enemy, deps) => {
      gs.player.buffs.poisoned = { stacks: 3 };
      gs.addLog(`☠️ ${enemy.name}: 맹독 부여!`, 'damage');
      deps.updateStatusDisplay?.();
    },
    self_heal_15: (gs, enemy) => {
      enemy.hp = Math.min(enemy.maxHp, (enemy.hp || 0) + 15);
      gs.addLog(`💚 ${enemy.name}: 체력 회복 (+15)`, 'heal');
    },
    self_atk_up_4: (gs, enemy) => {
      enemy.atk += 4;
      gs.addLog(`💪 ${enemy.name}: 공격 대폭 강화 (+4)`, 'system');
    },
    phase_shift: (gs, enemy) => {
      gs.addLog(`⚠️ ${enemy.name}: 위상 전환!`, 'system');
    }
  };

  const CombatTurnUI = {
    endPlayerTurn(deps = {}) {
      const gs = deps.gs || globalObj.GS;
      const data = deps.data || globalObj.DATA;
      if (!gs?.combat?.active || !gs.combat.playerTurn) return;

      if (gs.player.hand.length > 0) {
        const playable = gs.player.hand.filter(id => {
          const card = data?.cards?.[id];
          if (!card) return false;
          const cascade = gs.player._cascadeCards;
          const isCascadeFree = cascade instanceof Map
            ? (cascade.get(id) || 0) > 0
            : !!(cascade && cascade.has && cascade.has(id));
          const hasFreeCharge = Number(gs.player._freeCardUses || 0) > 0;
          const cost = (gs.player.zeroCost || isCascadeFree || hasFreeCharge) ? 0 : Math.max(0, card.cost - (gs.player.costDiscount || 0));
          return gs.player.energy >= cost;
        });
        if (playable.length > 0) {
          gs.addLog?.(`💡 사용 가능한 카드 ${playable.length}장을 남기고 턴 종료`, 'system');
        }
      }

      Object.keys(gs.player.buffs).forEach(buffId => {
        const buff = gs.player.buffs[buffId];
        if (!buff || typeof buff !== 'object') return;
        if (TURN_START_DEBUFFS.has(buffId)) return;
        if (ENEMY_TURN_BUFFS.has(buffId)) return;
        if (buffId === 'momentum') return;
        if (buff.nextEnergy) return; // 시간 왜곡 등 다음 턴 발동 버프는 스킵
        if (buff.echoRegen) gs.addEcho(buff.echoRegen);
        if (!Number.isFinite(buff.stacks)) return;
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
      gs.player._freeCardUses = 0;
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

      setTimeout(async () => {
        try {
          await deps.enemyTurn?.();
        } catch (e) {
          console.error('[CombatTurn] 적 턴 오류:', e);
        }
      }, 700);
    },

    async enemyTurn(deps = {}) {
      const gs = deps.gs || globalObj.GS;
      if (!gs?.combat?.active) return;

      // status effects ticks only, turn++ is now in startPlayerTurn
      this.processEnemyStatusTicks(deps);

      for (let index = 0; index < gs.combat.enemies.length; index++) {
        const enemy = gs.combat.enemies[index];
        if (enemy.hp <= 0) continue;

        await new Promise(r => setTimeout(r, 800));
        if (!gs.combat.active) return;

        if (enemy.statusEffects?.stunned > 0) {
          enemy.statusEffects.stunned--;
          if (enemy.statusEffects.stunned <= 0) delete enemy.statusEffects.stunned;
          gs.addLog?.(`🌀 ${enemy.name}: 기절 상태!`, 'echo');
          deps.renderCombatEnemies?.();
          continue;
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
          if (gs.player.buffs?.mirror) {
            enemy.hp = Math.max(0, enemy.hp - dmg);
            gs.addLog?.(`🪞 반사! ${enemy.name}에게 ${dmg} 피해`, 'echo');
            delete gs.player.buffs.mirror;
            if (enemy.hp <= 0) {
              gs.onEnemyDeath?.(enemy, index);
              deps.renderCombatEnemies?.();
              continue;
            }
          } else {
            gs.takeDamage(dmg);
          }
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
      }

      // 모든 적 행동 종료 후 플레이어 턴으로 전환
      await new Promise(r => setTimeout(r, 600));
      if (!gs.combat.active) return;

      ENEMY_TURN_BUFFS.forEach(buffId => {
        const buff = gs.player.buffs?.[buffId];
        if (!buff || !Number.isFinite(buff.stacks)) return;
        buff.stacks--;
        if (buff.stacks <= 0) delete gs.player.buffs[buffId];
      });

      gs.combat.turn++;
      gs.combat.playerTurn = true;
      gs.player.energy = gs.player.maxEnergy;
      gs.player.shield = 0;
      gs.drawCards(5);

      if (typeof this.processPlayerStatusTicks === 'function' && !this.processPlayerStatusTicks(deps)) return;

      Object.keys(gs.player.buffs || {}).forEach(buffId => {
        const buff = gs.player.buffs[buffId];
        if (buff?.nextEnergy) {
          gs.player.energy += buff.nextEnergy;
          const label = buffId === 'time_warp' ? '시간 왜곡' : (buff.name || '효과');
          gs.addLog?.(`🌀 ${label}: 에너지 +${buff.nextEnergy}`, 'echo');

          // 사용 후 스택 감소 및 삭제
          if (Number.isFinite(buff.stacks)) {
            buff.stacks--;
            if (buff.stacks <= 0) delete gs.player.buffs[buffId];
          } else {
            delete gs.player.buffs[buffId];
          }
        }
        if (buff?.energyPerTurn) {
          gs.player.energy += buff.energyPerTurn;
          const label = buffId === 'time_warp' ? '시간 왜곡' : (buff.name || '효과');
          gs.addLog?.(`🌀 ${label}: 에너지 +${buff.energyPerTurn}`, 'echo');
        }
      });

      gs.addLog?.('─── 새 턴 ───', 'system');
      globalObj.RunRules?.onTurnStart?.(gs);
      gs.triggerItems?.('turn_start');

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

      deps.renderCombatCards?.();
      deps.renderCombatEnemies?.();
      if (typeof globalObj.updateUI === 'function') globalObj.updateUI();
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

        if (se.immune > 0) {
          se.immune--;
          if (se.immune <= 0) delete se.immune;
        }
      });

      deps.renderCombatEnemies?.();
    },

    processPlayerStatusTicks(deps = {}) {
      const gs = deps.gs || globalObj.GS;
      if (!gs?.combat?.active || !gs?.player?.buffs) return true;

      const buffs = gs.player.buffs;
      const decStack = (id) => {
        const buff = buffs[id];
        if (!buff || !Number.isFinite(buff.stacks)) return;
        buff.stacks--;
        if (buff.stacks <= 0) delete buffs[id];
      };

      if ((buffs.burning?.stacks || 0) > 0) {
        gs.takeDamage(5);
        gs.addLog?.('🔥 화염: 턴 시작 피해 5', 'damage');
        decStack('burning');
        if (!gs.combat.active || gs.player.hp <= 0) return false;
      }

      if ((buffs.poisoned?.stacks || 0) > 0) {
        const poisonDmg = 1 + Math.max(1, buffs.poisoned.stacks);
        gs.takeDamage(poisonDmg);
        gs.addLog?.(`☠️ 독: 턴 시작 피해 ${poisonDmg}`, 'damage');
        decStack('poisoned');
        if (!gs.combat.active || gs.player.hp <= 0) return false;
      }

      if ((buffs.slowed?.stacks || 0) > 0) {
        gs.player.energy = Math.max(0, gs.player.energy - 1);
        gs.addLog?.('🐢 감속: 에너지 -1', 'damage');
        decStack('slowed');
      }

      if ((buffs.confusion?.stacks || 0) > 0) {
        if (gs.player.hand.length > 1) {
          deps.shuffleArray?.(gs.player.hand);
          gs.addLog?.('🌀 혼란: 손패가 뒤섞였다', 'damage');
          deps.renderCombatCards?.();
        }
        decStack('confusion');
      }

      deps.updateStatusDisplay?.();
      deps.updateUI?.();
      return true;
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

      if (!enemy.statusEffects) enemy.statusEffects = {};
      enemy.statusEffects.immune = Math.max(enemy.statusEffects.immune || 0, 1);
      gs.addLog?.(`🛡️ ${enemy.name}: 1턴 무적`, 'echo');

      if (enemy.phase === 2) {
        gs.addLog?.(`⚠️ ${enemy.name} 2페이즈 각성!`, 'echo');
        gs.player.buffs = {};
        gs.addLog?.('💀 플레이어 버프 해제!', 'damage');
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
      const handler = ENEMY_EFFECTS[effect];
      if (handler) handler(gs, enemy, deps, baseRegion, data);
      else console.warn('[CombatTurn] 알 수 없는 효과:', effect);
    },
  };

  globalObj.CombatTurnUI = CombatTurnUI;
})(window);
