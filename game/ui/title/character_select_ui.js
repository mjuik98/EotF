import { CARDS } from '../../../data/cards.js';
import { ClassProgressionSystem } from '../../systems/class_progression_system.js';
import { TooltipUI } from '../cards/tooltip_ui.js';
import { createCharacterSelectSfx } from './character_select_audio.js';
import { setupCharacterSelectBindings } from './character_select_bindings.js';
import { CHARACTER_SELECT_CHARS } from './character_select_catalog.js';
import {
  renderCharacterInfoPanel,
  renderCharacterPhase,
} from './character_select_panels.js';
import {
  renderCharacterButtons,
  renderCharacterDots,
  updateCharacterArrows,
} from './character_select_render.js';
import { buildCharacterRadar } from './character_select_radar.js';
import { LevelUpPopupUI } from './level_up_popup_ui.js';
import { RunEndScreenUI } from './run_end_screen_ui.js';

function getDoc(deps) {
  return deps?.doc || document;
}

const CHARS = CHARACTER_SELECT_CHARS;

function hexToRgbChannels(hex) {
  return [1, 3, 5].map((index) => parseInt(hex.slice(index, index + 2), 16)).join(',');
}

class Particle {
  constructor(type, accent, width, height) {
    this.type = type;
    this.accent = accent;
    this.width = width;
    this.height = height;
    this.reset();
  }

  reset() {
    const { type, width, height } = this;
    this.life = 0.6 + Math.random() * 0.4;
    this.decay = 0.004 + Math.random() * 0.005;

    if (type === 'ember') {
      this.x = width * 0.2 + Math.random() * width * 0.6;
      this.y = height + 5;
      this.vx = (Math.random() - 0.5) * 1.8;
      this.vy = -(Math.random() * 2.5 + 1);
      this.s = Math.random() * 3 + 1;
      return;
    }

    if (type === 'orb') {
      const maxOrbit = Math.min(width, height);
      this.angle = Math.random() * Math.PI * 2;
      this.r = maxOrbit * (0.18 + Math.random() * 0.32);
      this.speed = (Math.random() * 0.005 + 0.0025) * (Math.random() > 0.5 ? 1 : -1);
      this.s = Math.random() * 3 + 1.2;
      this.x = width / 2 + Math.cos(this.angle) * this.r;
      this.y = height / 2 + Math.sin(this.angle) * this.r;
      return;
    }

    if (type === 'rage') {
      this.x = width * 0.06 + Math.random() * width * 0.88;
      this.y = height * 0.2 + Math.random() * height * 0.72;
      this.vx = (Math.random() - 0.5) * 1.5;
      this.vy = -(Math.random() * 1.8 + 0.6);
      this.s = Math.random() * 3.2 + 1.4;
      this.len = Math.random() * 14 + 8;
      this.rot = (Math.random() - 0.5) * 1.6;
      this.decay = 0.0028 + Math.random() * 0.0038;
      return;
    }

    if (type === 'smoke') {
      this.x = width * 0.12 + Math.random() * width * 0.76;
      this.y = height * 0.55 + Math.random() * height * 0.4;
      this.vx = (Math.random() - 0.5) * 0.45;
      this.vy = -(Math.random() * 0.7 + 0.15);
      this.s = Math.random() * 8 + 6;
      this.decay = 0.0025 + Math.random() * 0.0035;
      return;
    }

    if (type === 'aegis') {
      const maxOrbit = Math.min(width, height);
      this.angle = Math.random() * Math.PI * 2;
      this.r = maxOrbit * (0.18 + Math.random() * 0.44);
      this.speed = (Math.random() * 0.0032 + 0.0012) * (Math.random() > 0.5 ? 1 : -1);
      this.s = Math.random() * 2.8 + 2.4;
      this.pulse = Math.random() * Math.PI * 2;
      this.rot = Math.random() * Math.PI * 2;
      this.decay = 0.0024 + Math.random() * 0.003;
      this.x = width / 2 + Math.cos(this.angle) * this.r;
      this.y = height / 2 + Math.sin(this.angle) * this.r;
      return;
    }

    this.x = Math.random() * width;
    this.y = Math.random() * height;
    this.vx = (Math.random() - 0.5) * 0.4;
    this.vy = -(Math.random() * 0.6 + 0.1);
    this.s = Math.random() * 2.5 + 0.5;
    this.pulse = Math.random() * Math.PI * 2;
  }

