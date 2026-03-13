export function setSettingsModalActive(modal, active) {
  if (!modal?.classList) return false;
  if (active) modal.classList.add('active');
  else modal.classList.remove('active');
  return true;
}

export function beginSettingsRebindUi(ui, action, doc, win) {
  ui._listeningAction = action;
  ui._rebindWindow = win;

  const btn = doc?.querySelector?.(`[data-keybind="${action}"]`);
  if (btn) {
    btn.textContent = '입력...';
    btn.classList.add('listening');
  }

  return btn || null;
}

export function cleanupSettingsRebindUi(ui, action, doc) {
  const btn = doc?.querySelector?.(`[data-keybind="${action}"]`);
  btn?.classList.remove('listening');

  if (ui._keydownHandler) {
    ui._rebindWindow?.removeEventListener?.('keydown', ui._keydownHandler);
    ui._keydownHandler = null;
  }

  ui._listeningAction = null;
  ui._rebindWindow = null;
  ui._checkConflicts(doc);
  return btn || null;
}
