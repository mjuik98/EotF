export const HitStop = (() => {
  let frames = 0;
  let enabled = true;
  return {
    trigger(f) {
      if (!enabled) return;
      frames = Math.max(frames, f);
    },
    active() { return enabled && frames > 0; },
    update() {
      if (!enabled) {
        frames = 0;
        return;
      }
      if (frames > 0) frames--;
    },
    setEnabled(value) {
      enabled = Boolean(value);
      if (!enabled) frames = 0;
    },
    isEnabled() {
      return enabled;
    },
  };
})();


// ────────────────────────────────────────
// FOV ENGINE (기억의 미궁)
// ────────────────────────────────────────
