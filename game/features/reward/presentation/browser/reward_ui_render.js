export {
  renderBlessingOption,
  renderItemOption,
  renderRewardCardOption,
} from './reward_ui_option_renderers.js';

export function renderRewardHeader(doc, rewardMode, isElite) {
  const eyebrow = doc.getElementById('rewardEyebrow');
  const titleEl = doc.getElementById('rewardTitle');

  if (eyebrow) {
    if (rewardMode === 'boss') eyebrow.textContent = 'BOSS REWARD';
    else if (rewardMode === 'mini_boss') eyebrow.textContent = 'MINI-BOSS REWARD';
    else if (isElite) eyebrow.textContent = 'ELITE REWARD';
    else eyebrow.textContent = 'COMBAT REWARD';
  }

  if (!titleEl) return;

  if (rewardMode === 'boss') {
    titleEl.textContent = 'Boss Defeated';
    titleEl.style.display = 'block';
    titleEl.style.color = 'var(--gold)';
    return;
  }
  if (rewardMode === 'mini_boss') {
    titleEl.textContent = 'Mini-Boss Defeated';
    titleEl.style.display = 'block';
    titleEl.style.color = '#ff7a33';
    return;
  }
  if (isElite) {
    titleEl.textContent = 'Elite Defeated';
    titleEl.style.display = 'block';
    titleEl.style.color = '#d4a017';
    return;
  }

  titleEl.style.display = 'none';
}

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
