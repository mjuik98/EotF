/**
 * button_feedback.js
 * 
 * 버튼 클릭에 대한 시각적 피드백을 통합 관리하는 모듈
 * - Bounce 애니메이션
 * - Ripple 효과
 * - DOM 파티클 (황금빛 파편 + 흰색 섬광)
 * 
 * @module ButtonFeedback
 */

/**
 * 버튼에서 DOM 파티클을 생성하여 터짐 효과를 연출
 * @param {number} cx - 파티클 생성 중심점 X 좌표 (viewport 기준)
 * @param {number} cy - 파티클 생성 중심점 Y 좌표 (viewport 기준)
 * @param {Document} doc - document 객체
 */
function spawnDomBurst(cx, cy, doc, mainColor = '#f0b429') {
  const PARTICLES = [
    ...Array.from({ length: 16 }, () => ({ color: mainColor, size: 5 })),
    ...Array.from({ length: 8 }, () => ({ color: '#ffffff', size: 3 })),
  ];

  PARTICLES.forEach(({ color, size }) => {
    const el = doc.createElement('div');
    const angle = Math.random() * Math.PI * 2;
    const dist = 40 + Math.random() * 60;
    const tx = Math.cos(angle) * dist;
    const ty = Math.sin(angle) * dist;
    const dur = 400 + Math.random() * 300;

    el.style.cssText = `
        position: fixed;
        left: ${cx}px;
        top: ${cy}px;
        width: ${size}px;
        height: ${size}px;
        border-radius: 50%;
        background: ${color};
        box-shadow: 0 0 ${size * 2}px ${color};
        pointer-events: none;
        z-index: 9999;
        transform: translate(-50%, -50%);
        transition: transform ${dur}ms cubic-bezier(0.25, 0.46, 0.45, 0.94),
                    opacity ${dur}ms ease-out;
    `;

    doc.body.appendChild(el);

    requestAnimationFrame(() => {
      el.style.transform = `translate(calc(-50% + ${tx}px), calc(-50% + ${ty}px))`;
      el.style.opacity = '0';
    });

    setTimeout(() => el.remove(), dur + 50);
  });
}

export const ButtonFeedback = {
  /**
   * 버튼에 클릭 효과 적용 (Bounce + Ripple + Particle)
   * @param {string|HTMLElement} btnOrId - 버튼 요소 또는 ID
   * @param {Object} options - 옵션
   * @param {Document} options.doc - document 객체
   */
  triggerEffect(btnOrId, options = {}) {
    const doc = options.doc || document;
    const btn = typeof btnOrId === 'string' ? doc.getElementById(btnOrId) : btnOrId;
    if (!btn) return;
    const mainColor = options.color || '#f0b429';

    // 1. Bounce
    btn.classList.remove('clicked');
    void btn.offsetWidth; // Trigger reflow
    btn.classList.add('clicked');
    setTimeout(() => btn.classList.remove('clicked'), 300);

    // 2. Ripple
    const ripple = doc.createElement('div');
    ripple.className = 'btn-ripple';
    btn.appendChild(ripple);
    setTimeout(() => ripple.remove(), 500);

    // 3. DOM Particle
    const rect = btn.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    spawnDomBurst(cx, cy, doc, mainColor);
  },

  /**
   * 카드 드로우 버튼 전용 효과
   * @param {Document} doc - document 객체
   */
  triggerDrawButton(doc = document) {
    this.triggerEffect('combatDrawCardBtn', { doc });
  },

  /**
   * Echo 스킬 버튼 전용 효과
   * @param {Document} doc - document 객체
   */
  triggerEchoButton(doc = document) {
    this.triggerEffect('useEchoSkillBtn', { doc, color: '#00ffcc' }); // Cyan for Echo
  },

  /**
   * 턴 종료 버튼 전용 효과
   * @param {Document} doc - document 객체
   */
  triggerEndTurnButton(doc = document) {
    this.triggerEffect('endPlayerTurnBtn', { doc });
  },
};
