export function clampVolumePercent(value) {
  const parsed = Number.parseInt(value, 10);
  if (Number.isNaN(parsed)) return 0;
  return Math.max(0, Math.min(100, parsed));
}

export function setVolume({
  applyFn,
  doc,
  saveVolumes,
  selectors,
  value,
}) {
  const normalizedValue = clampVolumePercent(value);
  const [valueSelectors, sliderSelectors] = selectors;

  applyFn?.(normalizedValue / 100);
  doc?.querySelectorAll?.(valueSelectors)?.forEach((el) => {
    if (el) el.textContent = `${normalizedValue}%`;
  });
  doc?.querySelectorAll?.(sliderSelectors)?.forEach((el) => {
    if (!el) return;
    el.value = normalizedValue;
    el.style.setProperty('--fill-percent', `${normalizedValue}%`);
  });
  saveVolumes?.();
}

export function playPreRunRipple({ doc, startPreRunRipple, win }, onComplete) {
  const finish = () => {
    if (typeof onComplete === 'function') onComplete();
  };

  if (!doc?.body) {
    finish();
    return;
  }

  const overlay = doc.createElement('div');
  overlay.id = 'titleRunPreludeOverlay';
  overlay.style.cssText = [
    'position:fixed',
    'inset:0',
    'background:radial-gradient(circle at center, rgba(94, 50, 170, 0.24) 0%, rgba(3, 3, 10, 0.95) 62%, rgba(0, 0, 0, 1) 100%)',
    'z-index:2100',
    'pointer-events:none',
    'opacity:1',
  ].join(';');
  doc.body.appendChild(overlay);

  let completed = false;
  const done = () => {
    if (completed) return;
    completed = true;
    finish();
  };

  try {
    startPreRunRipple(overlay, {
      doc,
      win,
      onComplete: done,
    });
  } catch (error) {
    console.error('[TitleActions] pre-run ripple failed:', error);
    overlay.remove();
    done();
  }
}
