/**
 * event_ui.js — 이벤트/상점/휴식 UI (순수 View)
 *
 * EventManager에서 이벤트 데이터/로직 결과를 받아 DOM만 업데이트합니다.
 */
import { EventManager } from '../../systems/event_manager.js';
import { clearIdempotencyPrefix, runIdempotent } from '../../utils/idempotency_utils.js';
import { RARITY_LABELS } from '../../../data/rarity_meta.js';
import { EVENT_DISCARD_CARD_RARITY_COLORS, ITEM_SHOP_RARITY_BORDER_COLORS, ITEM_SHOP_RARITY_TEXT_COLORS } from '../../../data/ui_rarity_styles.js';


let _currentEvent = null;

function _getEventId(event) {
  if (!event || typeof event !== 'object') return 'unknown';
  return event.id || event.key || event.title || 'unknown';
}

function _getDoc(deps) {
  return deps?.doc || document;
}

function _getGS(deps) {
  return deps?.gs;
}

function _getData(deps) {
  return deps?.data;
}

function _getRunRules(deps) {
  return deps?.runRules;
}

function _getAudioEngine(deps) {
  return deps?.audioEngine || globalThis.AudioEngine;
}

const OVERLAY_DISMISS_MS = 320;

function _nextFrame(cb) {
  if (typeof requestAnimationFrame === 'function') {
    requestAnimationFrame(cb);
    return;
  }
  setTimeout(cb, 16);
}

function _dismissTransientOverlay(overlay, onDone) {
  if (!overlay) {
    onDone?.();
    return;
  }

  overlay.style.pointerEvents = 'none';
  overlay.style.opacity = '1';
  overlay.style.filter = 'blur(0)';
  overlay.style.transform = 'translateY(0) scale(1)';
  overlay.style.transition = 'opacity 0.32s ease, filter 0.32s ease, transform 0.32s ease';

  _nextFrame(() => {
    overlay.style.opacity = '0';
    overlay.style.filter = 'blur(12px)';
    overlay.style.transform = 'translateY(10px) scale(0.985)';
  });

  setTimeout(() => {
    overlay.remove();
    onDone?.();
  }, OVERLAY_DISMISS_MS);
}

function _dismissEventModal(modal, onDone) {
  if (!modal) {
    onDone?.();
    return;
  }

  modal.classList.remove('active');
  modal.style.display = 'flex';
  modal.style.pointerEvents = 'none';
  modal.style.opacity = '1';
  modal.style.filter = 'blur(0)';
  modal.style.transform = 'translateY(0) scale(1)';
  modal.style.transition = 'opacity 0.32s ease, filter 0.32s ease, transform 0.32s ease';

  _nextFrame(() => {
    modal.style.opacity = '0';
    modal.style.filter = 'blur(10px)';
    modal.style.transform = 'translateY(10px) scale(0.985)';
  });

  setTimeout(() => {
    modal.style.display = '';
    modal.style.pointerEvents = '';
    modal.style.opacity = '';
    modal.style.filter = '';
    modal.style.transform = '';
    modal.style.transition = '';
    onDone?.();
  }, OVERLAY_DISMISS_MS);
}

function _getShopItemIcon(item, rarity = 'common') {
  const raw = String(item?.icon || '').trim();
  if (raw && raw !== '?' && !raw.includes('�')) {
    const asciiOnly = /^[\x20-\x7E]+$/.test(raw);
    if (!asciiOnly) return raw;
  }
  const fallback = {
    common: '🧩',
    uncommon: '🧿',
    rare: '💎',
    legendary: '👑',
  };
  return fallback[rarity] || '🎁';
}

function _isChoiceDisabled(choice, gs) {
  if (!choice) return false;
  if (typeof choice.isDisabled === 'function') return !!choice.isDisabled(gs);
  return !!choice.disabled;
}

function _hexToRgb(hex, fallback = [255, 255, 255]) {
  const raw = String(hex || '').trim();
  const normalized = raw.startsWith('#') ? raw.slice(1) : raw;
  if (/^[0-9a-fA-F]{6}$/.test(normalized)) {
    return [0, 2, 4].map((idx) => parseInt(normalized.slice(idx, idx + 2), 16));
  }
  return fallback;
}

const _PARTICLE_SPRITES = {
  hp: null,
  echo: null,
};

function _ensureParticleSprites(doc) {
  if (_PARTICLE_SPRITES.hp && _PARTICLE_SPRITES.echo) return;

  const createGradientSprite = (color, size = 64) => {
    const canvas = (doc || document).createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    const center = size / 2;

    // Core glow
    const [r, g, b] = _hexToRgb(color);
    const radGlow = ctx.createRadialGradient(center, center, 0, center, center, size / 2);
    radGlow.addColorStop(0, `rgba(${r},${g},${b}, 1)`);
    radGlow.addColorStop(0.3, `rgba(${r},${g},${b}, 0.4)`);
    radGlow.addColorStop(1, `rgba(${r},${g},${b}, 0)`);

    ctx.fillStyle = radGlow;
    ctx.beginPath();
    ctx.arc(center, center, size / 2, 0, Math.PI * 2);
    ctx.fill();

    return canvas;
  };

  if (!_PARTICLE_SPRITES.hp) _PARTICLE_SPRITES.hp = createGradientSprite('#ff5c96');
  if (!_PARTICLE_SPRITES.echo) _PARTICLE_SPRITES.echo = createGradientSprite('#9c63ff');
}

