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
function _getStoryUIDeps() {
  return {
    gs: GS,
    data: DATA,
    doc: document,
    audioEngine: AudioEngine,
    particleSystem: ParticleSystem,
    showWorldMemoryNotice,
  };
}

const StorySystem = {
  unlockNextFragment() {
    window.StoryUI?.unlockNextFragment?.(_getStoryUIDeps());
  },
  showRunFragment() {
    window.StoryUI?.showRunFragment?.(_getStoryUIDeps());
  },
  displayFragment(frag) {
    window.StoryUI?.displayFragment?.(frag, _getStoryUIDeps());
  },
  checkHiddenEnding() {
    return !!window.StoryUI?.checkHiddenEnding?.(_getStoryUIDeps());
  },
  showNormalEnding() {
    window.StoryUI?.showNormalEnding?.(_getStoryUIDeps());
  },
  showHiddenEnding() {
    window.StoryUI?.showHiddenEnding?.(_getStoryUIDeps());
  },
};

// ────────────────────────────────────────
// CLASS MECHANICS
// ────────────────────────────────────────
function _getClassMechanics() {
  return window.ClassMechanics || {};
}

// ────────────────────────────────────────
// CANVAS SETUP
// ────────────────────────────────────────
let gameCanvas, gameCtx;
let minimapCanvas, minimapCtx;
let combatCanvas; // 파티클용

// ────────────────────────────────────────
// MAZE SYSTEM — 독립 풀스크린 오버레이
// ────────────────────────────────────────
const MazeSystem = window.MazeSystem;
window.MazeSystem?.configure?.({
  gs: GS,
  doc: document,
  win: window,
  fovEngine: FovEngine,
  showWorldMemoryNotice: (text) => showWorldMemoryNotice(text),
  startCombat: (isBoss) => startCombat(isBoss),
});

function initTitleCanvas() {
  window.TitleCanvasUI?.init?.({ doc: document });
}

function resizeTitleCanvas() {
  window.TitleCanvasUI?.resize?.({ doc: document });
}

function animateTitle() {
  window.TitleCanvasUI?.animate?.({ doc: document });
}

function _applyGameCanvasRefs(refs) {
  if (!refs) return;
  gameCanvas = refs.gameCanvas;
  gameCtx = refs.gameCtx;
  minimapCanvas = refs.minimapCanvas;
  minimapCtx = refs.minimapCtx;
  combatCanvas = refs.combatCanvas;
}

function _getGameCanvasSetupDeps() {
  return {
    gs: GS,
    doc: document,
    showMapOverlay,
    particleSystem: ParticleSystem,
  };
}

function initGameCanvas() {
  const refs = window.GameCanvasSetupUI?.init?.(_getGameCanvasSetupDeps());
  _applyGameCanvasRefs(refs);
}

function resizeGameCanvas() {
  window.GameCanvasSetupUI?.resize?.();
  _applyGameCanvasRefs(window.GameCanvasSetupUI?.getRefs?.());
}

// ────────────────────────────────────────
// GAME LOOP — 단일 통합 루프
// ────────────────────────────────────────
function _getWorldRenderLoopDeps() {
  return {
    gs: GS,
    refs: {
      gameCanvas,
      gameCtx,
    },
    hitStop: HitStop,
    screenShake: ScreenShake,
    particleSystem: ParticleSystem,
    requestAnimationFrame: window.requestAnimationFrame.bind(window),
    gameLoop,
    renderMinimap: () => renderMinimap(),
    renderNodeInfo: (ctx, w, h) => renderNodeInfo(ctx, w, h),
    getRegionData,
  };
}

function gameLoop(timestamp) {
  window.WorldRenderLoopUI?.gameLoop?.(timestamp, _getWorldRenderLoopDeps());
}

function renderGameWorld(dt, ctx, w, h) {
  window.WorldRenderLoopUI?.renderGameWorld?.(dt, ctx, w, h, _getWorldRenderLoopDeps());
}

function renderRegionBackground(ctx, w, h) {
  window.WorldRenderLoopUI?.renderRegionBackground?.(ctx, w, h, _getWorldRenderLoopDeps());
}

