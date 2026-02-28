import { GS } from '../../core/game_state.js';


const STATUS_KR = {
  momentum: { name: '모멘텀', icon: '⚔️', buff: true, desc: '이동 및 공격 시 피해가 누적되어 증가합니다. 연속 공격일수록 위력이 강해집니다.' },
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
  dexterity: { name: '민첩', icon: '🏃', buff: true, desc: '얻는 방어도가 증가합니다.' },
  vulnerable: { name: '취약', icon: '🎯', buff: false, desc: '받는 피해가 50% 증가합니다.' },
  blessing_of_light: { name: '빛의 축복', icon: '☀️', buff: true, desc: '매 턴 시작 시 체력을 회복합니다.' },
  divine_grace: { name: '신의 은총', icon: '🛡️', buff: true, desc: '방어도가 일정 비율만큼 추가로 증가합니다.' }
};

function _getDoc(deps) {
  return deps?.doc || document;
}

function _getGS(deps) {
  return deps?.gs;
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
        const isBuff = info ? info.buff : ['momentum', 'soul_armor', 'vanish', 'immune', 'shadow_atk', 'dodge'].includes(k);
        const label = info ? `${info.icon} ${info.name}` : k;

        const badge = doc.createElement('span');
        badge.className = `hud-status-badge ${isBuff ? 'status-buff' : 'status-debuff'}`;

        const labelText = doc.createTextNode(label);
        badge.appendChild(labelText);

        const dmgBonus = k === 'momentum' && buff.dmgBonus ? ` +${buff.dmgBonus}↯` : '';
        if (dmgBonus) {
          badge.appendChild(doc.createTextNode(` ${dmgBonus}`));
        }

        if (k !== 'momentum' && buff.stacks > 0) {
          const stackSpan = doc.createElement('span');
          stackSpan.style.opacity = '0.7';
          stackSpan.textContent = ` (${buff.stacks})`;
          badge.appendChild(stackSpan);
        }

        const tip = doc.createElement('span');
        tip.className = 'hud-badge-tip';

        const tipH = doc.createElement('b'); tipH.textContent = label; tip.appendChild(tipH);
        if (dmgBonus) tip.appendChild(doc.createTextNode(` ${dmgBonus}`));
        tip.appendChild(doc.createElement('br'));

        const tipD = doc.createElement('span');
        tipD.style.cssText = 'color:var(--text-dim);font-size:10px;';
        tipD.textContent = info?.desc || '효과 정보 없음';
        tip.appendChild(tipD);

        badge.appendChild(tip);
        fragment.appendChild(badge);
      });
      el.appendChild(fragment);
    }

    if (gs.combat?.active && typeof deps.refreshCombatInfoPanel === 'function') {
      deps.refreshCombatInfoPanel();
    }
  },
};
