// ══════════════════════════════════════════════════════════
//  CharacterSelectUI
//  game/ui/title/character_select_ui.js
//
//  NOTE: CHARS 데이터는 현재 이 파일에 포함되어 있지만
//        data/classes.js 또는 game/data/ 로 이동을 권장합니다.
// ══════════════════════════════════════════════════════════

// ── 헬퍼 ──────────────────────────────────────────────────
import { ITEMS } from '../../../data/items.js';
import { CARDS } from '../../../data/cards.js';
import { CLASS_METADATA } from '../../../data/class_metadata.js';
import { TooltipUI } from '../cards/tooltip_ui.js';

function _getDoc(deps) {
  return deps?.doc || document;
}

function _$(id, deps) {
  return _getDoc(deps).getElementById(id);
}

// ══════════════════════════════════════════════════════════
// CHARACTER DATA
// 권장: data/classes.js 로 이동 후 deps.data.classes 로 주입
// ══════════════════════════════════════════════════════════
const CHARS = Object.values(CLASS_METADATA)
  .slice()
  .sort((a, b) => Number(a?.id ?? 0) - Number(b?.id ?? 0))
  .map((cls) => {
    const particle = cls.class === 'berserker'
      ? 'rage'
      : (cls.class === 'guardian' ? 'aegis' : cls.particle);
    const startRelic = ITEMS[cls.startRelic];
    return {
      ...cls,
      particle,
      startRelic: startRelic ? {
        icon: startRelic.icon || '?',
        name: startRelic.name || cls.startRelic,
        desc: startRelic.desc || 'Data unavailable',
        passive: startRelic.passive || 'No passive info',
      } : {
        icon: '?',
        name: cls.startRelic || 'Unknown Relic',
        desc: 'Data unavailable',
        passive: 'No passive info',
      },
    };
  });

// ══════════════════════════════════════════════════════════
// SOUND ENGINE
// deps.audioEngine 이 있으면 우선 사용하고, 없으면 Web Audio API 폴백
// ══════════════════════════════════════════════════════════
let _audioCtx = null;

function _getAudioCtx() {
  if (!_audioCtx) {
    _audioCtx = new (globalThis.AudioContext || globalThis.webkitAudioContext)();
  }
  return _audioCtx;
}

function _tone(f, d, type = 'sine', v = 0.06, delay = 0) {
  try {
    const c = _getAudioCtx();
    const o = c.createOscillator();
    const g = c.createGain();
    o.connect(g); g.connect(c.destination);
    o.type = type;
    o.frequency.setValueAtTime(f, c.currentTime + delay);
    o.frequency.exponentialRampToValueAtTime(f * 1.35, c.currentTime + delay + d * 0.7);
    g.gain.setValueAtTime(0.001, c.currentTime + delay);
    g.gain.linearRampToValueAtTime(v, c.currentTime + delay + 0.02);
    g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + delay + d);
    o.start(c.currentTime + delay);
    o.stop(c.currentTime + delay + d + 0.05);
  } catch (_e) { /* 오디오 컨텍스트 미지원 환경에서 무시 */ }
}

const _SFX = {
  nav: () => { _tone(360, 0.1, 'triangle', 0.06); _tone(520, 0.1, 'triangle', 0.05, 0.09); },
  hover: () => _tone(900, 0.035, 'sine', 0.022),
  select: () => [261, 329, 392, 523, 659, 880].forEach((f, i) => _tone(f, 0.8, 'triangle', 0.05, i * 0.065)),
  compare: () => { _tone(440, 0.1, 'sine', 0.05); _tone(660, 0.15, 'triangle', 0.05, 0.09); },
  echo: () => { _tone(300, 0.15, 'sine', 0.05); _tone(600, 0.2, 'triangle', 0.04, 0.12); _tone(900, 0.15, 'sine', 0.03, 0.25); },
};

// ══════════════════════════════════════════════════════════
// PARTICLE SYSTEM
// ══════════════════════════════════════════════════════════
function _hexRgb(h) {
  return [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16)).join(',');
}