class _RestFillParticle {
  constructor(kind, width, height) {
    this.kind = kind === 'echo' ? 'echo' : 'hp';
    this.color = _hexToRgb(this.kind === 'echo' ? '#9c63ff' : '#ff5c96');
    this.setBounds(width, height);
    this.reset();
  }

  setBounds(width, height) {
    this.width = Math.max(1, width || 1);
    this.height = Math.max(1, height || 1);
  }

  reset() {
    const isEcho = this.kind === 'echo';
    this.life = 0.62 + Math.random() * 0.38;
    this.decay = 0.004 + Math.random() * 0.0048;
    this.x = this.width * (0.03 + Math.random() * 0.94);
    this.y = this.height * (isEcho ? 0.9 : 0.94) + Math.random() * (isEcho ? 26 : 30);
    this.vx = (Math.random() - 0.5) * (isEcho ? 0.45 : 0.58);
    this.vy = -(Math.random() * (isEcho ? 1.8 : 2.2) + (isEcho ? 1.05 : 1.3));
    this.size = Math.random() * (isEcho ? 2.2 : 2.8) + (isEcho ? 1.1 : 1.3);
    this.phase = Math.random() * Math.PI * 2;
    this.wave = 0.03 + Math.random() * 0.035;
  }

  update(boost = 0) {
    const flow = 1 + boost * 1.35;
    this.life -= this.decay * flow;
    this.phase += this.wave;
    this.x += this.vx * flow + Math.sin(this.phase) * 0.12 * flow;
    this.y += this.vy * flow;

    const outOfBounds = this.y < -20 || this.x < -16 || this.x > this.width + 16;
    if (this.life <= 0 || outOfBounds) this.reset();
  }

