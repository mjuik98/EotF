import { GS } from './game_state.js';
import { DATA } from '../data/game_data.js';
import { SecurityUtils } from './utils/security.js';


let _uiPending = false;

function _getDoc(deps) {
  return deps?.doc || document;
}

function _getGS(deps) {
  return deps?.gs || window.GS;
}

export const HudUpdateUI = {
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
      const raf = deps.requestAnimationFrame || window.requestAnimationFrame?.bind(window);
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
      const raf = deps.requestAnimationFrame || window.requestAnimationFrame?.bind(window);
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
    if (typeof window._resetCombatInfoPanel === 'function') {
      window._resetCombatInfoPanel();
    }
    doc.getElementById('noiseGaugeOverlay')?.remove();
    doc.getElementById('cardTooltip')?.classList.remove('visible');
    const handCards = doc.getElementById('combatHandCards');
    if (handCards) handCards.textContent = '';
    const endZone = doc.getElementById('enemyZone');
    if (endZone) endZone.textContent = '';
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

    const raf = deps.requestAnimationFrame || window.requestAnimationFrame?.bind(window);
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
    const data = deps.data || window.DATA;
    const setBonusSystem = deps.setBonusSystem || window.SetBonusSystem;
    const getRegionData = deps.getRegionData || window.getRegionData;
    // Use DomValueUI directly instead of deps
    const setBar = (id, pct) => {
      const el = doc.getElementById(id);
      if (el) el.style.width = `${Math.max(0, Math.min(100, Number(pct) || 0))}%`;
    };
    const setText = (id, val) => {
      const el = doc.getElementById(id);
      if (el) {
        el.textContent = val;
        console.log('[setText]', id, '=', val, 'el:', el.id);
      }
    };

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
    const largePortrait = doc.getElementById('largePlayerPortrait');
    const largeFallback = doc.getElementById('playerPortraitFallback');

    if (p.class) {
      const icons = { swordsman: '⚔️', mage: '🔮', hunter: '🏹', paladin: '🛡️', berserker: '🪓', shielder: '🧱' };
      const avatarEmoji = data?.assets?.avatars?.[p.class] || icons[p.class] || '⚔️';

      // 소형 초상화 (HUD)
      if (avatarEl) {
        avatarEl.style.display = 'block';
        avatarEl.textContent = avatarEmoji;
        avatarEl.style.fontSize = '24px';
      }

      // 대형 초상화 (우측 패널)
      if (largePortrait && largeFallback) {
        largePortrait.style.display = 'none';
        largeFallback.textContent = avatarEmoji;
        largeFallback.style.fontSize = '80px';
        largeFallback.style.display = 'flex';
      }

      // 캐릭터 이름 및 특성 (우측 패널)
      const nameMap = {
        swordsman: '잔향검사', mage: '메아리술사', hunter: '침묵사냥꾼',
        paladin: '성기사', berserker: '광전사', shielder: '쉴더'
      };
      setText('playerNameDisplay', SecurityUtils.escapeHtml(nameMap[p.class] || ''));

      const specialEl = doc.getElementById('playerSpecialDisplay');
      if (specialEl && window.ClassMechanics?.[p.class]) {
        const specialUI = window.ClassMechanics[p.class].getSpecialUI(gs);
        specialEl.textContent = '';
        if (specialUI instanceof HTMLElement) {
          specialEl.appendChild(specialUI);
        } else if (typeof specialUI === 'string') {
          specialEl.textContent = specialUI;
        }
        specialEl.style.display = 'flex';
      } else if (specialEl) {
        specialEl.style.display = 'none';
      }
    }

    // Hover HUD 에도 클래스 특성 표시
    const hoverSpecialEl = doc.getElementById('hoverHudSpecial');
    if (hoverSpecialEl && window.ClassMechanics?.[p.class]) {
      const specialUI = window.ClassMechanics[p.class].getSpecialUI(gs);
      hoverSpecialEl.textContent = '';
      if (specialUI instanceof HTMLElement) {
        hoverSpecialEl.appendChild(specialUI);
      } else if (typeof specialUI === 'string') {
        hoverSpecialEl.textContent = specialUI;
      }
    } else if (hoverSpecialEl) {
      hoverSpecialEl.textContent = '';
      const none = doc.createElement('span');
      none.style.cssText = 'font-size:10px;color:var(--text-dim);font-style:italic;';
      none.textContent = '없음';
      hoverSpecialEl.appendChild(none);
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

    const hudOrbs = doc.getElementById('hudEnergyOrbs');
    if (hudOrbs) {
      hudOrbs.textContent = '';
      for (let i = 0; i < p.maxEnergy; i++) {
        const orb = doc.createElement('div');
        orb.className = `hud-energy-orb ${i < p.energy ? 'filled' : ''}`;
        hudOrbs.appendChild(orb);
      }
    }

    setText('hudEnergyText', `${p.energy}/${p.maxEnergy}`);

    setText('deckCount', p.deck.length);
    setText('graveCount', p.graveyard.length);
    setText('deckSize', p.deck.length);
    setText('graveyardSize', p.graveyard.length);
    setText('exhaustSize', p.exhausted.length);

    const combatOrbs = doc.getElementById('combatEnergyOrbs');
    if (combatOrbs) {
      const displayMax2 = Math.max(p.maxEnergy, p.energy);
      combatOrbs.textContent = '';
      for (let i = 0; i < displayMax2; i++) {
        const filled = i < p.energy;
        const isOverflow = i >= p.maxEnergy;
        const orb = doc.createElement('div');
        orb.className = `energy-orb ${filled ? 'filled' : ''}`;
        if (isOverflow && filled) {
          orb.style.cssText = 'background:var(--cyan);border-color:var(--cyan);box-shadow:0 0 10px rgba(0,255,204,0.8);';
        }
        combatOrbs.appendChild(orb);
      }
    }

    setText('combatEnergyText', `${p.energy} / ${p.maxEnergy}`);
    console.log('[updateUI] combatEnergyText set to:', `${p.energy} / ${p.maxEnergy}`, 'element:', doc.getElementById('combatEnergyText')?.textContent);
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
      ? (getRegionData(gs.currentRegion, gs) || { name: '알 수 없는 지역', rule: '-', floors: 5 })
      : { name: '알 수 없는 지역', rule: '-', floors: 5 };
    setText('regionName', region.name);
    setText('regionRule', region.rule);

    const maxFloors = region.floors || 5;
    const displayFloor = Math.min(maxFloors, gs.currentFloor);
    setText('regionFloor', `${displayFloor} / ${maxFloors}층`);
    setText('playerFloor', `${region.name} · ${displayFloor}층`);

    const classNames = { swordsman: '잔향검사', mage: '메아리술사', hunter: '침묵사냥꾼' };
    setText('playerClassDisplay', classNames[p.class] || p.class);

    const itemEl = doc.getElementById('itemSlots');
    if (itemEl) {
      itemEl.textContent = '';
      if (!p.items.length) {
        const none = doc.createElement('span');
        none.style.cssText = 'font-size:11px;color:var(--text-dim);font-style:italic;';
        none.textContent = '비어있음';
        itemEl.appendChild(none);
      } else {
        const rarityOrder = { legendary: 0, rare: 1, uncommon: 2, common: 3 };
        const sortedItems = [...p.items].sort((a, b) => {
          const ra = rarityOrder[data?.items?.[a]?.rarity || 'common'] ?? 3;
          const rb = rarityOrder[data?.items?.[b]?.rarity || 'common'] ?? 3;
          return ra - rb;
        });

        sortedItems.forEach(id => {
          const item = data?.items?.[id];
          if (!item) return;
          const slot = doc.createElement('div');
          slot.className = `hud-item-slot ${item.rarity ? `item-slot-${item.rarity}` : ''}`;
          const inSet = setBonusSystem ? Object.values(setBonusSystem.sets || {}).some(s => s.items.includes(id)) : false;
          if (inSet) slot.style.outline = '1px dashed rgba(0,255,204,0.4)';
          slot.textContent = item.icon;
          slot.addEventListener('mouseenter', ev => { if (typeof window.showItemTooltip === 'function') window.showItemTooltip(ev, id); });
          slot.addEventListener('mouseleave', () => { if (typeof window.hideItemTooltip === 'function') window.hideItemTooltip(); });
          itemEl.appendChild(slot);
        });
      }

      const setBonusPanel = doc.getElementById('setBonusPanel');
      if (setBonusPanel) {
        const activeSets = setBonusSystem?.getActiveSets?.(gs) || [];
        setBonusPanel.textContent = '';
        if (activeSets.length > 0) {
          setBonusPanel.style.display = 'block';
          activeSets.forEach(s => {
            const div = doc.createElement('div');
            div.style.cssText = 'background:rgba(0,255,204,0.06);border:1px solid rgba(0,255,204,0.2);border-radius:6px;padding:5px 8px;margin-bottom:4px;';
            const name = doc.createElement('div');
            name.style.cssText = "font-family:'Cinzel',serif;font-size:8px;letter-spacing:0.2em;color:var(--cyan);";
            name.textContent = `✦ ${s.name} [${s.count}/3]`;
            const bonus = doc.createElement('div');
            bonus.style.cssText = 'font-size:9px;color:var(--text-dim);margin-top:2px;';
            bonus.textContent = s.bonus?.label || '';
            div.append(name, bonus);
            setBonusPanel.appendChild(div);
          });
          setBonusSystem?.applyPassiveBonuses?.(gs);
        } else {
          setBonusPanel.style.display = 'none';
        }
      }
    }

    const modEl = doc.getElementById('hudRunModifiers');
    if (!modEl) return;
    modEl.textContent = '';
    const runRules = window.RunRules;
    const asc = runRules?.getAscension?.(gs) || 0;
    const endless = runRules?.isEndless?.(gs);

    const topCont = doc.createElement('div');
    topCont.style.cssText = 'display:flex; gap:6px; flex-direction:column;';
    if (asc > 0) {
      const ascDiv = doc.createElement('div');
      ascDiv.style.cssText = "font-family:'Cinzel',serif; font-size:10px; color:var(--danger); letter-spacing:0.1em; background:rgba(255,51,102,0.1); border:1px solid rgba(255,51,102,0.2); border-radius:4px; padding:4px 8px; display:inline-block;";
      ascDiv.textContent = `✦ 승천 ${asc}`;
      topCont.appendChild(ascDiv);
    }
    if (endless) {
      const endDiv = doc.createElement('div');
      endDiv.style.cssText = "font-family:'Cinzel',serif; font-size:10px; color:var(--cyan); letter-spacing:0.1em; background:rgba(0,255,204,0.1); border:1px solid rgba(0,255,204,0.2); border-radius:4px; padding:4px 8px; display:inline-block;";
      endDiv.textContent = '✦ 무한 모드';
      topCont.appendChild(endDiv);
    }
    modEl.appendChild(topCont);

    const blessingId = gs.runConfig?.blessing || 'none';
    const curseId = gs.runConfig?.curse || 'none';

    if (blessingId !== 'none' || curseId !== 'none') {
      const midCont = doc.createElement('div');
      midCont.style.cssText = 'margin-top:4px; display:flex; flex-direction:column; gap:4px;';
      if (blessingId !== 'none') {
        const b = runRules?.blessings?.[blessingId];
        if (b) {
          const bDiv = doc.createElement('div');
          bDiv.style.cssText = 'font-size:11px; color:var(--echo-bright); background:rgba(123,47,255,0.08); border-radius:4px; padding:3px 8px; border:1px solid rgba(123,47,255,0.15); cursor:help;';
          bDiv.title = b.desc; bDiv.textContent = `✨ ${b.name}`;
          midCont.appendChild(bDiv);
        }
      }
      if (curseId !== 'none') {
        const c = runRules?.curses?.[curseId];
        if (c) {
          const cDiv = doc.createElement('div');
          cDiv.style.cssText = 'font-size:11px; color:var(--danger); background:rgba(255,51,102,0.08); border-radius:4px; padding:3px 8px; border:1px solid rgba(255,51,102,0.15); cursor:help;';
          cDiv.title = c.desc; cDiv.textContent = `💀 ${c.name}`;
          midCont.appendChild(cDiv);
        }
      }
      modEl.appendChild(midCont);
    }


    const echoBtn = doc.getElementById('useEchoSkillBtn');
    if (echoBtn) {
      const echoValue = Math.floor(p.echo);
      const can = echoValue >= 30;
      echoBtn.disabled = !can;
      echoBtn.style.opacity = can ? '1' : '0.4';
      if (can) {
        // Echo 스킬 버튼 텍스트는 updateEchoSkillBtn 에서 일관되게 처리
        if (typeof deps.updateEchoSkillBtn === 'function') deps.updateEchoSkillBtn();
      } else {
        echoBtn.textContent = `⚡ Echo 스킬 (${echoValue}/30)`;
      }
    }

    const drawBtn = doc.getElementById('drawCardBtn');
    if (drawBtn) {
      const handFull = p.hand.length >= 8;
      const canDraw = gs.combat.active && gs.combat.playerTurn && p.energy >= 1 && !handFull;
      console.log('[updateUI] drawBtn - energy:', p.energy, 'canDraw:', canDraw, 'combat.active:', gs.combat?.active, 'playerTurn:', gs.combat?.playerTurn);
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

  updatePlayerStats(gs, deps = {}) {
    if (!gs?.player) return;
    const p = gs.player;
    const doc = _getDoc(deps);
    const setText = deps.setText || ((id, val) => {
      const el = doc.getElementById(id);
      if (el) el.textContent = val;
    });
    const setBar = deps.setBar || ((id, pct) => {
      const el = doc.getElementById(id);
      if (el) el.style.width = `${pct}%`;
    });

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

    const shieldTrigger = doc.getElementById('hudShieldTrigger');
    if (shieldTrigger) {
      shieldTrigger.style.opacity = p.shield > 0 ? '1' : '0.3';
      setText('hudShieldText', p.shield);
    }

    const shieldBar = doc.getElementById('shieldBar');
    if (shieldBar) shieldBar.style.width = `${Math.min(100, (p.shield / p.maxHp) * 100)}%`;
    setText('shieldText', p.shield || '0');

    const echoBar = doc.getElementById('echoBar');
    if (echoBar) echoBar.style.width = `${(p.echo / p.maxEcho) * 100}%`;
    setText('echoText', `${Math.floor(p.echo)} / ${p.maxEcho}`);

    // Update Echo skill button state
    if (typeof window.updateEchoSkillBtn === 'function') {
      window.updateEchoSkillBtn();
    } else {
      const echoBtn = doc.getElementById('useEchoSkillBtn');
      if (echoBtn) {
        const can = p.echo >= 30;
        echoBtn.disabled = !can;
        if (!can) {
          echoBtn.textContent = `⚡ Echo 스킬 (${Math.floor(p.echo)}/30)`;
          echoBtn.style.opacity = '0.4';
        } else {
          echoBtn.style.opacity = '1';
        }
      }
    }
  },

  // Expose public API for GAME.API
  api: {
    updateUI: (deps) => HudUpdateUI.updateUI(deps),
    updatePlayerStats: (gs, deps) => HudUpdateUI.updatePlayerStats(gs, deps),
    resetCombatUI: (deps) => HudUpdateUI.resetCombatUI(deps),
    triggerDeckShufflePulse: (deps) => HudUpdateUI.triggerDeckShufflePulse(deps),
  }
};
