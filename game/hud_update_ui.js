'use strict';

(function initHudUpdateUI(globalObj) {
  let _uiPending = false;

  function _getDoc(deps) {
    return deps?.doc || document;
  }

  function _getGS(deps) {
    return deps?.gs || globalObj.GS;
  }

  const HudUpdateUI = {
    triggerDeckShufflePulse(deps = {}) {
      const doc = _getDoc(deps);
      const deckEls = doc.querySelectorAll('#deckCount, #combatDeckCount');
      deckEls.forEach(el => {
        el.style.transition = 'color 0.15s, text-shadow 0.15s';
        el.style.color = 'var(--cyan)';
        el.style.textShadow = '0 0 10px rgba(0,255,204,0.8)';
        setTimeout(() => { el.style.color = ''; el.style.textShadow = ''; }, 600);
      });
    },

    enableActionButtons(deps = {}) {
      const doc = _getDoc(deps);
      doc.querySelectorAll('.action-btn').forEach(b => { b.disabled = false; });
    },

    triggerDrawCardAnimation(deps = {}) {
      const doc = _getDoc(deps);
      doc.querySelectorAll('#handCards .card, #combatHandCards .card').forEach((el, i) => {
        el.style.animation = 'none';
        const raf = deps.requestAnimationFrame || globalObj.requestAnimationFrame?.bind(globalObj);
        if (typeof raf === 'function') {
          raf(() => { el.style.animation = `cardDraw 0.25s ease ${i * 0.04}s both`; });
        } else {
          el.style.animation = `cardDraw 0.25s ease ${i * 0.04}s both`;
        }
      });
    },

    triggerCardShakeAnimation(deps = {}) {
      const doc = _getDoc(deps);
      doc.querySelectorAll('#combatHandCards .card:not(.playable)').forEach(el => {
        el.style.animation = 'none';
        const raf = deps.requestAnimationFrame || globalObj.requestAnimationFrame?.bind(globalObj);
        if (typeof raf === 'function') {
          raf(() => { el.style.animation = 'shake 0.3s ease'; });
        } else {
          el.style.animation = 'shake 0.3s ease';
        }
      });
    },

    resetCombatUI(deps = {}) {
      const doc = _getDoc(deps);
      doc.getElementById('combatOverlay')?.classList.remove('active');
      if (typeof globalObj._resetCombatInfoPanel === 'function') {
        globalObj._resetCombatInfoPanel();
      }
      doc.getElementById('noiseGaugeOverlay')?.remove();
      doc.getElementById('cardTooltip')?.classList.remove('visible');
      const handCards = doc.getElementById('combatHandCards');
      if (handCards) handCards.innerHTML = '';
      const endZone = doc.getElementById('enemyZone');
      if (endZone) endZone.innerHTML = '';
    },

    hideNodeOverlay(deps = {}) {
      const doc = _getDoc(deps);
      const nodeOverlay = doc.getElementById('nodeCardOverlay');
      if (nodeOverlay) nodeOverlay.style.display = 'none';
    },

    updateEndBtnWarn(deps = {}) {
      const gs = _getGS(deps);
      if (!gs) return;

      const doc = _getDoc(deps);
      const btn = doc.getElementById('combatOverlay')?.querySelector('.action-btn-end');
      if (!btn) return;
      const hasEnergy = gs.player.energy > 0 && gs.combat.active && gs.combat.playerTurn;
      btn.classList.toggle('energy-warn', hasEnergy);
    },

    updateUI(deps = {}) {
      const isGameStarted = typeof deps.isGameStarted === 'function'
        ? deps.isGameStarted()
        : !!deps.gameStarted;

      if (!isGameStarted) {
        this.doUpdateUI(deps);
        return;
      }

      if (_uiPending) return;
      _uiPending = true;

      const raf = deps.requestAnimationFrame || globalObj.requestAnimationFrame?.bind(globalObj);
      if (typeof raf === 'function') {
        raf(() => {
          _uiPending = false;
          this.doUpdateUI(deps);
        });
        return;
      }

      _uiPending = false;
      this.doUpdateUI(deps);
    },

    doUpdateUI(deps = {}) {
      const gs = _getGS(deps);
      const p = gs?.player;
      if (!gs || !p) return;

      const doc = _getDoc(deps);
      const data = deps.data || globalObj.DATA;
      const setBonusSystem = deps.setBonusSystem || globalObj.SetBonusSystem;
      const getRegionData = deps.getRegionData || globalObj.getRegionData;
      const setBar = deps.setBar || (() => { });
      const setText = deps.setText || (() => { });

      // HP - 저체력 시 색상 변화
      const hpPct = Math.max(0, (p.hp / p.maxHp) * 100);
      setBar('hpBar', hpPct);
      setText('hpText', `${Math.max(0, p.hp)} / ${p.maxHp}`);

      const hpFill = doc.getElementById('hpBar');
      if (hpFill) {
        if (hpPct <= 25) hpFill.style.background = 'linear-gradient(90deg,#8b0000,#cc0000)';
        else if (hpPct <= 50) hpFill.style.background = 'linear-gradient(90deg,#aa1122,#dd2244)';
        else hpFill.style.background = 'linear-gradient(90deg,#cc2244,#ff4466)';
      }

      const hudHpMini = doc.getElementById('hudHpBarMini');
      if (hudHpMini) {
        hudHpMini.style.width = `${hpPct}%`;
        hudHpMini.style.background = hpPct <= 25
          ? 'linear-gradient(90deg,#8b0000,#cc0000)'
          : 'linear-gradient(90deg,#cc2244,#ff4466)';
      }

      const hudEchoMini = doc.getElementById('hudEchoBarMini');
      if (hudEchoMini) hudEchoMini.style.width = `${(p.echo / p.maxEcho) * 100}%`;

      setText('hudHpText', `${Math.max(0, p.hp)}/${p.maxHp}`);
      setText('hudEchoText', Math.floor(p.echo));
      setText('hudGoldText', p.gold);

      const avatarEl = doc.getElementById('playerAvatar');
      if (avatarEl && p.class) {
        const avatarFile = data?.assets?.avatars?.[p.class];
        if (avatarFile) {
          const icons = { swordsman: '⚔️', mage: '🔮', hunter: '🗡️' };
          const fallbackIcon = icons[p.class] || '⚔️';
          avatarEl.innerHTML = `
            <img src="assets/images/${avatarFile}" style="width:24px;height:24px;object-fit:contain;vertical-align:middle;" 
                 onerror="this.style.display='none'; this.nextElementSibling.style.display='inline';">
            <span style="display:none;font-size:18px;vertical-align:middle;">${fallbackIcon}</span>
          `;
        }
      }

      const shieldTrigger = doc.getElementById('hudShieldTrigger');
      if (shieldTrigger) {
        shieldTrigger.style.opacity = p.shield > 0 ? '1' : '0.3';
        setText('hudShieldText', p.shield);
      }

      doc.getElementById('hoverHud')?.classList.toggle('low-hp', hpPct <= 30);

      setBar('shieldBar', Math.min(100, (p.shield / p.maxHp) * 100));
      setText('shieldText', p.shield || '0');

      setBar('echoBar', (p.echo / p.maxEcho) * 100);
      setText('echoText', `${Math.floor(p.echo)} / ${p.maxEcho}`);

      const orbs = doc.getElementById('energyOrbs');
      if (orbs) {
        const displayMax = Math.max(p.maxEnergy, p.energy);
        orbs.innerHTML = Array.from({ length: displayMax }, (_, i) => {
          const filled = i < p.energy;
          const isOverflow = i >= p.maxEnergy;
          return `<div class="energy-orb ${filled ? 'filled' : ''}" style="${isOverflow && filled ? 'background:var(--cyan);border-color:var(--cyan);box-shadow:0 0 10px rgba(0,255,204,0.8);' : ''}" title="${i + 1}/${p.maxEnergy}"></div>`;
        }).join('');
      }

      setText('energyText', `${p.energy} / ${p.maxEnergy}`);

      setText('deckCount', p.deck.length);
      setText('graveCount', p.graveyard.length);
      setText('deckSize', p.deck.length);
      setText('graveyardSize', p.graveyard.length);
      setText('exhaustSize', p.exhausted.length);

      const combatOrbs = doc.getElementById('combatEnergyOrbs');
      if (combatOrbs) {
        const displayMax2 = Math.max(p.maxEnergy, p.energy);
        combatOrbs.innerHTML = Array.from({ length: displayMax2 }, (_, i) => {
          const filled = i < p.energy;
          const isOverflow = i >= p.maxEnergy;
          return `<div class="energy-orb ${filled ? 'filled' : ''}" style="${isOverflow && filled ? 'background:var(--cyan);border-color:var(--cyan);box-shadow:0 0 10px rgba(0,255,204,0.8);' : ''}"></div>`;
        }).join('');
      }

      setText('combatEnergyText', `${p.energy} / ${p.maxEnergy}`);
      setText('combatDeckCount', p.deck.length);
      setText('combatGraveCount', p.graveyard.length);
      setText('combatExhaustCount', p.exhausted.length);

      if (typeof deps.updateNoiseWidget === 'function') deps.updateNoiseWidget();

      const endBtn = doc.querySelector('.action-btn-end');
      if (endBtn && gs.combat.active && gs.combat.playerTurn) {
        const hasPlayable = gs.player.hand.some(id => {
          const c = data?.cards?.[id];
          if (!c) return false;
          const cascade = gs.player._cascadeCards;
          const isCascadeFree = cascade instanceof Map
            ? (cascade.get(id) || 0) > 0
            : !!(cascade && cascade.has && cascade.has(id));
          const hasFreeCharge = Number(gs.player._freeCardUses || 0) > 0;
          const cost = (gs.player.zeroCost || isCascadeFree || hasFreeCharge) ? 0 : Math.max(0, c.cost - (gs.player.costDiscount || 0));
          return gs.player.energy >= cost;
        });
        endBtn.classList.toggle('energy-warn', hasPlayable && gs.player.energy > 0);
      }

      setText('runCount', gs.meta.runCount);
      setText('killCount', p.kills);
      setText('goldCount', p.gold);

      const region = typeof getRegionData === 'function'
        ? (getRegionData(gs.currentRegion, gs) || { name: '알 수 없는 지역', rule: '-', floors: 1 })
        : { name: '알 수 없는 지역', rule: '-', floors: 1 };
      setText('regionName', region.name);
      setText('regionRule', region.rule);
      setText('regionFloor', `${gs.currentFloor} / ${region.floors}층`);
      setText('playerFloor', `${region.name} · ${gs.currentFloor}층`);

      const classNames = { swordsman: '잔향검사', mage: '메아리술사', hunter: '침묵사냥꾼' };
      setText('playerClassDisplay', classNames[p.class] || p.class);

      const itemEl = doc.getElementById('itemSlots');
      if (itemEl) {
        if (!p.items.length) {
          itemEl.innerHTML = '<span style="font-size:11px;color:var(--text-dim);font-style:italic;">비어있음</span>';
        } else {
          const rarityOrder = { legendary: 0, rare: 1, uncommon: 2, common: 3 };
          const sortedItems = [...p.items].sort((a, b) => {
            const ra = rarityOrder[data?.items?.[a]?.rarity || 'common'] ?? 3;
            const rb = rarityOrder[data?.items?.[b]?.rarity || 'common'] ?? 3;
            return ra - rb;
          });

          itemEl.innerHTML = sortedItems.map(id => {
            const item = data?.items?.[id];
            if (!item) return '';
            const rarityClass = item.rarity ? `item-slot-${item.rarity}` : '';
            const inSet = setBonusSystem
              ? Object.values(setBonusSystem.sets || {}).some(s => s.items.includes(id))
              : false;
            const setGlow = inSet ? 'outline:1px dashed rgba(0,255,204,0.4);' : '';
            return `<div class="hud-item-slot ${rarityClass}" style="${setGlow}"
          onmouseenter="showItemTooltip(event,'${id}')"
          onmouseleave="hideItemTooltip()">${item.icon}</div>`;
          }).join('');
        }

        const setBonusPanel = doc.getElementById('setBonusPanel');
        if (setBonusPanel) {
          const activeSets = setBonusSystem?.getActiveSets?.(gs) || [];
          if (activeSets.length > 0) {
            setBonusPanel.style.display = 'block';
            setBonusPanel.innerHTML = activeSets.map(s => `
          <div style="background:rgba(0,255,204,0.06);border:1px solid rgba(0,255,204,0.2);border-radius:6px;padding:5px 8px;margin-bottom:4px;">
            <div style="font-family:'Cinzel',serif;font-size:8px;letter-spacing:0.2em;color:var(--cyan);">✦ ${s.name} [${s.count}/3]</div>
            <div style="font-size:9px;color:var(--text-dim);margin-top:2px;">${s.bonus?.label || ''}</div>
          </div>
        `).join('');
            setBonusSystem?.applyPassiveBonuses?.(gs);
          } else {
            setBonusPanel.style.display = 'none';
          }
        }
      }

      const echoBtn = doc.getElementById('echoSkillBtn');
      if (echoBtn) {
        const can = p.echo >= 30;
        echoBtn.disabled = !can;
        if (can) {
          if (typeof deps.updateEchoSkillBtn === 'function') deps.updateEchoSkillBtn();
        } else {
          echoBtn.textContent = `⚡ Echo 스킬 (${Math.floor(p.echo)}/30)`;
          echoBtn.style.opacity = '0.4';
        }
      }

      const drawBtn = doc.getElementById('drawCardBtn');
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

      if (typeof deps.updateStatusDisplay === 'function') deps.updateStatusDisplay();
      this.updateEndBtnWarn(deps);
    },
  };

  globalObj.HudUpdateUI = HudUpdateUI;
})(window);