  draw(ctx, boost = 0) {
    const alpha = Math.max(0, this.life) * (0.26 + boost * 0.62);
    if (alpha <= 0) return;

    const [r, g, b] = this.color;
    const radius = this.size * (0.9 + boost * 0.65);
    const sprite = _PARTICLE_SPRITES[this.kind];

    if (sprite) {
      ctx.save();
      ctx.globalAlpha = Math.min(1, alpha * 1.5);
      const drawSize = radius * 4; // Expanded for glow
      ctx.drawImage(
        sprite,
        this.x - drawSize / 2,
        this.y - drawSize / 2,
        drawSize,
        drawSize
      );
      ctx.restore();
    } else {
      // Fallback if sprite not ready
      ctx.save();
      ctx.globalAlpha = Math.max(0.08, Math.min(1, alpha));
      ctx.fillStyle = `rgba(${r},${g},${b},${alpha})`;
      ctx.beginPath();
      ctx.arc(this.x, this.y, radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }
}

function _resolveRestFillParticleBounds(doc, refs = {}) {
  const target = refs.target
    || doc?.querySelector?.('.game-canvas-wrapper-special')
    || doc?.querySelector?.('#gameCanvas')
    || doc?.querySelector?.('#hudOverlay');
  if (target?.getBoundingClientRect) {
    const rect = target.getBoundingClientRect();
    if (rect.width > 8 && rect.height > 8) {
      return {
        left: rect.left,
        top: rect.top,
        width: rect.width,
        height: rect.height,
      };
    }
  }

  const win = doc?.defaultView;
  const viewportW = Math.max(1, Math.floor(win?.innerWidth || doc?.documentElement?.clientWidth || 1));
  const viewportH = Math.max(1, Math.floor(win?.innerHeight || doc?.documentElement?.clientHeight || 1));
  return {
    left: 0,
    top: 0,
    width: viewportW,
    height: viewportH,
  };
}

function _startRestFillParticles(overlay, doc) {
  const canvas = overlay?.querySelector('#restFillParticleCanvas');
  if (!canvas) {
    return { setBoost: () => { }, stop: () => { } };
  }

  const ctx = canvas.getContext?.('2d');
  if (!ctx) {
    return { setBoost: () => { }, stop: () => { } };
  }

  const docRef = doc || overlay?.ownerDocument;
  _ensureParticleSprites(docRef);
  const win = docRef?.defaultView;
  const refs = {
    target: docRef?.querySelector?.('.game-canvas-wrapper-special')
      || docRef?.querySelector?.('#gameCanvas')
      || docRef?.querySelector?.('#hudOverlay')
      || null,
  };

  let width = 0;
  let height = 0;
  let styleKey = '';
  let hpParticles = [];
  let echoParticles = [];
  let targetHpCount = 0;
  let targetEchoCount = 0;
  let boost = 0.1;
  let rafId = null;
  let resizeQueued = false;
  let settleTimer = null;
  let resizeObserver = null;

  const requestFrame = (cb) => {
    if (typeof requestAnimationFrame === 'function') return requestAnimationFrame(cb);
    return setTimeout(() => cb(performance.now()), 16);
  };
  const cancelFrame = (id) => {
    if (id === null || id === undefined) return;
    if (typeof cancelAnimationFrame === 'function') {
      cancelAnimationFrame(id);
      return;
    }
    clearTimeout(id);
  };

  const syncBounds = (force = false) => {
    const bounds = _resolveRestFillParticleBounds(docRef, refs);
    const styleToken = `${Math.round(bounds.left)}:${Math.round(bounds.top)}:${Math.round(bounds.width)}:${Math.round(bounds.height)}`;
    if (force || styleToken !== styleKey) {
      styleKey = styleToken;
      canvas.style.left = `${Math.round(bounds.left)}px`;
      canvas.style.top = `${Math.round(bounds.top)}px`;
      canvas.style.width = `${Math.round(bounds.width)}px`;
      canvas.style.height = `${Math.round(bounds.height)}px`;
    }

    const nextW = Math.max(1, Math.floor(bounds.width || canvas.clientWidth || canvas.width || 1));
    const nextH = Math.max(1, Math.floor(bounds.height || canvas.clientHeight || canvas.height || 1));
    if (!force && nextW === width && nextH === height) return false;

    width = nextW;
    height = nextH;
    canvas.width = width;
    canvas.height = height;

    const density = Math.max(0.72, Math.min(1.45, Math.sqrt((width * height) / (1200 * 700))));
    targetHpCount = Math.max(26, Math.round(56 * density));
    targetEchoCount = Math.max(22, Math.round(50 * density));

    if (!hpParticles.length && !echoParticles.length) {
      const initialHp = Math.min(targetHpCount, 18);
      const initialEcho = Math.min(targetEchoCount, 16);
      hpParticles = Array.from({ length: initialHp }, () => new _RestFillParticle('hp', width, height));
      echoParticles = Array.from({ length: initialEcho }, () => new _RestFillParticle('echo', width, height));
    } else {
      [...hpParticles, ...echoParticles].forEach((particle) => {
        particle.setBounds(width, height);
      });
    }
    return true;
  };

  const scheduleBoundsSync = () => {
    if (resizeQueued) return;
    resizeQueued = true;
    requestFrame(() => {
      resizeQueued = false;
      syncBounds();
    });
  };

  const growParticles = () => {
    const hpNeed = Math.max(0, targetHpCount - hpParticles.length);
    const echoNeed = Math.max(0, targetEchoCount - echoParticles.length);
    const hpBatch = Math.min(4, hpNeed);
    const echoBatch = Math.min(4, echoNeed);
    for (let i = 0; i < hpBatch; i++) hpParticles.push(new _RestFillParticle('hp', width, height));
    for (let i = 0; i < echoBatch; i++) echoParticles.push(new _RestFillParticle('echo', width, height));
  };

  const render = () => {
    if (!overlay.isConnected) return;
    if (width <= 1 || height <= 1) {
      syncBounds();
      rafId = requestFrame(render);
      return;
    }
    growParticles();
    ctx.clearRect(0, 0, width, height);
    ctx.globalCompositeOperation = 'lighter';
    hpParticles.forEach((particle) => {
      particle.update(boost);
      particle.draw(ctx, boost);
    });
    echoParticles.forEach((particle) => {
      particle.update(boost * 0.95);
      particle.draw(ctx, boost * 0.95);
    });
    ctx.globalCompositeOperation = 'source-over';
    rafId = requestFrame(render);
  };

  if (win?.addEventListener) {
    win.addEventListener('resize', scheduleBoundsSync, { passive: true });
    win.addEventListener('orientationchange', scheduleBoundsSync, { passive: true });
  }

  if (typeof win?.ResizeObserver === 'function') {
    resizeObserver = new win.ResizeObserver(() => scheduleBoundsSync());
    if (refs.target) resizeObserver.observe(refs.target);
    if (refs.panel) resizeObserver.observe(refs.panel);
  }

  syncBounds(true);
  settleTimer = setTimeout(() => scheduleBoundsSync(), 120);
  render();

  return {
    setBoost(nextBoost) {
      const value = Number(nextBoost);
      if (!Number.isFinite(value)) return;
      boost = Math.max(0.06, Math.min(1, value));
    },
    stop() {
      if (win?.removeEventListener) {
        win.removeEventListener('resize', scheduleBoundsSync);
        win.removeEventListener('orientationchange', scheduleBoundsSync);
      }
      if (resizeObserver) {
        resizeObserver.disconnect();
        resizeObserver = null;
      }
      if (settleTimer) {
        clearTimeout(settleTimer);
        settleTimer = null;
      }
      cancelFrame(rafId);
      rafId = null;
      ctx.clearRect(0, 0, width, height);
    },
  };
}

function _renderChoices(event, doc, deps = {}) {
  const choicesEl = doc.getElementById('eventChoices');
  if (!choicesEl) return;
  const gs = _getGS(deps);
  choicesEl.textContent = '';
  event.choices.forEach((choice, idx) => {
    const btn = doc.createElement('div');
    btn.className = 'event-choice';
    if (event?.id === 'shop') btn.classList.add('event-choice-shop');
    if (choice?.cssClass) {
      String(choice.cssClass)
        .split(/\s+/)
        .filter(Boolean)
        .forEach((className) => btn.classList.add(className));
    }
    btn.textContent = choice.text;
    const disabled = _isChoiceDisabled(choice, gs);
    if (disabled) {
      btn.classList.add('disabled');
      btn.setAttribute('aria-disabled', 'true');
      btn.setAttribute('tabindex', '-1');
      if (choice?.disabledReason) btn.title = choice.disabledReason;
    } else {
      btn.addEventListener('click', () => EventUI.resolveEvent(idx, deps));
    }
    choicesEl.appendChild(btn);
  });
}

export const EventUI = {
  triggerRandomEvent(deps = {}) {
    const gs = _getGS(deps);
    const data = _getData(deps);

    // ── 로직 위임 ──
    const picked = EventManager.pickRandomEvent(gs, data);
    if (picked) this.showEvent(picked, deps);
  },

  updateEventGoldBar(deps = {}) {
    const gs = _getGS(deps);
    if (!gs?.player) return;
    const doc = _getDoc(deps);
    const player = gs.player;
    const gEl = doc.getElementById('eventGoldDisplay');
    const hEl = doc.getElementById('eventHpDisplay');
    const dEl = doc.getElementById('eventDeckDisplay');
    if (gEl) gEl.textContent = player.gold ?? 0;
    if (hEl) hEl.textContent = `${Math.max(0, player.hp ?? 0)}/${player.maxHp ?? 0}`;
    if (dEl) {
      const totalCards = (player.deck?.length || 0) + (player.hand?.length || 0) + (player.graveyard?.length || 0);
      dEl.textContent = totalCards;
    }
  },

  showEvent(event, deps = {}) {
    const gs = _getGS(deps);
    if (!event || !gs) return;

    const doc = _getDoc(deps);
    _currentEvent = event;
    gs._eventLock = false;
    clearIdempotencyPrefix('event:resolve:');

    const eyebrowEl = doc.getElementById('eventEyebrow');
    const titleEl = doc.getElementById('eventTitle');
    const descEl = doc.getElementById('eventDesc');
    const imgContEl = doc.getElementById('eventImageContainer');

    if (eyebrowEl) eyebrowEl.textContent = event.eyebrow || 'LAYER 1 · 이벤트';
    if (titleEl) titleEl.textContent = event.title;
    if (descEl) descEl.textContent = event.desc;

    if (imgContEl) {
      imgContEl.style.display = 'none';
    }

    this.updateEventGoldBar(deps);

    const deckInfoEl = doc.getElementById('eventDeckDisplay');
    if (deckInfoEl && gs.player) {
      const player = gs.player;
      const totalCards = (player.deck?.length || 0) + (player.hand?.length || 0) + (player.graveyard?.length || 0);
      deckInfoEl.textContent = totalCards;
    }

    _renderChoices(event, doc, deps);
    doc.getElementById('eventModal')?.classList.add('active');
  },

  resolveEvent(choiceIdx, deps = {}) {
    const gs = _getGS(deps);
    if (!gs) return;
    const event = _currentEvent;
    if (!event) return;
    if (!event.persistent && gs._eventLock) return;

    const eventId = _getEventId(event);
    const guardKey = `event:resolve:${eventId}:${choiceIdx}`;
    return runIdempotent(guardKey, () => {
      const doc = _getDoc(deps);
      gs._eventLock = true;

      let resolution = null;
      try {
        resolution = EventManager.resolveEventChoice(gs, event, choiceIdx);
      } catch (err) {
        console.error('[resolveEvent] choice effect error:', err);
        gs._eventLock = false;
        deps.audioEngine?.playHit?.();
        return;
      }

      const selectedChoice = event?.choices?.[choiceIdx];
      const { resultText, isFail, shouldClose, isItemShop, acquiredCard, acquiredItem } = resolution || {};

      if (typeof deps.updateUI === 'function') deps.updateUI();
      this.updateEventGoldBar(deps);

      // Trigger Card Toast
      if (acquiredCard && typeof deps.showItemToast === 'function') {
        const cardData = window.DATA?.cards?.[acquiredCard];
        if (cardData) {
          deps.showItemToast(cardData, {
            typeLabel: `${RARITY_LABELS[cardData.rarity] || cardData.rarity} 카드 획득`
          });
        }
      }

      // Trigger Item Toast (already supported but ensuring it works with new resolution structure)
      if (acquiredItem && typeof deps.showItemToast === 'function') {
        const itemData = window.DATA?.items?.[acquiredItem];
        if (itemData) {
          deps.showItemToast(itemData);
        }
      }

      if (isItemShop) {
        // Item shop overlay can close without purchase, so keep event choices interactive.
        gs._eventLock = false;
        return;
      }

      if (!resultText) {
        _dismissEventModal(doc.getElementById('eventModal'), () => {
          _currentEvent = null;
          gs._eventLock = false;
          if (typeof deps.switchScreen === 'function') deps.switchScreen('game');
          if (typeof deps.updateUI === 'function') deps.updateUI();
          if (typeof deps.renderMinimap === 'function') deps.renderMinimap();
          if (typeof deps.updateNextNodes === 'function') deps.updateNextNodes();
        });
        return;
      }

      const descEl = doc.getElementById('eventDesc');
      if (descEl) descEl.textContent = resultText;
      const choiceText = String(selectedChoice?.text || '');
      const choiceClass = String(selectedChoice?.cssClass || '');
      const isUpgradeChoice = choiceClass.includes('shop-choice-upgrade')
        || /\uCE74\uB4DC\s*\uAC15\uD654|\uAC15\uD654/.test(choiceText);
      if (!isFail && isUpgradeChoice && typeof deps.showItemToast === 'function') {
        const upgradedName = String(resultText || '').match(/(?:\u2728\s*)?(.+?)\s+\uAC15\uD654\s*\uC644\uB8CC/i)?.[1]?.trim()
          || 'Upgraded Card';
        deps.showItemToast({
          name: `Upgrade: ${upgradedName}`,
          icon: '\u2728',
          desc: resultText,
        });
      }

      if (event.persistent || isFail) {
        _renderChoices(event, doc, deps);
        this.updateEventGoldBar(deps);
        gs._eventLock = false;
        return;
      }

      if (!shouldClose) {
        gs._eventLock = false;
        return;
      }

      const choicesEl = doc.getElementById('eventChoices');
      if (choicesEl) {
        choicesEl.textContent = '';
        const continueBtn = doc.createElement('div');
        continueBtn.className = 'event-choice';
        continueBtn.id = 'eventChoiceContinue';
        continueBtn.textContent = '\uACC4\uC18D';
        continueBtn.addEventListener('click', () => {
          _dismissEventModal(doc.getElementById('eventModal'), () => {
            _currentEvent = null;
            gs._eventLock = false;
            if (typeof deps.switchScreen === 'function') deps.switchScreen('game');
            if (typeof deps.updateUI === 'function') deps.updateUI();
            if (typeof deps.renderMinimap === 'function') deps.renderMinimap();
            if (typeof deps.updateNextNodes === 'function') deps.updateNextNodes();
          });
        }, { once: true });
        choicesEl.appendChild(continueBtn);
      }
    }, { ttlMs: 800 });
  },
  showShop(deps = {}) {
    const gs = _getGS(deps);
    const data = _getData(deps);
    const runRules = _getRunRules(deps);
    if (!gs || !data || !runRules) return;

    const self = this;

    // ── 로직 위임: 이벤트 객체 생성 ──
    const shop = EventManager.createShopEvent(gs, data, runRules, {
      showItemShopFn: (state) => self.showItemShop(state, deps),
    });
    if (!shop) return;

    // UI에서 필요한 사운드 콜백 추가
    shop.choices.forEach(choice => {
      const originalEffect = choice.effect;
      choice.effect = (state) => {
        const result = originalEffect(state);
        const resultText = (typeof result === 'object' && result !== null) ? result.resultText : result;
        const isSkip = typeof resultText === 'string' && (resultText.includes('부족') || resultText.includes('없다'));
        if (result && !isSkip && result !== '__item_shop_open__') {
          if (typeof deps.playItemGet === 'function') deps.playItemGet();
          if (typeof deps.updateUI === 'function') deps.updateUI();
        }
        return result;
      };
    });

    self.showEvent(shop, deps);
  },

  showRestSite(deps = {}) {
    const gs = _getGS(deps);
    const data = _getData(deps);
    const runRules = _getRunRules(deps);
    if (!gs || !data || !runRules) return;

    const self = this;
    const doc = _getDoc(deps);
    const audioEngine = _getAudioEngine(deps);

    // ── 자동 HP/Echo 회복 ──
    const baseHeal = Math.floor(gs.player.maxHp * 0.25);
    const healAmount = runRules.getHealAmount(gs, baseHeal);
    const echoGain = 30;
    const oldHp = gs.player.hp;
    const oldEcho = gs.player.echo || 0;

    gs.heal(healAmount);
    gs.addEcho(echoGain);

    const newHp = gs.player.hp;
    const newEcho = gs.player.echo || 0;

    // ── 차오르는 시각적 연출 ──
    const overlay = doc.createElement('div');
    overlay.className = 'rest-fill-overlay';
    overlay.innerHTML = `
      <div class="rest-fill-bg"></div>
      <canvas id="restFillParticleCanvas" class="rest-fill-particle-canvas"></canvas>
      <div class="rest-fill-content">
        <div class="rest-fill-icon">🔥</div>
        <div class="rest-fill-title">잔향의 모닥불</div>
        <div class="rest-fill-subtitle">따뜻한 불꽃이 상처를 치유한다...</div>
        <div class="rest-fill-bars">
          <div class="rest-fill-stat">
            <span class="rest-fill-label">❤️ HP</span>
            <div class="rest-fill-bar-track">
              <div class="rest-fill-bar hp-fill" id="restHpFill" style="width: ${(oldHp / gs.player.maxHp) * 100}%"></div>
            </div>
            <span class="rest-fill-value" id="restHpValue">${oldHp}/${gs.player.maxHp}</span>
          </div>
          <div class="rest-fill-stat">
            <span class="rest-fill-label">⚡ Echo</span>
            <div class="rest-fill-bar-track">
              <div class="rest-fill-bar echo-fill" id="restEchoFill" style="width: ${Math.min(oldEcho, 100)}%"></div>
            </div>
            <span class="rest-fill-value" id="restEchoValue">${oldEcho}/100</span>
          </div>
        </div>
      </div>
    `;
    doc.body.appendChild(overlay);
    const restParticleFx = _startRestFillParticles(overlay, doc);

    // Trigger entrance animation
    requestAnimationFrame(() => {
      overlay.classList.add('active');
    });

    const totalSeqDuration = 3200;
    const healStartDelay = 600;
    const healDuration = 1400;
    const startTime = performance.now();

    const updateSequence = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / totalSeqDuration, 1);

      // --- 파티클 부스트(boost) 곡선 제어 ---
      // 0~600ms: 0.1 -> 0.16 (준비)
      // 600~2000ms: 0.16 -> 1.0 (치유 절정)
      // 2000~3200ms: 1.0 -> 0.08 (여운)
      let currentBoost = 0.1;

      if (elapsed < healStartDelay) {
        const p = elapsed / healStartDelay;
        currentBoost = 0.1 + p * 0.06;
      } else if (elapsed < healStartDelay + healDuration) {
        const p = (elapsed - healStartDelay) / healDuration;
        const eased = 1 - Math.pow(1 - p, 2); // easeOutQuad
        currentBoost = 0.16 + eased * 0.84;
      } else {
        const p = Math.min(1, (elapsed - (healStartDelay + healDuration)) / (totalSeqDuration - (healStartDelay + healDuration)));
        const eased = Math.pow(p, 0.5); // easeInSine or similar
        currentBoost = 1.0 - eased * 0.92;
      }
      restParticleFx.setBoost(currentBoost);

      // --- 숫자 및 게이지 애니메이션 (600ms~2000ms 구간) ---
      if (elapsed >= healStartDelay && elapsed <= healStartDelay + healDuration) {
        const p = (elapsed - healStartDelay) / healDuration;
        const eased = 1 - Math.pow(1 - p, 3); // easeOutCubic

        const hpBar = doc.getElementById('restHpFill');
        const echoBar = doc.getElementById('restEchoFill');
        const hpVal = doc.getElementById('restHpValue');
        const echoVal = doc.getElementById('restEchoValue');

        const currentHp = Math.round(oldHp + (newHp - oldHp) * eased);
        const currentEcho = Math.round(oldEcho + (newEcho - oldEcho) * eased);

        if (hpBar) hpBar.style.width = `${(currentHp / gs.player.maxHp) * 100}%`;
        if (echoBar) echoBar.style.width = `${Math.min(currentEcho, 100)}%`;
        if (hpVal) hpVal.textContent = `${currentHp}/${gs.player.maxHp}`;
        if (echoVal) echoVal.textContent = `${currentEcho}/100`;

        // 사운드는 시작 시 한 번만
        if (!updateSequence._playedSound) {
          audioEngine?.playHeal?.();
          updateSequence._playedSound = true;
        }
      }

      if (progress < 1) {
        requestAnimationFrame(updateSequence);
      } else {
        // 연출 종료 및 선택창 전환
        overlay.classList.remove('active');
        overlay.classList.add('fade-out');

        setTimeout(() => {
          restParticleFx.stop();
          overlay.remove();

          // ── 로직 위임: 선택지만 표시 ──
          const rest = EventManager.createRestEvent(gs, data, runRules, {
            showCardDiscardFn: (state, isBurn) => self.showCardDiscard(state, isBurn, deps),
          });
          if (!rest) return;

          rest.desc = `체력이 ${newHp - oldHp} 회복되고, 잔향이 ${newEcho - oldEcho} 충전되었다. 추가 행동을 선택하세요.`;
          self.showEvent(rest, deps);
          if (typeof deps.updateUI === 'function') deps.updateUI();
        }, 500);
      }
    };

    requestAnimationFrame(updateSequence);
  },

