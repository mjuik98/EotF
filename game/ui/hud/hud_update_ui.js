import { SecurityUtils } from '../../utils/security.js';
import { getEchoTierWindow, getHpBarGradient, setActionButtonLabel } from './hud_render_helpers.js';
import {
  triggerDeckShufflePulseUI,
  enableActionButtonsUI,
  triggerDrawCardAnimationUI,
  triggerCardShakeAnimationUI,
  resetCombatUIUI,
  hideNodeOverlayUI,
} from './hud_effects_ui.js';
import { updateCombatEnergyUI, updatePlayerStatsUI } from './hud_stats_ui.js';
import { DomValueUI } from './dom_value_ui.js';
import { resolveDrawAvailability } from '../combat/draw_availability.js';
import { getDoc as _getDoc, getRaf } from '../../utils/runtime_deps.js';
import { RARITY_SORT_ORDER } from '../../../data/rarity_meta.js';


let _uiPending = false;

function _getGS(deps) {
  return deps?.gs;
}

export const HudUpdateUI = {
  triggerDeckShufflePulse(deps = {}) {
    triggerDeckShufflePulseUI(deps);
  },

  enableActionButtons(deps = {}) {
    enableActionButtonsUI(deps);
  },

  triggerDrawCardAnimation(deps = {}) {
    triggerDrawCardAnimationUI(deps);
  },

  triggerCardShakeAnimation(deps = {}) {
    triggerCardShakeAnimationUI(deps);
  },

  resetCombatUI(deps = {}) {
    resetCombatUIUI(deps);
  },

  hideNodeOverlay(deps = {}) {
    hideNodeOverlayUI(deps);
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

    const raf = getRaf(deps);
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

  /**
   * UI
   * 
   */
  processDirtyFlags(deps = {}) {
    const gs = _getGS(deps);
    if (!gs || !gs.isDirty()) return;

    if (gs.hasDirtyFlag('hud')) {
      this.updateUI(deps);
    }

    const renderCombatEnemies = deps.renderCombatEnemies;
    if (gs.hasDirtyFlag('enemies') && typeof renderCombatEnemies === 'function') {
      renderCombatEnemies();
    }

    const renderCombatCards = deps.renderCombatCards;
    if (gs.hasDirtyFlag('hand') && typeof renderCombatCards === 'function') {
      renderCombatCards();
    }

    gs.clearDirty();
  },

  doUpdateUI(deps = {}) {
    const gs = _getGS(deps);
    const p = gs?.player;
    if (!gs || !p) return;

    const doc = _getDoc(deps);
    const data = deps.data;
    const setBonusSystem = deps.setBonusSystem
      || deps.SetBonusSystem
      || globalThis.SetBonusSystem
      || globalThis.GAME?.Modules?.['SetBonusSystem'];
    const getRegionData = deps.getRegionData;
    const domDeps = deps?.doc ? deps : { ...deps, doc };
    const setBar = (id, pct) => DomValueUI.setBar(id, pct, domDeps);
    const setText = (id, val) => DomValueUI.setText(id, val, domDeps);

    // HP - 
    const hpPct = Math.max(0, (p.hp / p.maxHp) * 100);
    setBar('hpBar', hpPct);
    setText('hpText', `${Math.max(0, p.hp)} / ${p.maxHp}`);

    // 
    setBar('hoverHpBar', hpPct);
    setText('hoverHpText', `${Math.max(0, p.hp)} / ${p.maxHp}`);

    const hpFill = doc.getElementById('hpBar');
    const hoverHpFill = doc.getElementById('hoverHpBar');
    const updateHpBackground = (el, pct) => {
      if (!el) return;
      el.style.background = getHpBarGradient(pct);
    };
    updateHpBackground(hpFill, hpPct);
    updateHpBackground(hoverHpFill, hpPct);

    const hudHpMini = doc.getElementById('hudHpBarMini');
    if (hudHpMini) {
      hudHpMini.style.width = `${hpPct}%`;
      hudHpMini.style.background = hpPct <= 25
        ? 'linear-gradient(90deg,#8b0000,#cc0000)'
        : 'linear-gradient(90deg,#cc2244,#ff4466)';
    }

    // HUD HP
    setText('hudHpText', `${Math.max(0, p.hp)}/${p.maxHp}`);

    const hudEchoText = doc.getElementById('hudEchoText');
    if (hudEchoText) hudEchoText.textContent = Math.floor(p.echo);

    const mazeEcho = doc.getElementById('mazeEcho');
    if (mazeEcho) mazeEcho.textContent = Math.floor(p.echo);

    const hudEchoMini = doc.getElementById('hudEchoBarMini');
    if (hudEchoMini) {
      const echoInfo = getEchoTierWindow(p.echo);
      hudEchoMini.style.width = `${echoInfo.pct}%`;
      hudEchoMini.style.background = echoInfo.bg;
    }

    setText('hudGoldText', p.gold);

    const avatarEl = doc.getElementById('playerAvatar');
    const largePortrait = doc.getElementById('largePlayerPortrait');
    const largeFallback = doc.getElementById('playerPortraitFallback');

    if (p.class) {
      const classMeta = data?.classes?.[p.class];
      const avatarEmoji = classMeta?.emoji || '⚔️';

      // (HUD)
      if (avatarEl) {
        avatarEl.style.display = 'block';
        avatarEl.textContent = avatarEmoji;
        avatarEl.style.fontSize = '24px';
      }

      // 
      if (largeFallback) {
        largeFallback.textContent = avatarEmoji;
        largeFallback.style.fontSize = '80px';
        largeFallback.style.display = 'flex';
      }

      // 
      const className = classMeta?.name || p.class;
      setText('playerNameDisplay', SecurityUtils.escapeHtml(className));

      const specialEl = doc.getElementById('playerSpecialDisplay');
      if (specialEl && deps.classMechanics?.[p.class]) {
        const specialUI = deps.classMechanics[p.class].getSpecialUI(gs);
        specialEl.textContent = '';
        if (specialUI instanceof HTMLElement) {
          specialEl.appendChild(specialUI);
        } else if (typeof specialUI === 'string') {
          specialEl.textContent = specialUI;
        }
        specialEl.style.display = 'flex';
      } else if (specialEl && globalThis.GAME?.Modules?.['ClassMechanics']?.[p.class]) {
        // Fallback to GAME object
        const specialUI = globalThis.GAME.Modules['ClassMechanics'][p.class].getSpecialUI(gs);
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



    // Hover HUD 
    const hoverSpecialEl = doc.getElementById('hoverHudSpecial');
    if (hoverSpecialEl && deps.classMechanics?.[p.class]) {
      const specialUI = deps.classMechanics[p.class].getSpecialUI(gs);
      hoverSpecialEl.textContent = '';
      if (specialUI instanceof HTMLElement) {
        hoverSpecialEl.appendChild(specialUI);
      } else if (typeof specialUI === 'string') {
        hoverSpecialEl.textContent = specialUI;
      }
    } else if (hoverSpecialEl && globalThis.GAME?.Modules?.['ClassMechanics']?.[p.class]) {
      // Fallback
      const specialUI = globalThis.GAME.Modules['ClassMechanics'][p.class].getSpecialUI(gs);
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
    setBar('hoverShieldBar', Math.min(100, (p.shield / p.maxHp) * 100));
    setText('hoverShieldText', p.shield || '0');

    const echoInfo = getEchoTierWindow(p.echo);
    setBar('echoBar', echoInfo.pct);
    setText('echoText', `${echoInfo.echo} / ${p.maxEcho}`);
    setBar('hoverEchoBar', echoInfo.pct);
    setText('hoverEchoText', `${echoInfo.echo} / ${p.maxEcho}`);

    const echoBarEl = doc.getElementById('echoBar');
    const hoverEchoBarEl = doc.getElementById('hoverEchoBar');
    if (echoBarEl) echoBarEl.style.background = echoInfo.bg;
    if (hoverEchoBarEl) hoverEchoBarEl.style.background = echoInfo.bg;

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
    setText('combatDeckCount', p.deck.length);
    setText('combatGraveCount', p.graveyard.length);
    setText('combatExhaustCount', p.exhausted.length);

    if (typeof deps.updateNoiseWidget === 'function') deps.updateNoiseWidget();

    const endBtn = doc.querySelector('.action-btn-end');
    if (endBtn && gs.combat.active && gs.combat.playerTurn) {
      const cardCostUtils = deps.cardCostUtils
        || deps.CardCostUtils
        || globalThis.CardCostUtils
        || globalThis.GAME?.Modules?.['CardCostUtils'];
      const hasPlayable = p.hand.some((id, handIndex) => {
        const c = data?.cards?.[id];
        if (!c) return false;
        const cost = typeof cardCostUtils?.calcEffectiveCost === 'function'
          ? cardCostUtils.calcEffectiveCost(id, c, p, handIndex)
          : c.cost;
        return p.energy >= cost;
      });
      endBtn.classList.toggle('energy-warn', hasPlayable && p.energy > 0);
    }

    setText('runCount', gs.meta.runCount);
    setText('killCount', p.kills);
    setText('goldCount', p.gold);

    const getRegData = typeof getRegionData === 'function' ? getRegionData : (typeof globalThis.getRegionData === 'function' ? globalThis.getRegionData : null);
    const region = typeof getRegData === 'function'
      ? (getRegData(gs.currentRegion, gs) || { name: '알 수 없는 지역', rule: '-', floors: 5 })
      : { name: '알 수 없는 지역', rule: '-', floors: 5 };
    setText('regionName', region.name);
    setText('regionRule', region.rule);

    // Add tooltip to Region Rule / Name
    const regionNameEl = doc.getElementById('regionName');
    const regionRuleEl = doc.getElementById('regionRule');

    if (regionNameEl && regionRuleEl) {
      const showTooltip = (evt) => {
        const title = `${region.name} - ${region.rule}`;
        const desc = region.ruleDesc || '특수 규칙이 적용되는 지역입니다.';
        const tooltipUI = deps.tooltipUI
          || deps.TooltipUI
          || globalThis.TooltipUI
          || globalThis.GAME?.Modules?.['TooltipUI'];

        if (typeof tooltipUI?.showGeneralTooltip === 'function') {
          tooltipUI.showGeneralTooltip(evt, title, desc, { doc, win: window });
        } else if (typeof deps.showGeneralTooltip === 'function') {
          deps.showGeneralTooltip(evt, title, desc, { doc, win: window });
        }
      };
      const hideTooltip = () => {
        const tooltipUI = deps.tooltipUI
          || deps.TooltipUI
          || globalThis.TooltipUI
          || globalThis.GAME?.Modules?.['TooltipUI'];

        if (typeof tooltipUI?.hideGeneralTooltip === 'function') {
          tooltipUI.hideGeneralTooltip();
        } else if (typeof deps.hideGeneralTooltip === 'function') {
          deps.hideGeneralTooltip();
        }
      };

      // Clean up previous listeners
      regionNameEl.onmouseenter = showTooltip;
      regionNameEl.onmouseleave = hideTooltip;
      regionRuleEl.onmouseenter = showTooltip;
      regionRuleEl.onmouseleave = hideTooltip;
    }

    const maxFloors = region.floors || 5;
    const displayFloor = Math.min(maxFloors, gs.currentFloor);
    setText('regionFloor', `${displayFloor} / ${maxFloors}F`);
    setText('playerFloor', `${region.name} - ${displayFloor}F`);

    const className = data?.classes?.[p.class]?.name || p.class;
    setText('playerClassDisplay', className);

    const itemEl = doc.getElementById('itemSlots');
    if (itemEl) {
      itemEl.textContent = '';
      if (!p.items.length) {
        const none = doc.createElement('span');
        none.style.cssText = 'font-size:11px;color:var(--text-dim);font-style:italic;';
        none.textContent = '비어있음';
        itemEl.appendChild(none);
      } else {
        const sortedItems = [...p.items].sort((a, b) => {
          const ra = RARITY_SORT_ORDER[data?.items?.[a]?.rarity || 'common'] ?? 3;
          const rb = RARITY_SORT_ORDER[data?.items?.[b]?.rarity || 'common'] ?? 3;
          return ra - rb;
        });
        const tooltipUI = deps.tooltipUI
          || deps.TooltipUI
          || globalThis.TooltipUI
          || globalThis.GAME?.Modules?.['TooltipUI'];

        const showItemTooltip = (event, itemId) => {
          if (typeof deps.showItemTooltip === 'function') {
            deps.showItemTooltip(event, itemId);
            return;
          }
          if (typeof tooltipUI?.showItemTooltip === 'function') {
            tooltipUI.showItemTooltip(event, itemId, { doc, win: window, data, gs, setBonusSystem });
          }
        };

        const hideItemTooltip = () => {
          if (typeof deps.hideItemTooltip === 'function') {
            deps.hideItemTooltip();
            return;
          }
          if (typeof tooltipUI?.hideItemTooltip === 'function') {
            tooltipUI.hideItemTooltip({ doc, win: window });
          }
        };

        sortedItems.forEach(id => {
          const item = data?.items?.[id];
          if (!item) return;
          const slot = doc.createElement('div');
          slot.className = `hud-item-slot ${item.rarity ? `item-slot-${item.rarity}` : ''}`;
          const inSet = setBonusSystem ? Object.values(setBonusSystem.sets || {}).some(s => s.items.includes(id)) : false;
          if (inSet) slot.style.outline = '1px dashed rgba(0,255,204,0.4)';
          slot.textContent = item.icon;
          slot.addEventListener('mouseenter', ev => showItemTooltip(ev, id));
          slot.addEventListener('mouseleave', () => hideItemTooltip());
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
            name.textContent = `${s.name} [${s.count}/3]`;
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
    const runRules = deps.runRules;
    const asc = runRules?.getAscension?.(gs) || 0;
    const endless = runRules?.isEndless?.(gs);

    const topCont = doc.createElement('div');
    topCont.style.cssText = 'display:flex; gap:6px; flex-direction:column;';
    if (asc > 0) {
      const ascDiv = doc.createElement('div');
      ascDiv.style.cssText = "font-family:'Cinzel',serif; font-size:10px; color:var(--danger); letter-spacing:0.1em; background:rgba(255,51,102,0.1); border:1px solid rgba(255,51,102,0.2); border-radius:4px; padding:4px 8px; display:inline-block;";
      ascDiv.textContent = `승천 ${asc}`;
      topCont.appendChild(ascDiv);
    }
    if (endless) {
      const endDiv = doc.createElement('div');
      endDiv.style.cssText = "font-family:'Cinzel',serif; font-size:10px; color:var(--cyan); letter-spacing:0.1em; background:rgba(0,255,204,0.1); border:1px solid rgba(0,255,204,0.2); border-radius:4px; padding:4px 8px; display:inline-block;";
      endDiv.textContent = '무한 모드';
      topCont.appendChild(endDiv);
    }
    modEl.appendChild(topCont);

    const curseId = gs.runConfig?.curse || 'none';
    const disabledInscriptions = new Set(gs.runConfig?.disabledInscriptions || []);
    const activeInscriptions = Object.entries(gs.meta?.inscriptions || {})
      .filter(([, value]) => Number(value) > 0)
      .filter(([id]) => !disabledInscriptions.has(id));

    if (activeInscriptions.length > 0 || curseId !== 'none') {
      const midCont = doc.createElement('div');
      midCont.style.cssText = 'margin-top:4px; display:flex; flex-direction:column; gap:4px;';
      if (activeInscriptions.length > 0) {
        const previewIds = activeInscriptions.slice(0, 3).map(([id]) => id);
        const previewNames = previewIds
          .map((id) => deps.data?.inscriptions?.[id]?.name)
          .filter(Boolean);
        const remaining = activeInscriptions.length - previewNames.length;
        const inscDiv = doc.createElement('div');
        inscDiv.style.cssText = 'font-size:11px; color:var(--echo-bright); background:rgba(123,47,255,0.08); border-radius:4px; padding:3px 8px; border:1px solid rgba(123,47,255,0.15); cursor:help;';
        inscDiv.title = previewNames.join(', ');
        inscDiv.textContent = remaining > 0
          ? `활성 각인 ${activeInscriptions.length}개 · ${previewNames.join(', ')} 외 ${remaining}`
          : `활성 각인 ${activeInscriptions.length}개${previewNames.length ? ` · ${previewNames.join(', ')}` : ''}`;
        midCont.appendChild(inscDiv);
      }
      if (curseId !== 'none') {
        const c = runRules?.curses?.[curseId];
        if (c) {
          const cDiv = doc.createElement('div');
          cDiv.style.cssText = 'font-size:11px; color:var(--danger); background:rgba(255,51,102,0.08); border-radius:4px; padding:3px 8px; border:1px solid rgba(255,51,102,0.15); cursor:help;';
          cDiv.title = c.desc; cDiv.textContent = `${c.name}`;
          midCont.appendChild(cDiv);
        }
      }
      modEl.appendChild(midCont);
    }


    const echoBtn = doc.getElementById('useEchoSkillBtn');
    if (echoBtn) {
      // deps.updateEchoSkillBtn 
      if (typeof deps.updateEchoSkillBtn === 'function') {
        deps.updateEchoSkillBtn({ ...deps, gs });
      } else {
        // Fallback: 렌더링 업데이트
        const echoValue = Math.floor(p.echo);
        const tier = echoValue >= 100 ? 3 : echoValue >= 60 ? 2 : echoValue >= 30 ? 1 : 0;
        const nextTarget = echoValue < 30 ? 30 : (echoValue < 60 ? 60 : 100);

        if (tier === 0) {
          echoBtn.disabled = true;
          echoBtn.style.opacity = '0.45';
          setActionButtonLabel(echoBtn, `⚡ 잔향 스킬 ✦(${echoValue}/${nextTarget})`, 'E');
        } else {
          echoBtn.disabled = false;
          echoBtn.style.opacity = '1';
          setActionButtonLabel(echoBtn, `⚡ 잔향 스킬 ✦(${echoValue}/${nextTarget})`, 'E');
        }
      }
    }
    const drawBtn = doc.getElementById('combatDrawCardBtn');
    if (drawBtn) {
      const drawState = resolveDrawAvailability(gs);
      drawBtn.disabled = !drawState.canDraw;
      drawBtn.classList.toggle('hand-full', drawState.handFull);
      drawBtn.style.opacity = drawState.canDraw ? '1' : '0.4';
      if (drawState.inCombat) {
        if (!drawState.playerTurn) {
          setActionButtonLabel(drawBtn, '적 턴', 'Q');
          drawBtn.title = '적 턴에는 카드를 뽑을 수 없습니다.';
        } else if (drawState.handFull) {
          setActionButtonLabel(drawBtn, '손패 가득 참', 'Q');
          drawBtn.title = `손패가 가득 찼습니다 (최대 ${drawState.maxHand}장)`;
        } else if (!drawState.hasEnergy) {
          setActionButtonLabel(drawBtn, '에너지 부족', 'Q');
          drawBtn.title = '카드를 뽑으려면 에너지 1이 필요합니다.';
        } else {
          setActionButtonLabel(drawBtn, '🃏 카드 뽑기 (1 에너지)', 'Q');
          drawBtn.title = '카드를 1장 뽑습니다 (에너지 1).';
        }
      } else {
        setActionButtonLabel(drawBtn, '🃏 카드 뽑기 (1 에너지)', 'Q');
        drawBtn.title = '전투 중에만 사용할 수 있습니다.';
      }
    }
    const updateStatusDisplay = deps.updateStatusDisplay
      || globalThis.updateStatusDisplay
      || globalThis.GAME?.API?.updateStatusDisplay;
    if (typeof updateStatusDisplay === 'function') updateStatusDisplay();
    this.updateEndBtnWarn(deps);

    // UI HUD
    const gs_internal = _getGS(deps);
    if (gs_internal) gs_internal.clearDirtyFlag('hud');
  },

  updateCombatEnergy(gs, deps = {}) {
    updateCombatEnergyUI(gs, deps);
  },

  updatePlayerStats(gs, deps = {}) {
    updatePlayerStatsUI(gs, deps);
  },

  // Expose public API for GAME.API
  api: {
    updateUI: (deps) => HudUpdateUI.updateUI(deps),
    updatePlayerStats: (gs, deps) => HudUpdateUI.updatePlayerStats(gs, deps),
    updateCombatEnergy: (gs, deps) => HudUpdateUI.updateCombatEnergy(gs, deps),
    resetCombatUI: (deps) => HudUpdateUI.resetCombatUI(deps),
    triggerDeckShufflePulse: (deps) => HudUpdateUI.triggerDeckShufflePulse(deps),
  }
};
