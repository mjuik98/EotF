let _deckFilterType = 'all';

function getDoc(deps) {
  return deps?.doc || document;
}

export function resetDeckModalFilter() {
  _deckFilterType = 'all';
}

export function getDeckModalFilter() {
  return _deckFilterType;
}

export function setDeckModalFilter(type = 'all') {
  _deckFilterType = type;
}

export function openDeckModal(deps = {}) {
  const modal = getDoc(deps).getElementById('deckViewModal');
  if (modal) modal.classList.add('active');
}

export function closeDeckModal(deps = {}) {
  const modal = getDoc(deps).getElementById('deckViewModal');
  if (modal) modal.classList.remove('active');
}
