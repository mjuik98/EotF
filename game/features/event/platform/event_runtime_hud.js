export function updateEventGoldBarUi(doc, player) {
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
