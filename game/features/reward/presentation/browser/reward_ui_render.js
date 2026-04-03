export function renderRewardHeader(doc, rewardMode, isElite) {
  const eyebrow = doc.getElementById('rewardEyebrow');
  const titleEl = doc.getElementById('rewardTitle');

  if (eyebrow) {
    if (rewardMode === 'boss') eyebrow.textContent = '보스 보상';
    else if (rewardMode === 'mini_boss') eyebrow.textContent = '중간 보스 보상';
    else if (isElite) eyebrow.textContent = '정예 보상';
    else eyebrow.textContent = '전투 보상';
  }

  if (!titleEl) return;

  if (rewardMode === 'boss') {
    titleEl.textContent = '보스 처치';
    titleEl.style.display = 'block';
    titleEl.style.color = 'var(--gold)';
    return;
  }
  if (rewardMode === 'mini_boss') {
    titleEl.textContent = '중간 보스 처치';
    titleEl.style.display = 'block';
    titleEl.style.color = '#ff7a33';
    return;
  }
  if (isElite) {
    titleEl.textContent = '정예 처치';
    titleEl.style.display = 'block';
    titleEl.style.color = '#d4a017';
    return;
  }

  titleEl.style.display = 'none';
}
