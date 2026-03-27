export const PlayerUiEffectMethods = {
  showLowHpWarning(deps = {}) {
    const doc = deps?.doc || null;
    if (!doc?.body) return;
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
