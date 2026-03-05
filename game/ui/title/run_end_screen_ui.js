function countUp({ from, to, durationMs, onStep, onDone }) {
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
    requestAnimationFrame(tick);
  };

  requestAnimationFrame(tick);
}

function globalProgress(snapshot) {
  if (!snapshot) return 0;
  const level = Number(snapshot.level) || 1;
  const local = Number(snapshot.progress) || 0;
  return Math.max(0, Math.min(1, (level - 1 + local) / 10));
}

export class RunEndScreenUI {
  constructor() {
    this.onClose = null;
    this._buildDom();
    this._bindEvents();
  }

  _buildDom() {
    const overlay = document.createElement('div');
    overlay.id = 'classRunEndOverlay';
    overlay.style.display = 'none';
    overlay.innerHTML = `
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
    document.body.appendChild(overlay);

    this._els = {
      overlay,
      eyebrow: overlay.querySelector('#classRunEndEyebrow'),
      title: overlay.querySelector('#classRunEndTitle'),
      rows: overlay.querySelector('#classRunEndRows'),
      total: overlay.querySelector('#classRunEndTotalVal'),
      barLeft: overlay.querySelector('#classRunEndBarLeft'),
      barRight: overlay.querySelector('#classRunEndBarRight'),
      barFill: overlay.querySelector('#classRunEndBarFill'),
      closeBtn: overlay.querySelector('#classRunEndCloseBtn'),
    };
  }

  _bindEvents() {
    this._els.closeBtn?.addEventListener('click', () => this.close());
    this._els.overlay?.addEventListener('click', (event) => {
      if (event.target === this._els.overlay) this.close();
    });
  }

  show(summary, classInfo = {}) {
    const accent = classInfo.accent || '#8b6dff';
    const classTitle = classInfo.title || classInfo.name || 'CLASS';
    const rewards = Array.isArray(summary?.rewards) ? summary.rewards : [];
    const totalGain = Number(summary?.totalGain) || rewards.reduce((sum, row) => sum + (Number(row?.xp) || 0), 0);
    const before = summary?.before || null;
    const after = summary?.after || null;

    this._els.title.textContent = summary?.outcome === 'victory' ? '승리' : '패배';
    this._els.title.style.color = accent;
    this._els.title.style.textShadow = `0 0 28px ${accent}66`;
    this._els.eyebrow.textContent = `${classTitle} - 런 요약`;

    this._els.rows.innerHTML = rewards.map((row, idx) => `
      <div class="class-run-end-row">
        <span>${row.label || 'XP'}</span>
        <span id="classRunEndRowVal-${idx}">+0</span>
      </div>
    `).join('');

    this._els.total.textContent = '+0';
    this._els.total.style.color = accent;

    const fromPct = Math.round(globalProgress(before) * 100);
    const toPct = Math.round(globalProgress(after) * 100);
    this._els.barLeft.textContent = after ? `Lv.${after.level} - ${after.totalXp} XP` : '';
    this._els.barRight.textContent = `${fromPct}%`;
    this._els.barFill.style.background = accent;
    this._els.barFill.style.boxShadow = `0 0 10px ${accent}77`;
    this._els.barFill.style.width = `${fromPct}%`;

    this._els.overlay.style.display = 'flex';

    this._animateRows(rewards, totalGain, fromPct, toPct, accent);
  }

  _animateRows(rewards, totalGain, fromPct, toPct, accent) {
    let rowIndex = 0;

    const animateNextRow = () => {
      if (rowIndex >= rewards.length) {
        countUp({
          from: 0,
          to: totalGain,
          durationMs: 650,
          onStep: (value, ratio) => {
            this._els.total.textContent = `+${value}`;
            const pct = Math.round(fromPct + (toPct - fromPct) * ratio);
            this._els.barRight.textContent = `${pct}%`;
          },
          onDone: () => {
            this._els.total.style.color = accent;
            this._els.barFill.style.transition = 'width 0.9s cubic-bezier(.4,0,.2,1)';
            this._els.barFill.style.width = `${toPct}%`;
            this._els.barRight.textContent = `${toPct}%`;
          },
        });
        return;
      }

      const xp = Number(rewards[rowIndex]?.xp) || 0;
      const valueEl = document.getElementById(`classRunEndRowVal-${rowIndex}`);
      if (!valueEl) {
        rowIndex += 1;
        animateNextRow();
        return;
      }

      countUp({
        from: 0,
        to: xp,
        durationMs: Math.max(220, Math.min(700, xp * 22)),
        onStep: (value) => { valueEl.textContent = `+${value}`; },
        onDone: () => {
          valueEl.style.color = `${accent}cc`;
          rowIndex += 1;
          setTimeout(animateNextRow, 110);
        },
      });
    };

    setTimeout(animateNextRow, 250);
  }

  close() {
    this._els.overlay.style.display = 'none';
    this.onClose?.();
  }

  destroy() {
    this.close();
    this._els.overlay?.remove();
  }
}
