const STATUS_KR = {
  resonance: { name: 'Resonance', icon: 'R', buff: true, desc: 'Gain bonus attack damage by chaining cards.' },
  acceleration: { name: 'Acceleration', icon: 'A', buff: true, desc: 'Increase damage during this turn.' },
  soul_armor: { name: 'Soul Armor', icon: 'S', buff: true, desc: 'Reduces incoming damage.' },
  vanish: { name: 'Vanish', icon: 'V', buff: true, desc: 'The next attack deals critical damage.' },
  immune: { name: 'Immune', icon: 'I', buff: true, desc: 'Prevents all damage for this turn.' },
  shadow_atk: { name: 'Shadow Attack', icon: 'H', buff: true, desc: 'Increases shadow-type attack damage.' },
  mirror: { name: 'Mirror', icon: 'M', buff: true, desc: 'Reflects the next incoming damage to an enemy.' },
  zeroCost: { name: 'Zero Cost', icon: '0', buff: true, desc: 'Cards played this turn cost 0.' },
  weakened: { name: 'Weakened', icon: 'W', buff: false, desc: 'Outgoing damage is reduced.' },
  slowed: { name: 'Slowed', icon: 'L', buff: false, desc: 'Action efficiency is reduced.' },
  burning: { name: 'Burning', icon: 'B', buff: false, desc: 'Take damage at turn start.' },
  cursed: { name: 'Cursed', icon: 'C', buff: false, desc: 'Card effects and healing are reduced.' },
  poisoned: { name: 'Poisoned', icon: 'P', buff: false, desc: 'Take stacking damage at turn start.' },
  stunned: { name: 'Stunned', icon: 'T', buff: false, desc: 'Cannot act this turn.' },
  confusion: { name: 'Confusion', icon: 'Q', buff: false, desc: 'Card order is randomized while active.' },
  dodge: { name: 'Dodge', icon: 'D', buff: true, desc: 'Evades the next incoming attack.' },
  strength: { name: 'Strength', icon: 'G', buff: true, desc: 'Increases dealt damage.' },
  dexterity: { name: 'Dexterity', icon: 'X', buff: true, desc: 'Increases gained shield.' },
  vulnerable: { name: 'Vulnerable', icon: 'U', buff: false, desc: 'Increases incoming damage.' },
  blessing_of_light: { name: 'Blessing of Light', icon: 'L+', buff: true, desc: 'Heals at turn start.' },
  divine_grace: { name: 'Divine Grace', icon: 'D+', buff: true, desc: 'Converts part of shield into bonus value.' },
  time_warp: { name: 'Time Warp', icon: 'TW', buff: true, desc: 'Grants additional energy each turn.' },
  berserk_mode: { name: 'Berserk', icon: 'BZ', buff: true, desc: 'Attack power ramps up over time.' },
  unbreakable_wall: { name: 'Unbreakable Wall', icon: 'UW', buff: true, desc: 'Deals damage based on shield at turn start.' },
  unbreakable_wall_plus: { name: 'Unbreakable Wall+', icon: 'UW+', buff: true, desc: 'Stronger shield-based turn-start damage.' },
  echo_on_hit: { name: 'Echo on Hit', icon: 'EH', buff: true, desc: 'Gain echo when hit.' },
};

function _getDoc(deps) {
  return deps?.doc || document;
}

function _getGS(deps) {
  return deps?.gs;
}

function _getTooltipUI(deps) {
  return deps?.tooltipUI
    || deps?.TooltipUI
    || globalThis.TooltipUI
    || globalThis.GAME?.Modules?.['TooltipUI'];
}

function _getStackDisplay(key, buff) {
  if (!buff || buff.stacks <= 0) return '';
  if (buff.stacks < 99) return String(buff.stacks);

  if (key === 'blessing_of_light') return String(buff.healPerTurn || '');
  if (key === 'soul_armor') return String(buff.echoRegen || 0);
  if (key === 'time_warp') return String(buff.energyPerTurn || 0);
  if (key === 'berserk_mode') return String(buff.atkGrowth || 0);
  if (key === 'divine_grace') return String(buff.shieldBonus || 0);

  return '';
}

export const StatusEffectsUI = {
  getStatusMap() {
    return STATUS_KR;
  },

  updateStatusDisplay(deps = {}) {
    const gs = _getGS(deps);
    if (!gs?.player) return;

    const doc = _getDoc(deps);
    const el = doc.getElementById(deps.statusContainerId || 'statusEffects');
    if (!el) return;

    const buffs = gs.player.buffs || {};
    const keys = Object.keys(buffs);
    el.textContent = '';

    if (!keys.length) {
      const none = doc.createElement('span');
      none.style.cssText = 'font-size:11px;color:var(--text-dim);font-style:italic;';
      none.textContent = 'None';
      el.appendChild(none);
    } else {
      const fragment = doc.createDocumentFragment();
      keys.forEach((k) => {
        const buff = buffs[k];
        const info = STATUS_KR[k];
        const isBuff = info ? info.buff : ['resonance', 'acceleration', 'soul_armor', 'vanish', 'immune', 'shadow_atk', 'dodge'].includes(k);
        const label = info ? `${info.icon} ${info.name}` : k;

        const badge = doc.createElement('span');
        badge.className = `hud-status-badge ${isBuff ? 'status-buff' : 'status-debuff'}`;
        badge.appendChild(doc.createTextNode(label));

        const dmgBonus = (k === 'resonance' || k === 'acceleration') && buff.dmgBonus ? ` +${buff.dmgBonus}` : '';
        if (dmgBonus) {
          badge.appendChild(doc.createTextNode(` ${dmgBonus}`));
        }

        if (k !== 'resonance' && k !== 'acceleration' && buff.stacks > 0) {
          const stackSpan = doc.createElement('span');
          stackSpan.style.opacity = '0.7';
          const displayVal = _getStackDisplay(k, buff);
          stackSpan.textContent = displayVal ? ` (${displayVal})` : '';
          badge.appendChild(stackSpan);
        }

        const tooltipUI = _getTooltipUI(deps);
        const tooltipTitle = dmgBonus ? `${label} ${dmgBonus}` : label;
        const tooltipDesc = info?.desc || 'No description';
        badge.addEventListener('mouseenter', (event) => {
          if (typeof tooltipUI?.showGeneralTooltip === 'function') {
            tooltipUI.showGeneralTooltip(event, tooltipTitle, tooltipDesc, { doc, win: globalThis });
          }
        });
        badge.addEventListener('mouseleave', () => {
          if (typeof tooltipUI?.hideGeneralTooltip === 'function') {
            tooltipUI.hideGeneralTooltip({ doc, win: globalThis });
          }
        });

        fragment.appendChild(badge);
      });
      el.appendChild(fragment);
    }

    if (gs.combat?.active && typeof deps.refreshCombatInfoPanel === 'function') {
      deps.refreshCombatInfoPanel();
    }
  },
};