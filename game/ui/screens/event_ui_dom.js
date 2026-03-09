import { isChoiceDisabled } from './event_ui_helpers.js';

export function updateEventGoldBar(doc, player) {
  if (!player) return;
  const gEl = doc.getElementById('eventGoldDisplay');
  const hEl = doc.getElementById('eventHpDisplay');
  const dEl = doc.getElementById('eventDeckDisplay');
  if (gEl) gEl.textContent = player.gold ?? 0;
  if (hEl) hEl.textContent = `${Math.max(0, player.hp ?? 0)}/${player.maxHp ?? 0}`;
  if (dEl) {
    const totalCards = (player.deck?.length || 0) + (player.hand?.length || 0) + (player.graveyard?.length || 0);
    dEl.textContent = totalCards;
  }
}

export function renderChoices(event, doc, gs, onResolve) {
  const choicesEl = doc.getElementById('eventChoices');
  if (!choicesEl) return;

  choicesEl.textContent = '';
  event.choices.forEach((choice, idx) => {
    const btn = doc.createElement('div');
    btn.className = 'event-choice';
    if (event?.id === 'shop') btn.classList.add('event-choice-shop');
    if (choice?.cssClass) {
      String(choice.cssClass)
        .split(/\s+/)
        .filter(Boolean)
        .forEach((className) => btn.classList.add(className));
    }
    btn.textContent = choice.text;
    const disabled = isChoiceDisabled(choice, gs);
    if (disabled) {
      btn.classList.add('disabled');
      btn.setAttribute('aria-disabled', 'true');
      btn.setAttribute('tabindex', '-1');
      if (choice?.disabledReason) btn.title = choice.disabledReason;
    } else {
      btn.addEventListener('click', () => onResolve(idx));
    }
    choicesEl.appendChild(btn);
  });
}
