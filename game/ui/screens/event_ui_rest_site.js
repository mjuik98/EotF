import { EventManager } from '../../systems/event_manager.js';
import { startRestFillParticles } from './event_ui_particles.js';

const REST_FILL_TOTAL_DURATION = 3200;
const REST_FILL_HEAL_START_DELAY = 600;
const REST_FILL_HEAL_DURATION = 1400;
const REST_FILL_ECHO_GAIN = 30;

function requestFrame(cb) {
  if (typeof globalThis.requestAnimationFrame === 'function') {
    return globalThis.requestAnimationFrame(cb);
  }
  return setTimeout(() => cb(Date.now()), 16);
}

export function buildRestRecoverySnapshot(gs, runRules) {
  const baseHeal = Math.floor(gs.player.maxHp * 0.25);
  const healAmount = runRules.getHealAmount(gs, baseHeal);
  const oldHp = gs.player.hp;
  const oldEcho = gs.player.echo || 0;

  gs.heal(healAmount);
  gs.addEcho(REST_FILL_ECHO_GAIN);

  return {
    oldHp,
    oldEcho,
    newHp: gs.player.hp,
    newEcho: gs.player.echo || 0,
    maxHp: gs.player.maxHp,
    echoMax: 100,
  };
}

export function buildRestRecoveryResultText(snapshot) {
  return `Recovered ${snapshot.newHp - snapshot.oldHp} HP and gained ${snapshot.newEcho - snapshot.oldEcho} Echo. Choose your next action.`;
}

export function createRestFillOverlay(doc, snapshot) {
  const overlay = doc.createElement('div');
  overlay.className = 'rest-fill-overlay';
  overlay.innerHTML = `
      <div class="rest-fill-bg"></div>
      <canvas id="restFillParticleCanvas" class="rest-fill-particle-canvas"></canvas>
      <div class="rest-fill-content">
        <div class="rest-fill-icon">*</div>
        <div class="rest-fill-title">Restoration</div>
        <div class="rest-fill-subtitle">Energy settles and the wound closes.</div>
        <div class="rest-fill-bars">
          <div class="rest-fill-stat">
            <span class="rest-fill-label">HP</span>
            <div class="rest-fill-bar-track">
              <div class="rest-fill-bar hp-fill" id="restHpFill" style="width: ${(snapshot.oldHp / snapshot.maxHp) * 100}%"></div>
            </div>
            <span class="rest-fill-value" id="restHpValue">${snapshot.oldHp}/${snapshot.maxHp}</span>
          </div>
          <div class="rest-fill-stat">
            <span class="rest-fill-label">Echo</span>
            <div class="rest-fill-bar-track">
              <div class="rest-fill-bar echo-fill" id="restEchoFill" style="width: ${Math.min(snapshot.oldEcho, snapshot.echoMax)}%"></div>
            </div>
            <span class="rest-fill-value" id="restEchoValue">${snapshot.oldEcho}/${snapshot.echoMax}</span>
          </div>
        </div>
      </div>
    `;
  doc.body.appendChild(overlay);
  return overlay;
}

export function computeRestFillBoost(elapsed) {
  if (elapsed < REST_FILL_HEAL_START_DELAY) {
    const p = elapsed / REST_FILL_HEAL_START_DELAY;
    return 0.1 + p * 0.06;
  }

  if (elapsed < REST_FILL_HEAL_START_DELAY + REST_FILL_HEAL_DURATION) {
    const p = (elapsed - REST_FILL_HEAL_START_DELAY) / REST_FILL_HEAL_DURATION;
    const eased = 1 - Math.pow(1 - p, 2);
    return 0.16 + eased * 0.84;
  }

  const p = Math.min(
    1,
    (elapsed - (REST_FILL_HEAL_START_DELAY + REST_FILL_HEAL_DURATION)) / (REST_FILL_TOTAL_DURATION - (REST_FILL_HEAL_START_DELAY + REST_FILL_HEAL_DURATION)),
  );
  const eased = Math.pow(p, 0.5);
  return 1.0 - eased * 0.92;
}

export function applyRestFillSequenceFrame(doc, snapshot, elapsed, audioEngine, state) {
  if (elapsed < REST_FILL_HEAL_START_DELAY || elapsed > REST_FILL_HEAL_START_DELAY + REST_FILL_HEAL_DURATION) {
    return;
  }

  const p = (elapsed - REST_FILL_HEAL_START_DELAY) / REST_FILL_HEAL_DURATION;
  const eased = 1 - Math.pow(1 - p, 3);
  const hpBar = doc.getElementById('restHpFill');
  const echoBar = doc.getElementById('restEchoFill');
  const hpVal = doc.getElementById('restHpValue');
  const echoVal = doc.getElementById('restEchoValue');
  const currentHp = Math.round(snapshot.oldHp + (snapshot.newHp - snapshot.oldHp) * eased);
  const currentEcho = Math.round(snapshot.oldEcho + (snapshot.newEcho - snapshot.oldEcho) * eased);

  if (hpBar) hpBar.style.width = `${(currentHp / snapshot.maxHp) * 100}%`;
  if (echoBar) echoBar.style.width = `${Math.min(currentEcho, snapshot.echoMax)}%`;
  if (hpVal) hpVal.textContent = `${currentHp}/${snapshot.maxHp}`;
  if (echoVal) echoVal.textContent = `${currentEcho}/${snapshot.echoMax}`;

  if (!state.playedSound) {
    audioEngine?.playHeal?.();
    state.playedSound = true;
  }
}

export function showEventRestSiteOverlay(gs, data, runRules, deps = {}) {
  if (!gs || !data || !runRules) return;

  const doc = deps.doc || document;
  const audioEngine = deps.audioEngine || globalThis.AudioEngine;
  const snapshot = buildRestRecoverySnapshot(gs, runRules);
  const overlay = createRestFillOverlay(doc, snapshot);
  const restParticleFx = startRestFillParticles(overlay, doc);
  const state = { playedSound: false };
  const startTime = globalThis.performance?.now?.() || Date.now();

  requestFrame(() => {
    overlay.classList.add('active');
  });

  const updateSequence = (now) => {
    const elapsed = now - startTime;
    const progress = Math.min(elapsed / REST_FILL_TOTAL_DURATION, 1);
    restParticleFx.setBoost(computeRestFillBoost(elapsed));
    applyRestFillSequenceFrame(doc, snapshot, elapsed, audioEngine, state);

    if (progress < 1) {
      requestFrame(updateSequence);
      return;
    }

    overlay.classList.remove('active');
    overlay.classList.add('fade-out');

    setTimeout(() => {
      restParticleFx.stop();
      overlay.remove();

      const rest = EventManager.createRestEvent(gs, data, runRules, {
        showCardDiscardFn: (restState, isBurn) => deps.showCardDiscard?.(restState, isBurn),
      });
      if (!rest) return;

      rest.desc = buildRestRecoveryResultText(snapshot);
      deps.showEvent?.(rest);
      deps.updateUI?.();
    }, 500);
  };

  requestFrame(updateSequence);
}
