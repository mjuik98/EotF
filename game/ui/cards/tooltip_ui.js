import { DescriptionUtils } from '../../utils/description_utils.js';
import { DomSafe } from '../../utils/dom_safe.js';
import { RARITY_LABELS, RARITY_TEXT_COLORS } from '../../../data/rarity_meta.js';
import { UNBREAKABLE_WALL_STACK_UNIT } from '../../../data/status_key_data.js';


let _tooltipTimer = null;
let _itemTipEl = null;

function _getDoc(deps) {
  return deps?.doc || document;
}

function _getWin(deps) {
  return deps?.win || window;
}

function _isUnbreakableWallCard(cardId) {
  return cardId === 'unbreakable_wall' || cardId === 'unbreakable_wall_plus';
}

function _getUnbreakableWallBuffId(cardId) {
  return cardId === 'unbreakable_wall_plus' ? 'unbreakable_wall_plus' : 'unbreakable_wall';
}

function _getUnbreakableWallHitCount(buff) {
  const stacks = Number(buff?.stacks || 0);
  if (!Number.isFinite(stacks) || stacks <= 0) return 0;
  return Math.max(1, Math.floor(stacks / UNBREAKABLE_WALL_STACK_UNIT));
}

function _buildUnbreakableWallCardTooltip(cardId, gs) {
  if (!_isUnbreakableWallCard(cardId)) return '';

  const buffId = _getUnbreakableWallBuffId(cardId);
  const currentBuff = gs?.getBuff?.(buffId);
  const currentHits = _getUnbreakableWallHitCount(currentBuff);
  const nextHits = Math.max(1, currentHits + 1);
  const ratio = cardId === 'unbreakable_wall_plus' ? 0.7 : 0.5;
  const shield = Number(gs?.player?.shield || 0);
  const safeShield = Number.isFinite(shield) && shield > 0 ? Math.floor(shield) : 0;
  const perHit = Math.floor(safeShield * ratio);
  const total = perHit * nextHits;

  return `<br><br>\uD604\uC7AC \uC911\uCCA9: ${currentHits}\uD68C \uBC1C\uB3D9<br>\uC0AC\uC6A9 \uD6C4 \uC608\uC0C1: ${nextHits}\uD68C \uBC1C\uB3D9<br>\uD604\uC7AC \uBC29\uC5B4\uB9C9(${safeShield}) \uAE30\uC900: 1\uD68C ${perHit}, \uCD1D ${total} \uD53C\uD574`;
}

const KEYWORD_MAP = {
  '[소진]': { title: '소진 (Exhaust)', text: '사용 후 이번 전투에서 영구 제거됩니다. 소모 더미로 가지 않습니다.' },
  '[지속]': { title: '지속 (Persistent)', text: '전투가 끝날 때까지 계속 효과가 발동되는 능력 카드입니다.' },
  '[즉시]': { title: '즉시 (Instant)', text: '사용 즉시 발동되는 강력한 일회성 효과입니다.' },
  '잔향': { title: '잔향 (Echo)', text: '특수 능력을 발동하는 에너지 자원. 0~100 사이를 유지하며, 게이지에 따라 효과가 달라집니다.' },
  '연쇄': { title: '연쇄 (Chain)', text: '연속 공격 횟수를 나타냅니다. 5회 이상 쌓이면 다음 공격에 추가 피해가 적용됩니다.' },
  '침묵': { title: '침묵 (Silence)', text: '침묵사냥꾼 전용 게이지. 최대치(10) 도달 시 다음 공격이 대폭 강화됩니다.' },
  '약화': { title: '약화 (Weakened)', text: '대상의 공격력이 50% 감소합니다. 지속 시간이 만료되면 해제됩니다.' },
  '기절 면역': { title: '기절 면역 (Stun Immunity)', text: '적의 기절 효과를 지정된 횟수만큼 완전히 무효화합니다.' },
  '기절': { title: '기절 (Stunned)', text: '다음 턴에 행동하지 못합니다. 기절 턴에는 공격과 방어 모두 불가합니다.' },
  '독': { title: '독 (Poison)', text: '중독된 대상의 턴 시작 시 독 스택 × 5 피해를 입힙니다. 매 턴 독 스택이 1씩 감소합니다.' },
  '화염': { title: '화염 (Burning)', text: '매 턴 시작 시 피해 5를 입습니다. 지속 시간이 끝나면 소멸합니다.' },
  '처형 표식': { title: '처형 표식 (Death Mark)', text: '3턴 후 표식이 폭발하여 피해 30을 입힙니다. 시간이 얼마 남지 않았을 때 더욱 위험합니다.' },
  '면역': { title: '면역 (Immune)', text: '모든 피해와 상태이상을 완전히 무효화합니다. 지속 시간 동안 무적 상태입니다.' },
  '회피': { title: '회피 (Dodge)', text: '다음 적의 공격 1회를 완전히 무효화합니다. 회피 후 즉시 소모됩니다.' },
  '은신': { title: '은신 (Stealth)', text: '다음에 사용하는 공격 카드가 치명타로 적중합니다. 공격 즉시 은신이 해제됩니다.' },
  '반사': { title: '반사 (Reflect)', text: '피해를 받을 때 해당 피해를 공격자에게 되돌립니다.' },
  '시간 왜곡': { title: '시간 왜곡 (Time Warp)', text: '매 턴 시작 시 에너지를 1 추가로 획득합니다. 전투가 끝날 때까지 지속됩니다.' },
  '드로우': { title: '드로우 (Draw)', text: '덱에서 카드를 손패로 가져옵니다. 덱이 비면 소모 더미를 섞어 새 덱을 만듭니다.' },
};

