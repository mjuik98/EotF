'use strict';

(function initDomValueUI(globalObj) {
  function _getDoc(deps) {
    return deps?.doc || document;
  }

  const DomValueUI = {
    setBar(id, pct, deps = {}) {
      const doc = _getDoc(deps);
      const el = doc.getElementById(id);
      if (!el) return;
      const clamped = Math.max(0, Math.min(100, Number(pct) || 0));
      el.style.width = `${clamped}%`;
    },

    setText(id, value, deps = {}) {
      const doc = _getDoc(deps);
      const el = doc.getElementById(id);
      if (!el) return;
      el.textContent = value;
    },
  };

  globalObj.DomValueUI = DomValueUI;
})(window);
