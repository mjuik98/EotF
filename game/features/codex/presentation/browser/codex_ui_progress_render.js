function catBar(label, seen, total, fillClass, tab) {
  const width = total > 0 ? Math.round((seen / total) * 100) : 0;
  return `
    <div class="cx-cat-item" data-tab="${tab}">
      <div class="cx-cat-header">
        <span class="cx-cat-label">${label}</span>
        <span class="cx-cat-nums"><span class="cx-cat-seen">${seen}</span>/${total}</span>
      </div>
      <div class="cx-cat-track">
        <div class="cx-cat-fill ${fillClass}" style="width:${width}%"></div>
      </div>
    </div>`;
}

function renderRewardRoadmap(entries = []) {
  if (!Array.isArray(entries) || entries.length === 0) return '';
  return `
    <div class="cx-progress-block">
      <div class="cx-ring-cap" style="margin-bottom:6px">다음 조사 목표</div>
      <div style="display:grid;gap:8px;">
        ${entries.map((entry) => `
          <div class="cx-cat-item" style="padding:8px 10px;">
            <div class="cx-cat-header">
              <span class="cx-cat-label">${entry.contentLabel}</span>
              <span class="cx-cat-nums">${entry.progressLabel}</span>
            </div>
            <div class="cx-ring-cap" style="margin-top:4px;text-align:left">${entry.achievementTitle}${entry.focusLabel ? ` · ${entry.focusLabel}` : ''}</div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

function renderRecentDiscoveries(entries = []) {
  if (!Array.isArray(entries) || entries.length === 0) return '';
  return `
    <div class="cx-progress-block">
      <div class="cx-ring-cap" style="margin-bottom:6px">최근 발견</div>
      <div style="display:grid;gap:6px;">
        ${entries.map((entry) => `
          <div class="cx-cat-header">
            <span class="cx-cat-label">${entry.categoryLabel} · ${entry.label}</span>
            <span class="cx-cat-nums">${entry.firstSeen}</span>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

export function renderCodexProgress(doc, progress, handlers = {}) {
  const section = doc.getElementById('cxProgressSection');
  if (!section) return;

  [
    ['enemies', progress.enemies.seen, progress.enemies.total],
    ['cards', progress.cards.seen, progress.cards.total],
    ['items', progress.items.seen, progress.items.total],
    ['inscriptions', progress.inscriptions.seen, progress.inscriptions.total],
  ].forEach(([tab, seen, total]) => {
    const badge = doc.getElementById(`cxBadge_${tab}`);
    if (badge) badge.textContent = `${seen}/${total}`;
  });

  section.innerHTML = `
    <div class="cx-ring-wrap">
      <svg class="cx-ring-svg" width="72" height="72" viewBox="0 0 72 72">
        <defs>
          <linearGradient id="cxRingGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stop-color="#007755"/>
            <stop offset="100%" stop-color="#00ffcc"/>
          </linearGradient>
        </defs>
        <circle class="cx-ring-bg" cx="36" cy="36" r="29"/>
        <circle class="cx-ring-fill" cx="36" cy="36" r="29"
          stroke="url(#cxRingGrad)"
          stroke-dasharray="${progress.circumference.toFixed(1)}"
          stroke-dashoffset="${progress.offset.toFixed(1)}"/>
      </svg>
      <div class="cx-ring-label">
        <div class="cx-ring-pct">${progress.percent}%</div>
        <div class="cx-ring-cap">TOTAL</div>
      </div>
    </div>
    <div class="cx-cat-bars">
      ${catBar('👾 적', progress.enemies.seen, progress.enemies.total, 'fill-enemy', 'enemies')}
      ${catBar('🃏 카드', progress.cards.seen, progress.cards.total, 'fill-cards', 'cards')}
      ${catBar('💎 유물', progress.items.seen, progress.items.total, 'fill-items', 'items')}
      ${catBar('✨ 각인', progress.inscriptions.seen, progress.inscriptions.total, 'fill-inscr', 'inscriptions')}
    </div>
    ${renderRewardRoadmap(progress.rewardRoadmap)}
    ${renderRecentDiscoveries(progress.recentDiscoveries)}
  `;

  section.querySelectorAll('.cx-cat-item').forEach((element) => {
    element.addEventListener('click', () => handlers.onSelectTab?.(element.dataset.tab));
  });

  const defaultView = doc?.defaultView || null;
  const raf = handlers.requestAnimationFrame
    || (typeof defaultView?.requestAnimationFrame === 'function'
      ? defaultView.requestAnimationFrame.bind(defaultView)
      : ((cb) => setTimeout(cb, 16)));
  raf(() => {
    const fill = section.querySelector('.cx-ring-fill');
    if (fill) fill.style.strokeDashoffset = progress.offset;
  });
}
