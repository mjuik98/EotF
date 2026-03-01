const STATUS_KR = {
  resonance: { name: '공명', icon: '🌀', buff: true, desc: '카드를 연계할 때마다 다음 공격의 위력이 상승합니다.' },
  acceleration: { name: '가속', icon: '👟', buff: true, desc: '이번 턴 동안 피해량이 증가합니다.' },
  soul_armor: { name: '영혼의 갑옷', icon: '🛡️', buff: true, desc: '받는 피해를 일부 감소시킵니다.' },
  vanish: { name: '은신', icon: '🌫️', buff: true, desc: '다음 공격이 치명타로 적중합니다.' },
  immune: { name: '무적', icon: '🏛️', buff: true, desc: '이번 턴 동안 모든 피해를 입지 않습니다.' },
  shadow_atk: { name: '그림자격', icon: '🌑', buff: true, desc: '그림자 공격 계열 카드의 피해가 증가합니다.' },
  mirror: { name: '반사', icon: '🪞', buff: true, desc: '다음에 받는 피해를 적에게 그대로 반사합니다.' },
  zeroCost: { name: '무비용', icon: '✨', buff: true, desc: '이번 턴에 사용하는 모든 카드의 비용이 0이 됩니다.' },
  weakened: { name: '약화', icon: '💫', buff: false, desc: '적에게 주는 피해가 50% 감소합니다.' },
  slowed: { name: '감속', icon: '🐢', buff: false, desc: '행동이 지연되어 일부 효과의 효율이 감소합니다.' },
  burning: { name: '화염', icon: '🔥', buff: false, desc: '매 턴 시작 시 피해 5.를 입습니다.' },
  cursed: { name: '저주', icon: '💀', buff: false, desc: '카드의 효과와 체력 회복량이 감소합니다.' },
  poisoned: { name: '독', icon: '🐍', buff: false, desc: '매 턴 시작 시 지속적인 피해를 입습니다. 중첩될수록 피해가 강해집니다.' },
  stunned: { name: '기절', icon: '⚡', buff: false, desc: '이번 턴 동안 행동할 수 없습니다.' },
  confusion: { name: '혼란', icon: '🌀', buff: false, desc: '사용하는 카드의 순서가 무작위로 뒤섞입니다.' },
  dodge: { name: '회피', icon: '💨', buff: true, desc: '다음에 받는 공격을 회피합니다.' },
  strength: { name: '근력', icon: '💪', buff: true, desc: '주는 피해가 증가합니다.' },
  dexterity: { name: '민첩', icon: '🏃', buff: true, desc: '얻는 방어막이 증가합니다.' },
  vulnerable: { name: '취약', icon: '🎯', buff: false, desc: '받는 피해가 50% 증가합니다.' },
  blessing_of_light: { name: '빛의 축복', icon: '☀️', buff: true, desc: '매 턴 시작 시 체력을 회복합니다.' },
  divine_grace: { name: '신의 은총', icon: '🛡️', buff: true, desc: '방어막이 일정 비율만큼 추가로 증가합니다.' },
  time_warp: { name: '시간 왜곡', icon: '🌀', buff: true, desc: '매 턴 시작 시 에너지를 추가로 획득합니다.' },
  berserk_mode: { name: '광폭화', icon: '💢', buff: true, desc: '매 턴 공격력이 서서히 증가합니다.' },
  unbreakable_wall: { name: '불굴의 벽', icon: '🧱', buff: true, desc: '턴 시작 시 방어막의 50%만큼 무작위 적에게 피해를 입힙니다.' },
  unbreakable_wall_plus: { name: '불굴의 벽+', icon: '🧱', buff: true, desc: '턴 시작 시 방어막의 70%만큼 무작위 적에게 피해를 입힙니다.' },
  echo_on_hit: { name: '반향', icon: '🔊', buff: true, desc: '공격받을 시 잔향을 충전합니다.' }
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
    || window.TooltipUI
    || window.GAME?.Modules?.['TooltipUI'];
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
      keys.forEach(k => {
        const buff = buffs[k];
        const info = STATUS_KR[k];
        const isBuff = info ? info.buff : ['resonance', 'acceleration', 'soul_armor', 'vanish', 'immune', 'shadow_atk', 'dodge'].includes(k);
        const label = info ? `${info.icon} ${info.name}` : k;

        const badge = doc.createElement('span');
        badge.className = `hud-status-badge ${isBuff ? 'status-buff' : 'status-debuff'}`;

        const labelText = doc.createTextNode(label);
        badge.appendChild(labelText);

        const dmgBonus = (k === 'resonance' || k === 'acceleration') && buff.dmgBonus ? ` +${buff.dmgBonus}↯` : '';
        if (dmgBonus) {
          badge.appendChild(doc.createTextNode(` ${dmgBonus}`));
        }

        if (k !== 'resonance' && k !== 'acceleration' && buff.stacks > 0) {
          const stackSpan = doc.createElement('span');
          stackSpan.style.opacity = '0.7';

          // 지속 시간이 99 이상인 경우 (무한 지속), 턴 수 대신 실제 효과 수치를 표시
          let displayVal = buff.stacks;
          if (buff.stacks >= 99) {
            if (k === 'blessing_of_light') displayVal = buff.healPerTurn || '';
            else if (k === 'soul_armor') displayVal = buff.echoRegen || 0;
            else if (k === 'time_warp') displayVal = buff.energyPerTurn || 0;
            else if (k === 'berserk_mode') displayVal = buff.atkGrowth || 0;
            else if (k === 'divine_grace') displayVal = buff.shieldBonus || 0;

            // 만약 displayVal이 여전히 99 이상이면 (지정된 수치가 없는 경우), 괄호 없이 아이콘만 보이거나 공백 처리 가능
            // 여기서는 수치가 있는 경우만 괄호 안에 표시하고, 99인 경우(단순 파워)는 괄호를 생략하거나 별도 처리
            if (displayVal >= 99) displayVal = '';
          }

          stackSpan.textContent = displayVal !== '' ? ` (${displayVal})` : '';
          badge.appendChild(stackSpan);
        }

        const tooltipUI = _getTooltipUI(deps);
        const tooltipTitle = dmgBonus ? `${label} ${dmgBonus}` : label;
        const tooltipDesc = info?.desc || '효과 정보 없음';
        badge.addEventListener('mouseenter', (event) => {
          if (typeof tooltipUI?.showGeneralTooltip === 'function') {
            tooltipUI.showGeneralTooltip(event, tooltipTitle, tooltipDesc, { doc, win: window });
          }
        });
        badge.addEventListener('mouseleave', () => {
          if (typeof tooltipUI?.hideGeneralTooltip === 'function') {
            tooltipUI.hideGeneralTooltip({ doc, win: window });
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
