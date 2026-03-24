export function createCodexEntryShell(doc, entry, typeClass, rarityClass, seen) {
  const card = doc.createElement('article');
  card.className = [
    'cx-card',
    typeClass,
    rarityClass,
    !seen ? 'is-unknown' : '',
    entry?.isNew && seen ? 'new-card' : '',
  ].filter(Boolean).join(' ');

  if (!seen) {
    card.innerHTML = `
      <div class="cx-unknown-qmarks">
        <span class="cx-qmark" style="top:20%;left:10%;animation-delay:0s">?</span>
        <span class="cx-qmark" style="top:40%;left:80%;animation-delay:1s">?</span>
        <span class="cx-qmark" style="top:65%;left:40%;animation-delay:2s">?</span>
      </div>`;
  }

  return card;
}

export function setCodexEntryAnimationDelay(card, index) {
  if (!card?.style) return;
  card.style.animationDelay = `${(index % 12) * 0.03}s`;
}
