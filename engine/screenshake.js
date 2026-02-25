import { ScreenShake } from './screenshake.js';

﻿const ScreenShake = (() => {
  let intensity = 0, decay = 0, ox = 0, oy = 0;
  function shake(amt, dec = 0.3) { intensity = Math.max(intensity, amt); decay = dec; }
  function update() {
    if (intensity < 0.1) { intensity = 0; ox = oy = 0; return; }
    ox = (Math.random() - 0.5) * intensity;
    oy = (Math.random() - 0.5) * intensity;
    intensity *= (1 - decay * 0.1);
  }
  function apply(ctx) { ctx.translate(ox, oy); }
  return { shake, update, apply };
