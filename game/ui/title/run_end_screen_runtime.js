import {
  buildRunEndOverlayMarkup,
  countUp,
  getRunEndRowAnimationDuration,
  normalizeRunEndSummary,
} from './run_end_screen_helpers.js';

export function initRunEndScreenRuntime(instance) {
  const overlay = instance._doc.createElement('div');
  overlay.id = 'classRunEndOverlay';
  overlay.style.display = 'none';
  overlay.innerHTML = buildRunEndOverlayMarkup();
  instance._doc.body.appendChild(overlay);

  instance._els = {
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

  bindRunEndScreenRuntime(instance);
}

export function bindRunEndScreenRuntime(instance) {
  instance._els.closeBtn?.addEventListener('click', () => instance.close());
  instance._els.overlay?.addEventListener('click', (event) => {
    if (event.target === instance._els.overlay) instance.close();
  });

  instance._onKeyDown = (event) => {
    if (instance._els.overlay?.style.display === 'flex' && event.key === 'Escape') {
      instance.close();
    }
  };
  instance._doc.addEventListener('keydown', instance._onKeyDown);
}

export function animateRunEndRowsRuntime(instance, rewards, totalGain, fromPct, toPct, accent) {
  let rowIndex = 0;

  const animateNextRow = () => {
    if (rowIndex >= rewards.length) {
      countUp({
        from: 0,
        to: totalGain,
        durationMs: 650,
        raf: instance._raf,
        onStep: (value, ratio) => {
          instance._els.total.textContent = `+${value}`;
          const pct = Math.round(fromPct + (toPct - fromPct) * ratio);
          instance._els.barRight.textContent = `${pct}%`;
        },
        onDone: () => {
          instance._els.total.style.color = accent;
          instance._els.barFill.style.transition = 'width 0.9s cubic-bezier(.4,0,.2,1)';
          instance._els.barFill.style.width = `${toPct}%`;
          instance._els.barRight.textContent = `${toPct}%`;
        },
      });
      return;
    }

    const xp = Number(rewards[rowIndex]?.xp) || 0;
    const valueEl = instance._doc.getElementById(`classRunEndRowVal-${rowIndex}`);
    if (!valueEl) {
      rowIndex += 1;
      animateNextRow();
      return;
    }

    countUp({
      from: 0,
      to: xp,
      durationMs: getRunEndRowAnimationDuration(xp),
      raf: instance._raf,
      onStep: (value) => {
        valueEl.textContent = `+${value}`;
      },
      onDone: () => {
        valueEl.style.color = `${accent}cc`;
        rowIndex += 1;
        instance._setTimeout(animateNextRow, 110);
      },
    });
  };

  instance._setTimeout(animateNextRow, 250);
}

export function showRunEndScreenRuntime(instance, summary, classInfo = {}) {
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

  instance._els.title.textContent = outcomeTitle;
  instance._els.title.style.color = accent;
  instance._els.title.style.textShadow = `0 0 28px ${accent}66`;
  instance._els.eyebrow.textContent = summaryTitle;
  instance._els.rows.innerHTML = rowMarkup;
  instance._els.total.textContent = '+0';
  instance._els.total.style.color = accent;
  instance._els.barLeft.textContent = barLeft;
  instance._els.barRight.textContent = barRight;
  instance._els.barFill.style.background = accent;
  instance._els.barFill.style.boxShadow = `0 0 10px ${accent}77`;
  instance._els.barFill.style.width = `${fromPct}%`;
  instance._els.overlay.style.display = 'flex';

  animateRunEndRowsRuntime(instance, rewards, totalGain, fromPct, toPct, accent);
}

export function closeRunEndScreenRuntime(instance) {
  instance._els.overlay.style.display = 'none';
  instance.onClose?.();
}

export function destroyRunEndScreenRuntime(instance) {
  closeRunEndScreenRuntime(instance);
  if (instance._onKeyDown) {
    instance._doc.removeEventListener('keydown', instance._onKeyDown);
  }
  instance._els.overlay?.remove();
}
