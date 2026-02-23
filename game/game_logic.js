'use strict';

// ═══════════════════════════════════════════════════════════
//  ECHO OF THE FALLEN v2 — 완전 통합 코드베이스
//  모든 Phase 1~4 기능을 단일 아키텍처로 통합
//  훅 체인 제거 · 클린 FSM · 단일 게임 루프
// ═══════════════════════════════════════════════════════════

// ────────────────────────────────────────
// WEB AUDIO ENGINE
// ────────────────────────────────────────

const GS = {
  currentScreen: 'title',
  meta: {
    runCount: 1, totalKills: 0, bestChain: 0, echoFragments: 0,
    worldMemory: {},
    inscriptions: { echo_boost:false, resilience:false, fortune:false },
    storyPieces: [], _hiddenEndingHinted: false,
    codex: { enemies: new Set(), cards: new Set(), items: new Set() },
    unlocks: { ascension: false, endless: false },
    maxAscension: 0,
    runConfig: { ascension: 0, endless: false, blessing: 'none', curse: 'none' },
    progress: { echoShards: 0, totalDamage: 0, victories: 0, failures: 0, bossKills: {} },
  },
  player: {
    class:'swordsman', hp:80, maxHp:80, shield:0,
    echo:0, maxEcho:100, echoChain:0,
    energy:3, maxEnergy:3, gold:0, kills:0,
    deck:[], hand:[], graveyard:[], exhausted:[],
    items:[], buffs:{}, silenceGauge:0, zeroCost:false,
    upgradedCards: new Set(), _cardUpgradeBonus: {},
  },
  currentRegion: 0, currentFloor: 1,
  mapNodes: [], currentNode: null, visitedNodes: new Set(),
  combat: { active:false, enemies:[], turn:0, playerTurn:true, log:[] },
  _selectedTarget: null,
  worldMemory: {},
  runConfig: { ascension: 0, endless: false, endlessMode: false, blessing: 'none', curse: 'none' },
  stats: { damageDealt:0, damageTaken:0, cardsPlayed:0, maxChain:0 },
  _heartUsed: false, _temporalTurn: 0, _bossAdvancePending: false,

  // ── 전투 메서드 ──
  dealDamage(amount, targetIdx=null, noChain=false) {
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
    // 면역 체크
    if (this.getBuff('immune')) { this.addLog('🏛️ 면역: 피해 없음!', 'echo'); return 0; }

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

    const ex = window.innerWidth/2 + (targetIdx - (this.combat.enemies.length/2-0.5))*180;
    ParticleSystem.hitEffect(ex, 250, dmg > 20);

    // ── 공격 시 효과음 & 시각 효과 ──
    const isCrit = dmg > prevHp * 0.3 || (this.getBuff && this._lastCrit);
    if (isCrit || dmg > 25) {
      AudioEngine.playCritical();
      // 크리티컬 섬광
      const cf = document.createElement('div');
      cf.className = 'crit-flash-overlay';
      document.getElementById('hudOverlay')?.appendChild(cf);
      setTimeout(()=>cf.remove(), 450);
    } else if (dmg > 12) {
      AudioEngine.playHeavyHit();
      // 강타 오버레이
      const hf = document.createElement('div');
      hf.className = 'heavy-hit-overlay';
      document.getElementById('hudOverlay')?.appendChild(hf);
      setTimeout(()=>hf.remove(), 500);
    } else {
      AudioEngine.playHit();
    }

    // 적 카드 shake + 붉은 플래시
    const enemyCard = document.getElementById(`enemy_${targetIdx}`);
    if (enemyCard) {
      enemyCard.classList.remove('enemy-hit-anim');
      void enemyCard.offsetWidth; // reflow
      enemyCard.classList.add('enemy-hit-anim');
      setTimeout(()=>enemyCard.classList.remove('enemy-hit-anim'), 280);
      const flashEl = document.createElement('div');
      flashEl.className = 'enemy-dmg-flash';
      enemyCard.style.position = 'relative';
      enemyCard.appendChild(flashEl);
      setTimeout(()=>flashEl.remove(), 350);
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
    const alive = this.combat.enemies.map((_,i)=>i).filter(i=>this.combat.enemies[i].hp>0);
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
    const adjusted = RunRules.getHealAmount(this, amount);
    const actual = Math.min(adjusted, this.player.maxHp - this.player.hp);
    this.player.hp = Math.min(this.player.maxHp, this.player.hp + actual);
    if (actual > 0) {
      ParticleSystem.healEffect(window.innerWidth/2, window.innerHeight/2);
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
    this.triggerItems('damage_taken', dmg);
    if (dmg > 0) {
      this.player.hp -= dmg; this.stats.damageTaken += dmg;
      ScreenShake.shake(8, 0.4); showEdgeDamage();
      this.addLog(`💔 ${dmg} 피해 받음`, 'damage');
      showDmgPopup(dmg, window.innerWidth*0.3, window.innerHeight/2, '#ff3366');

      // ── 피격 효과음 & 시각 효과 ──
      AudioEngine.playPlayerHit();
      // 피격 붉은 비네트
      const vign = document.createElement('div');
      vign.className = 'player-hit-vignette';
      document.getElementById('hudOverlay')?.appendChild(vign);
      setTimeout(()=>vign.remove(), 600);
      // HUD shake
      const hpBar = document.getElementById('hoverHud');
      if (hpBar) {
        hpBar.style.animation = 'none';
        void hpBar.offsetWidth;
        hpBar.style.animation = 'shake 0.3s ease';
        setTimeout(()=>hpBar.style.animation='', 300);
      }

      // 저체력 경고
      if (this.player.hp < this.player.maxHp * 0.25) this.showLowHpWarning();
    }
    updateUI();
    if (this.player.hp <= 0) this.onPlayerDeath();
  },

  addBuff(id, stacks, data={}) {
    this.player.buffs[id] = { stacks, ...data };
    updateStatusDisplay();
  },

  getBuff(id) { return this.player.buffs[id] || null; },

  applyEnemyStatus(status, duration, targetIdx=null) {
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

  getEnemyIntent(targetIdx=0) {
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
      el.style.cssText = `position:fixed;right:260px;top:${60+Math.random()*40}px;font-family:'Share Tech Mono',monospace;font-size:14px;font-weight:700;color:var(--gold);text-shadow:0 0 12px rgba(240,180,41,0.7);pointer-events:none;z-index:500;animation:goldPop 1.4s ease forwards;`;
      el.textContent = `+${amount}G`;
      document.body.appendChild(el);
      setTimeout(()=>el.remove(), 1400);
    }
  },

  addSilence(amount) {
    this.player.silenceGauge = (this.player.silenceGauge||0) + amount;
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
    const eKey = region.enemies[Math.floor(Math.random()*region.enemies.length)];
    const eData = DATA.enemies[eKey];
    if (eData && this.combat.enemies.length < 3) {
      this.combat.enemies.push(DifficultyScaler.scaleEnemy({...eData, statusEffects:{}}));
      renderCombatEnemies();
      // 플레이어 턴 중 소환된 경우 버튼 활성화 상태 유지
      if (this.combat.playerTurn) {
        document.querySelectorAll('.action-btn').forEach(b => { b.disabled = false; });
      }
    }
  },

  drawCards(count=1) {
    for (let i = 0; i < count; i++) {
      if (this.player.deck.length === 0) {
        if (this.player.graveyard.length === 0) break;
        this.player.deck = [...this.player.graveyard];
        this.player.graveyard = [];
        shuffleArray(this.player.deck);
        this.addLog('🔄 덱을 섞었다', 'system');
        // 덱 카운트 UI 펄스 피드백
        const deckEls = document.querySelectorAll('#deckCount, #combatDeckCount');
        deckEls.forEach(el => {
          el.style.transition = 'color 0.15s, text-shadow 0.15s';
          el.style.color = 'var(--cyan)';
          el.style.textShadow = '0 0 10px rgba(0,255,204,0.8)';
          setTimeout(() => { el.style.color = ''; el.style.textShadow = ''; }, 600);
        });
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
      document.querySelectorAll('#handCards .card, #combatHandCards .card').forEach((el,i) => {
        el.style.animation = 'none';
        requestAnimationFrame(() => { el.style.animation = `cardDraw 0.25s ease ${i*0.04}s both`; });
      });
      const fanRestoreDelay = 300 + Math.max(0, (this.player.hand.length - 1) * 40);
      setTimeout(() => updateHandFanEffect(), fanRestoreDelay);
    }, 10);
  },

  playCard(cardId, handIdx) {
    const card = DATA.cards[cardId];
    if (!card) return false;
    // 적 턴이거나 전투 비활성 상태면 카드 사용 불가
    if (!this.combat.active || !this.combat.playerTurn) return false;
    const disc = this.player.costDiscount || 0;
    const cost = this.player.zeroCost ? 0 : Math.max(0, card.cost - disc);
    if (this.player.energy < cost) {
      this.addLog('⚠️ 에너지 부족!', 'damage');
      // 카드 흔들기
      document.querySelectorAll('#combatHandCards .card:not(.playable)').forEach(el => {
        el.style.animation = 'none';
        requestAnimationFrame(() => { el.style.animation = 'shake 0.3s ease'; });
      });
      AudioEngine.playHit();
      return false;
    }
    // 소음 (침묵의 도시)
    if (getBaseRegionIndex(this.currentRegion) === 1) {
      this.player.silenceGauge = (this.player.silenceGauge||0) + 1;
      this.addLog(`🌑 소음 +1 (${this.player.silenceGauge}/10)`, 'echo');
      if (this.player.silenceGauge >= 10) {
        this.player.silenceGauge = 0;
        this.spawnEnemy();
        this.addLog('⚠️ 소음 초과! 파수꾼 등장!', 'damage');
      }
    }
    this.player.energy -= cost;
    this.player.hand.splice(handIdx, 1);
    this.triggerItems('card_play', {cardId});
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
    this.triggerItems('card_discard', {cardId});
    // ── 모든 적 처치 체크 (카드 사용 후 즉시) ──
    if (this.combat.active) {
      const alive = this.combat.enemies.filter(e => e.hp > 0);
      if (alive.length === 0) {
        renderHand(); renderCombatCards(); updateUI();
        return true; // endCombat은 onEnemyDeath 타임아웃에서 호출됨
      }
    }
    renderHand(); renderCombatCards(); updateUI();
    return true;
  },

  triggerItems(trigger, data) {
    this.player.items.forEach(itemId => {
      const item = DATA.items[itemId];
      if (item?.passive) item.passive(this, trigger, data);
    });
    // 세트 보너스 체크
    SetBonusSystem.triggerSetBonuses(this, trigger, data);
  },

  getSetBonuses() { return SetBonusSystem.getActiveSets(this); },

  addLog(msg, type='') {
    this.combat.log.push({msg, type});
    if (this.combat.log.length > 200) this.combat.log.shift();
    updateCombatLog();
  },

  onEnemyDeath(enemy, idx) {
    this.player.kills++; this.meta.totalKills++;
    const goldGained = enemy.gold || 10;
    this.addGold(goldGained);
    AudioEngine.playHit();
    this.addLog(`💀 ${enemy.name} 처치! +${goldGained}골드`, 'system');
    // 죽은 적이 현재 타겟이면 다음 살아있는 적으로 자동 전환
    if (this._selectedTarget === idx) {
      const nextAlive = this.combat.enemies.findIndex((e, i) => i !== idx && e.hp > 0);
      this._selectedTarget = nextAlive >= 0 ? nextAlive : null;
      setTimeout(() => renderCombatEnemies(), 50);
    }
    this.worldMemory[`killed_${enemy.id}`] = (this.worldMemory[`killed_${enemy.id}`]||0) + 1;
    // 사망 애니메이션
    const cardEl = document.getElementById(`enemy_${idx}`);
    if (cardEl) {
      cardEl.classList.add('dying');
      setTimeout(() => { cardEl.style.display='none'; }, 700);
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
    ParticleSystem.deathEffect(window.innerWidth/2, window.innerHeight/2);
    document.getElementById('combatOverlay').classList.remove('active');
    // 사망 4단계 연출
    document.body.style.transition = 'filter 1s';
    document.body.style.filter = 'saturate(0.2) brightness(0.6)';
    setTimeout(() => {
      const quote = DATA.deathQuotes[Math.floor(Math.random()*DATA.deathQuotes.length)];
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
    document.getElementById('deathQuote').textContent = DATA.deathQuotes[Math.floor(Math.random()*DATA.deathQuotes.length)];

    // 세계 기억 힌트 렌더
    const wmEl = document.getElementById('deathWorldMemory');
    if (wmEl) {
      const wm = this.meta.worldMemory;
      const hints = [];
      if ((wm.savedMerchant||0) > 0) hints.push(`🤝 상인을 구함 ×${wm.savedMerchant}`);
      if (wm.stoleFromMerchant) hints.push('⚠️ 상인에게서 약탈함');
      if (wm['killed_ancient_echo']) hints.push(`💀 태고의 잔향 처치 ×${wm['killed_ancient_echo']}`);
      if (wm['killed_void_herald']) hints.push(`🌌 허공의 사도 처치 ×${wm['killed_void_herald']}`);
      if (wm['killed_memory_sovereign']) hints.push(`👑 기억의 군주 처치 ×${wm['killed_memory_sovereign']}`);
      const storyCount = this.meta.storyPieces.length;
      if (storyCount > 0) hints.push(`📖 스토리 ${storyCount}/10 해금`);
      if (hints.length) {
        wmEl.innerHTML = `<div style="font-family:'Cinzel',serif;font-size:9px;letter-spacing:0.3em;color:var(--text-dim);width:100%;text-align:center;margin-bottom:6px;">◈ 세계의 기억 ◈</div>` +
          hints.map(h=>`<span class="wm-badge">${h}</span>`).join('');
      } else {
        wmEl.innerHTML = '';
      }
    }

    this.generateFragmentChoices();
    switchScreen('death');
  },

  generateFragmentChoices() {
    const choices = [
      { icon:'⚡', name:'Echo 강화', desc:'다음 런 시작 시 Echo +30', effect:'echo_boost' },
      { icon:'🛡️', name:'회복력', desc:'최대 체력 +10', effect:'resilience' },
      { icon:'💰', name:'행운', desc:'시작 골드 +25', effect:'fortune' },
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
      document.getElementById('combatOverlay').classList.remove('active');
      // 전투 정보 패널 닫기
      _resetCombatInfoPanel();
      // 하단 손패 패널 복원
      // 소음 게이지 UI 제거
      document.getElementById('noiseGaugeOverlay')?.remove();
      // 적 카드 DOM 초기화
      const endZone = document.getElementById('enemyZone');
      if (endZone) endZone.innerHTML = '';
      // ── 전투 상태 완전 초기화 ──
      this.player.graveyard.push(...this.player.hand);
      this.player.hand = [];
      this.player.shield = 0;
      this.player.echoChain = 0;
      this.player.energy = this.player.maxEnergy;
      this.player.buffs = {};
      this.player.costDiscount = 0;
      this.player.zeroCost = false;
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
      const combatDmgDealt = this.stats.damageDealt - (this._combatStartDmg||0);
      const combatDmgTaken = this.stats.damageTaken - (this._combatStartTaken||0);
      showCombatSummary(combatDmgDealt, combatDmgTaken, this.player.kills - (this._combatStartKills||0));
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
      const nodeOverlay = document.getElementById('nodeCardOverlay');
      if (nodeOverlay) nodeOverlay.style.display = 'none';
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
    const burstDmg = 35 + Math.floor(this.player.echo / 3);
    this.combat.enemies.forEach((e, i) => {
      if (e.hp > 0) {
        e.hp = Math.max(0, e.hp - burstDmg);
        showDmgPopup(burstDmg, window.innerWidth/2+(i-0.5)*200, 200, '#00ffcc');
        if (e.hp <= 0) this.onEnemyDeath(e, i);
      }
    });
    ParticleSystem.burstEffect(window.innerWidth/2, window.innerHeight/3);
    showEchoBurstOverlay();
    this.addLog(`🌟 RESONANCE BURST! 전체 ${burstDmg} 피해!`, 'echo');
    this.stats.maxChain = Math.max(this.stats.maxChain, 5);
    updateChainUI(0);
    renderCombatEnemies();
    showChainAnnounce('RESONANCE BURST!!');
  },

  getRandomCard(rarity='common') {
    const rare = ['echo_burst_card','void_blade','soul_armor','echo_dance','arcane_storm','sanctuary','echo_overload'];
    const uncommon = ['echo_wave','resonance','soul_rend','twin_strike','echo_shield','afterimage','phantom_blade','time_echo','void_mirror','prediction','death_mark','shadow_step','poison_blade','soul_harvest','desperate_strike','reverberation','dark_pact','surge','energy_siphon'];
    const allCards = Object.keys(DATA.cards);
    let pool;
    if (rarity === 'rare') pool = rare;
    else if (rarity === 'uncommon') pool = uncommon;
    else pool = allCards.filter(c => !rare.includes(c) && !uncommon.includes(c));
    if (!pool.length) pool = allCards;
    return pool[Math.floor(Math.random()*pool.length)];
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

// 전역 참조 (레거시 호환)
const GameState = GS;

// ────────────────────────────────────────
// STORY SYSTEM
// ────────────────────────────────────────
const StorySystem = {
  unlockNextFragment() {
    const run = GS.meta.runCount;
    const frag = DATA.storyFragments.find(f => f.run === run);
    if (frag && !GS.meta.storyPieces.includes(frag.id)) {
      GS.meta.storyPieces.push(frag.id);
    }
  },

  showRunFragment() {
    const run = GS.meta.runCount;
    const frag = DATA.storyFragments.find(f => f.run === run);
    if (!frag || GS.meta.storyPieces.includes(frag.id)) return;
    GS.meta.storyPieces.push(frag.id);
    this.displayFragment(frag);
    // 히든 엔딩 힌트
    if (GS.meta.storyPieces.length >= 8 && !GS.meta._hiddenEndingHinted) {
      GS.meta._hiddenEndingHinted = true;
      setTimeout(() => showWorldMemoryNotice('진실에 가까워지고 있다 — 각인 없이 클리어하라'), 500);
    }
  },

  displayFragment(frag) {
    const el = document.createElement('div');
    el.style.cssText = 'position:fixed;inset:0;background:rgba(3,3,10,0.95);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:24px;z-index:2000;animation:fadeIn 1s ease both;';
    el.innerHTML = `
      <div style="font-family:'Cinzel',serif;font-size:10px;letter-spacing:0.5em;color:rgba(123,47,255,0.6);">FRAGMENT ${frag.id} — ${frag.title}</div>
      <div style="font-family:'Crimson Pro',serif;font-style:italic;font-size:clamp(15px,2vw,20px);color:var(--text);max-width:560px;text-align:center;line-height:1.9;animation:fadeInUp 1s ease 0.5s both;opacity:0;">${frag.text}</div>
      <div style="width:40px;height:1px;background:var(--echo);animation:fadeInUp 1s ease 1s both;opacity:0;"></div>
      <button onclick="this.parentElement.remove();" style="font-family:'Cinzel',serif;font-size:11px;letter-spacing:0.3em;color:var(--text-dim);background:none;border:1px solid var(--border);border-radius:6px;padding:10px 28px;cursor:pointer;animation:fadeInUp 1s ease 1.5s both;opacity:0;transition:all 0.3s;" onmouseover="this.style.color='var(--white)'" onmouseout="this.style.color='var(--text-dim)'">계속</button>
    `;
    document.body.appendChild(el);
    AudioEngine.playHeal();
  },

  checkHiddenEnding() {
    const m = GS.meta;
    const noIns = !Object.values(m.inscriptions).some(v => v);
    return noIns && m.storyPieces.length >= 10;
  },

  showNormalEnding() { this._showEnding(false); },
  showHiddenEnding() { this._showEnding(true); },

  _showEnding(isHidden) {
    const el = document.createElement('div');
    el.id = 'endingScreen';
    el.style.cssText = 'position:fixed;inset:0;background:var(--void);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:28px;z-index:3000;animation:fadeIn 2s ease both;';
    const color = isHidden ? 'var(--cyan)' : 'var(--white)';
    const glowColor = isHidden ? 'rgba(0,255,204,0.7)' : 'var(--echo-glow)';
    el.innerHTML = isHidden ? `
      <div style="font-family:'Cinzel',serif;font-size:10px;letter-spacing:0.5em;color:var(--cyan);animation:fadeInDown 1s ease 0.5s both;opacity:0;">TRUE ENDING — 초월</div>
      <div style="font-family:'Cinzel Decorative',serif;font-size:clamp(28px,5vw,56px);font-weight:900;color:var(--cyan);text-shadow:0 0 40px ${glowColor};animation:titleReveal 1.5s ease 0.8s both;opacity:0;">루프의 끝<br><span style="font-size:0.5em;color:var(--text-dim);">THE END OF ECHOES</span></div>
      <div style="font-family:'Crimson Pro',serif;font-style:italic;font-size:clamp(14px,1.8vw,19px);color:var(--text);max-width:520px;text-align:center;line-height:1.9;animation:fadeInUp 1s ease 1.8s both;opacity:0;">"잔향자는 처음으로 손을 내려놓았다.<br>각인의 힘도, 과거의 기억도 사용하지 않은 채.<br>그것이 진짜 선택이었다.<br><br>세계는 침묵을 되찾았다.<br>그리고 마침내 — 쉬었다."</div>
      <div style="animation:fadeInUp 1s ease 3s both;opacity:0;">
        <button onclick="restartFromEnding()" style="font-family:'Cinzel',serif;font-size:12px;letter-spacing:0.2em;color:var(--void);background:linear-gradient(135deg,var(--cyan),var(--echo));border:none;border-radius:8px;padding:14px 32px;cursor:pointer;">새로운 잔향</button>
      </div>
      <div style="font-family:'Share Tech Mono',monospace;font-size:10px;color:var(--text-dim);animation:fadeInUp 1s ease 3.5s both;opacity:0;">TRUE ENDING UNLOCKED — ${GS.meta.storyPieces.length}/10 fragments</div>
    ` : `
      <div style="font-family:'Cinzel',serif;font-size:10px;letter-spacing:0.5em;color:var(--echo);animation:fadeInDown 1s ease 0.5s both;opacity:0;">ENDING — 클리어</div>
      <div style="font-family:'Cinzel Decorative',serif;font-size:clamp(26px,4.5vw,50px);font-weight:900;color:var(--white);text-shadow:0 0 30px ${glowColor};animation:titleReveal 1.5s ease 0.8s both;opacity:0;">에코의 핵심 정복<br><span style="font-size:0.45em;color:var(--text-dim);">RESONANT VICTOR</span></div>
      <div style="font-family:'Crimson Pro',serif;font-style:italic;font-size:clamp(14px,1.8vw,18px);color:var(--text);max-width:500px;text-align:center;line-height:1.9;animation:fadeInUp 1s ease 1.8s both;opacity:0;">"잔향자는 에코의 핵심을 돌파했다.<br>하지만 루프는 아직 끝나지 않았다.<br>진실을 알기에는 — 아직 이르다."</div>
      <div style="display:flex;gap:28px;animation:fadeInUp 1s ease 2.5s both;opacity:0;flex-wrap:wrap;justify-content:center;">
        ${[{n:GS.player.kills,l:'처치 수'},{n:GS.stats.maxChain,l:'최고 체인'},{n:GS.stats.damageDealt,l:'총 피해'},{n:GS.meta.runCount,l:'런 횟수'},{n:GS.meta.storyPieces.length+'/10',l:'스토리 조각'}].map(s=>`<div style="text-align:center;"><div style="font-family:'Cinzel Decorative',serif;font-size:28px;font-weight:900;color:var(--echo);">${s.n}</div><div style="font-family:'Cinzel',serif;font-size:9px;letter-spacing:0.2em;color:var(--text-dim);margin-top:4px;">${s.l}</div></div>`).join('')}
      </div>
      <div style="animation:fadeInUp 1s ease 3s both;opacity:0;">
        <button onclick="restartFromEnding()" style="font-family:'Cinzel',serif;font-size:12px;letter-spacing:0.2em;color:var(--void);background:linear-gradient(135deg,var(--echo),var(--echo-bright));border:none;border-radius:8px;padding:14px 32px;cursor:pointer;">다시 잔향 속으로</button>
      </div>
      <div style="font-family:'Crimson Pro',serif;font-size:13px;font-style:italic;color:var(--text-dim);animation:fadeInUp 1s ease 3.5s both;opacity:0;">힌트: 각인 없이 클리어하면 — 다른 결말이 기다린다</div>
    `;
    document.body.appendChild(el);
    setTimeout(() => {
      for (let i=0;i<5;i++) setTimeout(() => ParticleSystem.burstEffect(window.innerWidth*(0.2+Math.random()*0.6),window.innerHeight*(0.2+Math.random()*0.6)),i*300);
      AudioEngine.playResonanceBurst();
    }, 2000);
  },
};

// ────────────────────────────────────────
// CLASS MECHANICS
// ────────────────────────────────────────
const ClassMechanics = {
  swordsman: {
    onMove() {
      const m = GS.player.buffs.momentum;
      if (m) { m.dmgBonus = Math.min(20, (m.dmgBonus||0)+2); m.stacks=1; }
      else GS.addBuff('momentum', 1, {dmgBonus:2});
    },
    getSpecialUI() {
      const m = GS.getBuff('momentum');
      return `<div style="font-size:9px;color:var(--text-dim);font-family:'Cinzel',serif;letter-spacing:0.1em;margin-bottom:2px;">모멘텀</div><div style="font-family:'Share Tech Mono',monospace;font-size:12px;color:var(--danger);">+${m?m.dmgBonus||0:0} 데미지</div>`;
    }
  },
  mage: {
    onCombatStart() { GS._prediction = true; },
    getSpecialUI() {
      const next = GS.combat.enemies[0]?.ai?.(GS.combat.turn+1);
      return `<div style="font-size:9px;color:var(--text-dim);font-family:'Cinzel',serif;letter-spacing:0.1em;margin-bottom:2px;">다음 턴 예측</div><div style="font-size:10px;color:var(--cyan);">${next?.intent||'불명'}</div>`;
    }
  },
  hunter: {
    getSpecialUI() {
      const gauge = GS.player.silenceGauge||0;
      const max = 10;
      const pct = (gauge/max)*100;
      const color = pct>70?'var(--danger)':pct>40?'var(--gold)':'var(--cyan)';
      return `<div style="font-size:9px;color:var(--text-dim);font-family:'Cinzel',serif;letter-spacing:0.1em;margin-bottom:3px;">침묵 게이지 ${gauge}/${max}</div><div style="height:4px;background:rgba(255,255,255,0.05);border-radius:2px;overflow:hidden;"><div style="width:${pct}%;height:100%;background:${color};border-radius:2px;transition:width 0.3s;"></div></div>`;
    }
  },
};

// ────────────────────────────────────────
// CANVAS SETUP
// ────────────────────────────────────────
let titleCanvas, titleCtx;
let gameCanvas, gameCtx;
let minimapCanvas, minimapCtx;
let combatCanvas; // 파티클용

// FoV 상태
let fovActive = false, fovPlayerX = 1, fovPlayerY = 1;

// ────────────────────────────────────────
// MAZE SYSTEM — 독립 풀스크린 오버레이
// ────────────────────────────────────────
const MazeSystem = (() => {
  let canvas, ctx, minimap, mmCtx;
  let W, H, map, px, py;
  let stepCount = 0;
  let animOffset = 0;
  let pendingCombat = false;

  const TILE = 40; // 타일 픽셀 크기

  function init() {
    canvas   = document.getElementById('mazeCanvas');
    minimap  = document.getElementById('mazeMinimap');
    if (!canvas || !minimap) return;
    ctx   = canvas.getContext('2d');
    mmCtx = minimap.getContext('2d');
  }

  function open(isBoss) {
    init();
    pendingCombat = isBoss ? 'boss' : 'combat';
    stepCount = 0;

    // 미로 생성
    const mData = FovEngine.generateMaze(21, 13);
    const size  = FovEngine.getSize();
    W = size.W; H = size.H;
    map = FovEngine.getMap();
    px = 1; py = 1;
    fovActive = true; fovPlayerX = px; fovPlayerY = py;

    // 캔버스 크기 설정
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // 오버레이 표시
    const overlay = document.getElementById('mazeOverlay');
    if (overlay) overlay.style.display = 'flex';

    updateHUD();
    draw();
  }

  function resizeCanvas() {
    if (!canvas) return;
    canvas.width  = canvas.offsetWidth  || canvas.clientWidth  || 800;
    canvas.height = canvas.offsetHeight || canvas.clientHeight || 500;
    draw();
  }

  function close() {
    fovActive = false;
    window.removeEventListener('resize', resizeCanvas);
    const overlay = document.getElementById('mazeOverlay');
    if (overlay) overlay.style.display = 'none';
    document.getElementById('mazeGuide')?.remove();
  }

  function move(dx, dy) {
    const nx = px + dx, ny = py + dy;
    if (!map[ny] || map[ny][nx] !== 0) {
      // 벽 충돌 — 흔들기 애니메이션
      shakeAnim();
      return false;
    }
    px = nx; py = ny;
    fovPlayerX = px; fovPlayerY = py;
    stepCount++;

    updateHUD();
    draw();

    // 출구 체크 (우하단 2×2 영역)
    if (px >= W-2 && py >= H-2) {
      onExit();
      return true;
    }
    return true;
  }

  let shakeX = 0, shakeY = 0, shakeFrm = 0;
  function shakeAnim() {
    shakeFrm = 6;
    const loop = () => {
      if (shakeFrm-- <= 0) { shakeX = shakeY = 0; draw(); return; }
      shakeX = (Math.random()-0.5)*8;
      shakeY = (Math.random()-0.5)*8;
      draw();
      requestAnimationFrame(loop);
    };
    requestAnimationFrame(loop);
  }

  function updateHUD() {
    const sc = document.getElementById('mazeStepCount');
    if (sc) sc.textContent = `이동: ${stepCount}`;
    const hp = document.getElementById('mazeHp');
    const echo = document.getElementById('mazeEcho');
    if (hp) hp.textContent = `${GS.player.hp}/${GS.player.maxHp}`;
    if (echo) echo.textContent = Math.floor(GS.player.echo);
  }

  function draw() {
    if (!ctx || !canvas) return;
    const cW = canvas.width, cH = canvas.height;
    // 중앙 정렬 오프셋 (플레이어 중심)
    const tW = TILE, tH = TILE;
    const offX = Math.round(cW/2 - (px + 0.5) * tW) + shakeX;
    const offY = Math.round(cH/2 - (py + 0.5) * tH) + shakeY;

    // 배경
    ctx.fillStyle = '#020210';
    ctx.fillRect(0, 0, cW, cH);

    FovEngine.computeFov(px, py, 6);
    const revealed = FovEngine.getRevealed ? FovEngine.getRevealed() : null;
    const visible  = FovEngine.getVisible  ? FovEngine.getVisible()  : null;

    // 타일 렌더링
    for (let y = 0; y < H; y++) {
      for (let x = 0; x < W; x++) {
        const tx = offX + x * tW, ty = offY + y * tH;
        // 화면 밖 컬링
        if (tx + tW < 0 || tx > cW || ty + tH < 0 || ty > cH) continue;

        const key = `${x},${y}`;
        const isVis = !visible  || visible.has(key);
        const isRev = !revealed || revealed.has(key);
        if (!isRev && !isVis) continue;

        const alpha = isVis ? 1 : 0.3;
        const isWall = map[y][x] === 1;
        const isExit = x >= W-2 && y >= H-2;
        const isPlayer = x === px && y === py;

        ctx.save();
        ctx.globalAlpha = alpha;

        if (isWall) {
          // 벽
          ctx.fillStyle = '#0d0830';
          ctx.fillRect(tx, ty, tW, tH);
          if (isVis) {
            ctx.strokeStyle = 'rgba(80,40,180,0.5)';
            ctx.lineWidth = 1;
            ctx.strokeRect(tx+0.5, ty+0.5, tW-1, tH-1);
            // 벽 패턴 (돌 느낌)
            ctx.fillStyle = 'rgba(60,30,120,0.3)';
            ctx.fillRect(tx+2, ty+2, tW/2-3, tH/2-3);
            ctx.fillRect(tx+tW/2+1, ty+tH/2+1, tW/2-3, tH/2-3);
          }
        } else {
          // 바닥
          ctx.fillStyle = isExit ? '#0a1a1a' : '#080520';
          ctx.fillRect(tx, ty, tW, tH);
          if (isVis) {
            // 바닥 타일 테두리
            ctx.strokeStyle = isExit ? 'rgba(0,255,204,0.15)' : 'rgba(60,40,120,0.2)';
            ctx.lineWidth = 0.5;
            ctx.strokeRect(tx+0.5, ty+0.5, tW-1, tH-1);
          }
          // 출구 강조
          if (isExit && isVis) {
            const pulse = 0.3 + 0.2*Math.sin(Date.now()*0.003);
            const g = ctx.createRadialGradient(tx+tW/2, ty+tH/2, 0, tx+tW/2, ty+tH/2, tW*0.8);
            g.addColorStop(0, `rgba(0,255,204,${pulse})`);
            g.addColorStop(1, 'transparent');
            ctx.fillStyle = g;
            ctx.fillRect(tx-2, ty-2, tW+4, tH+4);
          }
        }

        ctx.restore();
      }
    }

    // 출구 아이콘
    const exitTX = offX + (W-2) * tW, exitTY = offY + (H-2) * tH;
    if (exitTX > -tW && exitTX < cW) {
      ctx.save();
      ctx.font = `${tW*0.7}px serif`;
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.globalAlpha = 0.5 + 0.5*Math.sin(Date.now()*0.003);
      ctx.fillText('🚪', exitTX + tW, exitTY + tH);
      ctx.restore();
    }

    // 플레이어 (중앙)
    const playerX = offX + px * tW + tW/2;
    const playerY = offY + py * tH + tH/2;
    // 플레이어 글로우
    ctx.save();
    const glowR = tW * 1.2;
    const glow = ctx.createRadialGradient(playerX, playerY, 0, playerX, playerY, glowR);
    glow.addColorStop(0, 'rgba(0,255,204,0.18)');
    glow.addColorStop(1, 'transparent');
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(playerX, playerY, glowR, 0, Math.PI*2);
    ctx.fill();
    // 플레이어 아이콘
    ctx.font = `${tW*0.65}px serif`;
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.shadowColor = 'rgba(0,255,204,0.9)';
    ctx.shadowBlur = 16;
    ctx.fillText('🧙', playerX, playerY);
    ctx.restore();

    // 미니맵 렌더링
    drawMinimap();

    // 주기적으로 재드로우 (출구 펄스 애니메이션용)
    requestAnimationFrame(() => {
      if (fovActive) draw();
    });
  }

  function drawMinimap() {
    if (!mmCtx || !minimap) return;
    const mW = minimap.width, mH = minimap.height;
    const tS = Math.min(mW/W, mH/H);
    mmCtx.fillStyle = '#020210';
    mmCtx.fillRect(0, 0, mW, mH);
    const offX = (mW - W*tS)/2, offY = (mH - H*tS)/2;
    for (let y = 0; y < H; y++) {
      for (let x = 0; x < W; x++) {
        if (x === px && y === py) mmCtx.fillStyle = 'rgba(0,255,204,1)';
        else if (x >= W-2 && y >= H-2) mmCtx.fillStyle = 'rgba(255,200,0,0.9)';
        else if (map[y][x] === 0) mmCtx.fillStyle = 'rgba(80,60,180,0.7)';
        else mmCtx.fillStyle = 'rgba(10,5,30,0.9)';
        mmCtx.fillRect(offX + x*tS, offY + y*tS, tS, tS);
      }
    }
    // 플레이어 강조 점
    mmCtx.fillStyle = '#00ffcc';
    mmCtx.beginPath();
    mmCtx.arc(offX + (px+0.5)*tS, offY + (py+0.5)*tS, Math.max(1.5, tS*0.6), 0, Math.PI*2);
    mmCtx.fill();
  }

  function onExit() {
    close();
    showWorldMemoryNotice('🚪 출구 발견! 전투가 시작된다...');
    setTimeout(() => {
      startCombat(pendingCombat === 'boss');
    }, 800);
  }

  return { open, close, move, init };
})();

function initTitleCanvas() {
  titleCanvas = document.getElementById('titleCanvas');
  if (!titleCanvas) return;
  titleCtx = titleCanvas.getContext('2d');
  resizeTitleCanvas();
  window.addEventListener('resize', resizeTitleCanvas);
  // 크기가 0이면 재시도
  if (titleCanvas.width === 0 || titleCanvas.height === 0) {
    setTimeout(() => { resizeTitleCanvas(); animateTitle(); }, 100);
  } else {
    animateTitle();
  }
}

function resizeTitleCanvas() {
  if (!titleCanvas) return;
  titleCanvas.width  = window.innerWidth  || 1280;
  titleCanvas.height = window.innerHeight || 720;
}

// 타이틀 파티클
const titleStars = Array.from({length:200}, () => ({
  x: Math.random(), y: Math.random(),
  r: Math.random()*2+0.5, v: Math.random()*0.0003+0.0001,
  alpha: Math.random()*0.8+0.2,
}));
const titleParticles = Array.from({length:40}, () => ({
  x: Math.random(), y: Math.random(),
  vx: (Math.random()-0.5)*0.0005, vy: (Math.random()-0.5)*0.0005,
  r: Math.random()*40+10, alpha: Math.random()*0.06+0.01,
}));
let titleRAF;

function animateTitle() {
  if (!titleCtx) return;
  cancelAnimationFrame(titleRAF);
  const tick = () => {
    const w = titleCanvas.width, h = titleCanvas.height;
    titleCtx.fillStyle = 'rgba(3,3,10,0.15)';
    titleCtx.fillRect(0, 0, w, h);
    // 성운
    titleParticles.forEach(p => {
      p.x += p.vx; p.y += p.vy;
      if (p.x<-0.1) p.x=1.1; if (p.x>1.1) p.x=-0.1;
      if (p.y<-0.1) p.y=1.1; if (p.y>1.1) p.y=-0.1;
      const g = titleCtx.createRadialGradient(p.x*w,p.y*h,0,p.x*w,p.y*h,p.r*(w/800));
      g.addColorStop(0,`rgba(123,47,255,${p.alpha})`);
      g.addColorStop(0.5,`rgba(0,255,204,${p.alpha*0.3})`);
      g.addColorStop(1,'transparent');
      titleCtx.fillStyle = g;
      titleCtx.beginPath();
      titleCtx.arc(p.x*w, p.y*h, p.r*(w/800), 0, Math.PI*2);
      titleCtx.fill();
    });
    // 별
    titleStars.forEach(s => {
      s.y -= s.v; if (s.y < -0.01) s.y = 1;
      titleCtx.save();
      titleCtx.globalAlpha = s.alpha * (0.5 + 0.5*Math.sin(Date.now()*0.001+s.x*10));
      titleCtx.fillStyle = '#eef0ff';
      titleCtx.beginPath();
      titleCtx.arc(s.x*w, s.y*h, s.r, 0, Math.PI*2);
      titleCtx.fill();
      titleCtx.restore();
    });
    titleRAF = requestAnimationFrame(tick);
  };
  tick();
}

function initGameCanvas() {
  gameCanvas = document.getElementById('gameCanvas');
  if (!gameCanvas) return;
  gameCtx = gameCanvas.getContext('2d');

  // 노드 선택은 DOM 카드 오버레이에서 처리
  minimapCanvas = document.getElementById('minimapCanvas');
  minimapCtx = minimapCanvas?.getContext('2d');
  if (minimapCanvas && !minimapCanvas._mapOpenPatched) {
    minimapCanvas._mapOpenPatched = true;
    minimapCanvas.style.cursor = 'pointer';
    minimapCanvas.title = '클릭하여 지도 열기';
    minimapCanvas.addEventListener('click', () => {
      if (GS.currentScreen !== 'game') return;
      if (GS.combat.active) return;
      showMapOverlay();
    });
  }
  combatCanvas = gameCanvas;
  ParticleSystem.init(gameCanvas);
  resizeGameCanvas();
  window.addEventListener('resize', resizeGameCanvas);
}

function resizeGameCanvas() {
  if (!gameCanvas) return;
  const rect = gameCanvas.getBoundingClientRect();
  gameCanvas.width  = Math.max(rect.width  || gameCanvas.offsetWidth  || 0, 600);
  gameCanvas.height = Math.max(rect.height || gameCanvas.offsetHeight || 0, 400);
  // 리사이즈 관찰 (반응형)
  if (window.ResizeObserver && !gameCanvas._resizeObserver) {
    const ro = new ResizeObserver(() => {
      const r = gameCanvas.getBoundingClientRect();
      if (r.width > 0) { gameCanvas.width = r.width; gameCanvas.height = r.height; }
    });
    ro.observe(gameCanvas);
    gameCanvas._resizeObserver = ro;
  }
  minimapCanvas.width = minimapCanvas.offsetWidth || 200;
  minimapCanvas.height = 160;
}

// ────────────────────────────────────────
// GAME LOOP — 단일 통합 루프
// ────────────────────────────────────────
let lastTimestamp = 0;
function gameLoop(timestamp) {
  if (!gameCtx || GS.currentScreen !== 'game') {
    requestAnimationFrame(gameLoop); return;
  }
  if (HitStop.active()) { HitStop.update(); requestAnimationFrame(gameLoop); return; }
  const dt = Math.min((timestamp - lastTimestamp) / 1000, 0.05);
  lastTimestamp = timestamp;

  ScreenShake.update();
  gameCtx.save();
  gameCtx.clearRect(0, 0, gameCanvas.width, gameCanvas.height);
  ScreenShake.apply(gameCtx);
  renderGameWorld(dt, gameCtx, gameCanvas.width, gameCanvas.height);
  ParticleSystem.update();
  gameCtx.restore();
  renderMinimap();
  requestAnimationFrame(gameLoop);
}

function renderGameWorld(dt, ctx, w, h) {
  // 배경
  const bg = ctx.createLinearGradient(0, 0, 0, h);
  bg.addColorStop(0, '#03030a');
  bg.addColorStop(1, '#07071a');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, w, h);

  // 지역별 특수 렌더링 (미궁은 별도 오버레이 사용)
  renderRegionBackground(ctx, w, h);

  // 동적 광원 (전투 중)
  if (GS.combat.active) {
    renderDynamicLights(ctx, w, h);
  }

  // 현재 노드 정보
  if (GS.currentNode) {
    renderNodeInfo(ctx, w, h);
  }
}

function renderRegionBackground(ctx, w, h) {
  const region = getRegionData(GS.currentRegion, GS) || {};
  const accent = region.accent || '#7b2fff';
  // 배경 격자 패턴
  ctx.save();
  ctx.strokeStyle = 'rgba(123,47,255,0.04)';
  ctx.lineWidth = 1;
  const gs = 40;
  for (let x=0;x<w;x+=gs){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,h);ctx.stroke();}
  for (let y=0;y<h;y+=gs){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(w,y);ctx.stroke();}
  // 지역 색상 오버레이
  const glow = ctx.createRadialGradient(w/2,h/2,0,w/2,h/2,Math.max(w,h)*0.6);
  glow.addColorStop(0,accent+'08'); glow.addColorStop(1,'transparent');
  ctx.fillStyle = glow;
  ctx.fillRect(0,0,w,h);
  ctx.restore();
}

function renderDynamicLights(ctx, w, h) {
  const t = Date.now() * 0.001;
  GS.combat.enemies.forEach((e,i) => {
    if (e.hp <= 0) return;
    const ex = w/2 + (i-(GS.combat.enemies.length/2-0.5))*200;
    const ey = h*0.35;
    const pulse = 0.5 + 0.5*Math.sin(t + i*Math.PI);
    const glow = ctx.createRadialGradient(ex,ey,0,ex,ey,80+pulse*20);
    const region = getRegionData(GS.currentRegion, GS) || {};
    glow.addColorStop(0,(region.accent||'#7b2fff')+'22');
    glow.addColorStop(1,'transparent');
    ctx.fillStyle = glow;
    ctx.beginPath();
    ctx.arc(ex,ey,80+pulse*20,0,Math.PI*2);
    ctx.fill();
  });
  // Echo 체인 테두리
  if (GS.player.echoChain > 0) {
    const pct = GS.player.echoChain / 5;
    ctx.save();
    ctx.strokeStyle = `rgba(0,255,204,${pct*0.3})`;
    ctx.lineWidth = 2+pct*4;
    ctx.strokeRect(2,2,w-4,h-4);
    ctx.restore();
  }
}

// ── 노드 타입별 메타 ──
const NODE_META = {
  combat: { icon:'⚔️', label:'전투',   color:'#cc2244', glow:'rgba(204,34,68,',   desc:'일반 적과 싸워 카드를 획득한다' },
  elite:  { icon:'⭐', label:'정예',   color:'#d4a017', glow:'rgba(212,160,23,',  desc:'위험한 정예 몬스터. 희귀 보상 확정' },
  boss:   { icon:'💀', label:'보스',   color:'#7b2fff', glow:'rgba(123,47,255,',  desc:'지역 보스. 처치하면 새 지역이 열린다' },
  event:  { icon:'🎭', label:'이벤트', color:'#0099cc', glow:'rgba(0,153,204,',   desc:'선택지에 따라 좋을 수도, 나쁠 수도' },
  shop:   { icon:'🏪', label:'상점',   color:'#00cc88', glow:'rgba(0,204,136,',   desc:'골드로 카드·유물을 구입한다' },
  rest:   { icon:'🔥', label:'휴식',   color:'#cc5500', glow:'rgba(204,85,0,',    desc:'체력을 회복하거나 카드를 강화한다' },
};

function _getWorldCanvasUIDeps() {
  return {
    gs: GS,
    getRegionData,
  };
}

function renderNodeInfo(ctx, w, h) {
  window.WorldCanvasUI?.renderNodeInfo?.(ctx, w, h, _getWorldCanvasUIDeps());
}


// ── 지역/층별 상태 문구 헬퍼 ──
function getFloorStatusText(regionId, floor) {
  return window.WorldCanvasUI?.getFloorStatusText?.(regionId, floor, _getWorldCanvasUIDeps()) || '';
}

// 캔버스 텍스트 줄바꿈 헬퍼
function wrapCanvasText(ctx, text, x, y, maxW, lineH) {
  window.WorldCanvasUI?.wrapCanvasText?.(ctx, text, x, y, maxW, lineH);
}

// 캔버스 둥근 사각형
function roundRect(ctx, x, y, w, h, r) {
  window.WorldCanvasUI?.roundRect?.(ctx, x, y, w, h, r);
}
function roundRectTop(ctx, x, y, w, h, r) {
  window.WorldCanvasUI?.roundRectTop?.(ctx, x, y, w, h, r);
}

// ────────────────────────────────────────
// MAP SYSTEM
// ────────────────────────────────────────
function generateMap(regionIdx) {
  const region = getRegionData(regionIdx, GS);
  if (!region) return;
  GS.mapNodes = [];
  GS.currentNode = null;

  // 층별 노드 타입 가중치: 정예는 중반 이후 등장
  // 각 층에서 노드 2~3개, 보스층은 1개
  for (let floor = 1; floor <= region.floors; floor++) {
    const isBossFloor = floor === region.floors;
    const isLateGame  = floor >= Math.ceil(region.floors * 0.5);
    const count = isBossFloor ? 1 : Math.random() < 0.5 ? 2 : 3;

    // 이 층에서 정예를 넣을지 결정 (중반 이후, 30% 확률, 노드 여러 개일 때)
    let eliteAssigned = false;

    for (let i = 0; i < count; i++) {
      let type;
      if (isBossFloor) {
        type = 'boss';
      } else if (floor === 1) {
        type = 'combat'; // 첫 층은 항상 전투
      } else if (!eliteAssigned && isLateGame && count > 1 && Math.random() < 0.35) {
        type = 'elite';
        eliteAssigned = true;
      } else {
        // 가중치 풀: 전투 많고, 정예/이벤트/상점/휴식 골고루
        const pool = ['combat','combat','combat','event','shop','rest'];
        type = pool[Math.floor(Math.random() * pool.length)];
      }
      GS.mapNodes.push({
        id: `${floor}-${i}`,
        floor, pos: i, total: count,
        type, visited: false,
        accessible: floor === 1,
      });
    }
  }

  GS.currentFloor = 0;
  updateNextNodes();
  renderMapOverlay();
  updateUI();
  // 지역 진입 첫 화면 분위기 문구
  const _entryRegion = getRegionData(regionIdx, GS);
  if (_entryRegion?.quote) {
    setTimeout(() => showWorldMemoryNotice(_entryRegion.quote), 600);
  }
}

function _getMapUIDeps() {
  return {
    gs: GS,
    doc: document,
    mapCanvasId: 'mapCanvas',
    minimapCanvas,
    minimapCtx,
    nodeMeta: NODE_META,
    getFloorStatusText,
    renderMapOverlay: () => renderMapOverlay(),
    moveToNodeHandlerName: 'moveToNode',
    closeMapOverlay: () => closeMapOverlay(),
  };
}

function renderMapOverlay() {
  window.MapUI?.renderMapOverlay?.(_getMapUIDeps());
}

function renderMinimap() {
  window.MapUI?.renderMinimap?.(_getMapUIDeps());
}

function updateNextNodes() {
  window.MapUI?.updateNextNodes?.(_getMapUIDeps());
}

function isNodeAccessible(node) {
  if (node.floor !== GS.currentFloor + 1) return false;
  return true;
}

function handleMapClick(event) {
  window.MapUI?.handleMapClick?.(event, _getMapUIDeps());
}

function moveToNode(node) {
  if (typeof node === 'string') node = GS.mapNodes.find(n => n.id === node);
  if (!node || !node.accessible || node.visited) return;
  if (GS._nodeMoveLock) return;
  GS._nodeMoveLock = true;
  // 노드 카드 즉시 비활성화
  const overlay = document.getElementById('nodeCardOverlay');
  if (overlay) overlay.style.pointerEvents = 'none';

  node.visited = true;
  GS.currentNode = node;
  GS.currentFloor = node.floor;

  // 잔향검사 모멘텀 (이동 시 강화)
  if (GS.player.class === 'swordsman') {
    ClassMechanics.swordsman.onMove();
  }

  // 다음 층 노드 접근 가능하게
  GS.mapNodes.filter(n => n.floor === node.floor+1).forEach(n => n.accessible = true);

  AudioEngine.playFootstep();
  updateNextNodes();
  renderMapOverlay();
  renderMinimap();
  updateUI();

  // region 2 (기억의 미궁)도 일반 노드와 동일하게 처리
  setTimeout(() => {
    GS._nodeMoveLock = false;
    switch (node.type) {
      case 'combat': startCombat(false); break;
      case 'elite':  startCombat(false); break;
      case 'boss':   startCombat(true);  break;
      case 'event':  triggerRandomEvent(); break;
      case 'shop':   showShop(); break;
      case 'rest':   showRestSite(); break;
    }
  }, 300);
}

// ────────────────────────────────────────
// COMBAT SYSTEM
// ────────────────────────────────────────
function startCombat(isBoss=false) {
  const gs = GS;
  const region = getRegionData(gs.currentRegion, gs);
  if (!region) return;

  gs.combat.enemies = [];
  gs.combat.turn = 0;
  gs.combat.playerTurn = true;
  gs.combat.log = [];
  gs.player.shield = 0;
  gs.player.echoChain = 0;
  gs.player.energy = gs.player.maxEnergy;
  gs.combat.active = true;
  gs._endCombatScheduled = false;
  gs._endCombatRunning   = false;
  gs._selectedTarget = null;
  // 전투 시작 스탯 스냅샷 (종료 후 델타 계산용)
  gs._combatStartDmg = gs.stats.damageDealt;
  gs._combatStartTaken = gs.stats.damageTaken;
  gs._combatStartKills = gs.player.kills;

  if (isBoss) {
    // 히든 보스 조건: 최종 지역 + 상인 구출 + 스토리 5개 이상
    const isHiddenEligible = getBaseRegionIndex(GS.currentRegion) === Math.max(0, getRegionCount() - 1) &&
      (GS.worldMemory.savedMerchant||0) >= 1 &&
      GS.meta.storyPieces.length >= 5;
    let bossKey = region.boss || 'ancient_echo';
    if (isHiddenEligible) {
      bossKey = 'echo_origin';
      setTimeout(() => showWorldMemoryNotice('🌟 세계가 기억한다 — 숨겨진 근원이 깨어났다!'), 600);
    }
    const bossData = DATA.enemies[bossKey] || DATA.enemies['ancient_echo'];
    gs.combat.enemies.push(DifficultyScaler.scaleEnemy({...bossData, statusEffects:{}, phase:1}));
    if (gs.meta.codex) gs.meta.codex.enemies.add(bossKey); // 도감 등록
    AudioEngine.playBossPhase();
    gs.triggerItems('boss_start');
  } else {
    const isEliteNode = gs.currentNode?.type === 'elite';
    if (isEliteNode && region.elites?.length) {
      // 정예 노드: 정예 몬스터 1체
      const eKey = region.elites[Math.floor(Math.random()*region.elites.length)];
      if (DATA.enemies[eKey]) {
        gs.combat.enemies.push(DifficultyScaler.scaleEnemy({...DATA.enemies[eKey],statusEffects:{}}));
        if (gs.meta.codex) gs.meta.codex.enemies.add(eKey);
      }
    } else {
      // 일반 노드
      const count = gs.currentFloor <= 1 ? 1 : Math.random() < 0.4 ? 2 : 1;
      for (let i=0;i<count;i++) {
        const eKey = region.enemies[Math.floor(Math.random()*region.enemies.length)];
        if (DATA.enemies[eKey]) {
          gs.combat.enemies.push(DifficultyScaler.scaleEnemy({...DATA.enemies[eKey],statusEffects:{}}));
          if (gs.meta.codex) gs.meta.codex.enemies.add(eKey);
        }
      }
    }
  }

  // 기억의 미궁 — 왜곡된 기억 (무작위 경미한 디버프)
  if (getBaseRegionIndex(gs.currentRegion) === 2) {
    const memoryDebuffs = ['weakened','burning','confusion'];
    const debuff = memoryDebuffs[Math.floor(Math.random()*memoryDebuffs.length)];
    if (Math.random() < 0.5) { // 50% 확률
      gs.player.buffs[debuff] = {stacks:1};
      gs.addLog(`👁️ 왜곡된 기억: ${debuff} 부여!`, 'damage');
    }
  }

  // 신의 무덤 — 강제 디버프
  if (getBaseRegionIndex(gs.currentRegion) === 3) {
    const debuffs = ['weakened','slowed','burning'];
    const debuff = debuffs[Math.floor(Math.random()*debuffs.length)];
    gs.player.buffs[debuff] = {stacks:2};
    gs.addLog(`⚠️ 신의 무덤: ${debuff} 부여!`, 'damage');
  }

  // 메아리술사 전투 시작
  if (gs.player.class === 'mage') ClassMechanics.mage.onCombatStart(gs);

  RunRules.onCombatStart(gs);
  gs.triggerItems('combat_start');
  gs.drawCards(5);

  // 이전 전투의 적 카드가 남아있으면 전체 재렌더를 위해 초기화
  const _zone = document.getElementById('enemyZone');
  if (_zone) _zone.innerHTML = '';

  // 이전 화면 완전 정리
  document.getElementById('nodeCardOverlay').style.display = 'none';
  document.getElementById('mapOverlay')?.classList.remove('active');
  document.getElementById('eventModal').classList.remove('active');
  document.getElementById('eventModal').style.display = '';

  // 전투 시작 시 첫 번째 살아있는 적 자동 타겟 지정
  const firstAlive = gs.combat.enemies.findIndex(e => e.hp > 0);
  gs._selectedTarget = firstAlive >= 0 ? firstAlive : null;
  updateChainUI(gs.player.echoChain);

  renderCombatEnemies();
  renderCombatCards();
  updateCombatLog();
  gs.addLog('⚔️ 전투 시작!', 'system');
  updateNoiseWidget();
  document.getElementById('combatOverlay').classList.add('active');
  setTimeout(() => showTurnBanner('player'), 300);
  // 전투 정보 패널 초기화 (닫힌 상태로 시작)
  _resetCombatInfoPanel();
  _refreshCombatInfoPanel();
  updateUI();
  updateClassSpecialUI();
}

function _getCombatHudUIDeps() {
  return {
    gs: GS,
    data: DATA,
    doc: document,
    win: window,
    classMechanics: ClassMechanics,
    getBaseRegionIndex,
  };
}

// Echo 스킬 툴팁
// ── HUD 핀/언핀 토글 ──
function toggleHudPin() {
  window.CombatHudUI?.toggleHudPin?.(_getCombatHudUIDeps());
}
window.toggleHudPin = toggleHudPin;

function showEchoSkillTooltip(event) {
  window.CombatHudUI?.showEchoSkillTooltip?.(event, _getCombatHudUIDeps());
}
function hideEchoSkillTooltip() {
  window.CombatHudUI?.hideEchoSkillTooltip?.(_getCombatHudUIDeps());
}

// 턴 전환 중앙 배너
function showTurnBanner(type) {
  window.CombatHudUI?.showTurnBanner?.(type, _getCombatHudUIDeps());
}

function _getCombatUIDeps() {
  return {
    gs: GS,
    data: DATA,
    doc: document,
    win: window,
    selectTargetHandlerName: 'selectTarget',
    showIntentTooltipHandlerName: 'showIntentTooltip',
    hideIntentTooltipHandlerName: 'hideIntentTooltip',
  };
}

function showIntentTooltip(event, enemyIdx) {
  window.CombatUI?.showIntentTooltip?.(event, enemyIdx, _getCombatUIDeps());
}

function hideIntentTooltip() {
  window.CombatUI?.hideIntentTooltip?.(_getCombatUIDeps());
}

window.showIntentTooltip = showIntentTooltip;
window.hideIntentTooltip = hideIntentTooltip;

function renderCombatEnemies() {
  window.CombatUI?.renderCombatEnemies?.(_getCombatUIDeps());
}

// 단일 적 HP만 빠르게 갱신 (공격 직후 호출용)
function updateEnemyHpUI(idx, enemy) {
  window.CombatUI?.updateEnemyHpUI?.(idx, enemy, _getCombatUIDeps());
}

function _getCardUIDeps() {
  return {
    gs: GS,
    data: DATA,
    doc: document,
    playCardHandlerName: 'GS.playCard',
    dragStartHandlerName: 'handleCardDragStart',
    dragEndHandlerName: 'handleCardDragEnd',
    showTooltipHandlerName: 'showTooltip',
    hideTooltipHandlerName: 'hideTooltip',
  };
}

function getCardTypeClass(type) {
  return window.CardUI?.getCardTypeClass?.(type) || '';
}
function getCardTypeLabelClass(type) {
  return window.CardUI?.getCardTypeLabelClass?.(type) || '';
}

function renderCombatCards() {
  window.CardUI?.renderCombatCards?.(_getCardUIDeps());
}

function updateHandFanEffect() {
  window.CardUI?.updateHandFanEffect?.(_getCardUIDeps());
}

function renderHand() {
  const zone = document.getElementById('handCards');
  if (!zone) return;
  zone.innerHTML = GS.player.hand.map((cardId,i) => {
    const card = DATA.cards[cardId];
    if (!card) return '';
    return `
      <div class="card" onclick="GS.playCard('${cardId}',${i});renderCombatCards();" title="${card.desc}">
        <div class="card-cost">${card.cost}</div>
        <div class="card-icon">${card.icon}</div>
        <div class="card-name">${card.name}</div>
        <div class="card-desc">${card.desc}</div>
        <div class="card-type">${card.type}</div>
      </div>
    `;
  }).join('');
}

function updateCombatLog() {
  window.CombatHudUI?.updateCombatLog?.(_getCombatHudUIDeps());
}

function updateEchoSkillBtn() {
  window.CombatHudUI?.updateEchoSkillBtn?.(_getCombatHudUIDeps());
}

function useEchoSkill() {
  const gs = GS;
  const echoVal = gs.player.echo;
  // 충전 단계 결정
  let tier, cost;
  if (echoVal >= 100) { tier = 3; cost = 100; }
  else if (echoVal >= 60) { tier = 2; cost = 60; }
  else if (echoVal >= 30) { tier = 1; cost = 30; }
  else { gs.addLog('⚠️ Echo 게이지 부족! (30 필요)', 'damage'); return; }

  gs.drainEcho(cost);
  gs.triggerItems('echo_skill', {cost}); // 잔향 팔찌 세트 효과 트리거

  const cls = gs.player.class;
  if (cls === 'swordsman') {
    if (tier === 3) { gs.dealDamageAll(40); gs.addShield(20); gs.addLog('⚔️ 잔향 폭발! 전체 40 + 방어막 20','echo'); }
    else if (tier === 2) { gs.dealDamage(30); gs.addShield(12); gs.addLog('⚔️ 잔향 강타! 30 + 방어막 12','echo'); }
    else { gs.dealDamage(20); gs.addShield(8); gs.addLog('⚔️ Echo 스킬! 20 + 방어막 8','echo'); }
  } else if (cls === 'mage') {
    if (tier === 3) { gs.dealDamageAll(30); gs.addEcho(30); gs.drawCards(3); gs.addLog('🔮 비전 폭풍! 전체 30 + Echo 30 + 드로우 3','echo'); }
    else if (tier === 2) { gs.dealDamageAll(18); gs.addEcho(15); gs.drawCards(2); gs.addLog('🔮 잔향파! 전체 18 + 드로우 2','echo'); }
    else { gs.applyEnemyStatus('weakened',2); gs.drawCards(1); gs.addLog('🔮 예지! 약화 2턴 + 드로우 1','echo'); }
  } else { // hunter
    if (tier === 3) { gs.dealDamage(50); gs.addBuff('vanish',2,{}); gs.addLog('🗡️ 암살! 50 피해 + 은신 2턴','echo'); }
    else if (tier === 2) { gs.dealDamage(32); gs.addBuff('vanish',1,{}); gs.addLog('🗡️ 기습! 32 + 은신','echo'); }
    else { gs.dealDamage(20); gs.addLog('🗡️ 숨격! 20 피해','echo'); }
  }
  showEchoBurstOverlay();
  AudioEngine.playResonanceBurst();
  renderCombatEnemies(); renderCombatCards();
  // Echo 스킬 사용 후 버튼 쿨다운 시각 피드백
  const echoBtn2 = document.getElementById('echoSkillBtn');
  if (echoBtn2) {
    echoBtn2.style.transition = 'opacity 0.2s, background 0.2s';
    echoBtn2.style.background = 'linear-gradient(135deg,rgba(0,255,204,0.2),rgba(123,47,255,0.2))';
    setTimeout(() => { echoBtn2.style.background = ''; }, 800);
  }
}

function sortHandByEnergy() {
  if (!GS.combat.active || !GS.combat.playerTurn) return;
  GS.player.hand.sort((a, b) => {
    const ca = DATA.cards[a], cb = DATA.cards[b];
    if (!ca || !cb) return 0;
    return (ca.cost||0) - (cb.cost||0);
  });
  renderCombatCards();
  GS.addLog('🃏 손패를 비용 순으로 정렬했다', 'system');
}
window.sortHandByEnergy = sortHandByEnergy;

function drawCard() {
  const gs = GS;
  const MAX_HAND = 8;
  if (!gs.combat.active || !gs.combat.playerTurn) return;
  if (gs.player.hand.length >= MAX_HAND) {
    gs.addLog(`⚠️ 손패가 가득 찼습니다 (최대 ${MAX_HAND}장)`, 'damage');
    const btn = document.getElementById('drawCardBtn');
    if (btn) {
      btn.style.animation = 'none';
      requestAnimationFrame(() => { btn.style.animation = 'shake 0.3s ease'; });
    }
    updateUI();
    return;
  }
  if (gs.player.energy < 1) {
    gs.addLog('⚠️ 에너지 부족! (카드 뽑기: 1 에너지)', 'damage');
    // 에너지 오브 흔들기
    const orbs = document.getElementById('energyOrbs');
    if (orbs) { orbs.style.animation='none'; requestAnimationFrame(()=>{ orbs.style.animation='shake 0.3s ease'; }); }
    AudioEngine.playHit();
    return;
  }
  gs.player.energy -= 1;
  gs.drawCards(1);
  updateUI();
  renderCombatCards();
}

function endPlayerTurn() {
  const gs = GS;
  if (!gs.combat.playerTurn) return;

  // 손패에 플레이 가능한 카드가 남아있으면 경고 로그 (0장이면 생략)
  if (gs.player.hand.length > 0) {
    const playable = gs.player.hand.filter(id => {
      const c = DATA.cards[id]; if (!c) return false;
      const cost = gs.player.zeroCost ? 0 : Math.max(0, c.cost - (gs.player.costDiscount||0));
      return gs.player.energy >= cost;
    });
    if (playable.length > 0) {
      gs.addLog(`💡 사용 가능한 카드 ${playable.length}장을 남기고 턴 종료`, 'system');
    }
  }

  // 버프 처리 (턴 종료)
  Object.keys(gs.player.buffs).forEach(buffId => {
    const buff = gs.player.buffs[buffId];
    if (buff.echoRegen) gs.addEcho(buff.echoRegen);
    buff.stacks--;
    if (buff.stacks <= 0) delete gs.player.buffs[buffId];
  });

  // 침묵사냥꾼: 소음 자연 감소
  if (gs.player.class === 'hunter' && gs.player.silenceGauge > 0) {
    gs.player.silenceGauge = Math.max(0, gs.player.silenceGauge - 1);
  }

  gs.player.graveyard.push(...gs.player.hand);
  gs.player.hand = [];
  gs.player.echoChain = 0;
  gs.player.zeroCost = false;
  gs.player.costDiscount = 0; // 턴 종료 시 비용 할인 초기화
  gs.player._cascadeCards = null; // 잔향 폭포 무료화 초기화
  updateChainUI(0);

  gs.combat.playerTurn = false;
  const ti = document.getElementById('turnIndicator');
  ti.className = 'turn-indicator turn-enemy'; ti.textContent = '적의 턴';
  showTurnBanner('enemy');
  // 적 턴 중 버튼 비활성화
  document.querySelectorAll('.action-btn').forEach(b => b.disabled = true);

  setTimeout(enemyTurn, 700);
}

function enemyTurn() {
  const gs = GS;
  gs.combat.turn++;

  // 상태 이상 틱 (독, 표식, 반사)
  processEnemyStatusTicks();

  gs.combat.enemies.forEach((enemy, i) => {
    if (enemy.hp <= 0) return;
    // 기절
    if (enemy.statusEffects?.stunned > 0) {
      enemy.statusEffects.stunned--;
      gs.addLog(`🌀 ${enemy.name}: 기절 상태!`, 'echo');
      return;
    }

    let action;
    try { action = enemy.ai(gs.combat.turn); }
    catch(e) { action = {type:'strike', intent:`공격 ${enemy.atk}`, dmg:enemy.atk}; }

    if (action.type === 'phase_shift' || action.effect === 'phase_shift') {
      handleBossPhaseShift(enemy, i);
    } else if (action.dmg > 0) {
      let dmg = action.dmg;
      if (enemy.statusEffects?.weakened > 0) {
        dmg = Math.floor(dmg * 0.5);
        enemy.statusEffects.weakened--;
        gs.addLog(`💫 ${enemy.name}: 약화 (피해 감소)`, 'echo');
      }
      gs.takeDamage(dmg);
      gs.addLog(`💢 ${enemy.name}: ${action.intent}`, 'damage');
      const sprite = document.getElementById(`enemy_sprite_${i}`);
      const card = document.getElementById(`enemy_${i}`);
      if (card) { card.classList.add('hit'); setTimeout(()=>card.classList.remove('hit'),400); }
    }

    // 특수 효과
    handleEnemyEffect(action.effect, enemy, i);
    renderCombatEnemies();
  });

  // 플레이어 턴 복구
  setTimeout(() => {
    if (!gs.combat.active) return;
    gs.combat.playerTurn = true;
    gs.player.energy = gs.player.maxEnergy;
    gs.player.shield = 0;
    const ti = document.getElementById('turnIndicator');
    ti.className = 'turn-indicator turn-player'; ti.textContent = '플레이어 턴';
    showTurnBanner('player');
    // 플레이어 턴 버튼 강제 활성화 (침묵의 폭군 등 예외 상황 대비)
    document.querySelectorAll('.action-btn').forEach(b => { b.disabled = false; b.style.pointerEvents = ''; });
    gs.drawCards(5);
    renderCombatCards();
    gs.addLog('─── 새 턴 ───', 'system');
    RunRules.onTurnStart(gs);
    gs.triggerItems('turn_start');
    updateStatusDisplay();
    updateClassSpecialUI();
    updateUI();
  }, 800);
}

function processEnemyStatusTicks() {
  GS.combat.enemies.forEach((enemy,i) => {
    if (!enemy.statusEffects) return;
    if (enemy.hp <= 0) return;
    const se = enemy.statusEffects;
    const ex = window.innerWidth/2+(i-0.5)*200;
    // 독 (3 피해/턴)
    if (se.poisoned > 0) {
      const dmg = 3 + Math.floor((3 - se.poisoned) * 0.5); // 스택이 줄수록 피해도 감소
      enemy.hp = Math.max(0, enemy.hp-dmg);
      GS.addLog(`🐍 ${enemy.name}: 독 ${dmg}`, 'damage');
      showDmgPopup(dmg, ex, 200, '#44ff88');
      ParticleSystem.emit(ex,200,{count:5,color:'#00ff44',size:2,speed:2,life:0.5});
      se.poisoned--;
      if (se.poisoned<=0) delete se.poisoned;
      if (enemy.hp<=0) {
        GS.onEnemyDeath(enemy,i);
        return;
      }
    }
    // 화염 (5 피해/턴, 감소 없음)
    if (se.burning > 0) {
      const dmg = 5;
      enemy.hp = Math.max(0, enemy.hp-dmg);
      GS.addLog(`🔥 ${enemy.name}: 화염 ${dmg}`, 'damage');
      showDmgPopup(dmg, ex, 220, '#ff8844');
      ParticleSystem.emit(ex,180,{count:6,color:'#ff6600',size:3,speed:3,life:0.4});
      se.burning--;
      if (se.burning<=0) delete se.burning;
      if (enemy.hp<=0) {
        GS.onEnemyDeath(enemy,i);
        return;
      }
    }
    // 처형 표식
    if (se.marked !== undefined) {
      se.marked--;
      if (se.marked<=0) {
        const dmg = 30;
        enemy.hp = Math.max(0,enemy.hp-dmg);
        GS.addLog(`💢 ${enemy.name}: 처형 표식 폭발! ${dmg}!`, 'echo');
        showDmgPopup(dmg, ex, 200, '#ff2255');
        ScreenShake.shake(10,0.5);
        ParticleSystem.burstEffect(ex,200);
        AudioEngine.playChain(4);
        delete se.marked;
        if (enemy.hp<=0) {
          GS.onEnemyDeath(enemy,i);
          return;
        }
      }
    }
    // 반사
    if (GS.player.buffs.mirror && se.incoming>0) {
      const r = se.incoming;
      enemy.hp=Math.max(0,enemy.hp-r);
      GS.addLog(`🪞 반사! ${r} 피해`,'echo');
      delete GS.player.buffs.mirror; delete se.incoming;
      if (enemy.hp<=0) {
        GS.onEnemyDeath(enemy,i);
        return;
      }
    }
  });
  renderCombatEnemies();
}

function handleBossPhaseShift(enemy, idx) {
  const sprite = document.getElementById(`enemy_sprite_${idx}`);
  if (sprite) { sprite.style.animation='none'; setTimeout(()=>{sprite.style.animation='enemyHit 0.8s ease 3';},10); }
  ScreenShake.shake(15, 1.0);
  AudioEngine.playBossPhase();
  ParticleSystem.burstEffect(window.innerWidth/2+(idx-(GS.combat.enemies.length/2-0.5))*200, 220);
  // 페이즈 전환 시 플레이어 1턴 무적 부여
  GS.addBuff('immune', 1, {});
  GS.addLog('🛡️ 페이즈 전환: 1턴 무적!', 'echo');
  if (enemy.phase===2) {
    GS.addLog(`⚠️ ${enemy.name} 2페이즈 각성!`, 'echo');
    GS.player.buffs = { immune: {stacks:1} }; // 무적 유지하며 다른 버프만 제거
    GS.addLog('💀 다른 버프 해제!', 'damage');
  } else if (enemy.phase===3) {
    GS.addLog(`💀 ${enemy.name} 최종 페이즈!`, 'damage');
    enemy.atk = Math.floor(enemy.atk*1.3);
  }
  // 페이즈 전환 직후 적 카드 즉시 갱신
  setTimeout(() => { renderCombatEnemies(); updateStatusDisplay(); }, 50);
  showEchoBurstOverlay();
}

function handleEnemyEffect(effect, enemy, idx) {
  if (!effect) return;
  const gs = GS;
  const baseRegion = getBaseRegionIndex(gs.currentRegion);
  switch(effect) {
    case 'self_atk_up': enemy.atk+=3; gs.addLog(`💪 ${enemy.name}: 공격 강화 (+3)`,'system'); break;
    case 'self_shield': enemy.shield=(enemy.shield||0)+8; gs.addLog(`🛡️ ${enemy.name}: 방어막 8`,'system'); break;
    case 'self_shield_15': enemy.shield=(enemy.shield||0)+15; gs.addLog(`🛡️ ${enemy.name}: 신성 방어막 15`,'system'); break;
    case 'self_shield_20': enemy.shield=(enemy.shield||0)+20; gs.addLog(`🛡️ ${enemy.name}: 방어막 20`,'system'); break;
    case 'add_noise_5': if(baseRegion === 1){gs.addSilence(5);} break;
    case 'mass_debuff': {
      const debuffs=['weakened','slowed','burning'];
      debuffs.forEach(d=>{ gs.player.buffs[d]={stacks:1}; });
      gs.addLog('⚠️ 전체 디버프 부여!','damage');
      updateStatusDisplay();
    } break;
    case 'curse':
      gs.player.buffs['cursed']={stacks:2};
      gs.addLog(`💀 ${enemy.name}: 저주 부여!`,'damage');
      updateStatusDisplay();
      break;
    case 'drain_echo': gs.drainEcho(20); gs.addLog(`🌑 ${enemy.name}: Echo 흡수!`,'damage'); break;
    case 'nullify_echo': gs.player.echo=0; gs.player.echoChain=0; updateChainUI(0); gs.addLog('🌑 Echo 완전 무효화!','damage'); break;
    case 'add_noise': if(baseRegion === 1) gs.addSilence(3); break;
    case 'exhaust_card':
      if(gs.player.hand.length>0){const ci=Math.floor(Math.random()*gs.player.hand.length);const c=gs.player.hand.splice(ci,1)[0];gs.player.exhausted.push(c);gs.addLog(`💀 ${DATA.cards[c]?.name} 소각!`,'damage');renderCombatCards();}
      break;
    case 'drain_energy': gs.player.energy=Math.max(0,gs.player.energy-1); gs.addLog('⚡ 에너지 -1!','damage'); updateUI(); break;
    case 'drain_energy_2': gs.player.energy=Math.max(0,gs.player.energy-2); gs.addLog('⚡ 에너지 -2!','damage'); updateUI(); break;
    case 'drain_energy_all': gs.player.energy=0; gs.addLog('⚡ 에너지 완전 소진!','damage'); updateUI(); break;
    case 'confusion': shuffleArray(gs.player.hand); gs.addLog('🌀 카드 뒤섞임!','damage'); renderCombatCards(); break;
    case 'weaken': gs.applyEnemyStatus('weakened',1); break;
    case 'dodge': gs.addLog(`${enemy.name}: 회피 준비`,'system'); break;
    case 'lifesteal': gs.player.hp=Math.min(gs.player.maxHp,gs.player.hp+4); updateUI(); break;
    case 'poison_3': gs.player.buffs['poisoned']={stacks:3}; gs.addLog(`☠️ ${enemy.name}: 맹독 부여!`,'damage'); updateStatusDisplay(); break;
    case 'self_heal_15': enemy.hp=Math.min(enemy.maxHp,(enemy.hp||0)+15); gs.addLog(`💚 ${enemy.name}: 체력 회복 (+15)`, 'heal'); break;
    case 'self_atk_up_4': enemy.atk+=4; gs.addLog(`💪 ${enemy.name}: 공격 대폭 강화 (+4)`,'system'); break;
    case 'phase_shift': gs.addLog(`⚠️ ${enemy.name}: 위상 전환!`,'system'); break;
  }
}

// ────────────────────────────────────────
// EVENT SYSTEM
// ────────────────────────────────────────
function triggerRandomEvent() {
  const pool = DATA.events.filter(e => {
    if (e.layer===2 && GS.currentFloor<2) return false;
    return true;
  });
  showEvent(pool[Math.floor(Math.random()*pool.length)]);
}

// 현재 표시 중인 이벤트 캐시 (상점/휴식 등 DATA.events 밖의 객체도 처리)
let _currentEvent = null;

function _updateEventGoldBar() {
  const p = GS.player;
  if (!p) return;
  const gEl = document.getElementById('eventGoldDisplay');
  const hEl = document.getElementById('eventHpDisplay');
  const eEl = document.getElementById('eventEchoDisplay');
  if (gEl) gEl.textContent = p.gold ?? 0;
  if (hEl) hEl.textContent = `${Math.max(0,p.hp??0)}/${p.maxHp??0}`;
  if (eEl) eEl.textContent = Math.floor(p.echo ?? 0);
}

function showEvent(event) {
  _currentEvent = event;
  GS._eventLock = false; // 이벤트 열릴 때 락 초기화
  document.getElementById('eventEyebrow').textContent = event.eyebrow||'LAYER 1 · 이벤트';
  document.getElementById('eventTitle').textContent = event.title;
  document.getElementById('eventDesc').textContent = event.desc;
  _updateEventGoldBar();

  // 덱 상태 미니 표시
  const deckInfoEl = document.getElementById('eventDeckInfo');
  if (deckInfoEl && GS.player) {
    const p = GS.player;
    const totalCards = (p.deck?.length||0) + (p.hand?.length||0) + (p.graveyard?.length||0);
    const goldStr = p.gold !== undefined ? `<span style="color:var(--gold);">💰 ${p.gold}골드</span>` : '';
    const hpStr   = p.hp   !== undefined ? `<span style="color:var(--hp-color);">❤️ ${p.hp}/${p.maxHp}</span>` : '';
    const deckStr = `<span style="color:var(--echo);">🃏 덱 ${totalCards}장</span>`;
    deckInfoEl.innerHTML = [hpStr, goldStr, deckStr].filter(Boolean).join('<span style="opacity:0.25;margin:0 4px;">|</span>');
    deckInfoEl.style.display = 'flex';
  }

  const choicesEl = document.getElementById('eventChoices');
  choicesEl.innerHTML = event.choices.map((c,i) => `
    <div class="event-choice" onclick="resolveEvent(${i})">${c.text}</div>
  `).join('');
  document.getElementById('eventModal').classList.add('active');
}

function resolveEvent(choiceIdx) {
  const event = _currentEvent;
  if (!event) return;
  // persistent 이벤트(상점 등)가 아니면 연타 방지
  if (!event.persistent && GS._eventLock) return;
  GS._eventLock = true;

  const result = event.choices[choiceIdx].effect(GS);
  updateUI();
  _updateEventGoldBar(); // 골드 변경 즉시 반영
  if (!result) {
    // null 반환 = 그냥 닫기 (예: '나간다')
    document.getElementById('eventModal').classList.remove('active');
    _currentEvent = null;
    GS._eventLock = false;
    return;
  }
  document.getElementById('eventDesc').textContent = result;
  // 실패 메시지(골드·조건 부족)이거나 persistent 이벤트면 선택지 유지
  const isFail = result.includes('부족') || result.includes('없다') || result.includes('부족.');
  if (event.persistent || isFail) {
    const choicesEl = document.getElementById('eventChoices');
    choicesEl.innerHTML = event.choices.map((c,i) => `
      <div class="event-choice" onclick="resolveEvent(${i})">${c.text}</div>
    `).join('');
    _updateEventGoldBar();
    GS._eventLock = false; // persistent는 락 해제해서 계속 선택 가능
  } else {
    document.getElementById('eventChoices').innerHTML = `<div class="event-choice" onclick="document.getElementById('eventModal').classList.remove('active');_currentEvent=null;GS._eventLock=false;">계속</div>`;
    // 일회성 이벤트 — 락은 유지, '계속' 클릭 시 해제
  }
}

function showShop() {
  const savedMerchant = (GS.worldMemory.savedMerchant||0) > 0;
  const costPotion = RunRules.getShopCost(GS, savedMerchant ? 8 : 12);
  const costCard = RunRules.getShopCost(GS, 15);
  const costUpgrade = RunRules.getShopCost(GS, 20);
  const costEnergy = RunRules.getShopCost(GS, 30);
  const shop = {
    id:'shop', persistent: true,
    eyebrow: savedMerchant ? 'WORLD MEMORY · 특별 상점' : 'LAYER 1 · 상점',
    title: savedMerchant ? '고마운 상인의 가게' : '잔향 상인',
    desc: savedMerchant
      ? '전에 도움받은 상인이다. 좋은 가격을 제시한다.'
      : '낡은 외투를 입은 상인이 잔향 결정들을 늘어놓고 있다.',
    choices: [
      {text:`💊 치료약 (HP +30) — ${costPotion}골드`, effect(gs){const c=costPotion;if(gs.player.gold>=c){gs.player.gold-=c;gs.heal(30);return `치료약을 마셨다. [남은 골드: ${gs.player.gold}]`;}return `골드 부족! (필요: ${c}, 보유: ${gs.player.gold})`;}},
      {text:`🃏 랜덤 카드 — ${costCard}골드`, effect(gs){const c=costCard;if(gs.player.gold>=c){gs.player.gold-=c;const cardId=gs.getRandomCard('uncommon');gs.player.deck.push(cardId);if (gs.meta.codex) gs.meta.codex.cards.add(cardId);AudioEngine.playItemGet();return `카드 획득: ${DATA.cards[cardId]?.name} [남은 골드: ${gs.player.gold}]`;}return `골드 부족! (필요: ${c}, 보유: ${gs.player.gold})`;}},
      {text:`⚒️ 카드 강화 — ${costUpgrade}골드`, effect(gs){
        const c = costUpgrade;
        if(gs.player.gold<c) return `골드 부족! (필요: ${c}, 보유: ${gs.player.gold})`;
        const upgradable = gs.player.deck.filter(id => DATA.upgradeMap[id]);
        if(!upgradable.length) return '강화 가능한 카드가 없다.';
        gs.player.gold-=c;
        const cardId = upgradable[Math.floor(Math.random()*upgradable.length)];
        const upgId = DATA.upgradeMap[cardId];
        const idx = gs.player.deck.indexOf(cardId);
        if(idx>=0){ gs.player.deck[idx]=upgId; }
        if (gs.meta.codex) gs.meta.codex.cards.add(upgId);
        AudioEngine.playItemGet();
        return `${DATA.cards[cardId]?.name} → ${DATA.cards[upgId]?.name} [남은 골드: ${gs.player.gold}]`;
      }},
      {text:`⚡ 에너지 강화 — ${costEnergy}골드 (최대 에너지 +1)`, effect(gs){
        const c = costEnergy;
        if(gs.player.gold<c) return `골드 부족! (필요: ${c}, 보유: ${gs.player.gold})`;
        if(gs.player.maxEnergy>=6) return '이미 최대 에너지에 도달했다.';
        gs.player.gold-=c;
        gs.player.maxEnergy++;
        gs.player.energy=Math.min(gs.player.energy+1,gs.player.maxEnergy);
        AudioEngine.playItemGet();
        gs.addLog(`⚡ 에너지 강화! 최대 에너지 ${gs.player.maxEnergy}`,'echo');
        updateUI();
        return `최대 에너지 ${gs.player.maxEnergy}으로 증가! [남은 골드: ${gs.player.gold}]`;
      }},
      {text:'💎 아이템 구매 — 골드', effect(gs){ showItemShop(gs); return null; }},
      {text:'🚪 나간다', effect(){return null;}},
    ]
  };
  showEvent(shop);
}

function showRestSite() {
  const rest = {
    id:'rest', eyebrow:'LAYER 1 · 휴식 장소', title:'잔향의 모닥불',
    desc:'꺼지지 않는 이상한 불꽃이 타오르고 있다.',
    choices:[
      {text:'❤️ 휴식한다 (HP +25%)', effect(gs){
        const baseHeal = Math.floor(gs.player.maxHp * 0.25);
        gs.heal(RunRules.getHealAmount(gs, baseHeal));
        return '몸이 회복되었다.';
      }},
      {text:'🃏 카드를 강화한다 (랜덤 카드 업그레이드)', effect(gs){
        const upgradable = gs.player.deck.filter(id => DATA.upgradeMap[id]);
        if(!upgradable.length) return '강화 가능한 카드가 없다.';
        const cardId = upgradable[Math.floor(Math.random()*upgradable.length)];
        const upgId = DATA.upgradeMap[cardId];
        const idx = gs.player.deck.indexOf(cardId);
        if(idx>=0){ gs.player.deck[idx]=upgId; gs.addLog(`✨ ${DATA.cards[cardId]?.name} → ${DATA.cards[upgId]?.name} 강화!`,'echo'); }
        return `${DATA.cards[cardId]?.name}이(가) 강화되었다.`;
      }},
      {text:'⚡ Echo를 충전한다 (Echo +50)', effect(gs){gs.addEcho(50);return 'Echo 에너지가 충전됐다.';}},
      {text:'🔥 카드를 소각한다 (덱에서 1장 제거)', effect(gs){ showCardDiscard(gs, true); return null; }},
    ]
  };
  showEvent(rest);
}

// ────────────────────────────────────────
// REWARD SCREEN
// ────────────────────────────────────────
// ── 카드 버리기/소각 UI ──
function showCardDiscard(gs, isBurn=false) {
  const allCards = [...gs.player.deck];
  if (allCards.length === 0) {
    gs.addLog('덱에 카드가 없다.', 'system');
    return;
  }
  const overlay = document.createElement('div');
  overlay.id = 'cardDiscardOverlay';
  overlay.style.cssText = 'position:fixed;inset:0;background:rgba(3,3,10,0.94);display:flex;flex-direction:column;align-items:center;justify-content:flex-start;padding:40px 24px;gap:20px;z-index:800;backdrop-filter:blur(12px);overflow-y:auto;animation:fadeIn 0.3s ease both;';

  const rarityColor = {common:'var(--text-dim)',uncommon:'var(--echo-bright)',rare:'var(--gold)',legendary:'#c084fc'};
  const title = isBurn ? '🔥 소각할 카드를 선택하세요' : '🗑️ 버릴 카드를 선택하세요 (+8골드)';
  const sub = isBurn ? '선택한 카드가 덱에서 영구 제거됩니다.' : '선택한 카드를 팔고 8골드를 받습니다.';

  overlay.innerHTML = `
    <div style="text-align:center;">
      <div style="font-family:'Cinzel',serif;font-size:11px;letter-spacing:0.4em;color:var(--text-dim);margin-bottom:8px;">${isBurn?'🔥 소각':'🗑️ 처분'}</div>
      <div style="font-family:'Cinzel Decorative',serif;font-size:22px;font-weight:900;color:var(--white);margin-bottom:6px;">${title}</div>
      <div style="font-family:'Crimson Pro',serif;font-style:italic;font-size:13px;color:var(--text-dim);">${sub}</div>
    </div>
    <div id="discardCardList" style="display:flex;flex-wrap:wrap;gap:10px;justify-content:center;max-width:700px;"></div>
    <button onclick="document.getElementById('cardDiscardOverlay')?.remove();"
      style="font-family:'Cinzel',serif;font-size:11px;letter-spacing:0.2em;color:var(--text-dim);background:none;border:1px solid rgba(255,255,255,0.1);border-radius:6px;padding:10px 24px;cursor:pointer;margin-top:8px;">
      취소
    </button>
  `;
  document.body.appendChild(overlay);

  const list = document.getElementById('discardCardList');
  const uniqueCards = [...new Set(allCards)];
  uniqueCards.forEach(cardId => {
    const card = DATA.cards[cardId];
    if (!card) return;
    const count = allCards.filter(c=>c===cardId).length;
    const btn = document.createElement('div');
    btn.style.cssText = `cursor:pointer;background:rgba(10,5,30,0.9);border:1px solid ${rarityColor[card.rarity]||'var(--border)'};border-radius:10px;padding:12px;width:120px;text-align:center;transition:all 0.2s;position:relative;`;
    btn.innerHTML = `
      <div style="font-size:22px;margin-bottom:6px;">${card.icon||'🃏'}</div>
      <div style="font-family:'Cinzel',serif;font-size:10px;font-weight:700;color:${rarityColor[card.rarity]||'var(--white)'};margin-bottom:3px;">${card.name}</div>
      <div style="font-size:10px;color:var(--text-dim);line-height:1.3;">${card.desc||''}</div>
      ${count>1?`<div style="position:absolute;top:4px;right:6px;font-size:9px;color:var(--echo);">×${count}</div>`:''}
    `;
    btn.onmouseenter = () => { btn.style.borderColor='var(--cyan)'; btn.style.boxShadow='0 0 12px rgba(0,255,204,0.3)'; };
    btn.onmouseleave = () => { btn.style.borderColor=rarityColor[card.rarity]||'var(--border)'; btn.style.boxShadow=''; };
    btn.onclick = () => {
      const idx = gs.player.deck.indexOf(cardId);
      if (idx >= 0) {
        gs.player.deck.splice(idx, 1);
        if (!isBurn) {
          gs.addGold(8);
          gs.addLog(`🗑️ ${card.name} 처분 +8골드`, 'system');
        } else {
          gs.addLog(`🔥 ${card.name} 소각`, 'system');
        }
        AudioEngine.playItemGet();
        updateUI();
      }
      document.getElementById('cardDiscardOverlay')?.remove();
    };
    list.appendChild(btn);
  });
}

// ── 아이템 상점 UI (등급별 차별화) ──
function showItemShop(gs) {
  const rarityConfig = {
    common:    { label:'일반',    color:'var(--text)',      baseCost:10, border:'rgba(150,150,180,0.3)' },
    uncommon:  { label:'고급',    color:'var(--echo-bright)', baseCost:20, border:'rgba(123,47,255,0.4)' },
    rare:      { label:'희귀',    color:'var(--gold)',       baseCost:35, border:'rgba(240,180,41,0.5)' },
    legendary: { label:'전설',    color:'#c084fc',           baseCost:60, border:'rgba(192,132,252,0.6)' },
  };

  // 등급별 아이템 각 1개씩 랜덤 선정 (최대 4개)
  const byRarity = {};
  Object.values(DATA.items).forEach(item => {
    if (!byRarity[item.rarity]) byRarity[item.rarity] = [];
    byRarity[item.rarity].push(item);
  });
  const shopItems = [];
  ['common','uncommon','rare','legendary'].forEach(r => {
    const pool = (byRarity[r]||[]).filter(it => !gs.player.items.includes(it.id));
    if (pool.length) shopItems.push(pool[Math.floor(Math.random()*pool.length)]);
  });

  const overlay = document.createElement('div');
  overlay.id = 'itemShopOverlay';
  overlay.style.cssText = 'position:fixed;inset:0;background:rgba(3,3,10,0.94);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:24px;z-index:800;backdrop-filter:blur(12px);animation:fadeIn 0.3s ease both;';

  overlay.innerHTML = `
    <div style="text-align:center;">
      <div style="font-family:'Cinzel',serif;font-size:11px;letter-spacing:0.4em;color:var(--gold);margin-bottom:8px;">🏪 아이템 상점</div>
      <div style="font-family:'Cinzel Decorative',serif;font-size:22px;font-weight:900;color:var(--white);margin-bottom:6px;">무엇을 구하시겠습니까?</div>
      <div style="font-family:'Share Tech Mono',monospace;font-size:11px;color:var(--gold);">보유 골드: <span id="itemShopGold">${gs.player.gold}</span></div>
    </div>
    <div id="itemShopList" style="display:flex;gap:14px;flex-wrap:wrap;justify-content:center;max-width:700px;"></div>
    <button onclick="document.getElementById('itemShopOverlay')?.remove();"
      style="font-family:'Cinzel',serif;font-size:11px;letter-spacing:0.2em;color:var(--text-dim);background:none;border:1px solid rgba(255,255,255,0.1);border-radius:6px;padding:10px 24px;cursor:pointer;">
      닫기
    </button>
  `;
  document.body.appendChild(overlay);

  const list = document.getElementById('itemShopList');
  shopItems.forEach(item => {
    const rc = rarityConfig[item.rarity] || rarityConfig.common;
    const cost = RunRules.getShopCost(gs, rc.baseCost || 10);
    const canAfford = gs.player.gold >= cost;
    const card = document.createElement('div');
    card.style.cssText = `width:155px;background:rgba(10,5,30,0.95);border:1px solid ${rc.border};border-radius:12px;padding:16px;text-align:center;cursor:${canAfford?'pointer':'not-allowed'};opacity:${canAfford?1:0.5};transition:all 0.2s;position:relative;`;
    card.innerHTML = `
      <div style="position:absolute;top:8px;right:10px;font-family:'Cinzel',serif;font-size:8px;letter-spacing:0.1em;color:${rc.color};">${rc.label}</div>
      <div style="font-size:32px;margin-bottom:8px;">${item.icon}</div>
      <div style="font-family:'Cinzel',serif;font-size:11px;font-weight:700;color:${rc.color};margin-bottom:6px;">${item.name}</div>
      <div style="font-size:11px;color:var(--text-dim);line-height:1.4;margin-bottom:10px;">${item.desc}</div>
      <div style="font-family:'Share Tech Mono',monospace;font-size:12px;color:var(--gold);font-weight:700;">${cost} 골드</div>
    `;
    const alreadyOwned = gs.player.items.includes(item.id);
    if (alreadyOwned) {
      card.style.opacity = '0.35';
      card.style.cursor = 'not-allowed';
      card.innerHTML += `<div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;border-radius:12px;background:rgba(3,3,10,0.5);"><span style="font-family:'Cinzel',serif;font-size:9px;letter-spacing:0.15em;color:var(--text-dim);">보유 중</span></div>`;
    } else if (canAfford) {
      card.onmouseenter = () => { card.style.borderColor='var(--cyan)'; card.style.transform='translateY(-3px)'; card.style.boxShadow=`0 8px 24px rgba(0,255,204,0.2)`; };
      card.onmouseleave = () => { card.style.borderColor=rc.border; card.style.transform=''; card.style.boxShadow=''; };
      card.onclick = () => {
        if (gs.player.gold < cost) return;
        gs.player.gold -= cost;
        gs.player.items.push(item.id);
        if (gs.meta.codex) gs.meta.codex.items.add(item.id);
        AudioEngine.playItemGet();
        showItemToast(item);
        gs.addLog(`🛍️ ${item.name} 구매!`, 'echo');
        updateUI();
        _updateEventGoldBar();
        document.getElementById('itemShopOverlay')?.remove();
      };
    }
    list.appendChild(card);
  });
}

function showRewardScreen(isBoss) {
  if (GS.combat?.active) return;
  GS._rewardLock = false; // 보상 화면 열릴 때 락 초기화
  hideSkipConfirm(); // 건너뛰기 확인 UI 초기화
  const isElite = GS.currentNode?.type === 'elite';
  // 타이틀 업데이트
  const eyebrow = document.getElementById('rewardEyebrow');
  const titleEl = document.getElementById('rewardTitle');
  if (eyebrow) eyebrow.textContent = isBoss ? '✦ 보스 처치 — 보상 선택 ✦' : isElite ? '✦ 정예 처치 — 보상 선택 ✦' : '✦ 전투 승리 — 보상 선택 ✦';
  if (titleEl) {
    if (isBoss) {
      titleEl.textContent = '보스 처치!';
      titleEl.style.display = 'block';
      titleEl.style.color = 'var(--gold)';
    } else if (isElite) {
      titleEl.textContent = '⭐ 정예 처치!';
      titleEl.style.display = 'block';
      titleEl.style.color = '#d4a017';
    } else {
      titleEl.style.display = 'none';
    }
  }
  const count = isBoss ? 4 : isElite ? 3 : 3;
  const rarities = isBoss ? ['uncommon','uncommon','rare','rare']
                 : isElite ? ['uncommon','uncommon','rare']
                 : ['common','uncommon','common'];
  const rewardCards = Array.from({length:count},(_,i)=>GS.getRandomCard(rarities[i]));
  const container = document.getElementById('rewardCards');
  container.classList.remove('picked'); // 이전 선택 상태 초기화
  container.innerHTML = rewardCards.map((cardId, idx) => {
    const card = DATA.cards[cardId];
    if (!card) return '';
    const rarityBorder = card.rarity==='rare'?'rgba(240,180,41,0.4)':card.rarity==='uncommon'?'rgba(123,47,255,0.4)':'';
    return `<div class="reward-card-wrapper" onclick="takeRewardCard('${cardId}')"
      onmouseenter="showTooltip(event,'${cardId}')" onmouseleave="hideTooltip()"
      style="animation-delay:${idx*0.08}s;">
      <div class="card" style="width:110px;height:auto;min-height:150px;padding-bottom:10px;${rarityBorder?`border-color:${rarityBorder};`:''}">
        <div class="card-cost">${card.cost}</div>
        <div class="card-icon" style="font-size:28px;">${card.icon}</div>
        <div class="card-name" style="font-size:11px;">${card.name}</div>
        <div class="card-desc" style="font-size:10px;">${card.desc}</div>
        <div class="card-type" style="font-size:8px;color:${rarityBorder?rarityBorder:'var(--echo)'};">${card.rarity||'common'}</div>
      </div>
    </div>`;
  }).join('');

  let itemCardIdx = count;
  if (isBoss || Math.random() < 0.3) {
    // 보스면 rare+, 일반이면 uncommon 이하에서 선택
    const targetRarity = isBoss ? ['rare','legendary'] : ['common','uncommon'];
    const pool = Object.values(DATA.items)
      .filter(it => targetRarity.includes(it.rarity) && !GS.player.items.includes(it.id));
    const itemPool = pool.length > 0 ? pool : Object.values(DATA.items).filter(it=>!GS.player.items.includes(it.id));
    if (itemPool.length > 0) {
      const item = itemPool[Math.floor(Math.random()*itemPool.length)];
      const itemKey = item.id;
      const rarityColor = {common:'var(--text-dim)',uncommon:'var(--echo-bright)',rare:'var(--gold)',legendary:'#c084fc'};
      const rarityBorderItem = {common:'rgba(150,150,180,0.3)',uncommon:'rgba(123,47,255,0.4)',rare:'rgba(240,180,41,0.5)',legendary:'rgba(192,132,252,0.6)'};
      const rarityLabel = {common:'일반',uncommon:'고급',rare:'희귀',legendary:'전설'};
      const rc = item.rarity||'common';
      container.innerHTML += `<div class="reward-card-wrapper" onclick="takeRewardItem('${itemKey}')" style="animation-delay:${itemCardIdx*0.08}s;">
        <div class="card" style="width:110px;height:auto;min-height:150px;padding-bottom:10px;border-color:${rarityBorderItem[rc]};">
          <div class="card-icon" style="font-size:30px;">${item.icon}</div>
          <div class="card-name" style="font-size:11px;color:${rarityColor[rc]};">${item.name}</div>
          <div class="card-desc" style="font-size:10px;">${item.desc}</div>
          <div class="card-type" style="font-size:8px;color:${rarityColor[rc]};">아이템 · ${rarityLabel[rc]}</div>
        </div></div>`;
    }
  }
  switchScreen('reward');
}

function takeRewardCard(cardId) {
  if (GS._rewardLock) return;
  GS._rewardLock = true;
  // 선택된 카드 강조 + 나머지 딤처리
  const container = document.getElementById('rewardCards');
  if (container) {
    const wrappers = container.querySelectorAll('.reward-card-wrapper');
    wrappers.forEach(w => {
      if (w.getAttribute('onclick')?.includes(cardId)) w.classList.add('selected');
    });
    container.classList.add('picked');
  }
  GS.player.deck.push(cardId);
  if (GS.meta.codex) GS.meta.codex.cards.add(cardId);
  const card = DATA.cards[cardId];
  AudioEngine.playItemGet();
  showItemToast({name:card?.name, icon:card?.icon, desc:card?.desc});
  setTimeout(() => returnToGame(true), 350);
}

function takeRewardItem(itemKey) {
  if (GS._rewardLock) return;
  GS._rewardLock = true;
  const container = document.getElementById('rewardCards');
  if (container) {
    const wrappers = container.querySelectorAll('.reward-card-wrapper');
    wrappers.forEach(w => {
      if (w.getAttribute('onclick')?.includes(itemKey)) w.classList.add('selected');
    });
    container.classList.add('picked');
  }
  GS.player.items.push(itemKey);
  if (GS.meta.codex) GS.meta.codex.items.add(itemKey);
  const item = DATA.items[itemKey];
  AudioEngine.playItemGet();
  showItemToast(item);
  setTimeout(() => returnToGame(true), 350);
}

function showSkipConfirm() {
  const initBtn = document.getElementById('skipInitBtn');
  const confirmRow = document.getElementById('skipConfirmRow');
  if (initBtn) initBtn.style.display = 'none';
  if (confirmRow) confirmRow.style.display = 'flex';
}
function hideSkipConfirm() {
  const initBtn = document.getElementById('skipInitBtn');
  const confirmRow = document.getElementById('skipConfirmRow');
  if (initBtn) initBtn.style.display = '';
  if (confirmRow) confirmRow.style.display = 'none';
}
function skipReward() {
  if (GS._rewardLock) return;
  GS._rewardLock = true;
  returnToGame(true);
}

function returnToGame(fromReward) {
  const wasBoss = GS._bossRewardPending;
  const wasLastRegion = GS._bossLastRegion;
  const endlessRun = RunRules.isEndless(GS);
  GS._bossRewardPending = false;
  GS._bossLastRegion = false;
  GS._rewardLock = false;
  GS._nodeMoveLock = false;
  GS._eventLock = false;

  document.getElementById('combatOverlay')?.classList.remove('active');
  const combatHand = document.getElementById('combatHandCards');
  if (combatHand) combatHand.innerHTML = '';
  const enemyZone = document.getElementById('enemyZone');
  if (enemyZone) enemyZone.innerHTML = '';

  if (fromReward && wasBoss) {
    if (wasLastRegion) {
      if (!endlessRun) {
        // 최종 지역 보스(비엔들리스) → 메타 정산 + 엔딩
        finalizeRunOutcome('victory', { echoFragments: 5 });
        const rw = document.getElementById('rewardScreen');
        if (rw) rw.classList.remove('active');
        if (StorySystem.checkHiddenEnding()) StorySystem.showHiddenEnding();
        else StorySystem.showNormalEnding();
        return;
      }
      // 엔들리스는 엔딩 없이 다음 루프로 진행
      switchScreen('game');
      updateUI();
      setTimeout(() => advanceToNextRegion(), 300);
      return;
    } else {
      // 중간 보스 → 다음 지역
      switchScreen('game');
      updateUI();
      setTimeout(() => advanceToNextRegion(), 300);
      return;
    }
  }

  switchScreen('game');
  updateUI();
  renderMapOverlay();
  updateNextNodes();
}

// ────────────────────────────────────────
// UI SYSTEM — 단일 통합 updateUI (배치 처리)
// ────────────────────────────────────────
let _uiPending = false;
let _gameStarted = false; // 게임 시작 전에는 즉시 실행
function _updateEndBtnWarn() {
  // 에너지가 남아있는데 턴을 종료하려 할 때 경고 애니메이션
  const btn = document.getElementById('combatOverlay')?.querySelector('.action-btn-end');
  if (!btn) return;
  const hasEnergy = GS.player.energy > 0 && GS.combat.active && GS.combat.playerTurn;
  btn.classList.toggle('energy-warn', hasEnergy);
}

function updateUI() {
  if (!_gameStarted) { _doUpdateUI(); return; }
  if (_uiPending) return;
  _uiPending = true;
  requestAnimationFrame(() => {
    _uiPending = false;
    _doUpdateUI();
  });
}
function _doUpdateUI() {
  const gs = GS, p = gs.player;

  // HP — 저체력 시 색상 변화
  const hpPct = Math.max(0,(p.hp/p.maxHp)*100);
  setBar('hpBar',hpPct); setText('hpText',`${Math.max(0,p.hp)} / ${p.maxHp}`);
  const hpFill = document.getElementById('hpBar');
  if (hpFill) {
    if (hpPct <= 25) hpFill.style.background = 'linear-gradient(90deg,#8b0000,#cc0000)';
    else if (hpPct <= 50) hpFill.style.background = 'linear-gradient(90deg,#aa1122,#dd2244)';
    else hpFill.style.background = 'linear-gradient(90deg,#cc2244,#ff4466)';
  }
  // mini HUD 바 (hoverHud 트리거)
  const hudHpMini = document.getElementById('hudHpBarMini');
  if (hudHpMini) { hudHpMini.style.width = hpPct+'%'; hudHpMini.style.background = hpPct<=25?'linear-gradient(90deg,#8b0000,#cc0000)':'linear-gradient(90deg,#cc2244,#ff4466)'; }
  const hudEchoMini = document.getElementById('hudEchoBarMini');
  if (hudEchoMini) hudEchoMini.style.width = ((p.echo/p.maxEcho)*100)+'%';
  setText('hudHpText', `${Math.max(0,p.hp)}/${p.maxHp}`);
  setText('hudEchoText', Math.floor(p.echo));
  setText('hudGoldText', p.gold);
  // 저체력 경고 (30% 미만)
  document.getElementById('hoverHud')?.classList.toggle('low-hp', hpPct <= 30);
  // 방어막
  setBar('shieldBar',Math.min(100,(p.shield/p.maxHp)*100)); setText('shieldText',p.shield||'0');
  // Echo
  setBar('echoBar',(p.echo/p.maxEcho)*100); setText('echoText',`${Math.floor(p.echo)} / ${p.maxEcho}`);
  // 에너지 오브 (초과 에너지 표시 포함)
  const orbs = document.getElementById('energyOrbs');
  if (orbs) {
    const displayMax = Math.max(p.maxEnergy, p.energy);
    orbs.innerHTML = Array.from({length:displayMax},(_,i)=>{
      const filled = i < p.energy;
      const isOverflow = i >= p.maxEnergy;
      return `<div class="energy-orb ${filled?'filled':''}" style="${isOverflow&&filled?'background:var(--cyan);border-color:var(--cyan);box-shadow:0 0 10px rgba(0,255,204,0.8);':''}" title="${i+1}/${p.maxEnergy}"></div>`;
    }).join('');
  }
  setText('energyText',`${p.energy} / ${p.maxEnergy}`);
  // 덱
  setText('deckCount',p.deck.length); setText('graveCount',p.graveyard.length);
  setText('deckSize',p.deck.length); setText('graveyardSize',p.graveyard.length); setText('exhaustSize',p.exhausted.length);

  // 전투 오버레이 에너지/덱 동기화
  const combatOrbs = document.getElementById('combatEnergyOrbs');
  if (combatOrbs) {
    const displayMax2 = Math.max(p.maxEnergy, p.energy);
    combatOrbs.innerHTML = Array.from({length:displayMax2},(_,i)=>{
      const filled = i < p.energy;
      const isOverflow = i >= p.maxEnergy;
      return `<div class="energy-orb ${filled?'filled':''}" style="${isOverflow&&filled?'background:var(--cyan);border-color:var(--cyan);box-shadow:0 0 10px rgba(0,255,204,0.8);':''}"></div>`;
    }).join('');
  }
  setText('combatEnergyText',`${p.energy} / ${p.maxEnergy}`);
  setText('combatDeckCount', p.deck.length);
  setText('combatGraveCount', p.graveyard.length);
  setText('combatExhaustCount', p.exhausted.length);
  // 소음 게이지 위젯 업데이트
  updateNoiseWidget();
  // 에너지 남아있을 때 턴 종료 버튼 경고
  const endBtn = document.getElementById ? document.querySelector('.action-btn-end') : null;
  if (endBtn && gs.combat.active && gs.combat.playerTurn) {
    const hasPlayable = gs.player.hand.some(id => {
      const c = DATA.cards[id]; if (!c) return false;
      const cost = gs.player.zeroCost ? 0 : Math.max(0, c.cost - (gs.player.costDiscount||0));
      return gs.player.energy >= cost;
    });
    endBtn.classList.toggle('energy-warn', hasPlayable && gs.player.energy > 0);
  }
  // 런 정보
  setText('runCount',gs.meta.runCount); setText('killCount',p.kills); setText('goldCount',p.gold);
  // 지역
  const region = getRegionData(gs.currentRegion, gs) || { name: '알 수 없는 지역', rule: '-', floors: 1 };
  setText('regionName',region.name); setText('regionRule',region.rule); setText('regionFloor',`${gs.currentFloor} / ${region.floors}층`);
  setText('playerFloor',`${region.name} · ${gs.currentFloor}층`);
  const classNames = {swordsman:'잔향검사',mage:'메아리술사',hunter:'침묵사냥꾼'};
  setText('playerClassDisplay',classNames[p.class]||p.class);
  // 아이템
  const itemEl = document.getElementById('itemSlots');
  if (itemEl) {
    if (!p.items.length) {
      itemEl.innerHTML = '<span style="font-size:11px;color:var(--text-dim);font-style:italic;">비어있음</span>';
    } else {
      // 등급 우선순위로 정렬 (legendary > rare > uncommon > common)
      const _itemRarityOrder = {legendary:0, rare:1, uncommon:2, common:3};
      const _sortedItems = [...p.items].sort((a,b) => {
        const ra = _itemRarityOrder[DATA.items[a]?.rarity||'common'] ?? 3;
        const rb = _itemRarityOrder[DATA.items[b]?.rarity||'common'] ?? 3;
        return ra - rb;
      });
      itemEl.innerHTML = _sortedItems.map(id => {
        const item = DATA.items[id];
        if (!item) return '';
        const rarityClass = item.rarity ? `item-slot-${item.rarity}` : '';
        const inSet = Object.values(SetBonusSystem.sets).some(s=>s.items.includes(id));
        const setGlow = inSet ? 'outline:1px dashed rgba(0,255,204,0.4);' : '';
        return `<div class="hud-item-slot ${rarityClass}" style="${setGlow}"
          onmouseenter="showItemTooltip(event,'${id}')"
          onmouseleave="hideItemTooltip()">${item.icon}</div>`;
      }).join('');
    }
    // 세트 보너스 패널 업데이트
    const setBonusPanel = document.getElementById('setBonusPanel');
    if (setBonusPanel) {
      const activeSets = SetBonusSystem.getActiveSets(GS);
      if (activeSets.length > 0) {
        setBonusPanel.style.display = 'block';
        setBonusPanel.innerHTML = activeSets.map(s => `
          <div style="background:rgba(0,255,204,0.06);border:1px solid rgba(0,255,204,0.2);border-radius:6px;padding:5px 8px;margin-bottom:4px;">
            <div style="font-family:'Cinzel',serif;font-size:8px;letter-spacing:0.2em;color:var(--cyan);">✦ ${s.name} [${s.count}/3]</div>
            <div style="font-size:9px;color:var(--text-dim);margin-top:2px;">${s.bonus?.label||''}</div>
          </div>
        `).join('');
        // 패시브 보너스 적용 (초기화 체크 포함)
        SetBonusSystem.applyPassiveBonuses(GS);
      } else {
        setBonusPanel.style.display = 'none';
      }
    }
  }
  // Echo 스킬 버튼
  const echoBtn = document.getElementById('echoSkillBtn');
  if (echoBtn) {
    const can = p.echo >= 30;
    echoBtn.disabled = !can;
    if (can) {
      updateEchoSkillBtn();
    } else {
      echoBtn.textContent = `⚡ Echo 스킬 (${Math.floor(p.echo)}/30)`;
      echoBtn.style.opacity = '0.4';
    }
  }
  // 카드 뽑기 버튼 — 에너지 0이면 비활성화 (Echo 스킬과 동일 방식)
  const drawBtn = document.getElementById('drawCardBtn');
  if (drawBtn) {
    const handFull = p.hand.length >= 8;
    const canDraw = gs.combat.active && gs.combat.playerTurn && p.energy >= 1 && !handFull;
    drawBtn.disabled = !canDraw;
    drawBtn.classList.toggle('hand-full', handFull);
    drawBtn.style.opacity = canDraw ? '1' : '0.4';
    if (gs.combat.active) {
      if (handFull) {
        drawBtn.textContent = '🃏 손패 가득 참';
        drawBtn.title = '손패가 가득 찼습니다 (최대 8장)';
      } else if (p.energy < 1) {
        drawBtn.textContent = '🃏 에너지 부족';
        drawBtn.title = '카드 뽑기에는 에너지 1이 필요합니다.';
      } else {
        drawBtn.textContent = `🃏 카드 뽑기 (에너지 ${p.energy})`;
        drawBtn.title = '카드를 한 장 뽑습니다.';
      }
    } else {
      drawBtn.textContent = '🃏 카드 뽑기 (1 에너지)';
      drawBtn.title = '전투 중에만 사용할 수 있습니다.';
    }
  }

  updateStatusDisplay();
  _updateEndBtnWarn();
}

const STATUS_KR = {
  momentum:   {name:'모멘텀',   icon:'⚔️', buff:true,  desc:'이동·공격 시 피해가 누적 증가. 연속 공격일수록 강해집니다.'},
  soul_armor: {name:'영혼갑옷', icon:'🛡️', buff:true,  desc:'받는 피해를 일부 감소시킵니다.'},
  vanish:     {name:'은신',     icon:'🌫️', buff:true,  desc:'다음 공격이 크리티컬로 발동됩니다.'},
  immune:     {name:'무적',     icon:'🏛️', buff:true,  desc:'이번 턴 동안 모든 피해를 무효화합니다.'},
  shadow_atk: {name:'그림자격', icon:'🌑', buff:true,  desc:'그림자 공격 계열 카드의 피해가 강화됩니다.'},
  mirror:     {name:'반사',     icon:'🪞', buff:true,  desc:'다음에 받는 피해를 적에게 반사시킵니다.'},
  zeroCost:   {name:'무비용',   icon:'✨', buff:true,  desc:'이번 턴 모든 카드의 에너지 비용이 0이 됩니다.'},
  weakened:   {name:'약화',     icon:'💫', buff:false, desc:'공격 피해가 50% 감소합니다. 턴이 지나면 회복됩니다.'},
  slowed:     {name:'감속',     icon:'🐢', buff:false, desc:'행동이 지연되어 일부 효과가 감소합니다.'},
  burning:    {name:'화염',     icon:'🔥', buff:false, desc:'매 턴 시작 시 5의 화염 피해를 받습니다.'},
  cursed:     {name:'저주',     icon:'💀', buff:false, desc:'카드 효과와 회복량이 감소합니다.'},
  poisoned:   {name:'독',       icon:'🐍', buff:false, desc:'매 턴 독 피해를 받으며 스택이 쌓일수록 강해집니다.'},
  stunned:    {name:'기절',     icon:'⚡', buff:false, desc:'이번 턴 행동을 할 수 없습니다.'},
  confusion:  {name:'혼란',     icon:'🌀', buff:false, desc:'카드 사용 순서가 무작위로 뒤섞입니다.'},
  dodge:      {name:'회피',     icon:'💨', buff:true,  desc:'다음 공격을 회피합니다.'},
};
function _getCombatInfoUIDeps() {
  return {
    gs: GS,
    data: DATA,
    statusKr: STATUS_KR,
    doc: document,
  };
}
function _resetCombatInfoPanel() {
  window.CombatInfoUI?.reset?.(_getCombatInfoUIDeps());
}
function updateStatusDisplay() {
  const el = document.getElementById('statusEffects');
  if (!el) return;
  const buffs = GS.player.buffs;
  const keys = Object.keys(buffs);
  if (!keys.length) {
    el.innerHTML='<span style="font-size:11px;color:var(--text-dim);font-style:italic;">없음</span>';
  } else {
    el.innerHTML = keys.map(k=>{
      const b = buffs[k];
      const info = STATUS_KR[k];
      const isBuff = info ? info.buff : ['momentum','soul_armor','vanish','immune','shadow_atk','dodge'].includes(k);
      const label = info ? `${info.icon} ${info.name}` : k;
      const stacks = b.stacks > 0 ? ` <span style="opacity:0.7;">(${b.stacks})</span>` : '';
      const desc = info?.desc || '효과 정보 없음';
      const dmgBonus = k === 'momentum' && b.dmgBonus ? ` +${b.dmgBonus}↯` : '';
      const tipContent = `<b>${label}</b>${dmgBonus ? ' ' + dmgBonus : ''}<br><span style="color:var(--text-dim);font-size:10px;">${desc}</span>`;
      return `<span class="hud-status-badge ${isBuff?'status-buff':'status-debuff'}">
        ${label}${stacks}${dmgBonus}
        <span class="hud-badge-tip">${tipContent}</span>
      </span>`;
    }).join('');
  }
  if (GS.combat?.active) _refreshCombatInfoPanel();
}

// ── 전투 정보 사이드 패널 ──
function toggleCombatInfo() {
  window.CombatInfoUI?.toggle?.(_getCombatInfoUIDeps());
}

function _refreshCombatInfoPanel() {
  window.CombatInfoUI?.refresh?.(_getCombatInfoUIDeps());
}

function updateChainUI(chain) {
  window.CombatHudUI?.updateChainUI?.(chain, _getCombatHudUIDeps());
}

function updateNoiseWidget() {
  window.CombatHudUI?.updateNoiseWidget?.(_getCombatHudUIDeps());
}
window.updateNoiseWidget = updateNoiseWidget;

function updateClassSpecialUI() {
  window.CombatHudUI?.updateClassSpecialUI?.(_getCombatHudUIDeps());
}
window.updateClassSpecialUI = updateClassSpecialUI;

function setBar(id,pct) { const el=document.getElementById(id); if(el) el.style.width=`${Math.max(0,Math.min(100,pct))}%`; }
function setText(id,val) { const el=document.getElementById(id); if(el) el.textContent=val; }

// ────────────────────────────────────────
// 카드 드래그 앤 드롭
// ────────────────────────────────────────
let _dragCardId = null, _dragIdx = null;

function handleCardDragStart(event, cardId, idx) {
  _dragCardId = cardId; _dragIdx = idx;
  event.dataTransfer.effectAllowed = 'move';
  event.currentTarget.style.opacity = '0.5';
  // 적 카드에 드롭 하이라이트
  document.querySelectorAll('.enemy-card').forEach(el => {
    el.style.outline = '2px dashed rgba(0,255,204,0.4)';
    el.setAttribute('ondragover', 'event.preventDefault();this.style.outline="2px dashed var(--cyan)"');
    el.setAttribute('ondragleave', 'this.style.outline="2px dashed rgba(0,255,204,0.4)"');
    el.setAttribute('ondrop', `handleCardDropOnEnemy(event,${el.id.split('_')[1]})`);
  });
}

function handleCardDragEnd(event) {
  event.currentTarget.style.opacity = '';
  _dragCardId = null; _dragIdx = null;
  document.querySelectorAll('.enemy-card').forEach(el => {
    el.style.outline = '';
    el.removeAttribute('ondragover'); el.removeAttribute('ondragleave'); el.removeAttribute('ondrop');
  });
}

function handleCardDropOnEnemy(event, enemyIdx) {
  event.preventDefault();
  if (!_dragCardId || _dragIdx === undefined || _dragIdx === null) return;
  document.querySelectorAll('.enemy-card').forEach(el => { el.style.outline=''; });
  // 공격 카드인 경우 해당 적을 대상으로 플레이
  const card = DATA.cards[_dragCardId];
  if (!card) return;
  // 임시로 대상 인덱스를 설정 후 플레이
  GS._dragTarget = enemyIdx;
  GS._selectedTarget = enemyIdx; // 드래그 타겟도 선택 타겟으로 동기화
  try {
    GS.playCard(_dragCardId, _dragIdx);
  } finally {
    GS._dragTarget = null;
  }
}

// 적 카드 클릭 → 타겟 지정 (같은 적 다시 클릭하면 해제)
function selectTarget(idx) {
  if (!GS.combat.active || !GS.combat.playerTurn) return;
  const enemy = GS.combat.enemies[idx];
  if (!enemy || enemy.hp <= 0) return;
  if (GS._selectedTarget === idx) {
    GS._selectedTarget = null; // 해제
  } else {
    GS._selectedTarget = idx;
    GS.addLog(`🎯 ${enemy.name} 타겟 지정`, 'system');
  }
  renderCombatEnemies(); // 선택 표시 갱신
}
window.selectTarget = selectTarget;

function _getFeedbackUIDeps() {
  return {
    gs: GS,
    doc: document,
    win: window,
    audioEngine: AudioEngine,
    screenShake: ScreenShake,
  };
}

function showCombatSummary(dealt, taken, kills) {
  window.FeedbackUI?.showCombatSummary?.(dealt, taken, kills, _getFeedbackUIDeps());
}

function showDmgPopup(dmg, x, y, color='#ff3366') {
  window.FeedbackUI?.showDmgPopup?.(dmg, x, y, color, _getFeedbackUIDeps());
}

function showEdgeDamage() {
  window.FeedbackUI?.showEdgeDamage?.(_getFeedbackUIDeps());
}

function showEchoBurstOverlay() {
  window.FeedbackUI?.showEchoBurstOverlay?.(_getFeedbackUIDeps());
}

function showCardPlayEffect(card) {
  window.FeedbackUI?.showCardPlayEffect?.(card, _getFeedbackUIDeps());
}

function _getDeckModalUIDeps() {
  return {
    gs: GS,
    data: DATA,
    doc: document,
  };
}

function _resetDeckModalFilter() {
  window.DeckModalUI?.resetFilter?.();
}

function showDeckView() {
  window.DeckModalUI?.showDeckView?.(_getDeckModalUIDeps());
}

function _renderDeckModal() {
  window.DeckModalUI?.renderDeckModal?.(_getDeckModalUIDeps());
}

// ────────────────────────────────────────
// CODEX SYSTEM — 도감
// ────────────────────────────────────────
function _getCodexUIDeps() {
  return {
    gs: GS,
    data: DATA,
    doc: document,
  };
}

function openCodex() {
  window.CodexUI?.openCodex?.(_getCodexUIDeps());
}

function closeCodex() {
  window.CodexUI?.closeCodex?.(_getCodexUIDeps());
}

function setCodexTab(tab) {
  window.CodexUI?.setCodexTab?.(tab, _getCodexUIDeps());
}

function renderCodexContent() {
  window.CodexUI?.renderCodexContent?.(_getCodexUIDeps());
}

function setDeckFilter(type) {
  window.DeckModalUI?.setDeckFilter?.(type, _getDeckModalUIDeps());
}

function closeDeckView() {
  window.DeckModalUI?.closeDeckView?.(_getDeckModalUIDeps());
}

function _getTooltipUIDeps() {
  return {
    gs: GS,
    data: DATA,
    setBonusSystem: SetBonusSystem,
    doc: document,
    win: window,
  };
}

// ── 카드 툴팁 ──
function showTooltip(event, cardId) {
  window.TooltipUI?.showTooltip?.(event, cardId, _getTooltipUIDeps());
}

function hideTooltip() {
  window.TooltipUI?.hideTooltip?.(_getTooltipUIDeps());
}

// 전투 카드에 툴팁 연결 (렌더 후 호출)
function attachCardTooltips() {
  window.TooltipUI?.attachCardTooltips?.(_getTooltipUIDeps());
}

// ── 아이템 툴팁 ──
function showItemTooltip(event, itemId) {
  window.TooltipUI?.showItemTooltip?.(event, itemId, _getTooltipUIDeps());
}
function hideItemTooltip() {
  window.TooltipUI?.hideItemTooltip?.(_getTooltipUIDeps());
}

function showItemToast(item) {
  window.FeedbackUI?.showItemToast?.(item, _getFeedbackUIDeps());
}

// ── 전설 아이템 획득 풀스크린 연출 ──
function showLegendaryAcquire(item) {
  window.FeedbackUI?.showLegendaryAcquire?.(item, _getFeedbackUIDeps());
}

function showChainAnnounce(text) {
  window.FeedbackUI?.showChainAnnounce?.(text, _getFeedbackUIDeps());
}

function showWorldMemoryNotice(text) {
  window.FeedbackUI?.showWorldMemoryNotice?.(text, _getFeedbackUIDeps());
}
function _flushNoticeQueue() {
  window.FeedbackUI?._flushNoticeQueue?.(_getFeedbackUIDeps());
}

function showMapOverlay(autoClose = false) {
  window.MapUI?.showOverlay?.(autoClose, _getMapUIDeps());
}
function closeMapOverlay() {
  window.MapUI?.closeOverlay?.(_getMapUIDeps());
  // 닫힌 후 노드 카드 등장 애니메이션
  _nodeCardReveal = Date.now();
}
let _nodeCardReveal = 0;

// ────────────────────────────────────────
// SCREEN FSM
// ────────────────────────────────────────
function switchScreen(screen) {
  document.querySelectorAll('.screen').forEach(s=>s.classList.remove('active'));
  const el = document.getElementById(screen+'Screen');
  if (el) el.classList.add('active');
  GS.currentScreen = screen;
  if (screen==='title') { cancelAnimationFrame(titleRAF); animateTitle(); }
}

// ────────────────────────────────────────
// TITLE SCREEN
// ────────────────────────────────────────
let selectedClass = null;

function selectClass(btn) {
  // 이미 처리 중이면 중복 실행 방지
  if (btn._selecting) return;
  btn._selecting = true;
  setTimeout(() => { btn._selecting = false; }, 300);

  document.querySelectorAll('.class-btn').forEach(b => b.classList.remove('selected'));
  btn.classList.add('selected');
  selectedClass = btn.dataset.class;
  document.getElementById('startBtn').disabled = false;

  // 클래스 선택 힌트 숨기기
  const hint = document.getElementById('classSelectHint');
  if (hint) { hint.style.opacity = '0'; hint.style.transform = 'translateY(-8px)'; hint.style.transition = 'opacity 0.4s,transform 0.4s'; }

  const icons = {swordsman:'⚔️', mage:'🔮', hunter:'🗡️'};
  const avatarEl = document.getElementById('playerAvatar');
  if (avatarEl) avatarEl.textContent = icons[selectedClass] || '⚔️';

  // 선택 펄스 애니메이션
  btn.style.transition = 'transform 0.15s ease';
  btn.style.transform = 'scale(1.04) translateY(-4px)';
  setTimeout(() => { btn.style.transform = ''; }, 200);

  // 오디오는 별도로 처리 (실패해도 선택 자체는 유지)
  try { AudioEngine.init(); AudioEngine.resume(); AudioEngine.playClassSelect(selectedClass); } catch(e) { console.warn('Audio error:', e); }
}

function _getSaveSystemDeps() {
  return {
    gs: GS,
    runRules: RunRules,
    doc: document,
    isGameStarted: () => _gameStarted,
  };
}

function _getRunModeDeps() {
  return {
    gs: GS,
    runRules: RunRules,
    saveMeta: () => window.SaveSystem?.saveMeta?.(_getSaveSystemDeps()),
    notice: (msg) => {
      if (typeof showWorldMemoryNotice === 'function') showWorldMemoryNotice(msg);
    },
  };
}

function refreshRunModePanel() {
  window.RunModeUI?.refresh?.(_getRunModeDeps());
}

function shiftAscension(delta) {
  window.RunModeUI?.shiftAscension?.(delta, _getRunModeDeps());
}

function toggleEndlessMode() {
  window.RunModeUI?.toggleEndlessMode?.(_getRunModeDeps());
}

function cycleRunBlessing() {
  window.RunModeUI?.cycleBlessing?.(_getRunModeDeps());
}

function cycleRunCurse() {
  window.RunModeUI?.cycleCurse?.(_getRunModeDeps());
}

function startGame() {
  if (!selectedClass) return;
  AudioEngine.init(); AudioEngine.resume();
  RunRules.ensureMeta(GS.meta);

  const configs = {
    swordsman: {maxHp:80, startEcho:0},
    mage: {maxHp:50, startEcho:20},
    hunter: {maxHp:65, startEcho:10},
  };
  const cfg = configs[selectedClass];
  const ins = GS.meta.inscriptions;
  GS.runConfig = {
    ascension: GS.meta.runConfig.ascension || 0,
    endless: !!GS.meta.runConfig.endless,
    endlessMode: !!GS.meta.runConfig.endless,
    blessing: GS.meta.runConfig.blessing || 'none',
    curse: GS.meta.runConfig.curse || 'none',
  };
  GS._runOutcomeCommitted = false;

  GS.player = {
    class: selectedClass,
    hp: cfg.maxHp + (ins.resilience?10:0),
    maxHp: cfg.maxHp + (ins.resilience?10:0),
    shield: 0, echo: cfg.startEcho + (ins.echo_boost?30:0), maxEcho:100,
    echoChain: 0, energy:3, maxEnergy:3,
    gold: ins.fortune?30:10, kills:0,
    deck: [...DATA.startDecks[selectedClass]],
    hand:[], graveyard:[], exhausted:[], items:[], buffs:{}, silenceGauge:0, zeroCost:false, costDiscount:0,
    upgradedCards: new Set(), _cardUpgradeBonus: {},
  };
  if (!GS.meta.codex) GS.meta.codex = { enemies: new Set(), cards: new Set(), items: new Set() };
  GS.player.deck.forEach(id => GS.meta.codex.cards.add(id));

  // 클래스별 시작 아이템
  const classStartItems = {
    swordsman: 'dull_blade',    // 무딘 검: 카드 사용 시 10% Echo
    mage: 'void_shard',         // 허공 파편: 전투 종료 시 Echo +20
    hunter: 'travelers_map',    // 여행자 지도: 층 이동 시 HP 회복
  };
  if (classStartItems[selectedClass]) {
    GS.player.items.push(classStartItems[selectedClass]);
    GS.meta.codex.items.add(classStartItems[selectedClass]);
  }

  RunRules.applyRunStart(GS);

  shuffleArray(GS.player.deck);
  GS.currentRegion = 0; GS.currentFloor = 0;
  GS.mapNodes = []; GS.currentNode = null; GS.visitedNodes = new Set();
  GS.worldMemory = {...GS.meta.worldMemory};
  GS.stats = {damageDealt:0,damageTaken:0,cardsPlayed:0,maxChain:0};
  GS.combat = {active:false,enemies:[],turn:0,playerTurn:true,log:[]};
  GS._heartUsed = false; GS._temporalTurn = 0; GS._bossAdvancePending = false;
  _resetDeckModalFilter(); // 덱 필터 초기화

  switchScreen('game');
  _gameStarted = true;
  generateMap(0);
  AudioEngine.startAmbient(0);
  updateUI(); updateClassSpecialUI();
  // 캔버스는 화면이 완전히 렌더된 후 초기화 (타이밍 이슈 방지)
  setTimeout(() => {
    initGameCanvas();
    requestAnimationFrame(gameLoop);
    // 맵 오버레이 자동 표시로 루트 인식 유도
    setTimeout(() => showMapOverlay(true), 400);
  }, 80);

  // 스토리 조각 표시
  setTimeout(() => {
    StorySystem.showRunFragment();
    // World Memory 힌트
    const wm = GS.worldMemory;
    const hints = [];
    if ((wm.savedMerchant||0)>0) hints.push('🤝 상인들이 당신을 기억한다');
    if (wm['killed_ancient_echo']) hints.push('💀 태고의 잔향이 기다린다');
    if (hints.length) showWorldMemoryNotice(hints.join(' · '));
  }, 1000);

  // 런 카운터 배지
  if (GS.meta.runCount > 1) {
    setTimeout(() => {
      const badge = document.createElement('div');
      badge.style.cssText = 'position:fixed;top:16px;right:16px;font-family:\'Share Tech Mono\',monospace;font-size:10px;color:rgba(123,47,255,0.6);z-index:20;';
      badge.textContent = `RUN ${GS.meta.runCount}`;
      document.getElementById('gameScreen')?.appendChild(badge);
    }, 500);
  }
}

function selectFragment(effect) {
  const meta = GS.meta;
  switch(effect) {
    case 'echo_boost': meta.inscriptions.echo_boost=true; break;
    case 'resilience': meta.inscriptions.resilience=true; break;
    case 'fortune': meta.inscriptions.fortune=true; break;
  }
  meta.echoFragments--;
  setTimeout(() => {
    switchScreen('title');
    selectedClass = null;
    document.getElementById('startBtn').disabled = true;
    document.querySelectorAll('.class-btn').forEach(b=>b.classList.remove('selected'));
    refreshRunModePanel();
  }, 500);
}

// ────────────────────────────────────────
// REGION ADVANCE
// ────────────────────────────────────────
function advanceToNextRegion() {
  GS.currentRegion++;
  GS.currentFloor = 0;
  MazeSystem.close();

  const region = getRegionData(GS.currentRegion, GS);
  if (!region) return;

  AudioEngine.startAmbient(getBaseRegionIndex(GS.currentRegion));

  const el = document.createElement('div');
  el.style.cssText = 'position:fixed;inset:0;background:rgba(3,3,10,0.95);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:16px;z-index:2000;animation:fadeIn 0.8s ease both;';
  el.innerHTML = `
    <div style="font-family:'Cinzel',serif;font-size:10px;letter-spacing:0.5em;color:var(--text-dim);animation:fadeInUp 0.8s ease both;">NEW REGION</div>
    <div style="font-family:'Cinzel Decorative',serif;font-size:clamp(24px,4vw,48px);font-weight:900;color:${region.accent||'var(--echo)'};text-shadow:0 0 30px ${region.accent||'var(--echo-glow)'};animation:titleReveal 1s ease 0.3s both;opacity:0;">${region.name}</div>
    <div style="font-family:'Cinzel',serif;font-size:12px;letter-spacing:0.2em;color:var(--echo);animation:fadeInUp 1s ease 0.8s both;opacity:0;">${region.rule}</div>
    <div style="font-size:13px;font-style:italic;color:var(--text-dim);max-width:400px;text-align:center;line-height:1.7;animation:fadeInUp 1s ease 1.1s both;opacity:0;">${region.ruleDesc||''}</div>
    ${region.quote ? `<div style="font-family:'Crimson Pro',serif;font-size:15px;font-style:italic;color:rgba(238,240,255,0.45);max-width:380px;text-align:center;line-height:1.8;animation:fadeInUp 1s ease 1.5s both;opacity:0;border-top:1px solid rgba(255,255,255,0.05);padding-top:16px;margin-top:4px;">${region.quote}</div>` : ''}
  `;
  document.body.appendChild(el);
  setTimeout(() => {
    el.style.transition='opacity 0.8s'; el.style.opacity='0';
    setTimeout(() => {
      el.remove();
      generateMap(GS.currentRegion);
      updateUI();
      StorySystem.showRunFragment();
      setTimeout(() => showMapOverlay(true), 200);
    }, 800);
  }, 2800);

  ParticleSystem.burstEffect(window.innerWidth/2, window.innerHeight/2);
  ScreenShake.shake(8, 0.5);
  AudioEngine.playBossPhase();
}

// ────────────────────────────────────────
// HELP / PAUSE UI + HOTKEYS
// ────────────────────────────────────────
function _getHelpPauseUIDeps() {
  return {
    gs: GS,
    doc: document,
    showMapOverlay,
    closeMapOverlay,
    showDeckView,
    closeDeckView,
    useEchoSkill,
    endPlayerTurn,
    renderCombatEnemies,
    finalizeRunOutcome,
    switchScreen,
  };
}

function toggleHelp() {
  if (window.HelpPauseUI?.toggleHelp) {
    window.HelpPauseUI.toggleHelp(_getHelpPauseUIDeps());
  }
}

function abandonRun() {
  if (window.HelpPauseUI?.abandonRun) {
    window.HelpPauseUI.abandonRun(_getHelpPauseUIDeps());
  }
}

function confirmAbandon() {
  if (window.HelpPauseUI?.confirmAbandon) {
    window.HelpPauseUI.confirmAbandon(_getHelpPauseUIDeps());
  }
}

function togglePause() {
  if (window.HelpPauseUI?.togglePause) {
    window.HelpPauseUI.togglePause(_getHelpPauseUIDeps());
  }
}

(function initHelpPauseUIBindings() {
  if (!window.HelpPauseUI) return;
  const deps = _getHelpPauseUIDeps();
  window.HelpPauseUI.showMobileWarning(deps);
  window.HelpPauseUI.bindGlobalHotkeys(deps);
})();

// ────────────────────────────────────────
// UTILITIES
// ────────────────────────────────────────
function shuffleArray(arr) {
  for (let i=arr.length-1;i>0;i--) {
    const j=Math.floor(Math.random()*(i+1));
    [arr[i],arr[j]]=[arr[j],arr[i]];
  }
  return arr;
}

function restartFromEnding() {
  document.getElementById('endingScreen')?.remove();
  switchScreen('title');
  selectedClass = null;
  document.getElementById('startBtn').disabled = true;
  document.querySelectorAll('.class-btn').forEach(b=>b.classList.remove('selected'));
  refreshRunModePanel();
}

// ────────────────────────────────────────
// GLOBAL EXPORTS
// ────────────────────────────────────────
window.GS = GS;
window.GameState = GS;
window.selectClass = selectClass;
window.startGame = startGame;
window.shiftAscension = shiftAscension;
window.toggleEndlessMode = toggleEndlessMode;
window.cycleRunBlessing = cycleRunBlessing;
window.cycleRunCurse = cycleRunCurse;
window.selectFragment = selectFragment;
window.useEchoSkill = useEchoSkill;
window.drawCard = drawCard;
window.endPlayerTurn = endPlayerTurn;
window.showMapOverlay = showMapOverlay;
window.closeMapOverlay = closeMapOverlay;
window.toggleCombatInfo = toggleCombatInfo;
window.handleMapClick = handleMapClick;
window.moveToNode = moveToNode;
window.resolveEvent = resolveEvent;
window.takeRewardCard = takeRewardCard;
window.takeRewardItem = takeRewardItem;
window.skipReward = skipReward;
window.showSkipConfirm = showSkipConfirm;
window.hideSkipConfirm = hideSkipConfirm;
window.returnToGame = returnToGame;
window.restartFromEnding = restartFromEnding;
window.toggleHelp = toggleHelp;
window.handleCardDragStart = handleCardDragStart;
window.handleCardDragEnd = handleCardDragEnd;
window.handleCardDropOnEnemy = handleCardDropOnEnemy;
window.showDeckView = showDeckView;
window.showItemTooltip = showItemTooltip;
window.hideItemTooltip = hideItemTooltip;
window.closeDeckView = closeDeckView;
window.openCodex = openCodex;
window.closeCodex = closeCodex;
window.setCodexTab = setCodexTab;

// ────────────────────────────────────────
// AUTOSAVE SYSTEM
// ────────────────────────────────────────
// SaveSystem is provided by game/save_system.js.

function _bootGame() {
  try {
  document.addEventListener('click', () => { try{AudioEngine.init();AudioEngine.resume();}catch(e){} }, {once:false});
  try { window.SaveSystem?.loadMeta?.(_getSaveSystemDeps()); } catch(e) {}
  try { RunRules.ensureMeta(GS.meta); } catch(e) {}
  // class-btn 이벤트는 onclick 속성으로 처리됨 (중복 등록 방지)
  // startBtn도 onclick 속성으로 처리됨
  initTitleCanvas();
  try { updateUI(); } catch(e) { console.warn('updateUI error:', e); }
  refreshRunModePanel();

  // 메타 데이터 표시 (런 횟수 등)
  if (GS.meta.runCount > 1) {
    const badge = document.createElement('div');
    badge.style.cssText = 'position:fixed;bottom:16px;left:50%;transform:translateX(-50%);font-family:\'Share Tech Mono\',monospace;font-size:10px;color:rgba(123,47,255,0.5);z-index:5;pointer-events:none;';
    badge.textContent = `총 ${GS.meta.runCount-1}회 플레이 · 처치 ${GS.meta.totalKills} · 최고 체인 ${GS.meta.bestChain}`;
    document.getElementById('titleScreen')?.appendChild(badge);
  }

  } catch(e) { console.error('Boot error:', e); }
  console.log(`
╔══════════════════════════════════════════╗
║  ECHO OF THE FALLEN v11 — SET SYSTEM    ║
║                                          ║
║  ✓ 유물 세트 효과 시스템 (3세트 9유물)  ║
║  ✓ 기억의 미궁 — WASD UI 가이드        ║
║  ✓ 미궁 미니맵 + 출구 표시             ║
║  ✓ 방향키 지원 + 이동 피드백            ║
║  ✓ 세트 보너스 패널 (좌측 패널)         ║
║  ✓ 아이템 툴팁 세트 정보 표시           ║
║  ✓ 세트 아이템 점선 테두리 강조         ║
║  ✓ echo_skill 트리거 (잔향 팔찌 세트)  ║
╚══════════════════════════════════════════╝
  `);
}

// 즉시 실행 (load 이벤트 대신)
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', _bootGame);
} else {
  _bootGame();
}
