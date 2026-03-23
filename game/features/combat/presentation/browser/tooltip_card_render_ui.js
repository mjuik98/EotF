import { DescriptionUtils } from '../../../../utils/description_utils.js';
import { DomSafe } from '../../../../utils/dom_safe.js';
import { UNBREAKABLE_WALL_STACK_UNIT } from '../../../../../data/status_key_data.js';
import {
  getCombatCardTypeLabel,
  resolvePrimaryCombatKeywordTooltip,
} from './combat_copy.js';

function isUnbreakableWallCard(cardId) {
  return cardId === 'unbreakable_wall' || cardId === 'unbreakable_wall_plus';
}

function getUnbreakableWallBuffId(cardId) {
  return cardId === 'unbreakable_wall_plus' ? 'unbreakable_wall_plus' : 'unbreakable_wall';
}

function getUnbreakableWallHitCount(buff) {
  const stacks = Number(buff?.stacks || 0);
  if (!Number.isFinite(stacks) || stacks <= 0) return 0;
  return Math.max(1, Math.floor(stacks / UNBREAKABLE_WALL_STACK_UNIT));
}

export function buildUnbreakableWallCardTooltip(cardId, gs) {
  if (!isUnbreakableWallCard(cardId)) return '';

  const buffId = getUnbreakableWallBuffId(cardId);
  const currentBuff = gs?.getBuff?.(buffId);
  const currentHits = getUnbreakableWallHitCount(currentBuff);
  const nextHits = Math.max(1, currentHits + 1);
  const ratio = cardId === 'unbreakable_wall_plus' ? 0.7 : 0.5;
  const shield = Number(gs?.player?.shield || 0);
  const safeShield = Number.isFinite(shield) && shield > 0 ? Math.floor(shield) : 0;
  const perHit = Math.floor(safeShield * ratio);
  const total = perHit * nextHits;

  return `<br><br>\uD604\uC7AC \uC911\uCCA9: ${currentHits}\uD68C \uBC1C\uB3D9<br>\uC0AC\uC6A9 \uD6C4 \uC608\uC0C1: ${nextHits}\uD68C \uBC1C\uB3D9<br>\uD604\uC7AC \uBC29\uC5B4\uB9C9(${safeShield}) \uAE30\uC900: 1\uD68C ${perHit}, \uCD1D ${total} \uD53C\uD574`;
}

export function renderCardTooltipContent(doc, card, gs, options = {}) {
  const { cardId = '' } = options;
  doc.getElementById('ttIcon').textContent = card.icon;
  const costEl = doc.getElementById('ttCost');
  costEl.textContent = card.cost;
  costEl.className = ['card-cost', 'card-cost-tooltip', `card-cost-type-${String(card.type || '').toLowerCase()}`].filter(Boolean).join(' ');
  doc.getElementById('ttName').textContent = card.name;
  const typeEl = doc.getElementById('ttType');
  typeEl.textContent = getCombatCardTypeLabel(card.type);
  typeEl.className = ['card-tooltip-type', `card-tooltip-type-${String(card.type || '').toLowerCase()}`].filter(Boolean).join(' ');

  const desc = `${card.desc || ''}${buildUnbreakableWallCardTooltip(cardId, gs)}`;
  DomSafe.setHighlightedText(doc.getElementById('ttDesc'), desc);

  const rarityEl = doc.getElementById('ttRarity');
  rarityEl.textContent = DescriptionUtils.getRarityLabel(card.rarity || 'common');
  rarityEl.className = `card-tooltip-rarity rarity-${card.rarity || 'common'}`;

  const predEl = doc.getElementById('ttPredicted');
  const baseDmg = card.dmg;
  const res = gs?.getBuff?.('resonance');
  const acc = gs?.getBuff?.('acceleration');
  const resBonus = res ? (res.dmgBonus || 0) : 0;
  const accBonus = acc ? (acc.dmgBonus || 0) : 0;
  const chainBonus = baseDmg && gs?.player?.echoChain >= 3 ? Math.floor(baseDmg * 0.2) : 0;

  if (baseDmg !== undefined && baseDmg > 0) {
    const total = baseDmg + resBonus + accBonus + chainBonus;
    predEl.style.display = 'block';
    predEl.textContent = '';
    predEl.append(doc.createTextNode('⚔ 예상 피해: '));

    const totalB = doc.createElement('b');
    totalB.textContent = total;
    predEl.appendChild(totalB);

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
}

export function positionCardTooltip(event, tooltipEl, win) {
  const rect = event.currentTarget.getBoundingClientRect();
  let x = rect.right + 12;
  let y = rect.top;
  if (x + 170 > win.innerWidth) x = rect.left - 172;
  if (y + 260 > win.innerHeight) y = win.innerHeight - 265;
  tooltipEl.style.left = `${x}px`;
  tooltipEl.style.top = `${y}px`;
  return { x, y };
}

export function syncCardKeywordTooltip(doc, card, position, win) {
  const subTooltip = doc.getElementById('subTooltip');
  if (!subTooltip) return null;

  const keywordData = resolvePrimaryCombatKeywordTooltip(card);
  if (!keywordData) {
    subTooltip.style.display = 'none';
    return null;
  }
  doc.getElementById('stTitle').textContent = keywordData.title;
  doc.getElementById('stContent').textContent = keywordData.text;

  let x = position.x + 172;
  let y = position.y;
  if (x + 180 > win.innerWidth) x = position.x - 182;

  subTooltip.style.left = `${x}px`;
  subTooltip.style.top = `${y}px`;
  subTooltip.style.display = 'block';
  return { keyword: keywordData.keyword, x, y };
}

export function extractTooltipCardId(onclickValue) {
  const match = String(onclickValue || '').match(/playCard\('([^']+)'/);
  return match ? match[1] : null;
}
