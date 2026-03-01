import { DescriptionUtils } from '../../utils/description_utils.js';
import { DomSafe } from '../../utils/dom_safe.js';


let _tooltipTimer = null;
let _itemTipEl = null;

function _getDoc(deps) {
  return deps?.doc || document;
}

function _getWin(deps) {
  return deps?.win || window;
}

const UNBREAKABLE_WALL_STACK_UNIT = 99;

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
  '【소진】': { title: '소진 (Exhaust)', text: '사용 후 이번 전투에서 영구 제거됩니다. 소모 더미로 가지 않습니다.' },
  '【지속】': { title: '지속 (Persistent)', text: '전투가 끝날 때까지 계속 효과가 발동되는 능력 카드입니다.' },
  '【즉시】': { title: '즉시 (Instant)', text: '사용 즉시 발동되는 강력한 일회성 효과입니다.' },
  '잔향': { title: '잔향 (Echo)', text: '특수 능력을 발동하는 에너지 자원. 0~100 사이를 유지하며, 게이지에 따라 효과가 달라집니다.' },
  '연쇄': { title: '연쇄 (Chain)', text: '연속 공격 횟수를 나타냅니다. 5회 이상 쌓이면 다음 공격에 추가 피해가 적용됩니다.' },
  '침묵': { title: '침묵 (Silence)', text: '침묵사냥꾼 전용 게이지. 최대치(10) 도달 시 다음 공격이 대폭 강화됩니다.' },
  '약화': { title: '약화 (Weakened)', text: '대상의 공격력이 50% 감소합니다. 지속 시간이 만료되면 해제됩니다.' },
  '기절': { title: '기절 (Stunned)', text: '다음 턴에 행동하지 못합니다. 기절 턴에는 공격과 방어 모두 불가합니다.' },
  '독': { title: '독 (Poison)', text: '매 턴 시작 시 피해를 입습니다. 매 턴 독 스택이 1씩 감소합니다.' },
  '화염': { title: '화염 (Burning)', text: '매 턴 시작 시 피해 5를 입습니다. 지속 시간이 끝나면 소멸합니다.' },
  '처형 표식': { title: '처형 표식 (Death Mark)', text: '3턴 후 표식이 폭발하여 피해 30을 입힙니다. 시간이 얼마 남지 않았을 때 더욱 위험합니다.' },
  '면역': { title: '면역 (Immune)', text: '모든 피해와 상태이상을 완전히 무효화합니다. 지속 시간 동안 무적 상태입니다.' },
  '회피': { title: '회피 (Dodge)', text: '다음 적의 공격 1회를 완전히 무효화합니다. 회피 후 즉시 소모됩니다.' },
  '은신': { title: '은신 (Stealth)', text: '다음에 사용하는 공격 카드가 치명타로 적중합니다. 공격 즉시 은신이 해제됩니다.' },
  '반사': { title: '반사 (Reflect)', text: '피해를 받을 때 해당 피해를 공격자에게 되돌립니다.' },
  '시간 왜곡': { title: '시간 왜곡 (Time Warp)', text: '매 턴 시작 시 에너지를 1 추가로 획득합니다. 전투가 끝날 때까지 지속됩니다.' },
  '드로우': { title: '드로우 (Draw)', text: '덱에서 카드를 손패로 가져옵니다. 덱이 비면 소모 더미를 섞어 새 덱을 만듭니다.' },
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
    const wallExtraDesc = _buildUnbreakableWallCardTooltip(cardId, gs);
    DomSafe.setHighlightedText(doc.getElementById('ttDesc'), `${card.desc || ''}${wallExtraDesc}`);
    const rarityEl = doc.getElementById('ttRarity');
    rarityEl.textContent = (card.rarity || 'common').toUpperCase();
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
      const foundKw = Object.keys(KEYWORD_MAP).find(kw => card.desc?.includes(kw) || (card.exhaust && kw === '【소진】'));
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
    const data = deps.data;
    const gs = deps.gs;
    const setBonusSystem = deps.setBonusSystem;
    if (!data?.items || !gs || !setBonusSystem?.sets) return;

    const item = data.items[itemId];
    if (!item) return;
    this.hideItemTooltip(deps);

    const doc = _getDoc(deps);
    const win = _getWin(deps);
    const el = doc.createElement('div');
    el.id = '_itemTip';
    el.style.cssText = [
      'position:fixed;z-index:950;',
      'background:var(--panel);border:1px solid rgba(240,180,41,0.35);border-radius:12px;',
      'padding:14px 14px 12px;width:200px;pointer-events:none;',
      'backdrop-filter:blur(24px);',
      'box-shadow:0 12px 40px rgba(0,0,0,0.7),0 0 20px rgba(240,180,41,0.1);',
      'animation:fadeIn 0.15s ease both;',
    ].join('');
    const triggerMap = {
      combat_start: '전투 시작 시',
      card_play: '카드 사용 시',
      turn_start: '턴 시작 시',
      damage_taken: '피해 받을 때',
      boss_start: '보스 조우 시',
      combat_end: '전투 종료 시',
    };
    const triggerText = item.trigger ? (triggerMap[item.trigger] || item.trigger) : '패시브';
    const tipRarityColor = { common: 'var(--text-dim)', uncommon: 'var(--echo-bright)', rare: 'var(--gold)', legendary: '#c084fc' };
    const tipRarityLabel = { common: '일반', uncommon: '비범', rare: '희귀', legendary: '전설' };
    const tipR = item.rarity || 'common';
    const tipBorder = tipR === 'legendary' ? 'rgba(192,132,252,0.4)' : tipR === 'rare' ? 'rgba(240,180,41,0.35)' : tipR === 'uncommon' ? 'rgba(123,47,255,0.35)' : 'var(--border)';
    el.style.borderColor = tipBorder;
    const header = doc.createElement('div');
    header.style.cssText = 'display:flex;align-items:center;gap:10px;margin-bottom:10px;';

    const icon = doc.createElement('div');
    icon.style.cssText = `font-size:28px;line-height:1;filter:${tipR === 'legendary' ? 'drop-shadow(0 0 8px rgba(192,132,252,0.7))' : 'none'};`;
    icon.textContent = item.icon;

    const info = doc.createElement('div');
    const name = doc.createElement('div');
    name.style.cssText = `font-family:'Cinzel',serif;font-size:12px;font-weight:700;color:${tipRarityColor[tipR] || 'var(--white)'};`;
    name.textContent = item.name;

    const sub = doc.createElement('div');
    sub.style.cssText = 'display:flex;gap:6px;align-items:center;margin-top:3px;';
    const rLabel = doc.createElement('span');
    rLabel.style.cssText = `font-family:'Cinzel',serif;font-size:7px;letter-spacing:0.15em;background:rgba(123,47,255,0.15);border-radius:3px;padding:1px 5px;color:${tipRarityColor[tipR]};`;
    rLabel.textContent = tipRarityLabel[tipR] || tipR;
    const tText = doc.createElement('span');
    tText.style.cssText = "font-family:'Cinzel',serif;font-size:7px;letter-spacing:0.1em;color:var(--text-dim);";
    tText.textContent = triggerText;
    sub.append(rLabel, tText);
    info.append(name, sub);
    header.append(icon, info);
    el.appendChild(header);

    const desc = doc.createElement('div');
    desc.style.cssText = 'font-size:11px;color:var(--text);line-height:1.65;border-top:1px solid var(--border);padding-top:8px;';
    DomSafe.setHighlightedText(desc, item.desc);
    el.appendChild(desc);

    (() => {
      const setEntry = Object.entries(setBonusSystem.sets).find(([, s]) => s.items.includes(itemId));
      if (!setEntry) return;
      const [, setData] = setEntry;
      const owned = gs.player.items.filter(id => setData.items.includes(id)).length;
      const total = setData.items.length;
      const setColor = owned >= 3 ? 'var(--gold)' : owned >= 2 ? 'var(--cyan)' : 'rgba(0,255,204,0.4)';
      const b2Label = setData.bonuses[2]?.label || '';
      const b3Label = setData.bonuses[3]?.label || '';

      const setDiv = doc.createElement('div');
      setDiv.style.cssText = 'margin-top:8px;padding:6px 8px;background:rgba(0,255,204,0.05);border:1px solid rgba(0,255,204,0.2);border-radius:6px;';

      const setH = doc.createElement('div');
      setH.style.cssText = `font-family:Cinzel,serif;font-size:8px;letter-spacing:0.15em;color:${setColor};margin-bottom:3px;`;
      setH.textContent = `✦ 세트: ${setData.name} [${owned}/${total}]`;

      const b2 = doc.createElement('div');
      b2.style.cssText = `font-size:9px;color:${owned >= 2 ? 'var(--cyan)' : 'var(--text-dim)'};margin-bottom:1px;`;
      b2.textContent = `2개: ${b2Label}`;

      const b3 = doc.createElement('div');
      b3.style.cssText = `font-size:9px;color:${owned >= 3 ? 'var(--gold)' : 'var(--text-dim)'};`;
      b3.textContent = `3개: ${b3Label}`;

      setDiv.append(setH, b2, b3);
      el.appendChild(setDiv);
    })();

    const rect = event.currentTarget.getBoundingClientRect();
    let x = rect.right + 10;
    let y = rect.top - 10;
    if (x + 212 > win.innerWidth) x = rect.left - 214;
    if (y + 140 > win.innerHeight) y = win.innerHeight - 145;
    el.style.left = `${Math.max(6, x)}px`;
    el.style.top = `${Math.max(6, y)}px`;
    doc.body.appendChild(el);
    _itemTipEl = el;
  },

  hideItemTooltip() {
    if (_itemTipEl) _itemTipEl.remove();
    _itemTipEl = null;
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
    const rightPanelWidth = 240; // 우측 패널 너비
    let x = rect.right + 10;
    let y = rect.top;

    // 우측 패널과의 충돌 확인
    if (x + 220 > win.innerWidth - rightPanelWidth) {
      x = rect.left - 230; // 왼쪽으로 표시
    }
    if (x < 6) x = 6; // 왼쪽 벽 충돌 방지

    if (y + 120 > win.innerHeight) y = win.innerHeight - 125;
    if (y < 6) y = 6;

    el.style.left = `${x}px`;
    el.style.top = `${y}px`;
    doc.body.appendChild(el);
    window._generalTipEl = el;
  },

  hideGeneralTooltip() {
    if (window._generalTipEl) {
      window._generalTipEl.remove();
      window._generalTipEl = null;
    }
  }
};