function renderDynamicLights(ctx, w, h) {
  window.WorldRenderLoopUI?.renderDynamicLights?.(ctx, w, h, _getWorldRenderLoopDeps());
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
function _getMapGenerationUIDeps() {
  return {
    gs: GS,
    getRegionData,
    updateNextNodes: () => updateNextNodes(),
    renderMapOverlay: () => renderMapOverlay(),
    updateUI,
    showWorldMemoryNotice,
  };
}

function generateMap(regionIdx) {
  window.MapGenerationUI?.generateMap?.(regionIdx, _getMapGenerationUIDeps());
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

function _getMapNavigationUIDeps() {
  return {
    gs: GS,
    doc: document,
    classMechanics: _getClassMechanics(),
    audioEngine: AudioEngine,
    updateNextNodes: () => updateNextNodes(),
    renderMapOverlay: () => renderMapOverlay(),
    renderMinimap: () => renderMinimap(),
    updateUI,
    startCombat,
    triggerRandomEvent,
    showShop,
    showRestSite,
  };
}

function moveToNode(node) {
  window.MapNavigationUI?.moveToNode?.(node, _getMapNavigationUIDeps());
}

// ────────────────────────────────────────
// COMBAT SYSTEM
// ────────────────────────────────────────
function _getCombatStartUIDeps() {
  return {
    gs: GS,
    data: DATA,
    doc: document,
    getRegionData,
    getBaseRegionIndex,
    getRegionCount,
    difficultyScaler: DifficultyScaler,
    audioEngine: AudioEngine,
    runRules: RunRules,
    classMechanics: _getClassMechanics(),
    showWorldMemoryNotice,
    updateChainUI: (chain) => updateChainUI(chain),
    renderCombatEnemies: () => renderCombatEnemies(),
    renderCombatCards: () => renderCombatCards(),
    updateCombatLog: () => updateCombatLog(),
    updateNoiseWidget: () => updateNoiseWidget(),
    showTurnBanner: (type) => showTurnBanner(type),
    resetCombatInfoPanel: () => _resetCombatInfoPanel(),
    refreshCombatInfoPanel: () => _refreshCombatInfoPanel(),
    updateUI,
    updateClassSpecialUI,
  };
}

function startCombat(isBoss=false) {
  window.CombatStartUI?.startCombat?.(isBoss, _getCombatStartUIDeps());
}

function _getCombatHudUIDeps() {
  return {
    gs: GS,
    data: DATA,
    doc: document,
    win: window,
    classMechanics: _getClassMechanics(),
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
    renderCombatCardsHandlerName: 'renderCombatCards',
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
  window.CardUI?.renderHand?.(_getCardUIDeps());
}

function updateCombatLog() {
  window.CombatHudUI?.updateCombatLog?.(_getCombatHudUIDeps());
}

function updateEchoSkillBtn() {
  window.CombatHudUI?.updateEchoSkillBtn?.(_getCombatHudUIDeps());
}

function _getEchoSkillUIDeps() {
  return {
    gs: GS,
    doc: document,
    audioEngine: AudioEngine,
    showEchoBurstOverlay,
    renderCombatEnemies,
    renderCombatCards,
  };
}

function useEchoSkill() {
  window.EchoSkillUI?.useEchoSkill?.(_getEchoSkillUIDeps());
}

function _getCombatActionsUIDeps() {
  return {
    gs: GS,
    data: DATA,
    doc: document,
    audioEngine: AudioEngine,
    renderCombatCards,
    updateUI,
  };
}

function sortHandByEnergy() {
  window.CombatActionsUI?.sortHandByEnergy?.(_getCombatActionsUIDeps());
}
window.sortHandByEnergy = sortHandByEnergy;

function drawCard() {
  window.CombatActionsUI?.drawCard?.(_getCombatActionsUIDeps());
}

function _getCombatTurnUIDeps() {
  return {
    gs: GS,
    data: DATA,
    doc: document,
    win: window,
    runRules: RunRules,
    audioEngine: AudioEngine,
    particleSystem: ParticleSystem,
    screenShake: ScreenShake,
    getBaseRegionIndex,
    shuffleArray,
    enemyTurn: () => enemyTurn(),
    updateChainUI: (chain) => updateChainUI(chain),
    showTurnBanner: (type) => showTurnBanner(type),
    renderCombatEnemies: () => renderCombatEnemies(),
    renderCombatCards: () => renderCombatCards(),
    updateStatusDisplay: () => updateStatusDisplay(),
    updateClassSpecialUI: () => updateClassSpecialUI(),
    updateUI,
    showEchoBurstOverlay: () => showEchoBurstOverlay(),
    showDmgPopup: (dmg, x, y, color) => showDmgPopup(dmg, x, y, color),
  };
}

function endPlayerTurn() {
  window.CombatTurnUI?.endPlayerTurn?.(_getCombatTurnUIDeps());
}

function enemyTurn() {
  window.CombatTurnUI?.enemyTurn?.(_getCombatTurnUIDeps());
}

function processEnemyStatusTicks() {
  window.CombatTurnUI?.processEnemyStatusTicks?.(_getCombatTurnUIDeps());
}

function handleBossPhaseShift(enemy, idx) {
  window.CombatTurnUI?.handleBossPhaseShift?.(enemy, idx, _getCombatTurnUIDeps());
}

function handleEnemyEffect(effect, enemy, idx) {
  window.CombatTurnUI?.handleEnemyEffect?.(effect, enemy, idx, _getCombatTurnUIDeps());
}

// ────────────────────────────────────────
// EVENT SYSTEM
// ────────────────────────────────────────
function _getEventUIDeps() {
  return {
    gs: GS,
    data: DATA,
    runRules: RunRules,
    doc: document,
    updateUI,
    showItemToast,
    playItemGet: () => AudioEngine.playItemGet(),
  };
}

function triggerRandomEvent() {
  window.EventUI?.triggerRandomEvent?.(_getEventUIDeps());
}

function _updateEventGoldBar() {
  window.EventUI?.updateEventGoldBar?.(_getEventUIDeps());
}

function showEvent(event) {
  window.EventUI?.showEvent?.(event, _getEventUIDeps());
}

function resolveEvent(choiceIdx) {
  window.EventUI?.resolveEvent?.(choiceIdx, _getEventUIDeps());
}

function showShop() {
  window.EventUI?.showShop?.(_getEventUIDeps());
}

function showRestSite() {
  window.EventUI?.showRestSite?.(_getEventUIDeps());
}

function showCardDiscard(gs, isBurn = false) {
  window.EventUI?.showCardDiscard?.(gs, isBurn, _getEventUIDeps());
}

function showItemShop(gs) {
  window.EventUI?.showItemShop?.(gs, _getEventUIDeps());
}

function _getRewardUIDeps() {
  return {
    gs: GS,
    data: DATA,
    doc: document,
    switchScreen,
    returnToGame,
    showItemToast,
    playItemGet: () => AudioEngine.playItemGet(),
  };
}

function showRewardScreen(isBoss) {
  window.RewardUI?.showRewardScreen?.(isBoss, _getRewardUIDeps());
}

function takeRewardCard(cardId) {
  window.RewardUI?.takeRewardCard?.(cardId, _getRewardUIDeps());
}

function takeRewardItem(itemKey) {
  window.RewardUI?.takeRewardItem?.(itemKey, _getRewardUIDeps());
}

function showSkipConfirm() {
  window.RewardUI?.showSkipConfirm?.(_getRewardUIDeps());
}

function hideSkipConfirm() {
  window.RewardUI?.hideSkipConfirm?.(_getRewardUIDeps());
}

function skipReward() {
  window.RewardUI?.skipReward?.(_getRewardUIDeps());
}

function _getRunReturnUIDeps() {
  return {
    gs: GS,
    runRules: RunRules,
    doc: document,
    switchScreen,
    updateUI,
    renderMapOverlay,
    updateNextNodes,
    advanceToNextRegion,
    finalizeRunOutcome,
    storySystem: StorySystem,
  };
}

function returnToGame(fromReward) {
  window.RunReturnUI?.returnToGame?.(fromReward, _getRunReturnUIDeps());
}

// ────────────────────────────────────────
// UI SYSTEM — 단일 통합 updateUI (배치 처리)
// ────────────────────────────────────────
let _gameStarted = false; // 게임 시작 전에는 즉시 실행
function _getHudUpdateUIDeps() {
  return {
    gs: GS,
    data: DATA,
    setBonusSystem: SetBonusSystem,
    doc: document,
    isGameStarted: () => _gameStarted,
    requestAnimationFrame: window.requestAnimationFrame.bind(window),
    setBar: (id, pct) => setBar(id, pct),
    setText: (id, val) => setText(id, val),
    updateNoiseWidget: () => updateNoiseWidget(),
    updateEchoSkillBtn: () => updateEchoSkillBtn(),
    updateStatusDisplay: () => updateStatusDisplay(),
    getRegionData,
  };
}

function _updateEndBtnWarn() {
  window.HudUpdateUI?.updateEndBtnWarn?.(_getHudUpdateUIDeps());
}

function updateUI() {
  window.HudUpdateUI?.updateUI?.(_getHudUpdateUIDeps());
}

function _doUpdateUI() {
  window.HudUpdateUI?.doUpdateUI?.(_getHudUpdateUIDeps());
}

function _getStatusKrMap() {
  return window.StatusEffectsUI?.getStatusMap?.() || {};
}

function _getCombatInfoUIDeps() {
  return {
    gs: GS,
    data: DATA,
    statusKr: _getStatusKrMap(),
    doc: document,
  };
}
function _resetCombatInfoPanel() {
  window.CombatInfoUI?.reset?.(_getCombatInfoUIDeps());
}
function updateStatusDisplay() {
  window.StatusEffectsUI?.updateStatusDisplay?.({
    gs: GS,
    doc: document,
    statusContainerId: 'statusEffects',
    refreshCombatInfoPanel: () => _refreshCombatInfoPanel(),
  });
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

function setBar(id, pct) {
  window.DomValueUI?.setBar?.(id, pct, { doc: document });
}
function setText(id, val) {
  window.DomValueUI?.setText?.(id, val, { doc: document });
}

// ────────────────────────────────────────
// 카드 드래그 앤 드롭
// ────────────────────────────────────────
function _getCardTargetUIDeps() {
  return {
    gs: GS,
    data: DATA,
    doc: document,
    renderCombatEnemies,
  };
}

function handleCardDragStart(event, cardId, idx) {
  window.CardTargetUI?.handleDragStart?.(event, cardId, idx, _getCardTargetUIDeps());
}

function handleCardDragEnd(event) {
  window.CardTargetUI?.handleDragEnd?.(event, _getCardTargetUIDeps());
}

function handleCardDropOnEnemy(event, enemyIdx) {
  window.CardTargetUI?.handleDropOnEnemy?.(event, enemyIdx, _getCardTargetUIDeps());
}

// 적 카드 클릭 → 타겟 지정 (같은 적 다시 클릭하면 해제)
function selectTarget(idx) {
  window.CardTargetUI?.selectTarget?.(idx, _getCardTargetUIDeps());
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
function _getScreenUIDeps() {
  return {
    gs: GS,
    doc: document,
    onEnterTitle: () => {
      animateTitle();
    },
  };
}

function switchScreen(screen) {
  window.ScreenUI?.switchScreen?.(screen, _getScreenUIDeps());
}

// ────────────────────────────────────────
// TITLE SCREEN
// ────────────────────────────────────────
function _getClassSelectUIDeps() {
  return {
    doc: document,
    playClassSelect: (cls) => {
      try {
        AudioEngine.init();
        AudioEngine.resume();
        AudioEngine.playClassSelect(cls);
      } catch (e) {
        console.warn('Audio error:', e);
      }
    },
  };
}

function _getSelectedClass() {
  return window.ClassSelectUI?.getSelectedClass?.() || null;
}

function _clearSelectedClass() {
  window.ClassSelectUI?.clearSelection?.(_getClassSelectUIDeps());
}

function selectClass(btn) {
  window.ClassSelectUI?.selectClass?.(btn, _getClassSelectUIDeps());
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

function _getRunStartUIDeps() {
  return {
    gs: GS,
    doc: document,
    switchScreen,
    markGameStarted: () => { _gameStarted = true; },
    generateMap,
    audioEngine: AudioEngine,
    updateUI,
    updateClassSpecialUI,
    initGameCanvas,
    gameLoop,
    requestAnimationFrame: window.requestAnimationFrame.bind(window),
    showMapOverlay,
    showRunFragment: () => StorySystem.showRunFragment(),
    showWorldMemoryNotice,
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

function _getRunSetupUIDeps() {
  return {
    gs: GS,
    data: DATA,
    runRules: RunRules,
    audioEngine: AudioEngine,
    getSelectedClass: () => _getSelectedClass(),
    shuffleArray,
    resetDeckModalFilter: () => _resetDeckModalFilter(),
    enterRun: () => window.RunStartUI?.enterRun?.(_getRunStartUIDeps()),
  };
}

function startGame() {
  window.RunSetupUI?.startGame?.(_getRunSetupUIDeps());
}

function _getMetaProgressionUIDeps() {
  return {
    gs: GS,
    doc: document,
    switchScreen,
    clearSelectedClass: _clearSelectedClass,
    refreshRunModePanel,
  };
}

function selectFragment(effect) {
  window.MetaProgressionUI?.selectFragment?.(effect, _getMetaProgressionUIDeps());
}

// ────────────────────────────────────────
// REGION ADVANCE
// ────────────────────────────────────────
function _getRegionTransitionUIDeps() {
  return {
    gs: GS,
    doc: document,
    mazeSystem: MazeSystem,
    getRegionData,
    getBaseRegionIndex,
    audioEngine: AudioEngine,
    particleSystem: ParticleSystem,
    screenShake: ScreenShake,
    generateMap,
    updateUI,
    showRunFragment: () => StorySystem.showRunFragment(),
    showMapOverlay,
  };
}

function advanceToNextRegion() {
  window.RegionTransitionUI?.advanceToNextRegion?.(_getRegionTransitionUIDeps());
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
  return window.RandomUtils?.shuffleArray?.(arr) || arr;
}

function restartFromEnding() {
  window.MetaProgressionUI?.restartFromEnding?.(_getMetaProgressionUIDeps());
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

function _getGameBootUIDeps() {
  return {
    gs: GS,
    doc: document,
    audioEngine: AudioEngine,
    runRules: RunRules,
    saveSystem: window.SaveSystem,
    saveSystemDeps: _getSaveSystemDeps(),
    initTitleCanvas,
    updateUI,
    refreshRunModePanel,
  };
}

function _bootGame() {
  window.GameBootUI?.bootGame?.(_getGameBootUIDeps());
}

// 즉시 실행 (load 이벤트 대신)
window.GameBootUI?.bootWhenReady?.(_getGameBootUIDeps());