class _Particle {
  constructor(t, a, W, H) { this.t = t; this.a = a; this.W = W; this.H = H; this.reset(); }
  reset() {
    const { t, W, H } = this;
    this.life = 0.6 + Math.random() * 0.4;
    this.decay = 0.004 + Math.random() * 0.005;
    if (t === 'ember') {
      this.x = W * 0.2 + Math.random() * W * 0.6; this.y = H + 5;
      this.vx = (Math.random() - 0.5) * 1.8; this.vy = -(Math.random() * 2.5 + 1); this.s = Math.random() * 3 + 1;
    } else if (t === 'orb') {
      // Orb particles use a wider orbit radius so the field fills more of the card.
      const maxOrbit = Math.min(W, H);
      this.angle = Math.random() * Math.PI * 2;
      this.r = maxOrbit * (0.18 + Math.random() * 0.32);
      this.speed = (Math.random() * 0.005 + 0.0025) * (Math.random() > 0.5 ? 1 : -1);
      this.s = Math.random() * 3 + 1.2;
      this.x = W / 2 + Math.cos(this.angle) * this.r; this.y = H / 2 + Math.sin(this.angle) * this.r;
    } else if (t === 'rage') {
      // Berserker: aggressive slash field across most of the card.
      this.x = W * 0.06 + Math.random() * W * 0.88; this.y = H * 0.2 + Math.random() * H * 0.72;
      this.vx = (Math.random() - 0.5) * 1.5; this.vy = -(Math.random() * 1.8 + 0.6);
      this.s = Math.random() * 3.2 + 1.4;
      this.len = Math.random() * 14 + 8;
      this.rot = (Math.random() - 0.5) * 1.6;
      this.decay = 0.0028 + Math.random() * 0.0038;
    } else if (t === 'smoke') {
      // Keep smoke spread wide but inside the visible card area.
      this.x = W * 0.12 + Math.random() * W * 0.76; this.y = H * 0.55 + Math.random() * H * 0.4;
      this.vx = (Math.random() - 0.5) * 0.45; this.vy = -(Math.random() * 0.7 + 0.15); this.s = Math.random() * 8 + 6;
      this.decay = 0.0025 + Math.random() * 0.0035;
    } else if (t === 'aegis') {
      // Guardian: shield-glyph diamonds orbiting in stable rings.
      const maxOrbit = Math.min(W, H);
      this.angle = Math.random() * Math.PI * 2;
      this.r = maxOrbit * (0.18 + Math.random() * 0.44);
      this.speed = (Math.random() * 0.0032 + 0.0012) * (Math.random() > 0.5 ? 1 : -1);
      this.s = Math.random() * 2.8 + 2.4;
      this.pulse = Math.random() * Math.PI * 2;
      this.rot = Math.random() * Math.PI * 2;
      this.decay = 0.0024 + Math.random() * 0.003;
      this.x = W / 2 + Math.cos(this.angle) * this.r;
      this.y = H / 2 + Math.sin(this.angle) * this.r;
    } else if (t === 'holy') {
      this.x = Math.random() * W; this.y = Math.random() * H;
      this.vx = (Math.random() - 0.5) * 0.4; this.vy = -(Math.random() * 0.6 + 0.1);
      this.s = Math.random() * 2.5 + 0.5; this.pulse = Math.random() * Math.PI * 2;
    }
  }
  update() {
    this.life -= this.decay;
    if (this.t === 'orb') { this.angle += this.speed; this.x = this.W / 2 + Math.cos(this.angle) * this.r; this.y = this.H / 2 + Math.sin(this.angle) * this.r; }
    else if (this.t === 'rage') {
      this.x += this.vx; this.y += this.vy;
      this.vx += (Math.random() - 0.5) * 0.03; this.vx *= 0.985; this.vy += 0.02;
      this.len *= 0.996; this.rot += (Math.random() - 0.5) * 0.06;
    }
    else if (this.t === 'smoke') { this.x += this.vx; this.y += this.vy; this.s += 0.04; }
    else if (this.t === 'aegis') {
      this.angle += this.speed; this.pulse += 0.06; this.rot += this.speed * 2.2;
      const pr = this.r * (1 + 0.08 * Math.sin(this.pulse));
      this.x = this.W / 2 + Math.cos(this.angle) * pr; this.y = this.H / 2 + Math.sin(this.angle) * pr;
    }
    else if (this.t === 'holy') { this.pulse += 0.05; this.x += this.vx; this.y += this.vy; }
    else { this.x += this.vx; this.y += this.vy; }
    if (this.life <= 0) this.reset();
  }
  draw(ctx) {
    const rgb = _hexRgb(this.a), al = Math.max(0, this.life);
    ctx.save();
    if (this.t === 'smoke') {
      const g = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.s);
      g.addColorStop(0, `rgba(${rgb},${al * 0.34})`);
      g.addColorStop(0.7, `rgba(${rgb},${al * 0.15})`);
      g.addColorStop(1, `rgba(${rgb},0)`);
      ctx.shadowBlur = 14; ctx.shadowColor = `rgba(${rgb},${al * 0.16})`;
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(this.x, this.y, this.s, 0, Math.PI * 2); ctx.fill();
    } else if (this.t === 'rage') {
      ctx.translate(this.x, this.y); ctx.rotate(this.rot);
      const len = Math.max(3, this.len);
      const lg = ctx.createLinearGradient(-len * 0.5, 0, len * 0.55, 0);
      lg.addColorStop(0, `rgba(${rgb},0)`);
      lg.addColorStop(0.45, `rgba(${rgb},${al * 0.25})`);
      lg.addColorStop(1, `rgba(${rgb},${al * 0.9})`);
      ctx.strokeStyle = lg;
      ctx.lineWidth = this.s;
      ctx.lineCap = 'round';
      ctx.shadowBlur = 18;
      ctx.shadowColor = `rgba(${rgb},${al * 0.82})`;
      ctx.beginPath();
      ctx.moveTo(-len * 0.5, 0);
      ctx.lineTo(len * 0.55, 0);
      ctx.stroke();
      const lg2 = ctx.createLinearGradient(-len * 0.22, this.s * 0.35, len * 0.35, -this.s * 0.28);
      lg2.addColorStop(0, `rgba(${rgb},0)`);
      lg2.addColorStop(1, `rgba(${rgb},${al * 0.6})`);
      ctx.strokeStyle = lg2;
      ctx.lineWidth = Math.max(0.9, this.s * 0.45);
      ctx.beginPath();
      ctx.moveTo(-len * 0.22, this.s * 0.35);
      ctx.lineTo(len * 0.35, -this.s * 0.28);
      ctx.stroke();
      ctx.fillStyle = `rgba(${rgb},${al * 0.88})`;
      ctx.beginPath();
      ctx.arc(len * 0.58, 0, this.s * 0.48, 0, Math.PI * 2);
      ctx.fill();
    } else if (this.t === 'aegis') {
      ctx.translate(this.x, this.y); ctx.rotate(this.rot);
      const ps = this.s * (1 + 0.28 * Math.sin(this.pulse));
      ctx.shadowBlur = 14; ctx.shadowColor = `rgba(${rgb},${al * 0.55})`;
      ctx.fillStyle = `rgba(${rgb},${al * 0.16})`;
      ctx.beginPath();
      ctx.moveTo(0, -ps); ctx.lineTo(ps, 0); ctx.lineTo(0, ps); ctx.lineTo(-ps, 0); ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = `rgba(${rgb},${al * 0.88})`; ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.moveTo(0, -ps); ctx.lineTo(ps, 0); ctx.lineTo(0, ps); ctx.lineTo(-ps, 0); ctx.closePath();
      ctx.stroke();
      ctx.strokeStyle = `rgba(${rgb},${al * 0.46})`; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.arc(0, 0, ps * (1.85 + 0.16 * Math.sin(this.pulse * 1.3)), 0, Math.PI * 2); ctx.stroke();
      ctx.strokeStyle = `rgba(${rgb},${al * 0.26})`; ctx.lineWidth = 0.7;
      ctx.beginPath(); ctx.arc(0, 0, ps * 2.35, 0, Math.PI * 2); ctx.stroke();
      ctx.strokeStyle = `rgba(${rgb},${al * 0.38})`; ctx.lineWidth = 0.9;
      ctx.beginPath();
      ctx.moveTo(-ps * 1.2, 0); ctx.lineTo(ps * 1.2, 0);
      ctx.moveTo(0, -ps * 1.2); ctx.lineTo(0, ps * 1.2);
      ctx.stroke();
    } else if (this.t === 'holy') {
      const ps = this.s * (1 + 0.3 * Math.sin(this.pulse));
      ctx.shadowBlur = 12; ctx.shadowColor = `rgba(${rgb},.9)`;
      ctx.fillStyle = `rgba(${rgb},${al * 0.95})`;
      ctx.beginPath(); ctx.arc(this.x, this.y, ps, 0, Math.PI * 2); ctx.fill();
      ctx.strokeStyle = `rgba(${rgb},${al * 0.3})`; ctx.lineWidth = 0.5;
      ctx.beginPath(); ctx.moveTo(this.x - ps * 3, this.y); ctx.lineTo(this.x + ps * 3, this.y);
      ctx.moveTo(this.x, this.y - ps * 3); ctx.lineTo(this.x, this.y + ps * 3); ctx.stroke();
    } else {
      ctx.shadowBlur = 10; ctx.shadowColor = `rgba(${rgb},.8)`;
      ctx.fillStyle = `rgba(${rgb},${al * 0.88})`;
      ctx.beginPath(); ctx.arc(this.x, this.y, this.s, 0, Math.PI * 2); ctx.fill();
    }
    ctx.restore();
  }
}

