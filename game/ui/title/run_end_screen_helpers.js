export function countUp({ from, to, durationMs, onStep, onDone, raf = globalThis.requestAnimationFrame } = {}) {
  const totalFrames = Math.max(8, Math.floor(durationMs / 16));
  let frame = 0;

  const tick = () => {
    frame += 1;
    const ratio = Math.min(1, frame / totalFrames);
    const eased = 1 - ((1 - ratio) ** 3);
    const value = Math.round(from + (to - from) * eased);
    onStep?.(value, ratio);
    if (ratio >= 1) {
      onDone?.();
      return;
    }
    raf?.(tick);
  };

  raf?.(tick);
}

export function globalProgress(snapshot) {
  if (!snapshot) return 0;
  const level = Number(snapshot.level) || 1;
  const local = Number(snapshot.progress) || 0;
  return Math.max(0, Math.min(1, (level - 1 + local) / 10));
}

export function buildRunEndOverlayMarkup() {
  return `
    <div class="class-run-end-panel">
      <div id="classRunEndEyebrow" class="class-run-end-eyebrow">런 완료</div>
      <div id="classRunEndTitle" class="class-run-end-title"></div>
      <div class="class-run-end-divider"></div>
      <div class="class-run-end-label">클래스 마스터리 XP</div>
      <div id="classRunEndRows"></div>
      <div class="class-run-end-total">
        <span>총 XP</span>
        <span id="classRunEndTotalVal">+0</span>
      </div>
      <div class="class-run-end-bar-wrap">
        <div class="class-run-end-bar-labels">
          <span id="classRunEndBarLeft"></span>
          <span id="classRunEndBarRight"></span>
        </div>
        <div class="class-run-end-bar-track">
          <div id="classRunEndBarFill" class="class-run-end-bar-fill"></div>
        </div>
      </div>
      <button id="classRunEndCloseBtn" class="class-run-end-close">계속하기</button>
    </div>
  `;
}

export function buildRunEndRowsMarkup(rewards = []) {
  return rewards.map((row, index) => `
    <div class="class-run-end-row">
      <span>${row.label || 'XP'}</span>
      <span id="classRunEndRowVal-${index}">+0</span>
    </div>
  `).join('');
}

export function getRunEndRowAnimationDuration(xp) {
  return Math.max(220, Math.min(700, (Number(xp) || 0) * 22));
}

export function normalizeRunEndSummary(summary, classInfo = {}) {
  const rewards = Array.isArray(summary?.rewards) ? summary.rewards : [];
  const totalGain = Number(summary?.totalGain) || rewards.reduce((sum, row) => sum + (Number(row?.xp) || 0), 0);
  const before = summary?.before || null;
  const after = summary?.after || null;
  const accent = classInfo.accent || '#8b6dff';
  const classTitle = classInfo.title || classInfo.name || 'CLASS';
  const fromPct = Math.round(globalProgress(before) * 100);
  const toPct = Math.round(globalProgress(after) * 100);

  return {
    accent,
    after,
    before,
    classTitle,
    fromPct,
    outcomeTitle: summary?.outcome === 'victory' ? '승리' : '패배',
    rewards,
    rowMarkup: buildRunEndRowsMarkup(rewards),
    summaryTitle: `${classTitle} - 전투 요약`,
    barLeft: after ? `Lv.${after.level} - ${after.totalXp} XP` : '',
    barRight: `${fromPct}%`,
    toPct,
    totalGain,
  };
}
