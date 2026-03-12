import { getDoc as _getDoc } from '../../../../shared/runtime/hud_runtime_deps.js';

export const DomValueUI = {
  setBar(id, pct, deps = {}) {
    const doc = _getDoc(deps);
    if (!doc) return;
    const el = doc.getElementById(id);
    if (!el) return;
    const clamped = Math.max(0, Math.min(100, Number(pct) || 0));
    el.style.width = `${clamped}%`;
  },

  setText(id, value, deps = {}) {
    const doc = _getDoc(deps);
    if (!doc) return;
    const el = doc.getElementById(id);
    if (!el) return;
    el.textContent = value;
  },
};
