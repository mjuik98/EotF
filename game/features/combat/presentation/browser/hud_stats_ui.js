import {
  applyCombatDrawButtonCopy,
  formatEchoSkillButtonText,
  getEchoTierWindow,
  getHpBarGradient,
  setActionButtonLabel,
} from './hud_render_helpers.js';
import { DomValueUI } from './dom_value_ui.js';
import { getDoc } from '../../../../utils/runtime_deps.js';
import { resolveDrawAvailability } from './draw_availability.js';

export function updateCombatEnergyUI(gs, deps = {}) {
  if (!gs?.player) return;
  const p = gs.player;
  const doc = getDoc(deps);

  const hudOrbs = doc.getElementById('hudEnergyOrbs');
  if (hudOrbs) {
    hudOrbs.textContent = '';
    for (let i = 0; i < p.maxEnergy; i++) {
      const orb = doc.createElement('div');
      orb.className = `hud-energy-orb ${i < p.energy ? 'filled' : ''}`;
      hudOrbs.appendChild(orb);
    }
  }

  const hudEnergyText = doc.getElementById('hudEnergyText');
  if (hudEnergyText) {
    hudEnergyText.textContent = `${p.energy}/${p.maxEnergy}`;
  }

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

  const combatEnergyText = doc.getElementById('combatEnergyText');
  if (combatEnergyText) {
    combatEnergyText.textContent = `${p.energy} / ${p.maxEnergy}`;
  }
  const drawBtn = doc.getElementById('combatDrawCardBtn');
  if (drawBtn && gs.combat?.active) {
    const drawState = resolveDrawAvailability(gs);
    applyCombatDrawButtonCopy(drawBtn, drawState, 'Q');
    drawBtn.disabled = !drawState.canDraw;
    drawBtn.style.opacity = drawState.canDraw ? '1' : '0.4';
  }
}

export function updatePlayerStatsUI(gs, deps = {}) {
  if (!gs?.player) return;
  const p = gs.player;
  const doc = getDoc(deps);

  const domDeps = deps?.doc ? deps : { ...deps, doc };
  const setText = deps.setText || ((id, val) => DomValueUI.setText(id, val, domDeps));
  const setBar = deps.setBar || ((id, pct) => DomValueUI.setBar(id, pct, domDeps));

  const hpPct = Math.max(0, (p.hp / p.maxHp) * 100);
  setBar('hpBar', hpPct);
  setText('hpText', `${Math.max(0, p.hp)} / ${p.maxHp}`);

  setBar('hoverHpBar', hpPct);
  setText('hoverHpText', `${Math.max(0, p.hp)} / ${p.maxHp}`);

  const updateHpColor = (el, pct) => {
    if (!el) return;
    el.style.background = getHpBarGradient(pct);
  };

  updateHpColor(doc.getElementById('hpBar'), hpPct);
  updateHpColor(doc.getElementById('hoverHpBar'), hpPct);

  const hudHpMini = doc.getElementById('hudHpBarMini');
  if (hudHpMini) {
    hudHpMini.style.width = `${hpPct}%`;
    hudHpMini.style.background = hpPct <= 25
      ? 'linear-gradient(90deg,#8b0000,#cc0000)'
      : 'linear-gradient(90deg,#cc2244,#ff4466)';
  }

  const hudEchoMini = doc.getElementById('hudEchoBarMini');
  if (hudEchoMini) {
    const echoInfo = getEchoTierWindow(p.echo);
    hudEchoMini.style.width = `${echoInfo.pct}%`;
    hudEchoMini.style.background = echoInfo.bg;
  }

  setText('hudHpText', `${Math.max(0, p.hp)}/${p.maxHp}`);
  setText('hudEchoText', Math.floor(p.echo));

  const shieldTrigger = doc.getElementById('hudShieldTrigger');
  if (shieldTrigger) {
    shieldTrigger.style.opacity = p.shield > 0 ? '1' : '0.3';
    setText('hudShieldText', p.shield);
  }

  const shieldPct = Math.min(100, (p.shield / p.maxHp) * 100);
  setBar('shieldBar', shieldPct);
  setText('shieldText', p.shield || '0');

  setBar('hoverShieldBar', shieldPct);
  setText('hoverShieldText', p.shield || '0');

  const echo2 = getEchoTierWindow(p.echo);
  setBar('echoBar', echo2.pct);
  setText('echoText', `${echo2.echo} / ${p.maxEcho}`);
  setBar('hoverEchoBar', echo2.pct);
  setText('hoverEchoText', `${echo2.echo} / ${p.maxEcho}`);

  const mazeEcho2 = doc.getElementById('mazeEcho');
  if (mazeEcho2) mazeEcho2.textContent = Math.floor(p.echo);

  const cm = deps.classMechanics;
  if (cm) {
    if (typeof cm.updateUI === 'function') cm.updateUI(gs);
    else if (typeof cm.render === 'function') cm.render(gs);
  }

  const updateBtn = deps.updateEchoSkillBtn
    ? (d) => d.updateEchoSkillBtn({ ...d, gs })
    : (typeof deps.updateEchoSkillBtn === 'function' ? deps.updateEchoSkillBtn : null);

  if (typeof updateBtn === 'function') {
    updateBtn(deps);
  } else {
    const echoBtn = doc.getElementById('useEchoSkillBtn');
    if (echoBtn) {
      const echo = Math.floor(p.echo);
      const tier = echo >= 100 ? 3 : echo >= 60 ? 2 : echo >= 30 ? 1 : 0;

      if (tier === 0) {
        echoBtn.disabled = true;
        echoBtn.style.opacity = '0.45';
        setActionButtonLabel(echoBtn, formatEchoSkillButtonText(echo), 'E');
      } else {
        echoBtn.disabled = false;
        echoBtn.style.opacity = '1';
        setActionButtonLabel(echoBtn, formatEchoSkillButtonText(echo), 'E');
      }
    }
  }
}
