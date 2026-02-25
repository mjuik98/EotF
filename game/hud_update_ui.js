import { GS } from './game_state.js';
import { DATA } from '../data/game_data.js';


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
      setText('playerNameDisplay', nameMap[p.class] || '');

      const specialEl = doc.getElementById('playerSpecialDisplay');
      if (specialEl && window.ClassMechanics?.[p.class]) {
        const specialUI = window.ClassMechanics[p.class].getSpecialUI(gs);
        if (typeof specialUI === 'string') {
          specialEl.innerHTML = specialUI;
        } else {
          specialEl.innerHTML = '';
          specialEl.appendChild(specialUI);
        }
        specialEl.style.display = 'flex';
      } else if (specialEl) {
        specialEl.style.display = 'none';
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

    const hudOrbs = doc.getElementById('hudEnergyOrbs');
    if (hudOrbs) {
      hudOrbs.innerHTML = Array.from({ length: p.maxEnergy }, (_, i) => {
        const filled = i < p.energy;
        return `<div class="hud-energy-orb ${filled ? 'filled' : ''}"></div>`;
      }).join('');
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

    const modEl = doc.getElementById('runModifiersSection');
    if (modEl) {
      let modHtml = '';
      const runRules = window.RunRules;
      const asc = runRules?.getAscension?.(gs) || 0;
      const endless = runRules?.isEndless?.(gs);

      // 승천/엔들리스 정보
      modHtml += `<div style="display:flex; gap:6px; flex-direction:column;">`;
      if (asc > 0) {
        modHtml += `<div style="font-family:'Cinzel',serif; font-size:10px; color:var(--danger); letter-spacing:0.1em; background:rgba(255,51,102,0.1); border:1px solid rgba(255,51,102,0.2); border-radius:4px; padding:4px 8px; display:inline-block;">✦ 승천 ${asc}</div>`;
      }
      if (endless) {
        modHtml += `<div style="font-family:'Cinzel',serif; font-size:10px; color:var(--cyan); letter-spacing:0.1em; background:rgba(0,255,204,0.1); border:1px solid rgba(0,255,204,0.2); border-radius:4px; padding:4px 8px; display:inline-block;">✦ 무한 모드</div>`;
      }
      modHtml += `</div>`;

      // 축복/저주 정보
      const blessingId = gs.runConfig?.blessing || 'none';
      const curseId = gs.runConfig?.curse || 'none';

      if (blessingId !== 'none' || curseId !== 'none') {
        modHtml += `<div style="margin-top:4px; display:flex; flex-direction:column; gap:4px;">`;
        if (blessingId !== 'none') {
          const b = runRules?.blessings?.[blessingId];
          if (b) modHtml += `<div title="${b.desc}" style="font-size:11px; color:var(--echo-bright); background:rgba(123,47,255,0.08); border-radius:4px; padding:3px 8px; border:1px solid rgba(123,47,255,0.15); cursor:help;">✨ ${b.name}</div>`;
        }
        if (curseId !== 'none') {
          const c = runRules?.curses?.[curseId];
          if (c) modHtml += `<div title="${c.desc}" style="font-size:11px; color:var(--danger); background:rgba(255,51,102,0.08); border-radius:4px; padding:3px 8px; border:1px solid rgba(255,51,102,0.15); cursor:help;">💀 ${c.name}</div>`;
        }
        modHtml += `</div>`;
      }

      modEl.innerHTML = modHtml;
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
