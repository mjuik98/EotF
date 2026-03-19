import { runOnNextFrame } from './map_ui_next_nodes_render.js';

export function getDoc(deps) {
  return deps?.doc || document;
}

export function resolveNodeMeta(deps = {}) {
  return deps.nodeMeta || {};
}

export function cleanupNextNodeOverlay(doc) {
  const overlay = doc?.getElementById?.('nodeCardOverlay');
  if (overlay?._ncKey) {
    doc.removeEventListener('keydown', overlay._ncKey);
    overlay._ncKey = null;
  }
}

export function resolveTooltipUI(deps = {}) {
  return deps.tooltipUI
    || deps.TooltipUI
    || null;
}

export function playSelectAnim(doc, card, rgb, onDone, deps = {}) {
  if (!doc?.body || !card?.getBoundingClientRect) {
    onDone?.();
    return;
  }

  let overlay = doc.getElementById('ncSelectOverlay');
  let flash = doc.getElementById('ncSelectFlash');

  if (!overlay) {
    overlay = doc.createElement('div');
    overlay.id = 'ncSelectOverlay';
    flash = doc.createElement('div');
    flash.id = 'ncSelectFlash';
    overlay.appendChild(flash);
    doc.body.appendChild(overlay);
  } else if (!flash) {
    flash = doc.createElement('div');
    flash.id = 'ncSelectFlash';
    overlay.appendChild(flash);
  }

  overlay.classList.add('active');
  const rect = card.getBoundingClientRect();
  const clone = card.cloneNode(true);
  clone.classList.add('nc-select-clone');
  clone.classList.add('is-cloned');
  clone.style.position = 'fixed';
  clone.style.margin = '0';
  clone.style.left = `${rect.left}px`;
  clone.style.top = `${rect.top}px`;
  clone.style.width = `${rect.width}px`;
  clone.style.height = `${rect.height}px`;
  clone.style.zIndex = '9999';
  clone.style.pointerEvents = 'none';
  clone.style.transition = 'all 0.45s cubic-bezier(0.23, 1, 0.32, 1)';

  overlay.appendChild(clone);
  const prevVisibility = card.style.visibility;
  card.style.visibility = 'hidden';

  runOnNextFrame(() => runOnNextFrame(() => {
    const targetWidth = Math.min(rect.width * 1.12, 340);
    const targetHeight = rect.height * 1.08;
    const win = deps.win || { innerWidth: 1280, innerHeight: 720 };

    clone.style.left = `${((win.innerWidth || 1280) - targetWidth) / 2}px`;
    clone.style.top = `${((win.innerHeight || 720) - targetHeight) / 2}px`;
    clone.style.width = `${targetWidth}px`;
    clone.style.height = `${targetHeight}px`;
  }, deps), deps);

  setTimeout(() => {
    if (flash) flash.style.background = `rgba(${rgb},.2)`;
    clone.style.opacity = '0';
    clone.style.transform = 'scale(1.12)';

    setTimeout(() => {
      if (flash) flash.style.background = 'transparent';
      overlay.classList.remove('active');
      clone.remove();
      card.style.visibility = prevVisibility;
      onDone?.();
    }, 300);
  }, 400);
}
