export const ScreenShake = (() => {
  let intensity = 0, decay = 0, ox = 0, oy = 0;
  let enabled = true;

  function shake(amt, dec = 0.3) {
    if (!enabled) return;
    intensity = Math.max(intensity, amt);
    decay = dec;
  }

  function setEnabled(value) {
    enabled = Boolean(value);
    if (!enabled) {
      intensity = 0;
      ox = 0;
      oy = 0;
    }
  }

  function isEnabled() {
    return enabled;
  }

  function update() {
    if (!enabled) {
      intensity = 0;
      ox = 0;
      oy = 0;
      return;
    }
    if (intensity < 0.1) { intensity = 0; ox = oy = 0; return; }
    ox = (Math.random() - 0.5) * intensity;
    oy = (Math.random() - 0.5) * intensity;
    intensity *= (1 - decay * 0.1);
  }
  function apply(ctx) {
    if (!enabled) return;
    ctx.translate(ox, oy);
  }
  return { shake, update, apply, setEnabled, isEnabled };
})();
