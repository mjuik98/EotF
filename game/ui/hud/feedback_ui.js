import { DescriptionUtils } from '../../utils/description_utils.js';
import { ButtonFeedback } from '../feedback/button_feedback.js';


const _noticeQueue = [];
let _noticeActive = false;

function _getDoc(deps) {
  return deps?.doc || document;
}

function _getWin(deps) {
  return deps?.win || window;
}

function _getHudOverlay(doc) {
  return doc.getElementById('hudOverlay');
}

export const FeedbackUI = {
  showCombatSummary(dealt, taken, kills, deps = {}) {
    const doc = _getDoc(deps);
    const el = doc.createElement('div');
    el.className = 'combat-stat-summary';
    const head = doc.createElement('div');
    head.style.cssText = "font-family:'Cinzel',serif;font-size:12px;letter-spacing:0.3em;color:var(--text-dim);margin-bottom:12px;text-align:center;";
    head.textContent = '⚔️ 전투 요약 ⚔️';

    const stats = doc.createElement('div');
    stats.style.cssText = 'display:flex;flex-direction:column;gap:8px;';

    const createRow = (label, value, color, font = "'Share Tech Mono'") => {
      const row = doc.createElement('div');
      row.style.cssText = 'display:flex;justify-content:space-between;gap:20px;align-items:center;';
      const lbl = doc.createElement('span'); lbl.style.cssText = 'color:var(--text-dim);font-size:13px;'; lbl.textContent = label;
      const val = doc.createElement('span'); val.style.cssText = `color:${color};font-weight:700;font-size:20px;font-family:${font};`; val.textContent = value;
      row.append(lbl, val);
      return row;
    };

    stats.append(
      createRow('가한 피해', dealt, 'var(--danger)'),
      createRow('받은 피해', taken, '#ff8888', "'Share Tech Mono'"),
      createRow('처치', kills, 'var(--cyan)')
    );

    el.append(head, stats);
    doc.body.appendChild(el);
    setTimeout(() => {
      el.classList.add('fadeout');
      setTimeout(() => el.remove(), 500);
    }, 2500);
  },

  showDmgPopup(dmg, x, y, color = '#ff3366', deps = {}) {
    const doc = _getDoc(deps);
    const overlay = _getHudOverlay(doc);
    if (!overlay) return;
    const el = doc.createElement('div');
    el.className = 'dmg-popup';
    el.textContent = dmg >= 0 ? `-${dmg}` : `+${Math.abs(dmg)}`;
    el.style.cssText = `left:${x - 20}px;top:${y - 40}px;font-size:${Math.min(28, 14 + dmg / 3)}px;color:${color};`;
    overlay.appendChild(el);
    setTimeout(() => el.remove(), 1200);
  },

  showEdgeDamage(deps = {}) {
    const doc = _getDoc(deps);
    const overlay = _getHudOverlay(doc);
    if (!overlay) return;
    const el = doc.createElement('div');
    el.className = 'screen-edge-damage';
    overlay.appendChild(el);
    setTimeout(() => el.remove(), 500);
  },

  showPlayerHitVignette(deps = {}) {
    const doc = _getDoc(deps);
    const overlay = _getHudOverlay(doc);
    if (!overlay) return;
    const el = doc.createElement('div');
    el.className = 'player-hit-vignette';
    overlay.appendChild(el);
    setTimeout(() => el.remove(), 620);
  },

  showShieldBlockEffect(deps = {}) {
    const doc = _getDoc(deps);
    const overlay = _getHudOverlay(doc);
    if (!overlay) return;
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
  },

  showEchoBurstOverlay(deps = {}) {
    const doc = _getDoc(deps);
    const overlay = _getHudOverlay(doc);
    if (!overlay) return;
    const el = doc.createElement('div');
    el.className = 'echo-burst-overlay';
    overlay.appendChild(el);
    setTimeout(() => el.remove(), 800);
  },

  showCardPlayEffect(card, deps = {}) {
    if (!card) return;
    const gs = deps.gs;
    if (!gs?.combat?.enemies) return;

    const doc = _getDoc(deps);
    const win = _getWin(deps);
    const overlay = _getHudOverlay(doc);
    if (!overlay) return;

    const isAtk = card.type === 'ATTACK';
    const isHeal = card.desc?.includes('방어') || card.desc?.includes('회복') || card.desc?.includes('방어막');
    const isEcho = card.type === 'ECHO' || card.type === 'POWER' || card.desc?.includes('Echo');
    const flashClass = isAtk ? 'attack-card-flash' : isHeal ? 'heal-card-flash' : isEcho ? 'echo-card-flash' : '';
    const flashColor = isAtk ? 'rgba(255,51,102,0.8)' : isHeal ? 'rgba(68,255,136,0.8)' : 'rgba(0,255,204,0.8)';
    const textColor = isAtk ? 'var(--danger)' : isHeal ? '#44ff88' : 'var(--cyan)';

    // 카드 타입별 효과음
    const ae = deps.audioEngine;
    if (ae) {
      if (isAtk) ae.playHit?.();
      else if (isHeal) ae.playSkill?.();
      else if (isEcho) ae.playEcho?.();
      else ae.playCard?.();
    }

    const el = doc.createElement('div');
    el.className = `card-flash-overlay ${flashClass}`;
    overlay.appendChild(el);
    setTimeout(() => el.remove(), 400);

    const aliveIdx = gs.combat.enemies.findIndex(e => e.hp > 0);
    const targetCard = aliveIdx >= 0 ? doc.getElementById(`enemy_${aliveIdx}`) : null;
    let tx = win.innerWidth / 2;
    let ty = win.innerHeight * 0.3;
    if (targetCard) {
      const r = targetCard.getBoundingClientRect();
      tx = r.left + r.width / 2;
      ty = r.top + r.height / 2;
    }

    const nameEl = doc.createElement('div');
    const startX = win.innerWidth / 2;
    const startY = win.innerHeight * 0.65;
    nameEl.style.cssText = `
        position:fixed; left:${startX}px; top:${startY}px;
        transform:translate(-50%,-50%);
        font-family:'Cinzel',serif; font-size:clamp(13px,2vw,20px); font-weight:700;
        color:${textColor}; text-shadow:0 0 20px ${flashColor};
        letter-spacing:0.1em; pointer-events:none; z-index:260;
        transition:left 0.4s cubic-bezier(0.2,0,0.8,1), top 0.4s cubic-bezier(0.2,0,0.8,1), opacity 0.35s ease 0.25s;
        opacity:1;
      `;
    nameEl.textContent = `${card.icon} ${card.name}`;
    doc.body.appendChild(nameEl);

    win.requestAnimationFrame(() => {
      nameEl.style.left = `${tx}px`;
      nameEl.style.top = `${ty}px`;
      nameEl.style.opacity = '0';
    });
    setTimeout(() => nameEl.remove(), 500);
  },

  showItemToast(item, deps = {}) {
    if (!item) return;
    if (item.rarity === 'legendary') {
      this.showLegendaryAcquire(item, deps);
      return;
    }
    const doc = _getDoc(deps);
    doc.querySelector('.item-toast')?.remove();
    const rarityLabel = { common: '일반', uncommon: '비범', rare: '희귀' };
    const rarityColor = { common: 'var(--text-dim)', uncommon: 'var(--echo-bright)', rare: 'var(--gold)' };
    const borderColor = { common: 'var(--border)', uncommon: 'rgba(123,47,255,0.5)', rare: 'rgba(240,180,41,0.5)' };
    const r = item.rarity || 'common';
    const el = doc.createElement('div');
    el.className = 'item-toast';
    el.style.borderColor = borderColor[r] || 'var(--border)';
    const icon = doc.createElement('div'); icon.className = 'toast-icon'; icon.textContent = item.icon || '✨';
    const content = doc.createElement('div');
    const rarityInfo = doc.createElement('div');
    rarityInfo.style.cssText = `font-size:9px;font-family:'Cinzel',serif;letter-spacing:0.2em;color:${rarityColor[r] || 'var(--text-dim)'};margin-bottom:2px;`;
    rarityInfo.textContent = `${rarityLabel[r] || r} 아이템 획득`;

    const name = doc.createElement('div');
    name.className = 'toast-text'; name.style.color = rarityColor[r] || 'var(--white)';
    name.textContent = item.name;

    const sub = doc.createElement('div');
    sub.className = 'toast-sub';
    if (window.DescriptionUtils) {
      sub.innerHTML = window.DescriptionUtils.highlight(item.desc);
    } else {
      sub.textContent = item.desc;
    }

    content.append(rarityInfo, name, sub);
    el.append(icon, content);
    doc.body.appendChild(el);
    setTimeout(() => el.remove(), 3500);
  },

  showLegendaryAcquire(item, deps = {}) {
    const doc = _getDoc(deps);
    const audioEngine = deps.audioEngine;
    const screenShake = deps.screenShake;

    audioEngine?.playLegendary?.();
    screenShake?.shake?.(8, 0.6);

    const overlay = doc.createElement('div');
    overlay.style.cssText = 'position:fixed;inset:0;z-index:2000;display:flex;align-items:center;justify-content:center;background:rgba(3,2,12,0.0);pointer-events:all;cursor:pointer;';
    overlay.addEventListener('click', () => overlay.remove());

    const bg = doc.createElement('div');
    bg.style.cssText = 'position:absolute;inset:0;background:radial-gradient(ellipse at center,rgba(192,132,252,0.18) 0%,transparent 70%);animation:fadeIn 0.8s ease both;';
    overlay.appendChild(bg);

    const rays = doc.createElement('div');
    rays.style.cssText = 'position:absolute;top:50%;left:50%;width:600px;height:600px;margin:-300px;pointer-events:none;';
    for (let i = 0; i < 8; i++) {
      const ray = doc.createElement('div');
      ray.style.cssText = `position:absolute;top:50%;left:50%;width:2px;height:280px;margin-left:-1px;transform-origin:top center;transform:rotate(${i * 45}deg);background:linear-gradient(to bottom,rgba(192,132,252,0.6),transparent);animation:legendaryRays 1.4s ease ${i * 0.05}s forwards;`;
      rays.appendChild(ray);
    }
    overlay.appendChild(rays);

    const card = doc.createElement('div');
    card.style.cssText = 'position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);text-align:center;animation:legendaryReveal 0.7s cubic-bezier(0.175,0.885,0.32,1.275) both;';

    const head = doc.createElement('div');
    head.style.cssText = "font-family:'Cinzel',serif;font-size:10px;letter-spacing:0.6em;color:rgba(192,132,252,0.7);margin-bottom:16px;animation:fadeIn 0.5s ease 0.3s both;";
    head.textContent = '✦ 전설 아이템 획득 ✦';

    const body = doc.createElement('div');
    body.style.cssText = 'width:160px;background:rgba(15,8,35,0.97);border:2px solid rgba(192,132,252,0.7);border-radius:20px;padding:28px 20px;margin:0 auto 20px;box-shadow:0 0 60px rgba(192,132,252,0.4),0 0 120px rgba(192,132,252,0.15);position:relative;overflow:hidden;';

    const innerGlow = doc.createElement('div');
    innerGlow.style.cssText = 'position:absolute;inset:0;background:radial-gradient(ellipse at top,rgba(192,132,252,0.12),transparent 60%);pointer-events:none;';

    const icon = doc.createElement('div');
    icon.style.cssText = `font-size:52px;margin-bottom:14px;filter:drop-shadow(0 0 16px rgba(192,132,252,0.8));`;
    icon.textContent = item.icon;

    const name = doc.createElement('div');
    name.style.cssText = "font-family:'Cinzel',serif;font-size:14px;font-weight:700;color:#c084fc;letter-spacing:0.05em;margin-bottom:8px;";
    name.textContent = item.name;

    const desc = doc.createElement('div');
    desc.style.cssText = 'font-size:11px;color:rgba(220,210,240,0.8);line-height:1.6;';
    if (window.DescriptionUtils) {
      desc.innerHTML = window.DescriptionUtils.highlight(item.desc);
    } else {
      desc.textContent = item.desc;
    }

    body.append(innerGlow, icon, name, desc);

    const foot = doc.createElement('div');
    foot.style.cssText = "font-family:'Crimson Pro',serif;font-style:italic;font-size:13px;color:rgba(192,132,252,0.6);animation:fadeIn 0.6s ease 0.6s both;";
    foot.textContent = '클릭하여 닫기';

    card.append(head, body, foot);

    for (let i = 0; i < 16; i++) {
      const p = doc.createElement('div');
      const angle = (i / 16) * Math.PI * 2;
      const dist = 80 + Math.random() * 80;
      const cx = Math.cos(angle) * dist;
      const cy = Math.sin(angle) * dist;
      p.style.cssText = `position:absolute;top:50%;left:50%;width:4px;height:4px;border-radius:50%;background:#c084fc;
          margin:-2px;transform:translate(${cx}px,${cy}px);
          animation:legendaryParticle ${0.8 + Math.random() * 0.6}s ease ${Math.random() * 0.4}s forwards;
          box-shadow:0 0 6px rgba(192,132,252,0.8);pointer-events:none;`;
      overlay.appendChild(p);
    }

    overlay.appendChild(card);
    doc.body.appendChild(overlay);
    setTimeout(() => overlay.remove(), 5000);
  },

  showChainAnnounce(text, deps = {}) {
    const doc = _getDoc(deps);
    const el = doc.createElement('div');
    el.style.cssText = 'position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);font-family:\'Cinzel Decorative\',serif;font-size:clamp(24px,4vw,48px);font-weight:900;color:var(--cyan);text-shadow:0 0 30px rgba(0,255,204,0.8);animation:fadeInUp 0.5s ease,fadeIn 0.5s ease 1.5s reverse both;z-index:1000;pointer-events:none;';
    el.textContent = text;
    doc.body.appendChild(el);
    setTimeout(() => el.remove(), 2000);
  },

  showWorldMemoryNotice(text, deps = {}) {
    const parts = text.split(' · ').map(s => s.trim()).filter(Boolean);
    parts.forEach(p => _noticeQueue.push(p));
    if (!_noticeActive) this._flushNoticeQueue(deps);
  },

  _flushNoticeQueue(deps = {}) {
    if (!_noticeQueue.length) {
      _noticeActive = false;
      return;
    }
    _noticeActive = true;
    const doc = _getDoc(deps);
    const text = _noticeQueue.shift();
    const el = doc.createElement('div');
    el.className = 'world-memory-notice';
    el.style.cssText = 'position:fixed;top:68px;left:50%;transform:translateX(-50%);font-family:\'Cinzel\',serif;font-size:13px;letter-spacing:0.2em;color:var(--cyan);background:rgba(0,20,18,0.96);border:1px solid rgba(0,255,204,0.3);border-radius:10px;padding:12px 28px;z-index:9000;box-shadow:0 4px 28px rgba(0,255,204,0.15);animation:worldNoticeIn 0.4s ease both;white-space:nowrap;pointer-events:none;text-align:center;max-width:90vw;';
    el.textContent = text;
    doc.body.appendChild(el);
    const showDuration = Math.max(2800, text.length * 60);
    setTimeout(() => {
      el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
      el.style.opacity = '0';
      el.style.transform = 'translateX(-50%) translateY(-10px)';
      setTimeout(() => {
        el.remove();
        this._flushNoticeQueue(deps);
      }, 500);
    }, showDuration);
  },

  /**
   * 카드 뽑기 버튼에 시각적 효과 적용 (리플, 반동, 파티클)
   */
  triggerDrawButtonEffect(btnId = 'combatDrawCardBtn', deps = {}) {
    const doc = deps.doc || document;
    ButtonFeedback.triggerEffect(btnId, { doc });
  },
};