  update() {
    this.life -= this.decay;

    if (this.type === 'orb') {
      this.angle += this.speed;
      this.x = this.width / 2 + Math.cos(this.angle) * this.r;
      this.y = this.height / 2 + Math.sin(this.angle) * this.r;
    } else if (this.type === 'rage') {
      this.x += this.vx;
      this.y += this.vy;
      this.vx += (Math.random() - 0.5) * 0.03;
      this.vx *= 0.985;
      this.vy += 0.02;
      this.len *= 0.996;
      this.rot += (Math.random() - 0.5) * 0.06;
    } else if (this.type === 'smoke') {
      this.x += this.vx;
      this.y += this.vy;
      this.s += 0.04;
    } else if (this.type === 'aegis') {
      this.angle += this.speed;
      this.pulse += 0.06;
      this.rot += this.speed * 2.2;
      const radius = this.r * (1 + 0.08 * Math.sin(this.pulse));
      this.x = this.width / 2 + Math.cos(this.angle) * radius;
      this.y = this.height / 2 + Math.sin(this.angle) * radius;
    } else if (this.type === 'holy') {
      this.pulse += 0.05;
      this.x += this.vx;
      this.y += this.vy;
    } else {
      this.x += this.vx;
      this.y += this.vy;
    }

    if (this.life <= 0) this.reset();
  }