/** 레어도별 색상 메타 (CSS var 와 혼합 사용) */
const RARITY_TIP_META = {
  legendary: { color: '#c084fc', glow: 'rgba(192,132,252,0.5)',  border: 'rgba(192,132,252,0.45)', rgb: '192,132,252' },
  rare:      { color: '#f0d472', glow: 'rgba(240,180,41,0.4)',   border: 'rgba(240,180,41,0.4)',   rgb: '240,180,41'  },
  uncommon:  { color: '#4af3cc', glow: 'rgba(74,243,204,0.4)',   border: 'rgba(74,243,204,0.4)',   rgb: '74,243,204'  },
  common:    { color: '#9b8ab8', glow: 'rgba(155,138,184,0.25)', border: 'rgba(155,138,184,0.2)',  rgb: '155,138,184' },
  boss:      { color: '#ff3366', glow: 'rgba(255,51,102,0.4)',   border: 'rgba(255,51,102,0.4)',   rgb: '255,51,102'  },
};

/**
 * 런타임 충전 상태 메타
 */
const ITEM_CHARGE_META = {
  echo_bell:            { gsKey: '_bellCount',       max: 10, label: '이번 전투 카드 사용', type: 'num'        },
  clockwork_butterfly:  { gsKey: '_butterflyCount',  max: 3,  label: '이번 턴 발동 횟수',  type: 'dot'        },
  void_crystal:         { gsKey: '_voidCrystalUsed', max: 1,  label: '이번 전투 발동',     type: 'invert-dot' },
  echo_heart:           { gsKey: '_heartUsed',       max: 1,  label: '부활 횟수',          type: 'invert-dot' },
  eternal_fragment:     { gsKey: '_fragmentActive',            label: '전투 효과 상태',     type: 'bool'       },
  titan_fragment:       { gsKey: '_titanUsed',                 label: '발동 여부',          type: 'bool'       },
};

/** trigger id → 한국어 표시 텍스트 */
const TRIGGER_LABEL_MAP = {
  combat_start:        '전투 시작 시',
  card_play:           '카드 사용 시',
  turn_start:          '턴 시작 시',
  turn_end:            '턴 종료 시',
  damage_taken:        '피해 받을 때',
  boss_start:          '보스 조우 시',
  combat_end:          '전투 종료 시',
  enemy_kill:          '적 처치 시',
  card_draw:           '카드 드로우 시',
  card_exhaust:        '카드 소멸 시',
  card_discard:        '카드 버릴 때',
  floor_start:         '층 이동 시',
  resonance_burst:     '공명 폭발 시',
  poison_damage:       '독 피해 시',
  enemy_status_apply:  '적 상태이상 부여 시',
  echo_gain:           '잔향 획득 시',
  chain_gain:          '연쇄 증가 시',
  chain_break:         '연쇄 단절 시',
  energy_gain:         '에너지 획득 시',
  energy_empty:        '에너지 소진 시',
  deal_damage:         '피해 줄 때',
  pre_death:           '사망 직전 (1회)',
  shop_buy:            '상점 구매 시',
  heal_amount:         '체력 회복 시',
  shield_gain:         '방어막 획득 시',
};

