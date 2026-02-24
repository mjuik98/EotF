'use strict';

(function initGameStateCoreMethods(globalObj) {
  const GameStateCoreMethods = {
    dealDamage(amount, targetIdx = null, noChain = false) {
      // targetIdx가 null이면 선택된 타겟 → 첫 번째 살아있는 적 순으로 자동 결정
      if (targetIdx === null) {
        const sel = this._selectedTarget;
        if (sel !== null && sel !== undefined && this.combat.enemies[sel]?.hp > 0) {
          targetIdx = sel;
        } else {
          targetIdx = this.combat.enemies.findIndex(e => e.hp > 0);
          if (targetIdx < 0) return 0;
        }
      }
      const enemy = this.combat.enemies[targetIdx];
      if (!enemy || enemy.hp <= 0) return 0;

      let dmg = amount;
      // 버프 적용
      const mom = this.getBuff('momentum');
      if (mom) dmg += mom.dmgBonus || 0;
      const sha = this.getBuff('shadow_atk');
      if (sha) { dmg += sha.dmgBonus || 0; delete this.player.buffs['shadow_atk']; }
      // 크리티컬 (은신)
      if (this.getBuff('vanish')) {
        dmg = Math.floor(dmg * 2);
        delete this.player.buffs['vanish'];
        this.addLog('💥 크리티컬!', 'echo');
      }
      // 적 무적 체크
      if (enemy.statusEffects?.immune > 0) {
        this.addLog(`🏛️ ${enemy.name}은(는) 무적 상태!`, 'echo');
        return 0;
      }

      // 플레이어 디버프: 약화 시 공격 피해 감소
      if ((this.getBuff('weakened')?.stacks || 0) > 0) {
        dmg = Math.max(0, Math.floor(dmg * 0.5));
      }

      // 유물/세트 보너스 피해 보정
      const itemScaled = this.triggerItems('deal_damage', dmg);
      if (typeof itemScaled === 'number' && Number.isFinite(itemScaled)) {
        dmg = Math.max(0, Math.floor(itemScaled));
      }
      if (this.player.echoChain > 0) {
        const chainScaled = this.triggerItems('chain_dmg', dmg);
        if (typeof chainScaled === 'number' && Number.isFinite(chainScaled)) {
          dmg = Math.max(0, Math.floor(chainScaled));
        }
      }

      // 적 방어막
      if (enemy.shield > 0) {
        const blocked = Math.min(enemy.shield, dmg);
        enemy.shield -= blocked;
        dmg -= blocked;
        if (blocked > 0) this.addLog(`🛡️ ${enemy.name} 방어막 ${blocked} 흡수`, 'system');
      }

      HitStop.trigger(8);
      const prevHp = enemy.hp;
      enemy.hp = Math.max(0, enemy.hp - dmg);
      this.stats.damageDealt += dmg;

      const ex = window.innerWidth / 2 + (targetIdx - (this.combat.enemies.length / 2 - 0.5)) * 180;
      ParticleSystem.hitEffect(ex, 250, dmg > 20);

      // ── 공격 시 효과음 & 시각 효과 ──
      const isCrit = dmg > prevHp * 0.3 || (this.getBuff && this._lastCrit);
      if (isCrit || dmg > 25) {
        AudioEngine.playCritical();
        // 크리티컬 섬광
        const cf = document.createElement('div');
        cf.className = 'crit-flash-overlay';
        document.getElementById('hudOverlay')?.appendChild(cf);
        setTimeout(() => cf.remove(), 450);
      } else if (dmg > 12) {
        AudioEngine.playHeavyHit();
        // 강타 오버레이
        const hf = document.createElement('div');
        hf.className = 'heavy-hit-overlay';
        document.getElementById('hudOverlay')?.appendChild(hf);
        setTimeout(() => hf.remove(), 500);
      } else {
        AudioEngine.playHit();
      }

      // 적 카드 shake + 붉은 플래시
      const enemyCard = document.getElementById(`enemy_${targetIdx}`);
      if (enemyCard) {
        enemyCard.classList.remove('enemy-hit-anim');
        void enemyCard.offsetWidth; // reflow
        enemyCard.classList.add('enemy-hit-anim');
        setTimeout(() => enemyCard.classList.remove('enemy-hit-anim'), 280);
        const flashEl = document.createElement('div');
        flashEl.className = 'enemy-dmg-flash';
        enemyCard.style.position = 'relative';
        enemyCard.appendChild(flashEl);
        setTimeout(() => flashEl.remove(), 350);
      }

      ScreenShake.shake(dmg > 20 ? 6 : 3, 0.2);

      if (!noChain) {
        this.player.echoChain++;
        this.addEcho(10);
        this.updateChainDisplay();
      }

      this.addLog(`⚔️ ${enemy.name}에게 ${dmg} 피해!`, 'damage');
      showDmgPopup(dmg, ex, 250);

      // 즉시 적 HP UI 갱신
      updateEnemyHpUI(targetIdx, enemy);

      if (enemy.hp <= 0) this.onEnemyDeath(enemy, targetIdx);
      return dmg;
    },

    dealDamageAll(amount) {
      const alive = this.combat.enemies.map((_, i) => i).filter(i => this.combat.enemies[i].hp > 0);
      alive.forEach((i, idx) => {
        this.dealDamage(amount, i, idx < alive.length - 1);
      });
    },

    addShield(amount) {
      this.player.shield += amount;
      this.addLog(`🛡️ 방어막 +${amount}`, 'system');
      updateUI();
    },

    addEcho(amount) {
      this.player.echo = Math.min(this.player.maxEcho, this.player.echo + amount);
      updateUI();
    },

    drainEcho(amount) {
      this.player.echo = Math.max(0, this.player.echo - amount);
      updateUI();
    },

    heal(amount) {
      if (getBaseRegionIndex(this.currentRegion) === Math.max(0, getRegionCount() - 1)) {
        this.addLog('❌ 에코의 핵심: 회복 불가!', 'damage');
        return;
      }
      let adjusted = RunRules.getHealAmount(this, amount);
      if ((this.getBuff('cursed')?.stacks || 0) > 0) {
        adjusted = Math.max(0, Math.floor(adjusted * 0.7));
      }
      const actual = Math.min(adjusted, this.player.maxHp - this.player.hp);
      this.player.hp = Math.min(this.player.maxHp, this.player.hp + actual);
      if (actual > 0) {
        ParticleSystem.healEffect(window.innerWidth / 2, window.innerHeight / 2);
        AudioEngine.playHeal();
        this.addLog(`💚 체력 +${actual}`, 'heal');
      }
      updateUI();
    },

    takeDamage(amount) {
      // 면역 체크
      if (this.getBuff('immune')) { this.addLog('🏛️ 면역으로 피해 무효!', 'echo'); return; }
      let dmg = amount;
      if (this.player.shield > 0) {
        const blocked = Math.min(this.player.shield, dmg);
        this.player.shield -= blocked; dmg -= blocked;
        if (blocked > 0) this.addLog(`🛡️ 방어막 ${blocked} 흡수`, 'system');
      }
      const triggerResult = this.triggerItems('damage_taken', dmg);
      if (triggerResult === true) {
        dmg = 0;
        this.addLog('🛡️ 피해 무효!', 'echo');
      } else if (typeof triggerResult === 'number' && Number.isFinite(triggerResult)) {
        dmg = Math.max(0, Math.floor(triggerResult));
      }
      if (dmg > 0) {
        this.player.hp -= dmg; this.stats.damageTaken += dmg;
        ScreenShake.shake(8, 0.4); showEdgeDamage();
        this.addLog(`💔 ${dmg} 피해 받음`, 'damage');
        showDmgPopup(dmg, window.innerWidth * 0.3, window.innerHeight / 2, '#ff3366');

        // ── 피격 효과음 & 시각 효과 ──
        AudioEngine.playPlayerHit();
        // 피격 붉은 비네트
        const vign = document.createElement('div');
        vign.className = 'player-hit-vignette';
        document.getElementById('hudOverlay')?.appendChild(vign);
        setTimeout(() => vign.remove(), 600);
        // HUD shake
        const hpBar = document.getElementById('hoverHud');
        if (hpBar) {
          hpBar.style.animation = 'none';
          void hpBar.offsetWidth;
          hpBar.style.animation = 'shake 0.3s ease';
          setTimeout(() => hpBar.style.animation = '', 300);
        }

        // 저체력 경고
        if (this.player.hp < this.player.maxHp * 0.25) this.showLowHpWarning();
      }
      updateUI();
      if (this.player.hp <= 0) this.onPlayerDeath();
    },

    addBuff(id, stacks, data = {}) {
      if (this.player.buffs[id]) {
        this.player.buffs[id].stacks += stacks;
        for (const key in data) {
          if (typeof data[key] === 'number') {
            this.player.buffs[id][key] = (this.player.buffs[id][key] || 0) + data[key];
          } else {
            this.player.buffs[id][key] = data[key];
          }
        }
      } else {
        this.player.buffs[id] = { stacks, ...data };
      }
      if (typeof updateStatusDisplay === 'function') updateStatusDisplay();
    },

    getBuff(id) { return this.player.buffs[id] || null; },

    applyEnemyStatus(status, duration, targetIdx = null) {
      if (targetIdx === null) {
        const sel = this._selectedTarget;
        if (sel !== null && sel !== undefined && this.combat.enemies[sel]?.hp > 0) {
          targetIdx = sel;
        } else {
          targetIdx = this.combat.enemies.findIndex(e => e.hp > 0);
          if (targetIdx < 0) return;
        }
      }
      const enemy = this.combat.enemies[targetIdx];
      if (!enemy) return;
      if (!enemy.statusEffects) enemy.statusEffects = {};
      enemy.statusEffects[status] = duration;
      this.addLog(`💫 ${enemy.name}: ${status} ${duration}턴`, 'echo');
    },

    getEnemyIntent(targetIdx = 0) {
      const enemy = this.combat.enemies[targetIdx];
      if (!enemy) return 0;
      return enemy.ai(this.combat.turn)?.dmg || 0;
    },

    addGold(amount) {
      this.player.gold += amount;
      updateUI();
      // 골드 획득 팝업
      if (amount > 0) {
        const el = document.createElement('div');
        el.style.cssText = `position:fixed;right:260px;top:${60 + Math.random() * 40}px;font-family:'Share Tech Mono',monospace;font-size:14px;font-weight:700;color:var(--gold);text-shadow:0 0 12px rgba(240,180,41,0.7);pointer-events:none;z-index:500;animation:goldPop 1.4s ease forwards;`;
        el.textContent = `+${amount}G`;
        document.body.appendChild(el);
        setTimeout(() => el.remove(), 1400);
      }
    },

    addSilence(amount) {
      this.player.silenceGauge = (this.player.silenceGauge || 0) + amount;
      const max = 10;
      this.addLog(`🌑 소음 ${this.player.silenceGauge}/${max}`, 'echo');
      if (this.player.silenceGauge >= max) {
        this.player.silenceGauge = 0; this.spawnEnemy();
        this.addLog('⚠️ 소음 한계! 파수꾼 등장!', 'damage');
        ScreenShake.shake(10, 0.5);
      }
      updateNoiseWidget();
      updateClassSpecialUI();
    },

    spawnEnemy() {
      const region = getRegionData(this.currentRegion, this);
      if (!region) return;
      const eKey = region.enemies[Math.floor(Math.random() * region.enemies.length)];
      const eData = DATA.enemies[eKey];
      if (eData && this.combat.enemies.length < 3) {
        this.combat.enemies.push(DifficultyScaler.scaleEnemy({ ...eData, statusEffects: {} }, this));
        renderCombatEnemies();
        // 플레이어 턴 중 소환된 경우 버튼 활성화 상태 유지
        if (this.combat.playerTurn) {
          if (typeof globalObj.HudUpdateUI !== 'undefined' && typeof globalObj.HudUpdateUI.enableActionButtons === 'function') {
            globalObj.HudUpdateUI.enableActionButtons();
          } else {
            document.querySelectorAll('.action-btn').forEach(b => { b.disabled = false; });
          }
        }
      }
    },

    drawCards(count = 1) {
      for (let i = 0; i < count; i++) {
        if (this.player.deck.length === 0) {
          if (this.player.graveyard.length === 0) break;
          this.player.deck = [...this.player.graveyard];
          this.player.graveyard = [];
          shuffleArray(this.player.deck);
          this.addLog('🔄 덱을 섞었다', 'system');
          // 덱 카운트 UI 펄스 피드백
          if (typeof globalObj.HudUpdateUI !== 'undefined' && typeof globalObj.HudUpdateUI.triggerDeckShufflePulse === 'function') {
            globalObj.HudUpdateUI.triggerDeckShufflePulse();
          }
        }
        if (this.player.hand.length < 8) {
          this.player.hand.push(this.player.deck.pop());
          AudioEngine.playCard();
        }
      }
      renderHand();
      updateUI();
      // 드로우 애니메이션
      setTimeout(() => {
        if (typeof globalObj.HudUpdateUI !== 'undefined' && typeof globalObj.HudUpdateUI.triggerDrawCardAnimation === 'function') {
          globalObj.HudUpdateUI.triggerDrawCardAnimation();
        } else {
          document.querySelectorAll('#handCards .card, #combatHandCards .card').forEach((el, i) => {
            el.style.animation = 'none';
            requestAnimationFrame(() => { el.style.animation = `cardDraw 0.25s ease ${i * 0.04}s both`; });
          });
          const fanRestoreDelay = 300 + Math.max(0, (this.player.hand.length - 1) * 40);
          setTimeout(() => updateHandFanEffect(), fanRestoreDelay);
        }
      }, 10);
    },

    playCard(cardId, handIdx) {
      const card = DATA.cards[cardId];
      if (!card) return false;
      // 적 턴이거나 전투 비활성 상태면 카드 사용 불가
      if (!this.combat.active || !this.combat.playerTurn || this._endCombatScheduled) return false;
      const cost = typeof globalObj.CardCostUtils !== 'undefined'
        ? globalObj.CardCostUtils.calcEffectiveCost(cardId, card, this.player)
        : Math.max(0, card.cost - (this.player.costDiscount || 0));

      if (this.player.energy < cost) {
        this.addLog('⚠️ 에너지 부족!', 'damage');
        // 카드 흔들기
        if (typeof globalObj.HudUpdateUI !== 'undefined' && typeof globalObj.HudUpdateUI.triggerCardShakeAnimation === 'function') {
          globalObj.HudUpdateUI.triggerCardShakeAnimation();
        } else {
          document.querySelectorAll('#combatHandCards .card:not(.playable)').forEach(el => {
            el.style.animation = 'none';
            requestAnimationFrame(() => { el.style.animation = 'shake 0.3s ease'; });
          });
        }
        AudioEngine.playHit();
        return false;
      }
      // 소음 (침묵의 도시)
      if (getBaseRegionIndex(this.currentRegion) === 1) {
        this.player.silenceGauge = (this.player.silenceGauge || 0) + 1;
        this.addLog(`🌑 소음 +1 (${this.player.silenceGauge}/10)`, 'echo');
        if (this.player.silenceGauge >= 10) {
          this.player.silenceGauge = 0;
          this.spawnEnemy();
          this.addLog('⚠️ 소음 초과! 파수꾼 등장!', 'damage');
        }
      }
      this.player.energy -= cost;
      if (typeof globalObj.CardCostUtils !== 'undefined') {
        globalObj.CardCostUtils.consumeFreeCharge(cardId, this.player);
      } else {
        const cascade = this.player._cascadeCards;
        const isCascadeFree = cascade instanceof Map
          ? (cascade.get(cardId) || 0) > 0
          : !!(cascade && cascade.has && cascade.has(cardId));
        const freeCardUses = Math.max(0, Number(this.player._freeCardUses || 0));
        const isChargedFree = !this.player.zeroCost && !isCascadeFree && freeCardUses > 0;

        if (isChargedFree) {
          this.player._freeCardUses = Math.max(0, freeCardUses - 1);
        }
        if (isCascadeFree) {
          if (cascade instanceof Map) {
            const left = Math.max(0, (cascade.get(cardId) || 0) - 1);
            if (left <= 0) cascade.delete(cardId);
            else cascade.set(cardId, left);
          } else if (cascade && cascade.delete) {
            cascade.delete(cardId);
          }
        }
      }
      this.player.hand.splice(handIdx, 1);

      if (typeof globalObj.TooltipUI !== 'undefined') {
        globalObj.TooltipUI.hideTooltip({ doc: document });
      }

      this.triggerItems('card_play', { cardId });
      // 도감 등록
      if (this.meta.codex) this.meta.codex.cards.add(cardId);
      // ── 카드 사용 시각 효과 ──
      showCardPlayEffect(card);
      card.effect(this);
      this.stats.cardsPlayed++;
      if (card.exhaust) {
        this.player.exhausted.push(cardId);
        this.addLog(`🔥 ${card.name} 소진`, 'system');
      } else {
        this.player.graveyard.push(cardId);
      }
      this.triggerItems('card_discard', { cardId });
      // ── 모든 적 처치 체크 (카드 사용 후 즉시) ──
      if (this.combat.active) {
        const alive = this.combat.enemies.filter(e => e.hp > 0);
        if (alive.length === 0) {
          renderHand(); renderCombatCards(); updateUI();
          if (typeof globalObj.CombatUI !== 'undefined') {
            globalObj.CombatUI.renderCombatEnemies({ gs: this, data: DATA });
          } else if (typeof renderCombatEnemies === 'function') {
            renderCombatEnemies();
          }
          return true; // endCombat은 onEnemyDeath 타임아웃에서 호출됨
        }
      }
      renderHand(); renderCombatCards(); updateUI();
      if (typeof globalObj.CombatUI !== 'undefined') {
        globalObj.CombatUI.renderCombatEnemies({ gs: this, data: DATA });
      } else if (typeof renderCombatEnemies === 'function') {
        renderCombatEnemies();
      }
      return true;
    },

    triggerItems(trigger, data) {
      let numericResult = typeof data === 'number' ? data : null;
      let boolResult = false;

      // 우선순위 정렬: damage_taken 같은 방어형 트리거에선 무효화/뎀감 템을 먼저 실행
      const sortedItems = [...this.player.items].sort((a, b) => {
        if (trigger === 'damage_taken') {
          const aPrio = (a === 'void_crystal' || a === 'blood_crown') ? -1 : 0;
          const bPrio = (b === 'void_crystal' || b === 'blood_crown') ? -1 : 0;
          return aPrio - bPrio;
        }
        return 0;
      });

      sortedItems.forEach(itemId => {
        const item = DATA.items[itemId];
        if (!item?.passive) return;
        const payload = numericResult !== null ? numericResult : data;
        const result = item.passive(this, trigger, payload);
        if (typeof result === 'number' && Number.isFinite(result) && numericResult !== null) {
          numericResult = result;
        }
        if (result === true) boolResult = true;
      });

      // 세트 보너스 체크
      const setPayload = numericResult !== null ? numericResult : data;
      const setResult = SetBonusSystem.triggerSetBonuses(this, trigger, setPayload);
      if (typeof setResult === 'number' && Number.isFinite(setResult) && numericResult !== null) {
        numericResult = setResult;
      }
      if (setResult === true) boolResult = true;

      if (boolResult) return true;
      if (numericResult !== null) return numericResult;
      return data;
    },

    getSetBonuses() { return SetBonusSystem.getActiveSets(this); },

    addLog(msg, type = '') {
      this.combat.log.push({ msg, type });
      if (this.combat.log.length > 200) this.combat.log.shift();
      updateCombatLog();
    },

    onEnemyDeath(enemy, idx) {
      this.player.kills++; this.meta.totalKills++;
      const goldGained = enemy.gold || 10;
      this.addGold(goldGained);
      AudioEngine.playHit();
      this.addLog(`💀 ${enemy.name} 처치! +${goldGained}골드`, 'system');
      this.triggerItems('enemy_kill', { enemy, idx, gold: goldGained });
      // 죽은 적이 현재 타겟이면 다음 살아있는 적으로 자동 전환
      if (this._selectedTarget === idx) {
        const nextAlive = this.combat.enemies.findIndex((e, i) => i !== idx && e.hp > 0);
        this._selectedTarget = nextAlive >= 0 ? nextAlive : null;
        setTimeout(() => renderCombatEnemies(), 50);
      }
      this.worldMemory[`killed_${enemy.id}`] = (this.worldMemory[`killed_${enemy.id}`] || 0) + 1;
      // 사망 애니메이션
      const cardEl = document.getElementById(`enemy_${idx}`);
      if (cardEl) {
        cardEl.classList.add('dying');
        setTimeout(() => { cardEl.style.display = 'none'; }, 700);
      }
      const alive = this.combat.enemies.filter(e => e.hp > 0);
      if (alive.length === 0 && !this._endCombatScheduled) {
        this._endCombatScheduled = true;
        setTimeout(() => this.endCombat(), 900);
      }
      updateUI();
    },

    onPlayerDeath() {
      // panel-bottom 복원
      // 잔향의 심장
      const heart = this.player.items.find(i => i === 'echo_heart');
      if (heart && !this._heartUsed) {
        if (DATA.items.echo_heart.passive(this, 'pre_death')) {
          AudioEngine.playHeal(); updateUI(); return;
        }
      }
      AudioEngine.playDeath();
      ScreenShake.shake(20, 1.2);
      ParticleSystem.deathEffect(window.innerWidth / 2, window.innerHeight / 2);
      document.getElementById('combatOverlay').classList.remove('active');
      // 사망 4단계 연출
      document.body.style.transition = 'filter 1s';
      document.body.style.filter = 'saturate(0.2) brightness(0.6)';
      setTimeout(() => {
        const quote = DATA.deathQuotes[Math.floor(Math.random() * DATA.deathQuotes.length)];
        const mono = document.createElement('div');
        mono.style.cssText = 'position:fixed;inset:0;display:flex;align-items:center;justify-content:center;z-index:1800;pointer-events:none;';
        mono.innerHTML = `<div style="font-family:'Crimson Pro',serif;font-style:italic;font-size:clamp(18px,3vw,28px);color:rgba(238,240,255,0.9);text-align:center;max-width:500px;line-height:1.8;text-shadow:0 0 40px rgba(123,47,255,0.8);animation:fadeInUp 1s ease both;">${quote}</div>`;
        document.body.appendChild(mono);
        setTimeout(() => {
          mono.remove();
          document.body.style.filter = '';
          document.body.style.transition = '';
          this.showDeathScreen();
        }, 2500);
      }, 800);
    },

    showDeathScreen() {
      finalizeRunOutcome('defeat', { echoFragments: 3 });

      document.getElementById('deathFloor').textContent = this.currentFloor;
      document.getElementById('deathKills').textContent = this.player.kills;
      document.getElementById('deathChain').textContent = this.stats.maxChain;
      document.getElementById('deathRun').textContent = this.meta.runCount - 1;
      document.getElementById('deathQuote').textContent = DATA.deathQuotes[Math.floor(Math.random() * DATA.deathQuotes.length)];

      // 세계 기억 힌트 렌더
      const wmEl = document.getElementById('deathWorldMemory');
      if (wmEl) {
        const wm = this.meta.worldMemory;
        const hints = [];
        if ((wm.savedMerchant || 0) > 0) hints.push(`🤝 상인을 구함 ×${wm.savedMerchant}`);
        if (wm.stoleFromMerchant) hints.push('⚠️ 상인에게서 약탈함');
        if (wm['killed_ancient_echo']) hints.push(`💀 태고의 잔향 처치 ×${wm['killed_ancient_echo']}`);
        if (wm['killed_void_herald']) hints.push(`🌌 허공의 사도 처치 ×${wm['killed_void_herald']}`);
        if (wm['killed_memory_sovereign']) hints.push(`👑 기억의 군주 처치 ×${wm['killed_memory_sovereign']}`);
        const storyCount = this.meta.storyPieces.length;
        if (storyCount > 0) hints.push(`📖 스토리 ${storyCount}/10 해금`);
        if (hints.length) {
          wmEl.innerHTML = `<div style="font-family:'Cinzel',serif;font-size:9px;letter-spacing:0.3em;color:var(--text-dim);width:100%;text-align:center;margin-bottom:6px;">◈ 세계의 기억 ◈</div>` +
            hints.map(h => `<span class="wm-badge">${h}</span>`).join('');
        } else {
          wmEl.innerHTML = '';
        }
      }

      this.generateFragmentChoices();
      switchScreen('death');
    },

    generateFragmentChoices() {
      const choices = [
        { icon: '⚡', name: 'Echo 강화', desc: '다음 런 시작 시 Echo +30', effect: 'echo_boost' },
        { icon: '🛡️', name: '회복력', desc: '최대 체력 +10', effect: 'resilience' },
        { icon: '💰', name: '행운', desc: '시작 골드 +25', effect: 'fortune' },
      ];
      shuffleArray(choices);
      document.getElementById('fragmentChoices').innerHTML = choices.map(c => `
      <div class="fragment-btn" onclick="selectFragment('${c.effect}')">
        <div class="fragment-icon">${c.icon}</div>
        <div class="fragment-name">${c.name}</div>
        <div class="fragment-desc">${c.desc}</div>
      </div>
    `).join('');
    },

    endCombat() {
      if (!this.combat.active) return;
      if (this._endCombatRunning) return;  // 중복 실행 방지
      this._endCombatRunning = true;
      try {
        this.combat.active = false;
        if (typeof globalObj.HudUpdateUI !== 'undefined' && typeof globalObj.HudUpdateUI.resetCombatUI === 'function') {
          globalObj.HudUpdateUI.resetCombatUI();
        } else {
          document.getElementById('combatOverlay').classList.remove('active');
          // 소음 게이지 UI 제거
          document.getElementById('noiseGaugeOverlay')?.remove();
          // 적 카드 DOM 초기화
          const endZone = document.getElementById('enemyZone');
          if (endZone) endZone.innerHTML = '';
        }
        // ── 전투 상태 완전 초기화 ──
        this.player.graveyard.push(...this.player.hand);
        this.player.hand = [];
        this.player.shield = 0;
        this.player.echoChain = 0;
        this.player.energy = this.player.maxEnergy;
        this.player.buffs = {};
        this.player.costDiscount = 0;
        this.player.zeroCost = false;
        this.player._freeCardUses = 0;
        this.player._cascadeCards = null;
        this.player.silenceGauge = 0;
        this._maskCount = 0;
        this._batteryUsedTurn = false;
        this._temporalTurn = 0;
        this.triggerItems('combat_end');
        this.triggerItems('void_shard');
        // UI 즉시 반영
        updateChainUI(0);
        renderHand();
        renderCombatCards();
        updateUI();
        // updateNextNodes는 returnToGame에서만 호출 (보상 선택 전 노드 표시 방지)

        const isBoss = this.combat.enemies.some(e => e.isBoss);
        const isLastRegion = getBaseRegionIndex(this.currentRegion) === Math.max(0, getRegionCount() - 1);

        AudioEngine.playItemGet();
        // 전투 통계 요약 (짧게 표시 후 보상 화면)
        const combatDmgDealt = this.stats.damageDealt - (this._combatStartDmg || 0);
        const combatDmgTaken = this.stats.damageTaken - (this._combatStartTaken || 0);
        showCombatSummary(combatDmgDealt, combatDmgTaken, this.player.kills - (this._combatStartKills || 0));
        // 보스 전투 완료 시 플래그 설정 (returnToGame에서 지역 전환)
        if (isBoss) {
          GS._bossRewardPending = true;
          GS._bossLastRegion = isLastRegion;
        }
        if (isBoss && isLastRegion && RunRules.isEndless(this)) {
          // 엔들리스 사이클 보스는 보상 선택 없이 즉시 다음 루프로 이동
          setTimeout(() => returnToGame(true), 300);
          return;
        }
        if (typeof globalObj.HudUpdateUI !== 'undefined' && typeof globalObj.HudUpdateUI.hideNodeOverlay === 'function') {
          globalObj.HudUpdateUI.hideNodeOverlay();
        } else {
          const nodeOverlay = document.getElementById('nodeCardOverlay');
          if (nodeOverlay) nodeOverlay.style.display = 'none';
        }
        // 전투 요약 UI(2800ms)가 완전히 사라진 후 보상 화면 표시 (클릭 차단 방지)
        setTimeout(() => showRewardScreen(isBoss), 3000);
      } catch (e) {
        console.error('[endCombat] Error:', e);
      } finally {
        this._endCombatRunning = false;
        this._endCombatScheduled = false;
      }
    },

    updateChainDisplay() {
      const chain = this.player.echoChain;
      this.stats.maxChain = Math.max(this.stats.maxChain, chain);
      updateChainUI(chain);
      if (chain > 0) AudioEngine.playChain(chain);
      if (chain >= 5) this.triggerResonanceBurst();
    },

    triggerResonanceBurst() {
      this.player.echoChain = 0;
      this.drainEcho(50);
      AudioEngine.playResonanceBurst();
      ScreenShake.shake(15, 0.8);
      let burstDmg = 35 + Math.floor(this.player.echo / 3);
      const burstMod = this.triggerItems('resonance_burst', burstDmg);
      if (burstMod === true) {
        burstDmg = Math.floor(burstDmg * 2);
      } else if (typeof burstMod === 'number' && Number.isFinite(burstMod)) {
        burstDmg = Math.max(0, Math.floor(burstMod));
      }
      this.combat.enemies.forEach((e, i) => {
        if (e.hp > 0) {
          e.hp = Math.max(0, e.hp - burstDmg);
          showDmgPopup(burstDmg, window.innerWidth / 2 + (i - 0.5) * 200, 200, '#00ffcc');
          if (e.hp <= 0) this.onEnemyDeath(e, i);
        }
      });
      ParticleSystem.burstEffect(window.innerWidth / 2, window.innerHeight / 3);
      showEchoBurstOverlay();
      this.addLog(`🌟 RESONANCE BURST! 전체 ${burstDmg} 피해!`, 'echo');
      this.stats.maxChain = Math.max(this.stats.maxChain, 5);
      updateChainUI(0);
      renderCombatEnemies();
      showChainAnnounce('RESONANCE BURST!!');
    },

    getRandomCard(rarity = 'common') {
      const rare = ['echo_burst_card', 'void_blade', 'soul_armor', 'echo_dance', 'arcane_storm', 'sanctuary', 'echo_overload'];
      const uncommon = ['echo_wave', 'resonance', 'soul_rend', 'twin_strike', 'echo_shield', 'afterimage', 'phantom_blade', 'time_echo', 'void_mirror', 'prediction', 'death_mark', 'shadow_step', 'poison_blade', 'soul_harvest', 'desperate_strike', 'reverberation', 'dark_pact', 'surge', 'energy_siphon'];
      const allCards = Object.keys(DATA.cards);
      let pool;
      if (rarity === 'rare') pool = rare;
      else if (rarity === 'uncommon') pool = uncommon;
      else pool = allCards.filter(c => !rare.includes(c) && !uncommon.includes(c));
      if (!pool.length) pool = allCards;
      return pool[Math.floor(Math.random() * pool.length)];
    },

    showLowHpWarning() {
      let el = document.querySelector('.pulse-overlay');
      if (!el) {
        el = document.createElement('div');
        el.className = 'pulse-overlay';
        document.body.appendChild(el);
      }
      clearTimeout(this._pulseTimer);
      this._pulseTimer = setTimeout(() => el.remove(), 5000);
    },
  };

  globalObj.GameStateCoreMethods = GameStateCoreMethods;
})(window);
