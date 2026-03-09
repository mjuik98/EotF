import {
  buildRunEndOverlayMarkup,
  countUp,
  getRunEndRowAnimationDuration,
  normalizeRunEndSummary,
} from './run_end_screen_helpers.js';

export class RunEndScreenUI {
  constructor(deps = {}) {
    this.onClose = null;
    this._doc = deps.doc || document;
    this._raf = deps.raf || globalThis.requestAnimationFrame;
    this._setTimeout = deps.setTimeout || globalThis.setTimeout;
    this._buildDom();
    this._bindEvents();
  }

  _buildDom() {
    const overlay = this._doc.createElement('div');
    overlay.id = 'classRunEndOverlay';
    overlay.style.display = 'none';
    overlay.innerHTML = buildRunEndOverlayMarkup();
    this._doc.body.appendChild(overlay);

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

    this._onKeyDown = (event) => {
      if (this._els.overlay?.style.display === 'flex' && event.key === 'Escape') {
        this.close();
      }
    };
    this._doc.addEventListener('keydown', this._onKeyDown);
  }

  show(summary, classInfo = {}) {
    const normalized = normalizeRunEndSummary(summary, classInfo);
    const {
      accent,
      barLeft,
      barRight,
      fromPct,
      outcomeTitle,
      rewards,
      rowMarkup,
      summaryTitle,
      toPct,
      totalGain,
    } = normalized;

    this._els.title.textContent = outcomeTitle;
    this._els.title.style.color = accent;
    this._els.title.style.textShadow = `0 0 28px ${accent}66`;
    this._els.eyebrow.textContent = summaryTitle;
    this._els.rows.innerHTML = rowMarkup;
    this._els.total.textContent = '+0';
    this._els.total.style.color = accent;
    this._els.barLeft.textContent = barLeft;
    this._els.barRight.textContent = barRight;
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
          raf: this._raf,
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
      const valueEl = this._doc.getElementById(`classRunEndRowVal-${rowIndex}`);
      if (!valueEl) {
        rowIndex += 1;
        animateNextRow();
        return;
      }

      countUp({
        from: 0,
        to: xp,
        durationMs: getRunEndRowAnimationDuration(xp),
        raf: this._raf,
        onStep: (value) => {
          valueEl.textContent = `+${value}`;
        },
        onDone: () => {
          valueEl.style.color = `${accent}cc`;
          rowIndex += 1;
          this._setTimeout(animateNextRow, 110);
        },
      });
    };

    this._setTimeout(animateNextRow, 250);
  }

  close() {
    this._els.overlay.style.display = 'none';
    this.onClose?.();
  }

  destroy() {
    this.close();
    if (this._onKeyDown) {
      this._doc.removeEventListener('keydown', this._onKeyDown);
    }
    this._els.overlay?.remove();
  }
}