// ══════════════════════════════════════════════════════════
// RADAR SVG BUILDER
// ══════════════════════════════════════════════════════════
const _STAT_LABELS = { HP: '체력', ATK: '공격', DEF: '방어', ECH: '잔향', RHY: '리듬', RES: '회복' };

function _buildRadar(stats, accent, cmp = null, size = 240) {
  const keys = Object.keys(stats), n = keys.length;
  const cx = size / 2, cy = size / 2, maxR = size / 2 - 35;
  const ang = i => (i * 2 * Math.PI / n) - Math.PI / 2;
  const pt = (i, r) => [cx + r * Math.cos(ang(i)), cy + r * Math.sin(ang(i))];
  const toD = pts => pts.map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(1)} ${y.toFixed(1)}`).join('') + 'Z';
  const sPts = keys.map((k, i) => pt(i, (stats[k] / 100) * maxR));
  const cPath = ''; // cmp 제거됨
  const fid = `glow${accent.replace('#', '')}`;
  const grids = [0.25, 0.5, 0.75, 1].map(lv =>
    `<polygon points="${keys.map((_, i) => { const [x, y] = pt(i, maxR * lv); return `${x},${y}`; }).join(' ')}" fill="none" stroke="rgba(255,255,255,.05)" stroke-width="1.5"/>`
  ).join('');
  const axes = keys.map((_, i) => { const [x, y] = pt(i, maxR); return `<line x1="${cx}" y1="${cy}" x2="${x}" y2="${y}" stroke="rgba(255,255,255,.05)" stroke-width="1.5"/>`; }).join('');
  const sPath = `<path d="${toD(sPts)}" fill="${accent}22" stroke="${accent}" stroke-width="2" filter="url(#${fid})"/>`;
  const dots = sPts.map(([x, y]) => `<circle cx="${x}" cy="${y}" r="3.5" fill="${accent}"/>`).join('');
  const lbls = keys.map((k, i) => { const [x, y] = pt(i, maxR + 22); return `<text x="${x}" y="${y + 4}" text-anchor="middle" font-size="11" fill="${accent}" font-family="'Share Tech Mono',monospace" font-weight="bold">${_STAT_LABELS[k] || k}</text>`; }).join('');
  return `<svg width="${size}" height="${size}" style="overflow:visible"><defs><filter id="${fid}"><feDropShadow dx="0" dy="0" stdDeviation="3" flood-color="${accent}" flood-opacity=".6"/></filter></defs>${grids}${axes}${cPath}${sPath}${dots}${lbls}</svg>`;
}



// ══════════════════════════════════════════════════════════
// PUBLIC EXPORT
// ══════════════════════════════════════════════════════════
export const CharacterSelectUI = {

  // 외부에서 직접 참조할 수 있도록 캐릭터 데이터 노출
  CHARS,

  /**
   * 캐릭터 선택 화면을 초기화하고 마운트합니다.
   *
   * @param {Object} deps
   * @param {Document}  [deps.doc]          - document 인스턴스 (테스트/멀티 윈도우용)
   * @param {Function}  [deps.onConfirm]    - 캐릭터 확정 시 콜백 (selectedChar) => void
   * @param {Function}  [deps.onBack]       - 뒤로가기 콜백 (선택 화면에서 타이틀로)
   * @param {Object}    [deps.audioEngine]  - 프로젝트 오디오 엔진 (있으면 _SFX 대신 사용)
   * @returns {{ destroy: Function }} - 이벤트 리스너 정리 함수 반환
   */
  mount(deps = {}) {
    const doc = _getDoc(deps);
    const S = { idx: 0, phase: 'select', activeSkill: null, typingTimer: null };
    const chars = CHARS;

    // ── 파티클 루프 참조 ───────────────────────────────
    let particles = [], pRaf = null;

    function initParticles(type, accent) {
      cancelAnimationFrame(pRaf);
      const cv = doc.getElementById('particleCanvas');
      if (!cv) return;
      const w = Math.max(1, Math.floor(cv.clientWidth || cv.width));
      const h = Math.max(1, Math.floor(cv.clientHeight || cv.height));
      if (cv.width !== w) cv.width = w;
      if (cv.height !== h) cv.height = h;
      const ctx = cv.getContext('2d');
      if (!ctx) return;
      const count = type === 'rage' ? 84 : (type === 'aegis' ? 52 : 40);
      particles = Array.from({ length: count }, () => new _Particle(type, accent, w, h));
      const loop = () => {
        ctx.clearRect(0, 0, w, h);
        ctx.globalCompositeOperation = (type === 'rage' || type === 'aegis') ? 'lighter' : 'source-over';
        particles.forEach(p => { p.update(); p.draw(ctx); });
        ctx.globalCompositeOperation = 'source-over';
        pRaf = requestAnimationFrame(loop);
      };
      loop();
    }

    // ── SFX 래퍼 (deps.audioEngine 우선) ──────────────
    const SFX = {
      nav: () => deps.audioEngine?.playClick?.() ?? _SFX.nav(),
      hover: () => _SFX.hover(),
      select: () => _SFX.select(),
      echo: () => _SFX.echo(),
    };

    // ── 유틸리티 ──────────────────────────────────────
    function $(id) { return doc.getElementById(id); }
    function sLabel(txt, ac) {
      return `<span class="s-label" style="border-left:2px solid ${ac}44">${txt}</span>`;
    }

    // ── 모달 ──────────────────────────────────────────
    function openModal(skill, accent) {
      S.activeSkill = skill;
      const isEcho = !!skill.echoCost;
      const tiers = skill.tree.map((t, i) => `
        <div style="padding:16px 20px;border:1px solid ${i === 0 ? accent + '55' : accent + '1a'};border-radius:10px;background:${i === 0 ? accent + '0f' : 'transparent'};display:flex;align-items:flex-start;gap:16px;animation:fadeInUp .3s ease ${i * 0.07}s both">
          <div style="width:28px;height:28px;flex-shrink:0;border-radius:50%;border:2px solid ${i === 0 ? accent : accent + '44'};display:flex;align-items:center;justify-content:center;font-size:12px;color:${i === 0 ? accent : accent + '55'};font-family:'Share Tech Mono',monospace;font-weight:bold">${t.tier}</div>
          <div>
            <div style="display:flex;align-items:center;gap:10px;margin-bottom:6px;flex-wrap:wrap">
              <span style="font-size:15px;color:${i === 0 ? '#fff' : '#555'};letter-spacing:1px">${t.name}</span>
              <span style="padding:2px 10px;border-radius:12px;font-size:11px;background:${accent}1a;color:${accent};font-family:'Share Tech Mono',monospace;border:1px solid ${accent}33">${t.bonus}</span>
            </div>
            <p style="font-size:13px;color:${i === 0 ? '#aaa' : '#3a3a50'};margin:0;line-height:1.6">${t.desc}</p>
          </div>
        </div>`).join('');

      const modalBox = $('modalBox');
      if (!modalBox) return;
      modalBox.style.border = `1px solid ${accent}33`;
      modalBox.style.boxShadow = `0 0 80px ${accent}22,0 30px 80px rgba(0,0,0,.8)`;
      modalBox.innerHTML = `
        <div style="display:flex;align-items:center;gap:16px;margin-bottom:24px">
          <span style="font-size:32px">${skill.icon}</span>
          <div>
            <p style="font-size:10px;letter-spacing:5px;color:#444;font-family:'Share Tech Mono',monospace;margin:0">${isEcho ? 'ECHO SKILL TREE' : 'SKILL TREE'}</p>
            <h3 style="font-size:20px;color:#fff;margin:0;letter-spacing:1.5px">${skill.name}</h3>
            ${isEcho ? `<span style="font-size:10px;color:${accent};font-family:'Share Tech Mono',monospace"> ${skill.echoCost} 소모</span>` : ''}
          </div>
          <button id="modalClose" style="margin-left:auto;background:none;border:none;color:#555;font-size:24px;cursor:pointer">✕</button>
        </div>
        <div style="display:flex;flex-direction:column;gap:12px">${tiers}</div>
        <p style="font-size:11px;color:#222;text-align:center;font-family:'Share Tech Mono',monospace;margin:20px 0 0">클릭 또는 ESC로 닫기</p>`;

      $('skillModal').classList.add('open');
      $('modalClose').addEventListener('click', closeModal);
      $('skillModal').addEventListener('click', e => { if (e.target === $('skillModal')) closeModal(); }, { once: true });
    }

    function closeModal() {
      S.activeSkill = null;
      $('skillModal')?.classList.remove('open');
    }

    // ── 카드 렌더 ─────────────────────────────────────
    function renderCard() {
      const ch = chars[S.idx];
      const card = $('charCard');
      if (!card) return;

      card.style.border = `1px solid ${ch.accent}44`;
      card.style.background = `linear-gradient(158deg,${ch.color}18 0%,#060610 50%,${ch.color}08 100%)`;
      card.style.boxShadow = `0 0 65px ${ch.glow}22,inset 0 1px 0 ${ch.accent}18`;

      const cardTitle = $('cardTitle');
      if (cardTitle) { cardTitle.style.color = ch.accent; cardTitle.textContent = ch.title; }
      const cardEmoji = $('cardEmoji');
      if (cardEmoji) { cardEmoji.textContent = ch.emoji; cardEmoji.style.filter = `drop-shadow(0 0 28px ${ch.glow})`; }
      const cardName = $('cardName');
      if (cardName) { cardName.textContent = ch.name; cardName.style.textShadow = `0 0 20px ${ch.glow}`; }
      const cardDiff = $('cardDiff');
      if (cardDiff) cardDiff.textContent = ch.difficulty;
      const cardTraitBadge = $('cardTraitBadge');
      if (cardTraitBadge) {
        cardTraitBadge.textContent = `✦ ${ch.traitName}`;
        cardTraitBadge.style.cssText += `;border:1px solid ${ch.accent}33;color:${ch.accent};background:${ch.accent}0a;`;
      }
      const cardTags = $('cardTags');
      if (cardTags) {
        cardTags.innerHTML = ch.tags.map(t =>
          `<span style="padding:4px 10px;border:1px solid ${ch.accent}22;border-radius:12px;font-size:11px;color:${ch.accent}aa;font-family:'Share Tech Mono',monospace;background:${ch.accent}07">${t}</span>`
        ).join('');
      }
      const cardBottomGrad = $('cardBottomGrad');
      if (cardBottomGrad) cardBottomGrad.style.background = `linear-gradient(to top,${ch.color}44,transparent)`;
      const cardShimmer = $('cardShimmer');
      if (cardShimmer) cardShimmer.style.background = `linear-gradient(105deg,transparent 40%,${ch.accent}07 50%,transparent 60%)`;

      // 코너 장식
      card.querySelectorAll('.card-corner').forEach(c => c.remove());
      [['top', 'left'], ['top', 'right'], ['bottom', 'left'], ['bottom', 'right']].forEach(([v, h]) => {
        const d = doc.createElement('div');
        d.className = 'card-corner';
        d.style[v] = '9px'; d.style[h] = '9px';
        d.style[`border${v[0].toUpperCase() + v.slice(1)}`] = `1px solid ${ch.accent}77`;
        d.style[`border${h[0].toUpperCase() + h.slice(1)}`] = `1px solid ${ch.accent}77`;
        card.appendChild(d);
      });
    }

    // ── 정보 패널 렌더 ────────────────────────────────
    function renderInfoPanel() {
      const ch = chars[S.idx];
      const panel = $('infoPanel');
      if (!panel) return;

      const rel = ch.startRelic;

      const ec = ch.echoSkill;
      panel.innerHTML = `
        <div style="padding:15px 18px;border:1px solid ${ch.accent}22;border-radius:10px;background:${ch.accent}06;margin-bottom:18px">
          ${sLabel('── 고유 특성 ──', ch.accent)}
          <p style="font-size:14px;color:${ch.accent};font-family:'Share Tech Mono',monospace;margin:0 0 5px;letter-spacing:1px">${ch.traitTitle}</p>
          <p style="font-size:13px;color:#888;margin:0;line-height:1.7">${ch.traitDesc}</p>
        </div>
        ${sLabel('ECHO SKILL — 잔향 게이지 스킬', ch.accent)}
        <div style="margin-bottom:20px">
          <button id="echoBadge" class="echo-badge" style="background:linear-gradient(135deg,${ch.accent}0e,${ch.color}08);border:1px solid ${ch.accent}44;padding:12px 16px">
            <div style="width:36px;height:36px;flex-shrink:0;border-radius:8px;border:1px solid ${ch.accent}55;background:${ch.accent}14;display:flex;align-items:center;justify-content:center;font-size:18px">${ec.icon}</div>
            <div style="flex:1;min-width:0">
              <div style="font-size:12px;color:${ch.accent};font-family:'Share Tech Mono',monospace;letter-spacing:1px;margin-bottom:4px">◈ ${ec.name}</div>
              <div style="font-size:11px;color:#666;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${ec.desc}</div>
            </div>
            <div style="flex-shrink:0;padding:4px 10px;border:1px solid ${ch.accent}33;border-radius:12px;font-size:10px;color:${ch.accent}99;font-family:'Share Tech Mono',monospace;background:${ch.accent}0a"> ${ec.echoCost}</div>
          </button>
        </div>
        <div style="display:flex;gap:12px;align-items:flex-start">
          <div>
            ${sLabel('STATS', ch.accent)}
            ${_buildRadar(ch.stats, ch.accent)}
          </div>
            <div style="flex:1;min-width:0">
            ${sLabel('시작 유물', ch.accent)}
            <div style="margin-bottom:18px">
              <div class="relic-wrap">
                <div class="relic-inner" style="border:1px solid ${ch.accent}33;background:${ch.accent}08;padding:10px 16px">
                  <span style="font-size:24px">${rel.icon}</span>
                  <div>
                    <div style="font-size:13px;color:${ch.accent};font-family:'Share Tech Mono',monospace;letter-spacing:.5px">${rel.name}</div>
                    <div style="font-size:11px;color:${ch.accent}66;font-family:'Share Tech Mono',monospace">유물</div>
                  </div>
                </div>
                <div class="relic-tooltip" style="border:1px solid ${ch.accent}44; width: 220px; padding: 14px 18px;">
                  <div style="display:flex;align-items:center;gap:8px;margin-bottom:8px">
                    <span style="font-size:18px">${rel.icon}</span>
                    <span style="font-size:13px;color:${ch.accent};font-family:'Share Tech Mono',monospace">${rel.name}</span>
                  </div>
                  <div style="font-size:11px;color:#888;line-height:1.6;margin-bottom:10px">${rel.desc}</div>
                  <div class="tip-arrow" style="border-top:7px solid ${ch.accent}44"></div>
                </div>
              </div>
            </div>
            ${sLabel('시작 덱', ch.accent)}
            <div style="display:flex;flex-wrap:wrap;gap:6px">${ch.startDeck.map(cId => {
        const card = CARDS[cId] || { name: cId };
        return `<span class="deck-card" data-cid="${cId}" style="border:1px solid ${ch.accent}1a;padding:4px 10px;font-size:11px;background:${ch.accent}05;cursor:help">${card.name}</span>`;
      }).join('')}</div>
          </div>
        </div>`;

      // 에코 배지 이벤트
      const eb = $('echoBadge');
      if (eb) {
        eb.addEventListener('mouseenter', () => { SFX.hover(); eb.style.borderColor = `${ch.accent}aa`; eb.style.background = `linear-gradient(135deg,${ch.accent}1e,${ch.color}1a)`; eb.style.boxShadow = `0 0 16px ${ch.accent}33`; });
        eb.addEventListener('mouseleave', () => { eb.style.borderColor = `${ch.accent}44`; eb.style.background = `linear-gradient(135deg,${ch.accent}0e,${ch.color}08)`; eb.style.boxShadow = 'none'; });
        eb.addEventListener('click', () => { SFX.echo(); openModal(ch.echoSkill, ch.accent); });
      }

      // ??? ?????: ??? ??? ???????? TooltipUI ???
      const mockGs = { getBuff: () => null, player: { echoChain: 0 } };
      panel.querySelectorAll('.deck-card').forEach(el => {
        el.addEventListener('mouseenter', (e) => {
          SFX.hover();
          TooltipUI.showTooltip(e, el.dataset.cid, { data: { cards: CARDS }, gs: mockGs });
        });
        el.addEventListener('mouseleave', () => TooltipUI.hideTooltip());
      });
    }



    // ── 도트 네비게이션 렌더 ──────────────────────────
    function renderDots() {
      const ch = chars[S.idx];
      const dotsRow = $('dotsRow');
      if (!dotsRow) return;
      dotsRow.style.width = '100%';
      dotsRow.style.display = 'flex';
      dotsRow.style.justifyContent = 'center';
      dotsRow.style.gap = '7px';
      dotsRow.style.marginTop = '12px';
      dotsRow.innerHTML = chars.map((_, i) =>
        `<button class="dot" data-i="${i}"
          style="width:${i === S.idx ? '24px' : '8px'};background:${i === S.idx ? ch.accent : '#151520'};
          box-shadow:${i === S.idx ? `0 0 12px ${ch.accent}66` : 'none'};cursor:${i === S.idx ? 'default' : 'pointer'}"></button>`
      ).join('');
      dotsRow.querySelectorAll('.dot').forEach(btn => {
        const i = parseInt(btn.dataset.i);
        btn.addEventListener('mouseenter', () => { if (i !== S.idx) btn.style.background = '#3a3a55'; });
        btn.addEventListener('mouseleave', () => { if (i !== S.idx) btn.style.background = '#151520'; });
        btn.addEventListener('click', () => jumpTo(i));
      });
    }

    // ── 버튼 렌더 ─────────────────────────────────────
    function renderButtons() {
      const ch = chars[S.idx];
      buttonsRow.innerHTML = `
        <button id="btnCfm" style="padding:10px 48px;border:1px solid ${ch.accent}55;border-radius:3px;background:linear-gradient(135deg,${ch.color}30,${ch.color}15);color:#fff;font-size:12px;letter-spacing:3px;text-transform:uppercase;font-family:'Cinzel',serif;box-shadow:0 0 22px ${ch.accent}22;transition:all .25s ease">선택 확정 — ${ch.name}</button>`;

      const bf = $('btnCfm');
      bf.addEventListener('mouseenter', () => { SFX.hover(); bf.style.letterSpacing = '5px'; bf.style.boxShadow = `0 0 50px ${ch.accent}44`; bf.style.background = `linear-gradient(135deg,${ch.color}55,${ch.color}2a)`; });
      bf.addEventListener('mouseleave', () => { bf.style.letterSpacing = '3px'; bf.style.boxShadow = `0 0 22px ${ch.accent}22`; bf.style.background = `linear-gradient(135deg,${ch.color}30,${ch.color}15)`; });
      bf.addEventListener('click', handleConfirm);
    }

    // ── 페이즈 오버레이 렌더 ──────────────────────────
    function stopTyping() { if (S.typingTimer) { clearInterval(S.typingTimer); S.typingTimer = null; } }

    function renderPhase() {
      const ch = chars[S.idx];
      const ov = $('phaseOverlay'), ci = $('phaseCircle'), ct = $('phaseContent');
      if (!ov) return;
      ov.className = '';
      if (S.phase === 'select') { ov.style.display = 'none'; return; }
      if (S.phase === 'burst') {
        ov.style.display = 'flex'; ov.className = 'burst';
        ci.style.background = `radial-gradient(circle,${ch.accent}55 0%,${ch.color}22 35%,transparent 60%)`;
        ci.style.width = '0'; ci.style.height = '0'; ct.innerHTML = '';
        setTimeout(() => { ci.style.width = '250vw'; ci.style.height = '250vw'; }, 20);
        return;
      }
      if (S.phase === 'done') {
        ov.style.display = 'flex'; ov.className = 'done';
        ci.style.width = '250vw'; ci.style.height = '250vw';
        ci.style.background = `radial-gradient(circle,${ch.accent}55 0%,${ch.color}22 35%,transparent 60%)`;
        ct.innerHTML = `
          <div style="font-size:clamp(60px,12vw,100px);margin-bottom:15px;filter:drop-shadow(0 0 60px ${ch.glow});animation:float 3s ease-in-out infinite">${ch.emoji}</div>
          <p style="font-size:11px;letter-spacing:8px;color:#889;font-family:'Share Tech Mono',monospace;margin:0 0 8px">YOUR HERO</p>
          <h2 style="font-size:clamp(32px,7vw,58px);font-weight:900;letter-spacing:6px;margin:0 0 6px;text-shadow:0 0 60px ${ch.glow};color:#fff">${ch.name}</h2>
          <p style="font-size:14px;letter-spacing:6px;color:${ch.accent};font-family:'Share Tech Mono',monospace;margin:0 0 8px">${ch.title}</p>
          <p style="font-size:13px;color:#aaa;font-family:'Share Tech Mono',monospace;margin:0 0 20px;letter-spacing:2px">고유 특성 · ${ch.traitName}</p>
          <div id="typedArea" style="font-size:clamp(12px,1.5vw,16px);color:#ddd;line-height:2.1;font-family:'Crimson Pro',serif;letter-spacing:.3px;min-height:7em;margin-bottom:30px;white-space:pre-line"></div>
          <div style="display:flex;gap:10px;justify-content:center;flex-wrap:wrap;margin-bottom:15px">${ch.tags.map(t => `<span style="padding:4px 16px;border:1px solid ${ch.accent}44;border-radius:24px;font-size:12px;color:${ch.accent};font-family:'Share Tech Mono',monospace;background:${ch.accent}0e">${t}</span>`).join('')}</div>
          <p style="font-size:13px;color:#ccc;font-family:'Share Tech Mono',monospace;margin:0 0 30px">시작 유물: ${ch.startRelic.icon} ${ch.startRelic.name}</p>
          <div style="display:flex;gap:20px;justify-content:center;margin-top:15px;">
            <button id="btnResel" style="padding:12px 32px;border:1px solid rgba(255,255,255,0.2);border-radius:4px;background:transparent;color:#99a;font-size:12px;letter-spacing:4px;font-family:'Cinzel',serif;cursor:pointer;transition:all .2s">← 다시 선택</button>
            <button id="btnRealStart" style="padding:12px 48px;border:1px solid ${ch.accent}55;border-radius:4px;background:linear-gradient(135deg,${ch.color}55,${ch.color}22);color:#fff;font-size:14px;letter-spacing:5px;font-family:'Cinzel',serif;cursor:pointer;box-shadow:0 0 30px ${ch.accent}33;transition:all .2s">여정 시작 →</button>
          </div>`;

        stopTyping();
        let i = 0;
        const txt = ch.story;
        S.typingTimer = setInterval(() => {
          const el = $('typedArea');
          if (!el) { stopTyping(); return; }
          i++;
          el.innerHTML = txt.slice(0, i).replace(/\n/g, '<br>') + `<span style="animation:blink 1s step-end infinite;color:${ch.accent}">█</span>`;
          if (i >= txt.length) stopTyping();
        }, 55);

        const rb = $('btnResel');
        if (rb) {
          rb.addEventListener('mouseenter', () => { rb.style.color = '#ccc'; rb.style.borderColor = '#555'; });
          rb.addEventListener('mouseleave', () => { rb.style.color = '#333'; rb.style.borderColor = '#1a1a28'; });
          rb.addEventListener('click', () => { S.phase = 'select'; stopTyping(); renderPhase(); });
        }
        const sb = $('btnRealStart');
        if (sb) {
          sb.addEventListener('mouseenter', () => { sb.style.boxShadow = `0 0 40px ${ch.accent}66`; sb.style.background = `linear-gradient(135deg,${ch.color}77,${ch.color}44)`; });
          sb.addEventListener('mouseleave', () => { sb.style.boxShadow = `0 0 20px ${ch.accent}33`; sb.style.background = `linear-gradient(135deg,${ch.color}55,${ch.color}22)`; });
          sb.addEventListener('click', () => {
            console.log('[CharacterSelectUI] Journey Start clicked:', chars[S.idx]);
            deps.onStart?.(chars[S.idx]);
          });
        }
      }
    }

    // ── 네비게이션 ────────────────────────────────────
    function setVisible(v, dir) {
      const card = $('charCard'), panel = $('infoPanel');
      if (!card || !panel) return;
      if (v) {
        card.style.opacity = '1'; card.style.transform = 'perspective(600px) scale(1)';
        panel.style.opacity = '1'; panel.style.transform = 'translateX(0)';
      } else {
        card.style.opacity = '0'; card.style.transform = `perspective(600px) translateX(${dir === 1 ? '-44px' : '44px'}) scale(.92)`;
        panel.style.opacity = '0'; panel.style.transform = 'translateX(16px)';
      }
    }

    function go(dir) {
      if (S.phase !== 'select') return;
      SFX.nav(); setVisible(false, dir);
      setTimeout(() => {
        S.idx = (S.idx + dir + chars.length) % chars.length;
        updateAll(); setVisible(true);
      }, 250);
    }

    function jumpTo(i) {
      if (i === S.idx || S.phase !== 'select') return;
      SFX.nav(); setVisible(false, 0);
      setTimeout(() => { S.idx = i; updateAll(); setVisible(true); }, 250);
    }



    function handleConfirm() {
      if (S.phase !== 'select') return;
      console.log('[CharacterSelectUI] Character selected:', chars[S.idx]);
      SFX.select(); S.phase = 'burst'; renderPhase();
      setTimeout(() => {
        S.phase = 'done'; renderPhase();
        console.log('[CharacterSelectUI] Firing onConfirm callback');
        deps.onConfirm?.(chars[S.idx]);
      }, 650);
    }

    function updateAll() {
      renderCard(); renderInfoPanel(); renderDots(); renderButtons();
      const bgGradient = $('bgGradient');
      if (bgGradient) bgGradient.style.background = `radial-gradient(ellipse 70% 65% at 50% 50%,${chars[S.idx].glow}10 0%,transparent 70%)`;
      const headerTitle = $('headerTitle');
      if (headerTitle) headerTitle.style.textShadow = `0 0 40px ${chars[S.idx].glow}44`;
      initParticles(chars[S.idx].particle, chars[S.idx].accent);
      updateArrows();
    }

    function updateArrows() {
      const ac = chars[S.idx].accent;
      ['btnLeft', 'btnRight'].forEach(id => {
        const b = $(id);
        if (!b) return;
        b.style.border = `1px solid ${ac}44`; b.style.background = `${ac}08`;
        b.style.boxShadow = `0 0 16px ${ac}22`; b.style.color = ac;
      });
    }

    // ── 카드 틸트 & 포일 ──────────────────────────────
    function initCardFX() {
      const card = $('charCard');
      if (!card) return;
      card.addEventListener('mousemove', e => {
        const r = card.getBoundingClientRect();
        const x = ((e.clientX - r.left) / r.width) * 100, y = ((e.clientY - r.top) / r.height) * 100;
        const angle = Math.atan2(e.clientY - (r.top + r.height / 2), e.clientX - (r.left + r.width / 2)) * 180 / Math.PI;
        card.style.transform = `perspective(600px) rotateX(${((e.clientY - r.top - r.height / 2) / (r.height / 2)) * -10}deg) rotateY(${((e.clientX - r.left - r.width / 2) / (r.width / 2)) * 10}deg)`;
        const cardFoil = $('cardFoil');
        if (cardFoil) cardFoil.style.background = `conic-gradient(from ${angle}deg at ${x}% ${y}%,#ff000015,#ff7f0015,#ffff0015,#00ff0015,#0000ff15,#8b00ff15,#ff007f15,#ff000015)`;
      });
      card.addEventListener('mouseleave', () => {
        card.style.transform = 'perspective(600px) rotateX(0) rotateY(0)';
        const cardFoil = $('cardFoil');
        if (cardFoil) cardFoil.style.background = 'none';
      });
    }

    // ── 드래그 & 스와이프 ─────────────────────────────
    let dragX = null, touchX = null;
    function initDrag() {
      doc.addEventListener('mousedown', e => { if (!$('skillModal')?.classList.contains('open')) dragX = e.clientX; });
      doc.addEventListener('mouseup', e => {
        if (dragX === null) return; const dx = e.clientX - dragX; dragX = null;
        if (Math.abs(dx) > 80) go(dx < 0 ? 1 : -1);
      });
      doc.addEventListener('touchstart', e => { touchX = e.touches[0].clientX; }, { passive: true });
      doc.addEventListener('touchend', e => {
        if (touchX === null) return; const dx = e.changedTouches[0].clientX - touchX; touchX = null;
        if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1);
      });
    }

    // ── 키보드 ────────────────────────────────────────
    function onKeyDown(e) {
      if (e.key === 'ArrowLeft') go(-1);
      else if (e.key === 'ArrowRight') go(1);
      else if (e.key === 'Enter' && S.phase === 'select' && !S.activeSkill) handleConfirm();
    }
    doc.addEventListener('keydown', onKeyDown);

    function initArrows() {
      const setup = (id, dir) => {
        const b = $(id);
        if (!b) return;
        b.addEventListener('click', () => go(dir));
        b.addEventListener('mouseenter', () => { SFX.hover(); const ac = chars[S.idx].accent; b.style.background = `${ac}22`; b.style.transform = 'scale(1.1)'; b.style.boxShadow = `0 0 30px ${ac}55`; });
        b.addEventListener('mouseleave', () => { const ac = chars[S.idx].accent; b.style.background = `${ac}08`; b.style.transform = 'scale(1)'; b.style.boxShadow = `0 0 16px ${ac}22`; });
      };
      setup('btnLeft', -1);
      setup('btnRight', 1);
    }

    updateAll();
    initCardFX();
    initDrag();
    initArrows();
    setTimeout(() => doc.querySelectorAll('.intro').forEach(el => el.classList.add('mounted')), 80);

    return {
      destroy() {
        doc.removeEventListener('keydown', onKeyDown);
        stopTyping();
        cancelAnimationFrame(pRaf);
      }
    };
  }
};