  showCardDiscard(gsArg, isBurn = false, deps = {}) {
    const gs = gsArg || _getGS(deps);
    const data = _getData(deps);
    if (!gs?.player || !data?.cards) return;

    const allCards = [
      ...(gs.player.deck || []),
      ...(gs.player.hand || []),
      ...(gs.player.graveyard || []),
    ];

    if (allCards.length === 0) {
      if (deps.audioEngine) deps.audioEngine.playHit();
      else _getAudioEngine(deps)?.playHit?.();
      if (deps.screenShake) deps.screenShake.shake(10, 0.4);
      else if (typeof ScreenShake !== 'undefined') ScreenShake.shake(10, 0.4);
      gs.addLog('⚠️ 소각/처분할 카드가 덱에 없습니다.', 'damage');
      return;
    }

    const doc = _getDoc(deps);
    const overlay = doc.createElement('div');
    overlay.id = 'cardDiscardOverlay';
    overlay.style.cssText = `
      position:fixed;inset:0;background:rgba(3,3,10,0.96);
      display:flex;flex-direction:column;align-items:center;justify-content:flex-start;
      padding:40px 24px;gap:20px;z-index:6000;backdrop-filter:blur(20px);
      overflow-y:auto; transition: opacity 0.3s ease;
      animation: modalFadeInDown 0.4s cubic-bezier(0.2, 0.8, 0.2, 1) both;
    `;

    const titleEl = doc.createElement('div');
    titleEl.style.textAlign = 'center';

    const eyebrow = doc.createElement('div');
    eyebrow.style.cssText = "font-family:'Cinzel',serif;font-size:11px;letter-spacing:0.4em;color:var(--text-dim);margin-bottom:8px;";
    eyebrow.textContent = isBurn ? '🔥 소각' : '🗑️ 처분';

    const bigTitle = doc.createElement('div');
    bigTitle.style.cssText = "font-family:'Cinzel Decorative',serif;font-size:22px;font-weight:900;color:var(--white);margin-bottom:6px;";
    bigTitle.textContent = isBurn ? '🔥 소각할 카드를 선택하세요' : '🗑️ 버릴 카드를 선택하세요 (+8골드)';

    const subTitle = doc.createElement('div');
    subTitle.style.cssText = "font-family:'Crimson Pro',serif;font-style:italic;font-size:13px;color:var(--text-dim);";
    subTitle.textContent = isBurn ? '선택한 카드가 덱에서 영구 제거됩니다.' : '선택한 카드를 팔고 8골드를 받습니다.';

    titleEl.append(eyebrow, bigTitle, subTitle);

    const list = doc.createElement('div');
    list.id = 'discardCardList';
    list.style.cssText = 'display:flex;flex-wrap:wrap;gap:10px;justify-content:center;max-width:700px;';

    const cancelBtn = doc.createElement('button');
    cancelBtn.style.cssText = "font-family:'Cinzel',serif;font-size:11px;letter-spacing:0.2em;color:var(--text-dim);background:none;border:1px solid rgba(255,255,255,0.1);border-radius:6px;padding:10px 24px;cursor:pointer;margin-top:8px;";
    cancelBtn.textContent = '취소';
    cancelBtn.onclick = () => {
      deps.onCancel?.();
      _dismissTransientOverlay(overlay);
    };

    overlay.append(titleEl, list, cancelBtn);
    doc.body.appendChild(overlay);

    const discardList = doc.getElementById('discardCardList');
    if (!discardList) return;
    const uniqueCards = [...new Set(allCards)];
    const rarityColor = EVENT_DISCARD_CARD_RARITY_COLORS;

    uniqueCards.forEach(cardId => {
      const card = data.cards[cardId];
      if (!card) return;
      const count = allCards.filter(id => id === cardId).length;

      const btn = doc.createElement('div');
      btn.style.cssText = `cursor:pointer;background:rgba(10,5,30,0.9);border:1px solid ${rarityColor[card.rarity] || 'var(--border)'};border-radius:10px;padding:12px;width:120px;text-align:center;transition:all 0.2s;position:relative;`;

      const icon = doc.createElement('div');
      icon.style.cssText = 'font-size:22px;margin-bottom:6px;';
      icon.textContent = card.icon || '🃏';

      const name = doc.createElement('div');
      name.style.cssText = `font-family:'Cinzel',serif;font-size:10px;font-weight:700;color:${rarityColor[card.rarity] || 'var(--white)'};margin-bottom:3px;`;
      name.textContent = card.name;

      const desc = doc.createElement('div');
      desc.style.cssText = 'font-size:10px;color:var(--text-dim);line-height:1.3;';
      desc.textContent = card.desc || '';

      btn.append(icon, name, desc);

      if (count > 1) {
        const countBadge = doc.createElement('div');
        countBadge.style.cssText = 'position:absolute;top:4px;right:6px;font-size:9px;color:var(--echo);';
        countBadge.textContent = `×${count}`;
        btn.appendChild(countBadge);
      }

      btn.onmouseenter = () => {
        btn.style.borderColor = 'var(--cyan)';
        btn.style.boxShadow = '0 0 12px rgba(0,255,204,0.3)';
      };
      btn.onmouseleave = () => {
        btn.style.borderColor = rarityColor[card.rarity] || 'var(--border)';
        btn.style.boxShadow = '';
      };
      btn.onclick = () => {
        // ── 로직 위임 ──
        const result = EventManager.discardCard(gs, cardId, data, isBurn);
        if (result.success) {
          if (typeof deps.playItemGet === 'function') deps.playItemGet();
          if (typeof deps.updateUI === 'function') deps.updateUI();
        }
        _dismissTransientOverlay(overlay);
      };
      discardList.appendChild(btn);
    });
  },

