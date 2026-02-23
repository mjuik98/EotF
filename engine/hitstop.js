const HitStop = (() => {
  let frames = 0;
  return {
    trigger(f) { frames = Math.max(frames, f); },
    active() { return frames > 0; },
    update() { if (frames > 0) frames--; }
  };
})();

// ────────────────────────────────────────
// FOV ENGINE (기억의 미궁)
// ────────────────────────────────────────