export const TooltipUI = {
  showTooltip(event, cardId, deps = {}) {
    const data = deps.data;
    const gs = deps.gs;
    if (!data?.cards || !gs) return;

    // 특수 툴팁: 스킬 소각
    if (cardId === 'remove_card') {
      this.showGeneralTooltip(event, '🔥 스킬 소각', '덱에서 원하는 카드 1장을 영구히 제거합니다.<br><br>조건: 덱에 카드가 있어야 합니다.', deps);
      return;
    }

    const card = data.cards[cardId];
    if (!card) return;
    clearTimeout(_tooltipTimer);
    const doc = _getDoc(deps);
    const win = _getWin(deps);
    const tt = doc.getElementById('cardTooltip');
    if (!tt) return;

    doc.getElementById('ttIcon').textContent = card.icon;
    doc.getElementById('ttCost').textContent = card.cost;
    doc.getElementById('ttName').textContent = card.name;
    doc.getElementById('ttType').textContent = card.type;
    DomSafe.setHighlightedText(doc.getElementById('ttDesc'), card.desc || '');
    const rarityEl = doc.getElementById('ttRarity');
    rarityEl.textContent = DescriptionUtils.getRarityLabel(card.rarity || 'common');
    rarityEl.className = `card-tooltip-rarity rarity-${card.rarity || 'common'}`;

    const predEl = doc.getElementById('ttPredicted');
    const baseDmg = card.dmg;
    const res = gs.getBuff?.('resonance');
    const acc = gs.getBuff?.('acceleration');
    const resBonus = res ? (res.dmgBonus || 0) : 0;
    const accBonus = acc ? (acc.dmgBonus || 0) : 0;
    const chainBonus = baseDmg && gs.player.echoChain >= 3 ? Math.floor(baseDmg * 0.2) : 0;

    // 공격 카드만 예상 피해 표시 (스킬/파워 카드는 숨김)
    if (baseDmg !== undefined && baseDmg > 0) {
      const total = baseDmg + resBonus + accBonus + chainBonus;
      predEl.style.display = 'block';
      predEl.textContent = '';
      predEl.append(doc.createTextNode('⚔ 예상 피해: '));
      const totalB = doc.createElement('b'); totalB.textContent = total; predEl.appendChild(totalB);

      if (resBonus > 0) {
        const span = doc.createElement('span');
        span.style.cssText = 'color:rgba(255,120,120,0.8);font-size:9px;';
        span.textContent = ` (+${resBonus} 공명)`;
        predEl.appendChild(span);
      }
      if (accBonus > 0) {
        const span = doc.createElement('span');
        span.style.cssText = 'color:rgba(255,180,0,0.8);font-size:9px;';
        span.textContent = ` (+${accBonus} 가속)`;
        predEl.appendChild(span);
      }
      if (chainBonus > 0) {
        const chainSpan = doc.createElement('span');
        chainSpan.style.cssText = 'color:rgba(0,255,204,0.8);font-size:9px;';
        chainSpan.textContent = ` (+${chainBonus} 체인)`;
        predEl.appendChild(chainSpan);
      }
    } else {
      predEl.style.display = 'none';
    }
    const rect = event.currentTarget.getBoundingClientRect();
    let x = rect.right + 12;
    let y = rect.top;
    if (x + 170 > win.innerWidth) x = rect.left - 172;
    if (y + 260 > win.innerHeight) y = win.innerHeight - 265;
    tt.style.left = `${x}px`;
    tt.style.top = `${y}px`;
    tt.classList.add('visible');

    // Sub-tooltip for keywords
    const st = doc.getElementById('subTooltip');
    if (st) {
      // Sort keys by length descending to match "기절 면역" before "기절"
      const sortedKeys = Object.keys(KEYWORD_MAP).sort((a, b) => b.length - a.length);
      const foundKw = sortedKeys.find(kw => card.desc?.includes(kw) || (card.exhaust && kw === '[소진]'));
      if (foundKw) {
        const kwData = KEYWORD_MAP[foundKw];
        doc.getElementById('stTitle').textContent = kwData.title;
        doc.getElementById('stContent').textContent = kwData.text;

        let stX = x + 172;
        let stY = y;
        if (stX + 180 > win.innerWidth) stX = x - 182;

        st.style.left = `${stX}px`;
        st.style.top = `${stY}px`;
        st.style.display = 'block';
      } else {
        st.style.display = 'none';
      }
    }
  },

  hideTooltip(deps = {}) {
    const doc = _getDoc(deps);
    _tooltipTimer = setTimeout(() => {
      doc.getElementById('cardTooltip')?.classList.remove('visible');
      const st = doc.getElementById('subTooltip');
      if (st) st.style.display = 'none';
    }, 80);
  },

  attachCardTooltips(deps = {}) {
    const doc = _getDoc(deps);
    doc.querySelectorAll('#combatHandCards .card, #deckModalCards > div').forEach(el => {
      el.addEventListener('mouseenter', (e) => {
        const onclick = el.getAttribute('onclick') || '';
        const m = onclick.match(/playCard\('([^']+)'/);
        if (m) this.showTooltip(e, m[1], deps);
      });
      el.addEventListener('mouseleave', () => this.hideTooltip(deps));
    });
  },

  showItemTooltip(event, itemId, deps = {}) {
    const data        = deps.data;
    const gs          = deps.gs;
    const setBonusSys = deps.setBonusSystem;
    if (!data?.items) return;

    const item = data.items[itemId];
    if (!item) return;

    this.hideItemTooltip(deps);          // 기존 툴팁 먼저 제거

    const doc = _getDoc(deps);
    const win = _getWin(deps);

    // ── 레어도 메타 ──────────────────────────────────────────────
    const rarity = item.rarity || 'common';
    const ra      = RARITY_TIP_META[rarity] || RARITY_TIP_META.common;
    const rLabel  = RARITY_LABELS[rarity] || rarity;
    const triggerText = item.trigger
      ? (TRIGGER_LABEL_MAP[item.trigger] || item.trigger)
      : '패시브';

    // ── 세트 정보 ────────────────────────────────────────────────
    // setBonusSystem.sets 에 직접 접근 (없으면 data.items 에서 재구성)
    let setDef   = null;
    let setCount = 0;
    let setOwnedFlags = [];

    if (item.setId && setBonusSys) {
      // 1순위: SetBonusSystem.sets 직접 접근
      setDef = setBonusSys.sets?.[item.setId] || null;

      // 2순위 fallback — data.items 에서 같은 setId 를 공유하는 아이템 수집
      if (!setDef) {
        const members = Object.values(data.items).filter(i => i.setId === item.setId);
        if (members.length >= 2) {
          const bonusEntries = {};
          // bonuses 를 알 수 없으면 빈 객체 (세트 이름/아이템 목록만 표시)
          setDef = {
            name: item.setId,
            items: members.map(m => m.id),
            bonuses: bonusEntries,
          };
        }
      }

      if (setDef && gs) {
        const counts = setBonusSys.getOwnedSetCounts?.(gs) || {};
        setCount     = counts[item.setId] || 0;
        setOwnedFlags = setDef.items.map(id => gs.player?.items?.includes(id) ?? false);
      }
    } else if (item.setId) {
      // setBonusSys가 아예 안 들어와도 fallback으로 세트 구성
      const members = Object.values(data.items).filter(i => i.setId === item.setId);
      if (members.length >= 2) {
        setDef = {
          name: item.setId,
          items: members.map(m => m.id),
          bonuses: {},
        };
        if (gs) {
          setCount = setDef.items.filter(id => gs.player?.items?.includes(id)).length;
          setOwnedFlags = setDef.items.map(id => gs.player?.items?.includes(id) ?? false);
        }
      }
    }

    // ── 런타임 충전 상태 ─────────────────────────────────────────
    const chargeMeta = ITEM_CHARGE_META[itemId] || null;
    let liveCharge   = null;
    if (chargeMeta && gs) {
      const val = gs[chargeMeta.gsKey];
      if (chargeMeta.type === 'bool') {
        liveCharge = { type: 'bool', active: !!val, label: chargeMeta.label };
      } else if (chargeMeta.type === 'invert-dot') {
        const used = val ? 1 : 0;
        liveCharge = { type: 'dot', val: chargeMeta.max - used, max: chargeMeta.max, remaining: chargeMeta.max - used, label: chargeMeta.label };
      } else if (chargeMeta.type === 'dot' || chargeMeta.type === 'num') {
        const cur = Number(val) || 0;
        liveCharge = { type: chargeMeta.type, val: cur, max: chargeMeta.max, remaining: chargeMeta.max - cur, label: chargeMeta.label };
      }
    }

    // ── 루트 엘리먼트 ────────────────────────────────────────────
    const el  = doc.createElement('div');
    el.id     = '_itemTip';
    el.style.cssText = [
      'position:fixed;z-index:960;width:268px;',
      `background:var(--panel,rgba(8,8,26,0.98));`,
      `border:1px solid ${ra.border};border-radius:14px;`,
      'overflow:hidden;pointer-events:none;',
      `backdrop-filter:blur(28px);`,
      `box-shadow:0 20px 60px rgba(0,0,0,0.9),0 0 40px ${ra.glow};`,
      'animation:itemTipIn 0.18s cubic-bezier(0.34,1.4,0.64,1) both;',
    ].join('');

    // ── 상단 레어도 바 ────────────────────────────────────────────
    const topBar = doc.createElement('div');
    topBar.style.cssText = `height:3px;background:linear-gradient(90deg,transparent,${ra.color} 30%,${ra.color} 70%,transparent);`;
    el.appendChild(topBar);

    // ── 내용 래퍼 ────────────────────────────────────────────────
    const body = doc.createElement('div');
    body.style.cssText = 'padding:14px 16px;display:flex;flex-direction:column;gap:10px;';

    // ── 헤더: 아이콘 + 이름 ──────────────────────────────────────
    const header = doc.createElement('div');
    header.style.cssText = 'display:flex;gap:12px;align-items:flex-start;';

    // 아이콘 박스
    const iconBox = doc.createElement('div');
    iconBox.style.cssText = [
      'width:56px;height:56px;border-radius:11px;flex-shrink:0;',
      `background:radial-gradient(circle at 38% 38%,rgba(${ra.rgb},0.25) 0%,transparent 68%);`,
      `border:1px solid rgba(${ra.rgb},0.45);`,
      'display:flex;align-items:center;justify-content:center;',
      'font-size:28px;position:relative;',
    ].join('');
    iconBox.textContent = item.icon || '?';

    // 전설 등급 코너 장식
    if (rarity === 'legendary') {
      [
        'top:-1px;left:-1px;border-top:2px solid;border-left:2px solid;border-radius:4px 0 0 0;',
        'top:-1px;right:-1px;border-top:2px solid;border-right:2px solid;border-radius:0 4px 0 0;',
        'bottom:-1px;left:-1px;border-bottom:2px solid;border-left:2px solid;border-radius:0 0 0 4px;',
        'bottom:-1px;right:-1px;border-bottom:2px solid;border-right:2px solid;border-radius:0 0 4px 0;',
      ].forEach(css => {
        const corner = doc.createElement('div');
        corner.style.cssText = `position:absolute;width:9px;height:9px;border-color:${ra.color};${css}`;
        iconBox.appendChild(corner);
      });
    }

    // 이름 + 배지
    const infoCol = doc.createElement('div');
    infoCol.style.cssText = 'padding-top:2px;flex:1;';

    const nameEl = doc.createElement('div');
    nameEl.style.cssText = `font-family:'Cinzel',serif;font-size:14px;font-weight:700;color:${ra.color};margin-bottom:5px;line-height:1.2;`;
    nameEl.textContent = item.name;

    const badges = doc.createElement('div');
    badges.style.cssText = 'display:flex;flex-wrap:wrap;gap:4px;';

    const rarityBadge = doc.createElement('span');
    rarityBadge.style.cssText = [
      'font-family:\'Cinzel\',serif;font-size:8px;letter-spacing:0.15em;',
      `background:rgba(${ra.rgb},0.1);border:1px solid rgba(${ra.rgb},0.35);`,
      `border-radius:4px;padding:2px 7px;color:${ra.color};`,
    ].join('');
    rarityBadge.textContent = rLabel;

    const triggerBadge = doc.createElement('span');
    triggerBadge.style.cssText = [
      'font-size:8px;letter-spacing:0.04em;',
      'background:rgba(0,255,204,0.06);border:1px solid rgba(0,255,204,0.2);',
      'border-radius:4px;padding:2px 7px;color:var(--echo,#00ffcc);',
    ].join('');
    triggerBadge.textContent = `⚡ ${triggerText}`;

    badges.append(rarityBadge, triggerBadge);
    infoCol.append(nameEl, badges);
    header.append(iconBox, infoCol);
    body.appendChild(header);

    // ── 설명 (DomSafe.setHighlightedText) ────────────────────────
    const descBox = doc.createElement('div');
    descBox.style.cssText = [
      'font-size:11.5px;color:var(--text,#c8c8e8);line-height:1.72;',
      'background:rgba(255,255,255,0.025);border:1px solid var(--border,rgba(255,255,255,0.08));',
      'border-radius:8px;padding:8px 10px;',
    ].join('');
    DomSafe.setHighlightedText(descBox, item.desc || '');
    body.appendChild(descBox);

    // ── 런타임 충전 패널 ─────────────────────────────────────────
    if (liveCharge) {
      const chargePanel = doc.createElement('div');
      chargePanel.style.cssText = [
        'padding:8px 10px;border-radius:8px;',
        'background:rgba(0,255,204,0.04);border:1px solid rgba(0,255,204,0.15);',
      ].join('');

      const chargeLabel = doc.createElement('div');
      chargeLabel.style.cssText = 'font-size:9px;color:var(--text-dim,#7a7a9a);letter-spacing:0.08em;margin-bottom:6px;font-family:\'Cinzel\',serif;';
      chargeLabel.textContent = liveCharge.label;
      chargePanel.appendChild(chargeLabel);

      if (liveCharge.type === 'dot') {
        const dotsRow = doc.createElement('div');
        dotsRow.style.cssText = 'display:flex;justify-content:space-between;align-items:center;margin-bottom:5px;';
        const dots = doc.createElement('div');
        dots.style.cssText = 'display:flex;gap:4px;';
        for (let i = 0; i < liveCharge.max; i++) {
          const dot = doc.createElement('div');
          const filled = i < liveCharge.val;
          dot.style.cssText = [
            'width:11px;height:11px;border-radius:50%;transition:all 0.2s;',
            `background:${filled ? ra.color : 'rgba(255,255,255,0.08)'};`,
            `box-shadow:${filled ? `0 0 6px ${ra.glow}` : 'none'};`,
          ].join('');
          dots.appendChild(dot);
        }
        const remain = doc.createElement('span');
        remain.style.cssText = `font-size:10px;color:${liveCharge.remaining > 0 ? ra.color : 'var(--text-dim,#7a7a9a)'};`;
        remain.textContent = liveCharge.remaining > 0 ? `${liveCharge.remaining}회 남음` : '소진됨';
        dotsRow.append(dots, remain);
        chargePanel.appendChild(dotsRow);

        const track = doc.createElement('div');
        track.style.cssText = 'height:4px;background:rgba(255,255,255,0.06);border-radius:3px;overflow:hidden;';
        const fill = doc.createElement('div');
        fill.style.cssText = `height:100%;border-radius:3px;width:${(liveCharge.remaining/liveCharge.max)*100}%;background:linear-gradient(90deg,rgba(${ra.rgb},0.55),${ra.color});`;
        track.appendChild(fill);
        chargePanel.appendChild(track);

      } else if (liveCharge.type === 'num') {
        const numRow = doc.createElement('div');
        numRow.style.cssText = 'display:flex;align-items:center;gap:9px;';
        const track = doc.createElement('div');
        track.style.cssText = 'flex:1;height:6px;background:rgba(255,255,255,0.06);border-radius:3px;overflow:hidden;';
        const fill = doc.createElement('div');
        fill.style.cssText = `height:100%;border-radius:3px;width:${(liveCharge.val/liveCharge.max)*100}%;background:linear-gradient(90deg,rgba(${ra.rgb},0.5),${ra.color});`;
        track.appendChild(fill);
        const numEl = doc.createElement('span');
        numEl.style.cssText = `font-size:11px;color:${ra.color};white-space:nowrap;font-variant-numeric:tabular-nums;`;
        numEl.textContent = `${liveCharge.val} / ${liveCharge.max}`;
        numRow.append(track, numEl);
        chargePanel.appendChild(numRow);

      } else if (liveCharge.type === 'bool') {
        const boolRow = doc.createElement('div');
        boolRow.style.cssText = 'display:flex;align-items:center;gap:8px;';
        const dot = doc.createElement('div');
        dot.style.cssText = [
          'width:8px;height:8px;border-radius:50%;',
          `background:${liveCharge.active ? 'var(--echo,#00ffcc)' : 'rgba(255,255,255,0.15)'};`,
          `box-shadow:${liveCharge.active ? '0 0 8px var(--echo,#00ffcc)' : 'none'};`,
        ].join('');
        const boolText = doc.createElement('span');
        boolText.style.cssText = `font-size:10px;color:${liveCharge.active ? 'var(--echo,#00ffcc)' : 'var(--text-dim,#7a7a9a)'};`;
        boolText.textContent = liveCharge.active ? '현재 활성화됨' : '비활성';
        boolRow.append(dot, boolText);
        chargePanel.appendChild(boolRow);
      }

      body.appendChild(chargePanel);
    }

    // ── 세트 패널 ─────────────────────────────────────────────────
    if (setDef) {
      const setPanel = doc.createElement('div');
      setPanel.style.cssText = [
        'background:rgba(123,47,255,0.07);border:1px solid rgba(123,47,255,0.25);',
        'border-radius:8px;padding:9px 11px;',
      ].join('');

      const setHeader = doc.createElement('div');
      setHeader.style.cssText = 'display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;';

      const setNameEl = doc.createElement('span');
      setNameEl.style.cssText = "font-size:9px;color:var(--echo-bright,#a78bfa);letter-spacing:0.12em;font-family:'Cinzel',serif;";
      setNameEl.textContent = `◈ ${setDef.name}`;

      const setCountBadge = doc.createElement('span');
      const countActive = setCount >= 2;
      setCountBadge.style.cssText = [
        'font-size:8px;padding:1px 7px;border-radius:3px;',
        `background:${countActive ? 'rgba(167,139,250,0.15)' : 'rgba(255,255,255,0.04)'};`,
        `border:1px solid ${countActive ? 'rgba(167,139,250,0.4)' : 'var(--border,rgba(255,255,255,0.08))'};`,
        `color:${countActive ? 'var(--echo-bright,#a78bfa)' : 'var(--text-dim,#7a7a9a)'};`,
      ].join('');
      setCountBadge.textContent = `${setCount} / ${setDef.items.length}`;
      setHeader.append(setNameEl, setCountBadge);
      setPanel.appendChild(setHeader);

      const itemList = doc.createElement('div');
      itemList.style.cssText = 'display:flex;flex-direction:column;gap:4px;margin-bottom:10px;';
      setDef.items.forEach((memberId, i) => {
        const memberData = data.items[memberId];
        const isOwned    = setOwnedFlags[i] ?? false;
        const memberRa   = RARITY_TIP_META[memberData?.rarity || 'common'];

        const row = doc.createElement('div');
        row.style.cssText = [
          'display:flex;align-items:center;gap:7px;',
          'padding:4px 7px;border-radius:6px;',
          `background:${isOwned ? 'rgba(123,47,255,0.14)' : 'rgba(255,255,255,0.02)'};`,
          `border:1px solid ${isOwned ? 'rgba(167,139,250,0.4)' : 'var(--border,rgba(255,255,255,0.08))'};`,
        ].join('');

        const indicator = doc.createElement('div');
        indicator.style.cssText = [
          'width:6px;height:6px;border-radius:50%;flex-shrink:0;',
          `background:${isOwned ? memberRa.color : 'rgba(255,255,255,0.15)'};`,
          `box-shadow:${isOwned ? `0 0 5px ${memberRa.glow}` : 'none'};`,
        ].join('');

        const memberIcon = doc.createElement('span');
        memberIcon.style.cssText = `font-size:13px;flex-shrink:0;opacity:${isOwned ? 1 : 0.3};`;
        memberIcon.textContent = memberData?.icon || '?';

        const memberName = doc.createElement('span');
        memberName.style.cssText = `font-size:10px;color:${isOwned ? '#c4b5fd' : 'var(--text-dim,#7a7a9a)'};flex:1;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;`;
        memberName.textContent = memberData?.name || memberId;

        row.append(indicator, memberIcon, memberName);

        if (isOwned) {
          const ownedBadge = doc.createElement('span');
          ownedBadge.style.cssText = 'font-size:8px;color:var(--echo,#00ffcc);flex-shrink:0;';
          ownedBadge.textContent = '보유';
          row.appendChild(ownedBadge);
        }
        itemList.appendChild(row);
      });
      setPanel.appendChild(itemList);

      const bonusEntries = Object.entries(setDef.bonuses || {}).sort(([a], [b]) => Number(a) - Number(b));
      bonusEntries.forEach(([tier, bonus], i) => {
        const tierNum = Number(tier);
        const isActive = setCount >= tierNum;
        const bonusRow = doc.createElement('div');
        bonusRow.style.cssText = `display:flex;gap:7px;align-items:flex-start;${i < bonusEntries.length - 1 ? 'margin-bottom:5px;' : ''}`;

        const tierBadge = doc.createElement('div');
        tierBadge.style.cssText = [
          'width:15px;height:15px;border-radius:3px;flex-shrink:0;margin-top:1px;',
          `background:${isActive ? 'rgba(123,47,255,0.25)' : 'rgba(255,255,255,0.04)'};`,
          `border:1px solid ${isActive ? 'rgba(167,139,250,0.5)' : 'var(--border,rgba(255,255,255,0.08))'};`,
          'display:flex;align-items:center;justify-content:center;',
          `font-size:7px;color:${isActive ? 'var(--echo-bright,#a78bfa)' : 'var(--text-dim,#7a7a9a)'};`,
        ].join('');
        tierBadge.textContent = tier;

        const bonusText = doc.createElement('span');
        bonusText.style.cssText = `font-size:10px;color:${isActive ? '#c4b5fd' : 'var(--text-dim,#7a7a9a)'};line-height:1.5;flex:1;`;
        bonusText.textContent = bonus.label || '';

        bonusRow.append(tierBadge, bonusText);
        if (isActive) {
          const activeMark = doc.createElement('span');
          activeMark.style.cssText = 'font-size:8px;color:var(--echo,#00ffcc);flex-shrink:0;';
          activeMark.textContent = '✦';
          bonusRow.appendChild(activeMark);
        }
        setPanel.appendChild(bonusRow);
      });

      body.appendChild(setPanel);
    }

    el.appendChild(body);

    const botBar = doc.createElement('div');
    botBar.style.cssText = `height:2px;background:linear-gradient(90deg,transparent,rgba(${ra.rgb},0.35),transparent);`;
    el.appendChild(botBar);

    // ── 위치 계산 ─────────────────────────────────────────────────
    const tipW   = 268;
    const tipH   = 460;  // 예상 최대 높이
    const margin = 10;
    const rect   = event.currentTarget.getBoundingClientRect();

    el.style.left = '0px';
    el.style.top  = '0px';
    doc.body.appendChild(el);

    const realRect = el.getBoundingClientRect();
    const actualH  = Math.max(tipH, realRect.height || tipH);
    const actualW  = Math.max(tipW, realRect.width  || tipW);

    let x = rect.right + 14;
    let y = rect.top - 10;
    if (x + actualW + margin > win.innerWidth)  x = rect.left - actualW - 14;
    if (x < margin)                              x = margin;
    if (x + actualW + margin > win.innerWidth)   x = Math.max(margin, win.innerWidth - actualW - margin);
    if (y + actualH + margin > win.innerHeight)  y = win.innerHeight - actualH - margin;
    if (y < margin)                              y = margin;

    el.style.left = `${Math.round(x)}px`;
    el.style.top  = `${Math.round(y)}px`;
    _itemTipEl = el;
  },

  hideItemTooltip(deps = {}) {
    if (!_itemTipEl) return;
    const el  = _itemTipEl;
    _itemTipEl = null;
    el.style.animation = 'itemTipOut 0.14s ease forwards';
    setTimeout(() => {
      if (el.parentNode) el.parentNode.removeChild(el);
    }, 140);
  },

  showGeneralTooltip(event, title, content, deps = {}) {
    this.hideGeneralTooltip(deps);
    const doc = _getDoc(deps);
    const win = _getWin(deps);
    const el = doc.createElement('div');
    el.id = '_generalTip';
    el.style.cssText = [
      'position:fixed;z-index:10000;',
      'background:rgba(10,10,35,0.98);border:1px solid var(--echo);border-left:3px solid var(--echo);border-radius:8px;',
      'padding:12px;width:220px;pointer-events:none;',
      'backdrop-filter:blur(20px);',
      'box-shadow:0 10px 40px rgba(0,0,0,0.8);',
      'animation:fadeIn 0.15s ease both;',
    ].join('');

    const titleEl = doc.createElement('div');
    titleEl.style.cssText = "font-family:'Cinzel',serif;font-size:11px;font-weight:700;color:var(--gold);margin-bottom:6px;letter-spacing:0.05em;";
    titleEl.textContent = title;

    const contentEl = doc.createElement('div');
    contentEl.style.cssText = 'font-size:11px;color:var(--text);line-height:1.6;';
    contentEl.innerHTML = content; // This specific one takes trusted content (e.g. from static calls)

    el.append(titleEl, contentEl);

    const rect = event.currentTarget.getBoundingClientRect();
    let x = rect.right + 10;
    let y = rect.top;
    const margin = 8;
    const maxRight = Math.max(margin, win.innerWidth - margin);

    el.style.left = '0px';
    el.style.top = '0px';
    doc.body.appendChild(el);
    const tipRect = el.getBoundingClientRect();
    const tipW = Math.max(180, tipRect.width || 220);
    const tipH = Math.max(80, tipRect.height || 120);

    if (x + tipW > maxRight) x = rect.left - tipW - 10;
    if (x < margin) x = margin;
    if (x + tipW > maxRight) x = Math.max(margin, maxRight - tipW);

    if (y + tipH + margin > win.innerHeight) y = win.innerHeight - tipH - margin;
    if (y < margin) y = margin;

    el.style.left = `${Math.round(x)}px`;
    el.style.top = `${Math.round(y)}px`;
    window._generalTipEl = el;
  },

  hideGeneralTooltip() {
    if (window._generalTipEl) {
      window._generalTipEl.remove();
      window._generalTipEl = null;
    }
  }
};