  showItemShop(gsArg, deps = {}) {
    const gs = gsArg || _getGS(deps);
    const data = _getData(deps);
    const runRules = _getRunRules(deps);
    if (!gs?.player || !data?.items || !runRules) return;

    // ── 로직 위임: 상점 아이템 생성 ──
    const shopStock = EventManager.generateItemShopStock(gs, data, runRules);

    const rarityConfig = {
      common: { label: RARITY_LABELS.common, color: ITEM_SHOP_RARITY_TEXT_COLORS.common, border: ITEM_SHOP_RARITY_BORDER_COLORS.common },
      uncommon: { label: RARITY_LABELS.uncommon, color: ITEM_SHOP_RARITY_TEXT_COLORS.uncommon, border: ITEM_SHOP_RARITY_BORDER_COLORS.uncommon },
      rare: { label: RARITY_LABELS.rare, color: ITEM_SHOP_RARITY_TEXT_COLORS.rare, border: ITEM_SHOP_RARITY_BORDER_COLORS.rare },
      legendary: { label: RARITY_LABELS.legendary, color: ITEM_SHOP_RARITY_TEXT_COLORS.legendary, border: ITEM_SHOP_RARITY_BORDER_COLORS.legendary },
    };

    const doc = _getDoc(deps);
    const overlay = doc.createElement('div');
    overlay.id = 'itemShopOverlay';
    overlay.className = 'item-shop-overlay';

    const titleCont = doc.createElement('div');
    titleCont.className = 'item-shop-title';

    const eyebrow = doc.createElement('div');
    eyebrow.className = 'item-shop-eyebrow';
    eyebrow.textContent = '🏪 아이템 상점';

    const bigTitle = doc.createElement('div');
    bigTitle.className = 'item-shop-main-title';
    bigTitle.textContent = '무엇을 구하시겠습니까?';

    const goldInfo = doc.createElement('div');
    goldInfo.className = 'item-shop-gold';
    goldInfo.textContent = '보유 골드: ';
    const goldVal = doc.createElement('span');
    goldVal.id = 'itemShopGold';
    goldVal.textContent = gs.player.gold;
    goldInfo.appendChild(goldVal);

    titleCont.append(eyebrow, bigTitle, goldInfo);

    const list = doc.createElement('div');
    list.id = 'itemShopList';
    list.className = 'item-shop-list';

    const closeBtn = doc.createElement('button');
    closeBtn.className = 'item-shop-close-btn';
    closeBtn.textContent = '닫기';
    closeBtn.onclick = () => {
      _dismissTransientOverlay(overlay);
    };

    overlay.append(titleCont, list, closeBtn);
    doc.body.appendChild(overlay);

    const shopList = doc.getElementById('itemShopList');
    if (!shopList) return;

    const renderShopList = () => {
      goldVal.textContent = gs.player.gold;
      shopList.textContent = '';

      shopStock.forEach(({ item, cost, rarity }) => {
        const rc = rarityConfig[rarity] || rarityConfig.common;
        const alreadyOwned = gs.player.items.includes(item.id);
        const canAfford = gs.player.gold >= cost;
        const purchasable = !alreadyOwned && canAfford;

        const card = doc.createElement('div');
        card.className = `item-shop-card rarity-${rarity}`;
        card.style.setProperty('--shop-border-color', rc.border);
        card.style.setProperty('--shop-rarity-color', rc.color);
        card.style.opacity = purchasable ? '1' : '0.5';
        card.style.cursor = purchasable ? 'pointer' : 'not-allowed';

        const rarityLabel = doc.createElement('div');
        rarityLabel.className = 'item-shop-rarity';
        rarityLabel.style.color = rc.color;
        rarityLabel.textContent = rc.label;

        const iconEl = doc.createElement('div');
        iconEl.className = 'item-shop-icon';
        iconEl.textContent = _getShopItemIcon(item, rarity);

        const nameEl = doc.createElement('div');
        nameEl.className = 'item-shop-name';
        nameEl.style.color = rc.color;
        nameEl.textContent = item.name;

        const descEl = doc.createElement('div');
        descEl.className = 'item-shop-desc';
        if (globalThis.DescriptionUtils) {
          descEl.innerHTML = globalThis.DescriptionUtils.highlight(item.desc);
        } else {
          descEl.textContent = item.desc;
        }

        const costEl = doc.createElement('div');
        costEl.className = 'item-shop-cost';
        costEl.textContent = `${cost} \uACE8\uB4DC`;

        card.append(rarityLabel, iconEl, nameEl, descEl, costEl);

        if (alreadyOwned) {
          const ownedOverlay = doc.createElement('div');
          ownedOverlay.className = 'item-shop-owned-overlay';
          const ownedLabel = doc.createElement('span');
          ownedLabel.className = 'item-shop-owned-label';
          ownedLabel.textContent = '\uBCF4\uC720 \uC911';
          ownedOverlay.appendChild(ownedLabel);
          card.appendChild(ownedOverlay);
        } else if (purchasable) {
          card.onmouseenter = () => {
            card.style.borderColor = 'var(--cyan)';
            card.style.transform = 'translateY(-3px)';
            card.style.boxShadow = '0 8px 24px rgba(0,255,204,0.2)';
          };
          card.onmouseleave = () => {
            card.style.borderColor = rc.border;
            card.style.transform = '';
            card.style.boxShadow = '';
          };
          card.onclick = () => {
            const result = EventManager.purchaseItem(gs, item, cost);
            if (!result.success) return;

            if (typeof deps.playItemGet === 'function') deps.playItemGet();
            if (typeof deps.showItemToast === 'function') deps.showItemToast(item, { forceQueue: true });
            if (typeof deps.updateUI === 'function') deps.updateUI();
            EventUI.updateEventGoldBar(deps);
            renderShopList();
          };
        }

        shopList.appendChild(card);
      });
    };

    renderShopList();
  },

  // Expose public API for GAME.API
  api: {
    showEvent: (event, deps) => EventUI.showEvent(event, deps),
    resolveEvent: (choiceIdx, deps) => EventUI.resolveEvent(choiceIdx, deps),
    showShop: (deps) => EventUI.showShop(deps),
    showRestSite: (deps) => EventUI.showRestSite(deps),
    showItemShop: (gs, deps) => EventUI.showItemShop(gs, deps),
  }
};
