const getDoc = (deps) => deps?.doc || document;

export const PlayerUiEffectMethods = {
  showLowHpWarning(deps = {}) {
    const doc = getDoc(deps);
    let el = doc.querySelector('.pulse-overlay');
    if (!el) {
      el = doc.createElement('div');
      el.className = 'pulse-overlay';
      doc.body.appendChild(el);
    }
    clearTimeout(this._pulseTimer);
    this._pulseTimer = setTimeout(() => el.remove(), 5000);
  },
};