  draw(ctx) {
    const rgb = hexToRgbChannels(this.accent);
    const alpha = Math.max(0, this.life);
    ctx.save();

    if (this.type === 'smoke') {
      const gradient = ctx.createRadialGradient(this.x, this.y, 0, this.x, this.y, this.s);
      gradient.addColorStop(0, `rgba(${rgb},${alpha * 0.34})`);
      gradient.addColorStop(0.7, `rgba(${rgb},${alpha * 0.15})`);
      gradient.addColorStop(1, `rgba(${rgb},0)`);
      ctx.shadowBlur = 14;
      ctx.shadowColor = `rgba(${rgb},${alpha * 0.16})`;
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.s, 0, Math.PI * 2);
      ctx.fill();
    } else if (this.type === 'rage') {
      ctx.translate(this.x, this.y);
      ctx.rotate(this.rot);
      const len = Math.max(3, this.len);
      const gradient = ctx.createLinearGradient(-len * 0.5, 0, len * 0.55, 0);
      gradient.addColorStop(0, `rgba(${rgb},0)`);
      gradient.addColorStop(0.45, `rgba(${rgb},${alpha * 0.25})`);
      gradient.addColorStop(1, `rgba(${rgb},${alpha * 0.9})`);
      ctx.strokeStyle = gradient;
      ctx.lineWidth = this.s;
      ctx.lineCap = 'round';
      ctx.shadowBlur = 18;
      ctx.shadowColor = `rgba(${rgb},${alpha * 0.82})`;
      ctx.beginPath();
      ctx.moveTo(-len * 0.5, 0);
      ctx.lineTo(len * 0.55, 0);
      ctx.stroke();

      const cross = ctx.createLinearGradient(-len * 0.22, this.s * 0.35, len * 0.35, -this.s * 0.28);
      cross.addColorStop(0, `rgba(${rgb},0)`);
      cross.addColorStop(1, `rgba(${rgb},${alpha * 0.6})`);
      ctx.strokeStyle = cross;
      ctx.lineWidth = Math.max(0.9, this.s * 0.45);
      ctx.beginPath();
      ctx.moveTo(-len * 0.22, this.s * 0.35);
      ctx.lineTo(len * 0.35, -this.s * 0.28);
      ctx.stroke();

      ctx.fillStyle = `rgba(${rgb},${alpha * 0.88})`;
      ctx.beginPath();
      ctx.arc(len * 0.58, 0, this.s * 0.48, 0, Math.PI * 2);
      ctx.fill();
    } else if (this.type === 'aegis') {
      ctx.translate(this.x, this.y);
      ctx.rotate(this.rot);
      const size = this.s * (1 + 0.28 * Math.sin(this.pulse));
      ctx.shadowBlur = 14;
      ctx.shadowColor = `rgba(${rgb},${alpha * 0.55})`;
      ctx.fillStyle = `rgba(${rgb},${alpha * 0.16})`;
      ctx.beginPath();
      ctx.moveTo(0, -size);
      ctx.lineTo(size, 0);
      ctx.lineTo(0, size);
      ctx.lineTo(-size, 0);
      ctx.closePath();
      ctx.fill();

      ctx.strokeStyle = `rgba(${rgb},${alpha * 0.88})`;
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.moveTo(0, -size);
      ctx.lineTo(size, 0);
      ctx.lineTo(0, size);
      ctx.lineTo(-size, 0);
      ctx.closePath();
      ctx.stroke();

      ctx.strokeStyle = `rgba(${rgb},${alpha * 0.46})`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(0, 0, size * (1.85 + 0.16 * Math.sin(this.pulse * 1.3)), 0, Math.PI * 2);
      ctx.stroke();
      ctx.strokeStyle = `rgba(${rgb},${alpha * 0.26})`;
      ctx.lineWidth = 0.7;
      ctx.beginPath();
      ctx.arc(0, 0, size * 2.35, 0, Math.PI * 2);
      ctx.stroke();
      ctx.strokeStyle = `rgba(${rgb},${alpha * 0.38})`;
      ctx.lineWidth = 0.9;
      ctx.beginPath();
      ctx.moveTo(-size * 1.2, 0);
      ctx.lineTo(size * 1.2, 0);
      ctx.moveTo(0, -size * 1.2);
      ctx.lineTo(0, size * 1.2);
      ctx.stroke();
    } else if (this.type === 'holy') {
      const size = this.s * (1 + 0.3 * Math.sin(this.pulse));
      ctx.shadowBlur = 12;
      ctx.shadowColor = `rgba(${rgb},.9)`;
      ctx.fillStyle = `rgba(${rgb},${alpha * 0.95})`;
      ctx.beginPath();
      ctx.arc(this.x, this.y, size, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = `rgba(${rgb},${alpha * 0.3})`;
      ctx.lineWidth = 0.5;
      ctx.beginPath();
      ctx.moveTo(this.x - size * 3, this.y);
      ctx.lineTo(this.x + size * 3, this.y);
      ctx.moveTo(this.x, this.y - size * 3);
      ctx.lineTo(this.x, this.y + size * 3);
      ctx.stroke();
    } else {
      ctx.shadowBlur = 10;
      ctx.shadowColor = `rgba(${rgb},.8)`;
      ctx.fillStyle = `rgba(${rgb},${alpha * 0.88})`;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.s, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }
}

export const CharacterSelectUI = {
  CHARS,
  _runtime: null,

  onEnter() {
    this._runtime?.onEnter?.();
  },

  showPendingSummaries() {
    this._runtime?.showPendingSummaries?.();
  },

  mount(deps = {}) {
    const owner = this;
    const doc = getDoc(deps);
    const win = deps?.win || globalThis.window || globalThis;
    const state = { idx: 0, phase: 'select', activeSkill: null, typingTimer: null };
    const chars = CHARS;
    const classIds = chars.map((ch) => ch.class);
    const levelUpPopup = new LevelUpPopupUI();
    const runEndScreen = new RunEndScreenUI();
    let isReplayingSummary = false;
    let particles = [];
    let particleRaf = null;

    ClassProgressionSystem.ensureMeta(deps?.gs?.meta, classIds);

    function getById(id) {
      return doc.getElementById(id);
    }

    function buildSectionLabel(text, accent) {
      return `<span class="s-label" style="border-left:2px solid ${accent}44">${text}</span>`;
    }

    function getClassProgress(classId) {
      const fallback = {
        classId,
        level: 1,
        totalXp: 0,
        currentLevelXp: 0,
        nextLevelXp: 100,
        progress: 0,
      };
      if (!deps?.gs?.meta || !classId) return fallback;
      return ClassProgressionSystem.getClassState(deps.gs.meta, classId, classIds) || fallback;
    }

    function saveProgressMeta() {
      if (typeof deps.onProgressConsumed === 'function') deps.onProgressConsumed();
    }

    function resolveClass(classId) {
      return chars.find((entry) => entry.class === classId) || chars[state.idx] || chars[0];
    }

    function ensureCardProgressNodes(card) {
      let badge = card.querySelector('#cardLevelBadge');
      if (!badge) {
        badge = doc.createElement('div');
        badge.id = 'cardLevelBadge';
        badge.innerHTML = '<div class="csm-card-level"></div>';
        card.appendChild(badge);
      }

      let xpWrap = card.querySelector('#cardXpBarWrap');
      if (!xpWrap) {
        xpWrap = doc.createElement('div');
        xpWrap.id = 'cardXpBarWrap';
        xpWrap.innerHTML = `
          <div class="csm-card-xp-track"><div class="csm-card-xp-fill"></div></div>
          <div class="csm-card-xp-text"></div>
        `;
        card.appendChild(xpWrap);
      }

      return {
        badge: badge.querySelector('.csm-card-level'),
        xpFill: xpWrap.querySelector('.csm-card-xp-fill'),
        xpText: xpWrap.querySelector('.csm-card-xp-text'),
      };
    }

    function updateAll() {
      ClassProgressionSystem.ensureMeta(deps?.gs?.meta, classIds);
      renderCard();
      renderInfoPanel();
      renderDots();
      renderButtons();
      const bgGradient = getById('bgGradient');
      if (bgGradient) {
        bgGradient.style.background = `radial-gradient(ellipse 70% 65% at 50% 50%,${chars[state.idx].glow}10 0%,transparent 70%)`;
      }
      const headerTitle = getById('headerTitle');
      if (headerTitle) headerTitle.style.textShadow = `0 0 40px ${chars[state.idx].glow}44`;
      initParticles(chars[state.idx].particle, chars[state.idx].accent);
      updateArrows();
    }

    function finishSummaryReplay() {
      isReplayingSummary = false;
      saveProgressMeta();
      updateAll();
      setTimeout(() => consumePendingSummaries(), 10);
    }

    function showLevelUpChain(summary, index = 0) {
      const levelUps = Array.isArray(summary?.levelUps) ? summary.levelUps : [];
      if (index >= levelUps.length) {
        finishSummaryReplay();
        return;
      }

      const ch = resolveClass(summary.classId);
      const level = levelUps[index];
      const roadmap = ClassProgressionSystem.getRoadmap(summary.classId);
      const roadmapEntry = roadmap.find((row) => row.lv === level);
      const bonusText = roadmapEntry?.desc || '?대옒??蹂대꼫?ㅺ? 媛뺥솕?섏뿀?듬땲??';

      levelUpPopup.onClose = () => showLevelUpChain(summary, index + 1);
      levelUpPopup.show({
        classTitle: ch?.title || ch?.name || 'CLASS',
        newLevel: level,
        bonusText,
        accent: ch?.accent || '#8b6dff',
      });
    }

    function playRunSummary(summary) {
      const ch = resolveClass(summary?.classId);
      isReplayingSummary = true;
      runEndScreen.onClose = () => {
        if (Array.isArray(summary?.levelUps) && summary.levelUps.length > 0) {
          showLevelUpChain(summary, 0);
          return;
        }
        finishSummaryReplay();
      };
      runEndScreen.show(summary, {
        title: ch?.title,
        name: ch?.name,
        accent: ch?.accent,
      });
    }

    function consumePendingSummaries() {
      if (isReplayingSummary) return;
      const next = ClassProgressionSystem.consumePendingSummary(deps?.gs?.meta, classIds);
      if (!next) return;
      saveProgressMeta();
      playRunSummary(next);
    }

    function initParticles(type, accent) {
      cancelAnimationFrame(particleRaf);
      const canvas = doc.getElementById('particleCanvas');
      if (!canvas) return;
      const width = Math.max(1, Math.floor(canvas.clientWidth || canvas.width));
      const height = Math.max(1, Math.floor(canvas.clientHeight || canvas.height));
      if (canvas.width !== width) canvas.width = width;
      if (canvas.height !== height) canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const count = type === 'rage' ? 84 : (type === 'aegis' ? 52 : 40);
      particles = Array.from({ length: count }, () => new Particle(type, accent, width, height));

      const loop = () => {
        ctx.clearRect(0, 0, width, height);
        ctx.globalCompositeOperation = (type === 'rage' || type === 'aegis') ? 'lighter' : 'source-over';
        particles.forEach((particle) => {
          particle.update();
          particle.draw(ctx);
        });
        ctx.globalCompositeOperation = 'source-over';
        particleRaf = requestAnimationFrame(loop);
      };

      loop();
    }

    const sfx = createCharacterSelectSfx(deps);

    function openModal(skill, accent) {
      state.activeSkill = skill;
      const isEcho = !!skill.echoCost;
      const tiers = skill.tree.map((tier, index) => `
        <div style="padding:16px 20px;border:1px solid ${index === 0 ? `${accent}55` : `${accent}1a`};border-radius:10px;background:${index === 0 ? `${accent}0f` : 'transparent'};display:flex;align-items:flex-start;gap:16px;animation:fadeInUp .3s ease ${index * 0.07}s both">
          <div style="width:28px;height:28px;flex-shrink:0;border-radius:50%;border:2px solid ${index === 0 ? accent : `${accent}44`};display:flex;align-items:center;justify-content:center;font-size:12px;color:${index === 0 ? accent : `${accent}55`};font-family:'Share Tech Mono',monospace;font-weight:bold">${tier.tier}</div>
          <div>
            <div style="display:flex;align-items:center;gap:10px;margin-bottom:6px;flex-wrap:wrap">
              <span style="font-size:15px;color:${index === 0 ? '#fff' : '#555'};letter-spacing:1px">${tier.name}</span>
              <span style="padding:2px 10px;border-radius:12px;font-size:11px;background:${accent}1a;color:${accent};font-family:'Share Tech Mono',monospace;border:1px solid ${accent}33">${tier.bonus}</span>
            </div>
            <p style="font-size:13px;color:${index === 0 ? '#aaa' : '#3a3a50'};margin:0;line-height:1.6">${tier.desc}</p>
          </div>
        </div>
      `).join('');

      const modalBox = getById('modalBox');
      if (!modalBox) return;
      modalBox.style.border = `1px solid ${accent}33`;
      modalBox.style.boxShadow = `0 0 80px ${accent}22,0 30px 80px rgba(0,0,0,.8)`;
      modalBox.innerHTML = `
        <div style="display:flex;align-items:center;gap:16px;margin-bottom:24px">
          <span style="font-size:32px">${skill.icon}</span>
          <div>
            <p style="font-size:10px;letter-spacing:5px;color:#444;font-family:'Share Tech Mono',monospace;margin:0">${isEcho ? 'ECHO SKILL TREE' : 'SKILL TREE'}</p>
            <h3 style="font-size:20px;color:#fff;margin:0;letter-spacing:1.5px">${skill.name}</h3>
            ${isEcho ? `<span style="font-size:10px;color:${accent};font-family:'Share Tech Mono',monospace">${skill.echoCost}</span>` : ''}
          </div>
          <button id="modalClose" style="margin-left:auto;background:none;border:none;color:#555;font-size:24px;cursor:pointer">x</button>
        </div>
        <div style="display:flex;flex-direction:column;gap:12px">${tiers}</div>
        <p style="font-size:11px;color:#222;text-align:center;font-family:'Share Tech Mono',monospace;margin:20px 0 0">ESC to close</p>
      `;

      const modal = getById('skillModal');
      if (!modal) return;
      modal.classList.add('open');
      getById('modalClose')?.addEventListener('click', closeModal);
      modal.addEventListener('click', (event) => {
        if (event.target === modal) closeModal();
      }, { once: true });
    }

    function closeModal() {
      state.activeSkill = null;
      getById('skillModal')?.classList.remove('open');
    }

    function renderCard() {
      const ch = chars[state.idx];
      const card = getById('charCard');
      if (!card) return;
      const progress = getClassProgress(ch.class);
      const isMax = progress.level >= ClassProgressionSystem.MAX_LEVEL;

      card.classList.toggle('csm-max', isMax);
      card.style.border = isMax ? `1.6px solid ${ch.accent}aa` : `1px solid ${ch.accent}44`;
      card.style.background = isMax
        ? `linear-gradient(158deg,${ch.color}2d 0%,#080610 48%,${ch.color}18 100%)`
        : `linear-gradient(158deg,${ch.color}18 0%,#060610 50%,${ch.color}08 100%)`;
      card.style.boxShadow = isMax
        ? `0 0 80px ${ch.glow}44,inset 0 1px 0 ${ch.accent}33`
        : `0 0 65px ${ch.glow}22,inset 0 1px 0 ${ch.accent}18`;

      const cardTitle = getById('cardTitle');
      if (cardTitle) {
        cardTitle.style.color = ch.accent;
        cardTitle.textContent = ch.title;
      }
      const cardEmoji = getById('cardEmoji');
      if (cardEmoji) {
        cardEmoji.textContent = ch.emoji;
        cardEmoji.style.filter = `drop-shadow(0 0 28px ${ch.glow})`;
      }
      const cardName = getById('cardName');
      if (cardName) {
        cardName.textContent = ch.name;
        cardName.style.textShadow = `0 0 20px ${ch.glow}`;
      }
      const cardDiff = getById('cardDiff');
      if (cardDiff) cardDiff.textContent = ch.difficulty;
      const cardTraitBadge = getById('cardTraitBadge');
      if (cardTraitBadge) {
        cardTraitBadge.textContent = `??${ch.traitName}`;
        cardTraitBadge.style.cssText += `;border:1px solid ${ch.accent}33;color:${ch.accent};background:${ch.accent}0a;`;
      }
      const cardTags = getById('cardTags');
      if (cardTags) {
        cardTags.innerHTML = ch.tags.map((tag) => (
          `<span style="padding:4px 10px;border:1px solid ${ch.accent}22;border-radius:12px;font-size:11px;color:${ch.accent}aa;font-family:'Share Tech Mono',monospace;background:${ch.accent}07">${tag}</span>`
        )).join('');
      }
      const cardBottomGrad = getById('cardBottomGrad');
      if (cardBottomGrad) cardBottomGrad.style.background = `linear-gradient(to top,${ch.color}44,transparent)`;
      const cardShimmer = getById('cardShimmer');
      if (cardShimmer) cardShimmer.style.background = `linear-gradient(105deg,transparent 40%,${ch.accent}07 50%,transparent 60%)`;

      const progressNodes = ensureCardProgressNodes(card);
      if (progressNodes.badge) {
        progressNodes.badge.textContent = isMax ? 'MAX' : `Lv.${progress.level}`;
        progressNodes.badge.style.color = ch.accent;
        progressNodes.badge.style.borderColor = `${ch.accent}${isMax ? 'bb' : '66'}`;
        progressNodes.badge.style.background = isMax ? `${ch.accent}26` : `${ch.accent}14`;
      }
      if (progressNodes.xpFill) {
        progressNodes.xpFill.style.width = `${Math.round(progress.progress * 100)}%`;
        progressNodes.xpFill.style.background = ch.accent;
        progressNodes.xpFill.style.boxShadow = `0 0 8px ${ch.accent}88`;
      }
      if (progressNodes.xpText) {
        progressNodes.xpText.textContent = progress.nextLevelXp === null
          ? `MAX LEVEL 쨌 ${progress.totalXp} XP`
          : `${progress.totalXp} / ${progress.nextLevelXp} XP`;
      }

      card.querySelectorAll('.card-corner').forEach((corner) => corner.remove());
      [['top', 'left'], ['top', 'right'], ['bottom', 'left'], ['bottom', 'right']].forEach(([vertical, horizontal]) => {
        const corner = doc.createElement('div');
        corner.className = 'card-corner';
        corner.style[vertical] = '9px';
        corner.style[horizontal] = '9px';
        corner.style[`border${vertical[0].toUpperCase() + vertical.slice(1)}`] = `1px solid ${ch.accent}77`;
        corner.style[`border${horizontal[0].toUpperCase() + horizontal.slice(1)}`] = `1px solid ${ch.accent}77`;
        card.appendChild(corner);
      });
    }

    function renderInfoPanel() {
      const ch = chars[state.idx];
      renderCharacterInfoPanel({
        panel: getById('infoPanel'),
        selectedChar: ch,
        classProgress: getClassProgress(ch.class),
        roadmap: ClassProgressionSystem.getRoadmap(ch.class),
        buildSectionLabel,
        buildRadar: buildCharacterRadar,
        cards: CARDS,
        generalTooltipUI: TooltipUI,
        cardTooltipUI: TooltipUI,
        doc,
        win,
        hover: () => sfx.hover(),
        echo: () => sfx.echo(),
        openModal,
      });
    }

    function renderDots() {
      renderCharacterDots(getById('dotsRow'), chars, state.idx, jumpTo);
    }

    function renderButtons() {
      renderCharacterButtons(getById('buttonsRow'), chars[state.idx], () => sfx.hover(), handleConfirm);
    }

    function stopTyping() {
      if (!state.typingTimer) return;
      clearInterval(state.typingTimer);
      state.typingTimer = null;
    }

    function renderPhase() {
      renderCharacterPhase({
        state,
        selectedChar: chars[state.idx],
        resolveById: getById,
        stopTyping,
        rerender: renderPhase,
        onStart: () => {
          console.log('[CharacterSelectUI] Journey Start clicked:', chars[state.idx]);
          deps.onStart?.(chars[state.idx]);
        },
      });
    }

    function setVisible(isVisible, dir) {
      const card = getById('charCard');
      const panel = getById('infoPanel');
      if (!card || !panel) return;
      if (isVisible) {
        card.style.opacity = '1';
        card.style.transform = 'perspective(600px) scale(1)';
        panel.style.opacity = '1';
        panel.style.transform = 'translateX(0)';
        return;
      }
      card.style.opacity = '0';
      card.style.transform = `perspective(600px) translateX(${dir === 1 ? '-44px' : '44px'}) scale(.92)`;
      panel.style.opacity = '0';
      panel.style.transform = 'translateX(16px)';
    }

    function go(dir) {
      if (state.phase !== 'select') return;
      sfx.nav();
      setVisible(false, dir);
      setTimeout(() => {
        state.idx = (state.idx + dir + chars.length) % chars.length;
        updateAll();
        setVisible(true);
      }, 250);
    }

    function jumpTo(index) {
      if (index === state.idx || state.phase !== 'select') return;
      sfx.nav();
      setVisible(false, 0);
      setTimeout(() => {
        state.idx = index;
        updateAll();
        setVisible(true);
      }, 250);
    }

    function handleConfirm() {
      if (state.phase !== 'select') return;
      console.log('[CharacterSelectUI] Character selected:', chars[state.idx]);
      sfx.select();
      state.phase = 'burst';
      renderPhase();
      setTimeout(() => {
        state.phase = 'done';
        renderPhase();
        console.log('[CharacterSelectUI] Firing onConfirm callback');
        deps.onConfirm?.(chars[state.idx]);
      }, 650);
    }

    function updateArrows() {
      updateCharacterArrows(getById, chars[state.idx].accent);
    }

    function initCardFX() {
      const card = getById('charCard');
      if (!card) return;
      card.addEventListener('mousemove', (event) => {
        const rect = card.getBoundingClientRect();
        const x = ((event.clientX - rect.left) / rect.width) * 100;
        const y = ((event.clientY - rect.top) / rect.height) * 100;
        const angle = Math.atan2(
          event.clientY - (rect.top + rect.height / 2),
          event.clientX - (rect.left + rect.width / 2),
        ) * 180 / Math.PI;
        card.style.transform = `perspective(600px) rotateX(${((event.clientY - rect.top - rect.height / 2) / (rect.height / 2)) * -10}deg) rotateY(${((event.clientX - rect.left - rect.width / 2) / (rect.width / 2)) * 10}deg)`;
        const foil = getById('cardFoil');
        if (foil) {
          foil.style.background = `conic-gradient(from ${angle}deg at ${x}% ${y}%,#ff000015,#ff7f0015,#ffff0015,#00ff0015,#0000ff15,#8b00ff15,#ff007f15,#ff000015)`;
        }
      });
      card.addEventListener('mouseleave', () => {
        card.style.transform = 'perspective(600px) rotateX(0) rotateY(0)';
        const foil = getById('cardFoil');
        if (foil) foil.style.background = 'none';
      });
    }

    const cleanupBindings = setupCharacterSelectBindings({
      doc,
      resolveById: getById,
      isModalOpen: () => getById('skillModal')?.classList.contains('open'),
      state,
      closeModal,
      stopTyping,
      renderPhase,
      onBack: deps.onBack,
      go,
      handleConfirm,
      hover: () => sfx.hover(),
      getAccent: () => chars[state.idx].accent,
    });

    updateAll();
    initCardFX();
    setTimeout(() => doc.querySelectorAll('.intro').forEach((element) => element.classList.add('mounted')), 80);
    owner._runtime = {
      onEnter() {
        updateAll();
      },
      showPendingSummaries() {
        consumePendingSummaries();
      },
    };

    return {
      destroy() {
        owner._runtime = null;
        cleanupBindings();
        stopTyping();
        cancelAnimationFrame(particleRaf);
        levelUpPopup.destroy();
        runEndScreen.destroy();
      },
    };
  },
};
