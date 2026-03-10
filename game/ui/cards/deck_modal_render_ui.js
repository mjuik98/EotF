import { RARITY_SORT_ORDER } from '../../../data/rarity_meta.js';
import { DECK_MODAL_RARITY_BORDER_COLORS } from '../../../data/ui_rarity_styles.js';

function getTypeColor(type, upgraded) {
  if (upgraded) return 'var(--cyan)';
  if (type === 'ATTACK') return '#ff6688';
  if (type === 'SKILL') return '#66bbff';
  if (type === 'POWER') return 'var(--gold)';
  return 'var(--echo)';
}

export function buildDeckModalEntries(gs, data, filterType = 'all') {
  const deckCards = gs?.player?.deck ? [...gs.player.deck] : [];
  const handCards = gs?.player?.hand ? [...gs.player.hand] : [];
  const graveCards = gs?.player?.graveyard ? [...gs.player.graveyard] : [];
  const countMap = {};

  deckCards.forEach((id) => {
    countMap[id] = (countMap[id] || 0) + 1;
  });

  const entries = Object.entries(countMap)
    .sort(([leftId], [rightId]) => {
      const leftRank = RARITY_SORT_ORDER[data?.cards?.[leftId]?.rarity || 'common'] ?? 3;
      const rightRank = RARITY_SORT_ORDER[data?.cards?.[rightId]?.rarity || 'common'] ?? 3;
      return leftRank - rightRank;
    })
    .filter(([id]) => {
      if (filterType === 'all') return true;
      const card = data?.cards?.[id];
      if (!card) return false;
      if (filterType === 'upgraded') return !!card.upgraded;
      return card.type === filterType;
    })
    .map(([id, count]) => ({
      id,
      count,
      card: data?.cards?.[id],
      inHand: handCards.includes(id),
      inGraveyard: graveCards.includes(id),
    }))
    .filter((entry) => !!entry.card);

  return {
    deckCount: deckCards.length,
    handCount: handCards.length,
    graveCount: graveCards.length,
    entries,
  };
}

export function renderDeckStatusBar(doc, bar, counts) {
  if (!bar) return;
  bar.textContent = '';

  const createPart = (label, value, color) => {
    const span = doc.createElement('span');
    span.style.color = color;
    span.textContent = `${label} `;
    const bold = doc.createElement('b');
    bold.textContent = value;
    span.appendChild(bold);
    return span;
  };
  const createSeparator = () => {
    const span = doc.createElement('span');
    span.style.opacity = '0.3';
    span.textContent = ' / ';
    return span;
  };

  bar.append(
    createPart('덱', counts.deckCount, 'var(--echo)'),
    createSeparator(),
    createPart('손패', counts.handCount, 'var(--cyan)'),
    createSeparator(),
    createPart('무덤', counts.graveCount, 'var(--text-dim)'),
  );
}

export function renderDeckModalCards(doc, cardsEl, entries, options = {}) {
  if (!cardsEl) return;
  const { showTooltip, hideTooltip, highlightDescription } = options;
  cardsEl.textContent = '';

  entries.forEach(({ id, count, card, inHand, inGraveyard }) => {
    const borderColor = DECK_MODAL_RARITY_BORDER_COLORS[card.rarity || 'common'];
    const typeColor = getTypeColor(card.type, card.upgraded);

    const el = doc.createElement('div');
    el.style.cssText = `position:relative;background:var(--glass);border:1px solid ${borderColor};border-radius:16px;padding:16px 14px;width:160px;min-height:240px;display:flex;flex-direction:column;align-items:center;backdrop-filter:blur(16px);transition:all 0.15s;`;
    el.onmouseenter = (event) => {
      showTooltip?.(event, id);
      el.style.transform = 'translateY(-6px)';
      el.style.boxShadow = '0 12px 32px rgba(0,0,0,0.6)';
    };
    el.onmouseleave = () => {
      hideTooltip?.();
      el.style.transform = '';
      el.style.boxShadow = '';
    };

    const cost = doc.createElement('div');
    cost.style.cssText = "position:absolute;top:8px;left:8px;width:32px;height:32px;border-radius:50%;background:rgba(123,47,255,0.4);border:1px solid var(--echo);display:flex;align-items:center;justify-content:center;font-family:'Cinzel',serif;font-size:16px;font-weight:700;color:var(--white);";
    cost.textContent = card.cost;
    el.appendChild(cost);

    if (count > 1) {
      const countBadge = doc.createElement('div');
      countBadge.style.cssText = "position:absolute;bottom:40px;right:10px;font-family:'Share Tech Mono',monospace;font-size:14px;color:var(--cyan);font-weight:bold;";
      countBadge.textContent = `×${count}`;
      el.appendChild(countBadge);
    }

    if (inHand || inGraveyard) {
      const tag = doc.createElement('div');
      tag.className = 'card-location-tag';
      tag.style.cssText = `position:absolute;top:4px;right:4px;font-size:7px;border-radius:3px;padding:1px 4px;color:${inHand ? 'var(--cyan)' : 'var(--echo)'};background:${inHand ? 'rgba(0,255,204,0.15)' : 'rgba(123,47,255,0.15)'};`;
      tag.textContent = inHand ? '손패' : '무덤';
      el.appendChild(tag);
    }

    const icon = doc.createElement('div');
    icon.style.cssText = 'font-size:48px;margin:32px 0 12px;';
    icon.textContent = card.icon;
    el.appendChild(icon);

    const name = doc.createElement('div');
    name.style.cssText = "font-family:'Cinzel',serif;font-size:16px;font-weight:700;color:var(--white);text-align:center;margin-bottom:8px;line-height:1.2;";
    name.textContent = card.name;
    el.appendChild(name);

    const desc = doc.createElement('div');
    desc.style.cssText = 'font-size:13px;color:var(--text);text-align:center;line-height:1.5;flex:1;';
    if (typeof highlightDescription === 'function') {
      desc.innerHTML = highlightDescription(card.desc);
    } else {
      desc.textContent = card.desc;
    }
    el.appendChild(desc);

    const type = doc.createElement('div');
    type.style.cssText = `font-family:'Cinzel',serif;font-size:12px;letter-spacing:0.1em;color:${typeColor};margin-top:8px;font-weight:bold;`;
    type.textContent = card.upgraded ? `${card.type} ✦` : card.type;
    el.appendChild(type);

    cardsEl.appendChild(el);
  });
}

export function applyDeckFilterButtonStyles(doc, activeType) {
  ['all', 'ATTACK', 'SKILL', 'POWER', 'upgraded'].forEach((type) => {
    const btn = doc.getElementById(`deckFilter_${type}`);
    if (!btn) return;
    if (type === activeType) {
      btn.style.background = type === 'ATTACK' ? 'rgba(255,80,100,0.2)'
        : type === 'SKILL' ? 'rgba(80,180,255,0.2)'
          : type === 'POWER' ? 'rgba(240,180,41,0.15)'
            : type === 'upgraded' ? 'rgba(0,255,204,0.12)'
              : 'rgba(123,47,255,0.2)';
    } else {
      btn.style.background = 'transparent';
    }
  });
}
