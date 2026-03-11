import { discardEventCard } from '../../app/event/use_cases/discard_event_card_use_case.js';
import { EVENT_DISCARD_CARD_RARITY_COLORS } from '../../../data/ui_rarity_styles.js';
import { dismissTransientOverlay, getAudioEngine } from './event_ui_helpers.js';
import { playAttackSlash, playUiItemGetFeedback } from '../../domain/audio/audio_event_helpers.js';

export function showEventCardDiscardOverlay(gs, data, isBurn = false, deps = {}) {
  if (!gs?.player || !data?.cards) return;

  const allCards = [
    ...(gs.player.deck || []),
    ...(gs.player.hand || []),
    ...(gs.player.graveyard || []),
  ];

  if (allCards.length === 0) {
    playAttackSlash(getAudioEngine(deps));
    deps.screenShake?.shake?.(10, 0.4);
    gs.addLog('No cards are available for this action.', 'damage');
    return;
  }

  const doc = deps.doc || document;
  const overlay = doc.createElement('div');
  overlay.id = 'cardDiscardOverlay';
  overlay.style.cssText = `
      position:fixed;inset:0;background:rgba(3,3,10,0.96);
      display:flex;flex-direction:column;align-items:center;justify-content:flex-start;
      padding:40px 24px;gap:20px;z-index:6000;backdrop-filter:blur(20px);
      overflow-y:auto; transition: opacity 0.3s ease;
      animation: modalFadeInDown 0.4s cubic-bezier(0.2, 0.8, 0.2, 1) both;
    `;

  const titleEl = doc.createElement('div');
  titleEl.style.textAlign = 'center';

  const eyebrow = doc.createElement('div');
  eyebrow.style.cssText = "font-family:'Cinzel',serif;font-size:11px;letter-spacing:0.4em;color:var(--text-dim);margin-bottom:8px;";
  eyebrow.textContent = isBurn ? 'BURN' : 'DISCARD';

  const bigTitle = doc.createElement('div');
  bigTitle.style.cssText = "font-family:'Cinzel Decorative',serif;font-size:22px;font-weight:900;color:var(--white);margin-bottom:6px;";
  bigTitle.textContent = isBurn ? 'Choose a card to burn' : 'Choose a card to discard (+8 gold)';

  const subTitle = doc.createElement('div');
  subTitle.style.cssText = "font-family:'Crimson Pro',serif;font-style:italic;font-size:13px;color:var(--text-dim);";
  subTitle.textContent = isBurn
    ? 'The selected card is removed permanently.'
    : 'Discard the selected card and gain 8 gold.';

  titleEl.append(eyebrow, bigTitle, subTitle);

  const list = doc.createElement('div');
  list.id = 'discardCardList';
  list.style.cssText = 'display:flex;flex-wrap:wrap;gap:10px;justify-content:center;max-width:700px;';

  const cancelBtn = doc.createElement('button');
  cancelBtn.style.cssText = "font-family:'Cinzel',serif;font-size:11px;letter-spacing:0.2em;color:var(--text-dim);background:none;border:1px solid rgba(255,255,255,0.1);border-radius:6px;padding:10px 24px;cursor:pointer;margin-top:8px;";
  cancelBtn.textContent = '\uCDE8\uC18C';
  cancelBtn.onclick = () => {
    deps.onCancel?.();
    dismissTransientOverlay(overlay);
  };

  overlay.append(titleEl, list, cancelBtn);
  doc.body.appendChild(overlay);

  const discardList = doc.getElementById('discardCardList');
  if (!discardList) return;

  const uniqueCards = [...new Set(allCards)];
  const rarityColor = EVENT_DISCARD_CARD_RARITY_COLORS;

  uniqueCards.forEach((cardId) => {
    const card = data.cards[cardId];
    if (!card) return;
    const count = allCards.filter((id) => id === cardId).length;

    const btn = doc.createElement('div');
    btn.style.cssText = `cursor:pointer;background:rgba(10,5,30,0.9);border:1px solid ${rarityColor[card.rarity] || 'var(--border)'};border-radius:10px;padding:12px;width:120px;text-align:center;transition:all 0.2s;position:relative;`;

    const icon = doc.createElement('div');
    icon.style.cssText = 'font-size:22px;margin-bottom:6px;';
    icon.textContent = card.icon || '*';

    const name = doc.createElement('div');
    name.style.cssText = `font-family:'Cinzel',serif;font-size:10px;font-weight:700;color:${rarityColor[card.rarity] || 'var(--white)'};margin-bottom:3px;`;
    name.textContent = card.name;

    const desc = doc.createElement('div');
    desc.style.cssText = 'font-size:10px;color:var(--text-dim);line-height:1.3;';
    desc.textContent = card.desc || '';

    btn.append(icon, name, desc);

    if (count > 1) {
      const countBadge = doc.createElement('div');
      countBadge.style.cssText = 'position:absolute;top:4px;right:6px;font-size:9px;color:var(--echo);';
      countBadge.textContent = `x${count}`;
      btn.appendChild(countBadge);
    }

    btn.onmouseenter = () => {
      btn.style.borderColor = 'var(--cyan)';
      btn.style.boxShadow = '0 0 12px rgba(0,255,204,0.3)';
    };
    btn.onmouseleave = () => {
      btn.style.borderColor = rarityColor[card.rarity] || 'var(--border)';
      btn.style.boxShadow = '';
    };
    btn.onclick = () => {
      const result = discardEventCard({ gs, cardId, data, isBurn });
      if (result.success) {
        playUiItemGetFeedback(deps.playItemGet, getAudioEngine(deps));
        if (typeof deps.updateUI === 'function') deps.updateUI();
      }
      dismissTransientOverlay(overlay);
    };
    discardList.appendChild(btn);
  });
}
