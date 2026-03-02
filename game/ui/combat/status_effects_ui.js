const STATUS_KR = {
  resonance: { name: '공명', icon: '⚡', buff: true, desc: '카드 연계 시 공격 보너스가 증가합니다.' },
  acceleration: { name: '가속', icon: '⏩', buff: true, desc: '이번 턴의 피해량이 증가합니다.' },
  soul_armor: { name: '영혼 갑옷', icon: '🛡', buff: true, desc: '받는 피해를 감소시킵니다.' },
  vanish: { name: '은신', icon: '🌫', buff: true, desc: '다음 공격이 치명타로 적용됩니다.' },
  immune: { name: '무적', icon: '🏛', buff: true, desc: '피해를 받지 않습니다.' },
  shadow_atk: { name: '그림자 강화', icon: '🗡', buff: true, desc: '공격 피해가 증가합니다.' },
  mirror: { name: '반사막', icon: '🪞', buff: true, desc: '다음 피해를 적에게 반사합니다.' },
  zeroCost: { name: '무소모', icon: '0', buff: true, desc: '카드 비용이 0이 됩니다.' },
  weakened: { name: '약화', icon: '🪶', buff: false, desc: '가하는 피해가 감소합니다.' },
  slowed: { name: '감속', icon: '🐢', buff: false, desc: '행동 효율이 감소합니다.' },
  burning: { name: '화상', icon: '🔥', buff: false, desc: '턴 시작 시 화염 피해를 받습니다.' },
  cursed: { name: '저주', icon: '☠', buff: false, desc: '카드 효과와 회복 효율이 감소합니다.' },
  poisoned: { name: '중독', icon: '🧪', buff: false, desc: '턴 시작 시 독 피해를 받습니다.' },
  stunned: { name: '기절', icon: '⏸', buff: false, desc: '행동할 수 없습니다.' },
  confusion: { name: '혼란', icon: '🌀', buff: false, desc: '손패 순서가 뒤섞입니다.' },
  dodge: { name: '회피', icon: '💨', buff: true, desc: '다음 공격을 회피합니다.' },
  strength: { name: '힘', icon: '💪', buff: true, desc: '가하는 피해가 증가합니다.' },
  dexterity: { name: '민첩', icon: '🦶', buff: true, desc: '획득 방어막이 증가합니다.' },
  vulnerable: { name: '취약', icon: '💢', buff: false, desc: '받는 피해가 증가합니다.' },
  blessing_of_light: { name: '빛의 축복', icon: '✨', buff: true, desc: '턴 시작 시 체력을 회복합니다.' },
  blessing_of_light_plus: { name: '빛의 축복+', icon: '✨+', buff: true, desc: '턴 시작 시 체력을 더 크게 회복합니다.' },
  divine_grace: { name: '신성 은총', icon: '✝', buff: true, desc: '방어막 일부를 보너스로 전환합니다.' },
  time_warp: { name: '시간 왜곡', icon: '⏳', buff: true, desc: '매 턴 추가 에너지를 획득합니다.' },
  time_warp_plus: { name: '시간 왜곡+', icon: '⏳+', buff: true, desc: '매 턴 추가 에너지를 더 많이 획득합니다.' },
  berserk_mode: { name: '광전사의 격노', icon: '🩸', buff: true, desc: '시간이 지날수록 공격력이 상승합니다.' },
  berserk_mode_plus: { name: '광전사의 격노+', icon: '🩸+', buff: true, desc: '시간이 지날수록 공격력이 크게 상승합니다.' },
  unbreakable_wall: { name: '불굴의 벽', icon: '🧱', buff: true, desc: '턴 시작 시 방어막 비례 피해를 줍니다.' },
  unbreakable_wall_plus: { name: '불굴의 벽+', icon: '🧱+', buff: true, desc: '불굴의 벽 효과가 강화됩니다.' },
  echo_on_hit: { name: '피격 잔향', icon: '🔔', buff: true, desc: '피격 시 잔향을 획득합니다.' },
  marked: { name: '표식', icon: '🎯', buff: false, desc: '지정 턴에 큰 피해가 터집니다.' },
  thorns: { name: '가시', icon: '🌵', buff: true, desc: '공격자에게 반격 피해를 줍니다.' },
  doom: { name: '파멸', icon: '☠️', buff: false, desc: '카운트가 끝나면 폭발 피해가 발생합니다.' },
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
      none.textContent = '없음';
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
        const tooltipDesc = info?.desc || '설명이 없습니다.';
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
