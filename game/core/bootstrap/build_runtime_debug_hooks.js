function toFiniteNumber(value, fallback = 0) {
  const num = Number(value);
  return Number.isFinite(num) ? num : fallback;
}

function resolveSetTimeout(win) {
  if (typeof win?.setTimeout === 'function') return win.setTimeout.bind(win);
  return setTimeout;
}

function resolveAnimationFrame(win) {
  if (typeof win?.requestAnimationFrame === 'function') return win.requestAnimationFrame.bind(win);
  return null;
}

function waitForFrame(win, callback) {
  const raf = resolveAnimationFrame(win);
  if (raf) {
    raf(() => callback());
    return;
  }
  resolveSetTimeout(win)(callback, 16);
}

function waitForFrames(win, count, callback) {
  const frames = Math.max(1, toFiniteNumber(count, 1));
  const step = (remaining) => {
    if (remaining <= 0) {
      callback();
      return;
    }
    waitForFrame(win, () => step(remaining - 1));
  };
  step(frames);
}

function resolveCoreGameState(modules) {
  return modules?.featureScopes?.core?.GS || modules?.GS || {};
}

export function createAdvanceTimeHook({ modules, fns, win }) {
  return (ms = 16) => {
    const duration = Math.max(0, toFiniteNumber(ms, 16));
    const frameCount = Math.max(1, Math.round(duration / (1000 / 60)));
    const timeout = resolveSetTimeout(win);

    return new Promise((resolve) => {
      timeout(() => {
        waitForFrames(win, frameCount, () => {
          try {
            const gs = resolveCoreGameState(modules);
            fns?.updateUI?.();
            if (gs?.combat?.active) {
              fns?.renderCombatEnemies?.();
              fns?.renderCombatCards?.();
              fns?.updateCombatLog?.();
              fns?.updateEchoSkillBtn?.();
            }
            if (gs?.currentScreen === 'game') {
              fns?.renderMinimap?.();
            }
          } catch (error) {
            console.warn('[RuntimeDebugHooks] advanceTime refresh failed:', error);
          }
          resolve(duration);
        });
      }, duration);
    });
  };
}

export function buildRuntimeDebugHooks({ modules, fns, doc, win, createSnapshot }) {
  const renderGameToText = () => JSON.stringify(createSnapshot({ modules, doc, win }));
  const advanceTime = createAdvanceTimeHook({ modules, fns, win });

  return {
    advanceTime,
    render_game_to_text: renderGameToText,
  };
}
