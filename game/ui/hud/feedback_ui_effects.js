function getDoc(deps) {
  return deps?.doc || document;
}

function getWin(deps) {
  return deps?.win || window;
}

function getHudOverlay(doc) {
  return doc.getElementById('hudOverlay');
}

export function showDmgPopupEffect(dmg, x, y, color = '#ff3366', deps = {}) {
  const doc = getDoc(deps);
  const overlay = getHudOverlay(doc);
  if (!overlay) return false;
  const el = doc.createElement('div');
  el.className = 'dmg-popup';
  el.textContent = dmg >= 0 ? `-${dmg}` : `+${Math.abs(dmg)}`;
  el.style.cssText = `left:${x - 20}px;top:${y - 40}px;font-size:${Math.min(28, 14 + dmg / 3)}px;color:${color};`;
  overlay.appendChild(el);
  setTimeout(() => el.remove(), 1200);
  return true;
}

export function showNamedOverlay(className, durationMs, deps = {}) {
  const doc = getDoc(deps);
  const overlay = getHudOverlay(doc);
  if (!overlay) return false;
  const el = doc.createElement('div');
  el.className = className;
  overlay.appendChild(el);
  setTimeout(() => el.remove(), durationMs);
  return true;
}

export function showShieldBlockEffectOverlay(deps = {}) {
  const doc = getDoc(deps);
  const overlay = getHudOverlay(doc);
  if (!overlay) return false;
  const el = doc.createElement('div');
  el.style.cssText = [
    'position:fixed;inset:0;pointer-events:none;',
    'border:3px solid rgba(90,180,255,0.95);',
    'box-shadow:inset 0 0 22px rgba(90,180,255,0.45);',
    'opacity:0;',
  ].join('');
  overlay.appendChild(el);
  el.animate(
    [
      { opacity: 0 },
      { opacity: 0.85, offset: 0.45 },
      { opacity: 0 },
    ],
    { duration: 460, easing: 'ease', fill: 'forwards' },
  );
  setTimeout(() => el.remove(), 460);
  return true;
}

function resolveCardPlayStyle(card) {
  const isAtk = card.type === 'ATTACK';
  const isHeal = card.desc?.includes('방어') || card.desc?.includes('회복') || card.desc?.includes('방어막');
  const isEcho = card.type === 'ECHO' || card.type === 'POWER' || card.desc?.includes('Echo');
  return {
    isAtk,
    isHeal,
    isEcho,
    flashClass: isAtk ? 'attack-card-flash' : isHeal ? 'heal-card-flash' : isEcho ? 'echo-card-flash' : '',
    flashColor: isAtk ? 'rgba(255,51,102,0.8)' : isHeal ? 'rgba(68,255,136,0.8)' : 'rgba(0,255,204,0.8)',
    textColor: isAtk ? 'var(--danger)' : isHeal ? '#44ff88' : 'var(--cyan)',
  };
}

function playCardFeedbackAudio(audioEngine, style) {
  if (!audioEngine) return;
  if (style.isAtk) audioEngine.playHit?.();
  else if (style.isHeal) audioEngine.playSkill?.();
  else if (style.isEcho) audioEngine.playEcho?.();
  else audioEngine.playCard?.();
}

export function showCardPlayEffectOverlay(card, deps = {}) {
  if (!card) return false;
  const gs = deps.gs;
  if (!gs?.combat?.enemies) return false;

  const doc = getDoc(deps);
  const win = getWin(deps);
  const overlay = getHudOverlay(doc);
  if (!overlay) return false;

  const style = resolveCardPlayStyle(card);
  playCardFeedbackAudio(deps.audioEngine, style);

  const flash = doc.createElement('div');
  flash.className = `card-flash-overlay ${style.flashClass}`;
  overlay.appendChild(flash);
  setTimeout(() => flash.remove(), 400);

  const aliveIdx = gs.combat.enemies.findIndex((enemy) => enemy.hp > 0);
  const targetCard = aliveIdx >= 0 ? doc.getElementById(`enemy_${aliveIdx}`) : null;
  let tx = win.innerWidth / 2;
  let ty = win.innerHeight * 0.3;
  if (targetCard) {
    const rect = targetCard.getBoundingClientRect();
    tx = rect.left + rect.width / 2;
    ty = rect.top + rect.height / 2;
  }

  const nameEl = doc.createElement('div');
  const startX = win.innerWidth / 2;
  const startY = win.innerHeight * 0.65;
  nameEl.style.cssText = `
    position:fixed; left:${startX}px; top:${startY}px;
    transform:translate(-50%,-50%);
    font-family:'Cinzel',serif; font-size:clamp(13px,2vw,20px); font-weight:700;
    color:${style.textColor}; text-shadow:0 0 20px ${style.flashColor};
    letter-spacing:0.1em; pointer-events:none; z-index:260;
    transition:left 0.4s cubic-bezier(0.2,0,0.8,1), top 0.4s cubic-bezier(0.2,0,0.8,1), opacity 0.35s ease 0.25s;
    opacity:1;
  `;
  nameEl.textContent = `${card.icon} ${card.name}`;
  doc.body.appendChild(nameEl);

  const scheduleFrame = win.requestAnimationFrame || globalThis.requestAnimationFrame || ((callback) => setTimeout(callback, 16));
  scheduleFrame(() => {
    nameEl.style.left = `${tx}px`;
    nameEl.style.top = `${ty}px`;
    nameEl.style.opacity = '0';
  });
  setTimeout(() => nameEl.remove(), 500);
  return true;
}

export function showChainAnnounceEffect(text, deps = {}) {
  const doc = getDoc(deps);
  const el = doc.createElement('div');
  el.style.cssText = "position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);font-family:'Cinzel Decorative',serif;font-size:clamp(24px,4vw,48px);font-weight:900;color:var(--cyan);text-shadow:0 0 30px rgba(0,255,204,0.8);animation:fadeIn 0.5s ease both, fadeOut 0.5s ease 1.5s forwards;z-index:9000;pointer-events:none;";
  el.textContent = text;
  doc.body.appendChild(el);
  setTimeout(() => el.remove(), 2000);
  return true;
}
