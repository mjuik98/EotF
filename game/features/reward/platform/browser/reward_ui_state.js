export function setRewardPickedState(doc, picked) {
  const rewardCards = doc.getElementById('rewardCards');
  if (!rewardCards) return;
  if (picked) rewardCards.classList.add('picked');
  else rewardCards.classList.remove('picked');
}

export function setSkipConfirmVisible(doc, visible) {
  const initBtn = doc.getElementById('rewardSkipInitBtn');
  const confirmRow = doc.getElementById('skipConfirmRow');
  if (initBtn) initBtn.style.display = visible ? 'none' : '';
  if (confirmRow) confirmRow.style.display = visible ? 'flex' : 'none';
}
