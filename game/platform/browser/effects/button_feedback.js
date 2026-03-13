function getDoc(options = {}) {
  return options.doc || document;
}

function getRaf(options = {}) {
  return options.requestAnimationFrame || requestAnimationFrame;
}

function spawnDomBurst(cx, cy, doc, mainColor = '#f0b429', options = {}) {
  const particles = [
    ...Array.from({ length: 16 }, () => ({ color: mainColor, size: 5 })),
    ...Array.from({ length: 8 }, () => ({ color: '#ffffff', size: 3 })),
  ];
  const raf = getRaf(options);

  particles.forEach(({ color, size }) => {
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

    raf(() => {
      el.style.transform = `translate(calc(-50% + ${tx}px), calc(-50% + ${ty}px))`;
      el.style.opacity = '0';
    });

    setTimeout(() => el.remove(), dur + 50);
  });
}

export const ButtonFeedback = {
  triggerEffect(btnOrId, options = {}) {
    const doc = getDoc(options);
    const btn = typeof btnOrId === 'string' ? doc.getElementById(btnOrId) : btnOrId;
    if (!btn) return;

    const mainColor = options.color || '#f0b429';
    btn.classList.remove('clicked');
    void btn.offsetWidth;
    btn.classList.add('clicked');
    setTimeout(() => btn.classList.remove('clicked'), 300);

    const ripple = doc.createElement('div');
    ripple.className = 'btn-ripple';
    btn.appendChild(ripple);
    setTimeout(() => ripple.remove(), 500);

    const rect = btn.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    spawnDomBurst(cx, cy, doc, mainColor, options);
  },

  triggerDrawButton(doc = document) {
    this.triggerEffect('combatDrawCardBtn', { doc });
  },

  triggerEchoButton(doc = document) {
    this.triggerEffect('useEchoSkillBtn', { doc, color: '#00ffcc' });
  },

  triggerEndTurnButton(doc = document) {
    this.triggerEffect('endPlayerTurnBtn', { doc });
  },
};
