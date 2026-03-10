let _combatInfoOpen = false;

function getDoc(deps) {
  return deps?.doc || document;
}

export function applyClosedCombatInfoState(doc) {
  const panel = doc.getElementById('combatInfoPanel');
  const tab = doc.getElementById('combatInfoTab');
  if (panel) panel.style.left = '-260px';
  if (tab) {
    tab.style.left = '0';
    tab.textContent = '📋 정보';
  }
}

export function resetCombatInfoState(deps = {}) {
  _combatInfoOpen = false;
  applyClosedCombatInfoState(getDoc(deps));
}

export function toggleCombatInfoState(deps = {}, options = {}) {
  const doc = getDoc(deps);
  const panel = doc.getElementById('combatInfoPanel');
  const tab = doc.getElementById('combatInfoTab');
  if (!panel) return false;

  _combatInfoOpen = !_combatInfoOpen;
  if (_combatInfoOpen) {
    panel.style.left = '0px';
    if (tab) {
      tab.style.left = '256px';
      tab.textContent = '✕ 닫기';
    }
    options.onOpen?.();
    return true;
  }

  applyClosedCombatInfoState(doc);
  return false;
}

export function isCombatInfoOpen() {
  return _combatInfoOpen;
}
