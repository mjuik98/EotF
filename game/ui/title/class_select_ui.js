let _selectedClass = null;

const CLASS_ID_ORDER = ['swordsman', 'mage', 'hunter', 'paladin', 'berserker', 'guardian'];

function _getDoc(deps) {
  return deps?.doc || document;
}

function _normalizeClassId(raw) {
  if (typeof raw === 'number' && Number.isInteger(raw)) {
    return CLASS_ID_ORDER[raw] || null;
  }

  if (typeof raw !== 'string') return null;
  const trimmed = raw.trim().toLowerCase();
  if (!trimmed) return null;
  if (CLASS_ID_ORDER.includes(trimmed)) return trimmed;

  if (/^\d+$/.test(trimmed)) {
    const idx = Number.parseInt(trimmed, 10);
    return CLASS_ID_ORDER[idx] || null;
  }

  return null;
}

function _applySelectionState(classId, deps = {}) {
  _selectedClass = classId;

  const doc = _getDoc(deps);
  const startBtn = doc.getElementById('startBtn');
  if (startBtn) startBtn.disabled = !_selectedClass;

  const hint = doc.getElementById('classSelectHint');
  if (hint) {
    hint.style.opacity = '0';
    hint.style.transform = 'translateY(-8px)';
    hint.style.transition = 'opacity 0.4s,transform 0.4s';
  }

  const classMeta = deps.data?.classes?.[_selectedClass];
  const avatarEmoji = classMeta?.emoji || '⚔️';

  const avatarEl = doc.getElementById('playerAvatar');
  if (avatarEl) {
    avatarEl.textContent = avatarEmoji;
    avatarEl.style.fontSize = '24px';
  }

  const largeFallback = doc.getElementById('playerPortraitFallback');
  if (largeFallback) {
    largeFallback.textContent = avatarEmoji;
    largeFallback.style.fontSize = '80px';
    largeFallback.style.display = 'flex';
  }

  if (typeof deps.playClassSelect === 'function' && _selectedClass) {
    deps.playClassSelect(_selectedClass);
  }
}

export const ClassSelectUI = {
  getSelectedClass() {
    return _selectedClass;
  },

  selectClass(btn, deps = {}) {
    if (!btn) return;
    if (btn._selecting) return;

    const classId = _normalizeClassId(btn.dataset?.class);
    if (!classId) return;

    btn._selecting = true;
    setTimeout(() => { btn._selecting = false; }, 300);

    const doc = _getDoc(deps);
    doc.querySelectorAll('.class-btn').forEach(el => el.classList.remove('selected'));
    btn.classList.add('selected');

    _applySelectionState(classId, deps);

    btn.style.transition = 'transform 0.15s ease';
    btn.style.transform = 'scale(1.04) translateY(-4px)';
    setTimeout(() => { btn.style.transform = ''; }, 200);
  },

  selectClassById(classId, deps = {}) {
    const normalized = _normalizeClassId(classId);
    if (!normalized) return;

    const doc = _getDoc(deps);
    doc.querySelectorAll('.class-btn').forEach(el => {
      const elClassId = _normalizeClassId(el.dataset?.class);
      if (elClassId === normalized) el.classList.add('selected');
      else el.classList.remove('selected');
    });

    _applySelectionState(normalized, deps);
  },

  clearSelection(deps = {}) {
    _selectedClass = null;
    const doc = _getDoc(deps);
    const startBtn = doc.getElementById('startBtn');
    if (startBtn) startBtn.disabled = true;
    doc.querySelectorAll('.class-btn').forEach(el => el.classList.remove('selected'));
  },

  _showTooltip(e, title, desc) {
    let tip = document.getElementById('classSelectTooltip');
    if (!tip) {
      tip = document.createElement('div');
      tip.id = 'classSelectTooltip';
      tip.style.cssText = `
        position:fixed; z-index:99999; pointer-events:none;
        background:rgba(10,10,25,0.95); border:1px solid rgba(0,255,204,0.3);
        border-radius:8px; padding:10px 14px; max-width:280px;
        box-shadow:0 4px 20px rgba(0,0,0,0.6); backdrop-filter:blur(8px);
        opacity:0; transition:opacity 0.15s;
      `;
      document.body.appendChild(tip);
    }

    tip.innerHTML = `
      <div style="font-family:'Cinzel',serif;font-size:11px;color:var(--cyan,#00ffcc);letter-spacing:0.05em;margin-bottom:4px;">${title}</div>
      <div style="font-size:10px;color:rgba(200,200,220,0.85);line-height:1.5;">${desc}</div>
    `;

    const rect = e.target.getBoundingClientRect();
    tip.style.left = `${Math.min(rect.left, (globalThis.innerWidth || 1280) - 300)}px`;
    tip.style.top = `${rect.bottom + 6}px`;
    tip.style.opacity = '1';
  },

  _hideTooltip() {
    const tip = document.getElementById('classSelectTooltip');
    if (tip) tip.style.opacity = '0';
  },

  renderButtons(container, deps = {}) {
    if (!container) {
      console.error('[ClassSelectUI] No container found for rendering buttons');
      return;
    }

    const data = deps.data;
    const CLASS_START_ITEMS = deps.CLASS_START_ITEMS;
    if (!data?.classes) return;

    container.innerHTML = '';

    Object.values(data.classes).forEach(cls => {
      const startItemKey = CLASS_START_ITEMS?.[cls.id];
      const startItem = data.items?.[startItemKey];
      const itemInfo = startItem ? `${startItem.icon} 시작 유물: ${startItem.name}` : '';

      const btn = document.createElement('button');
      btn.id = `class_${cls.id}`;
      btn.className = 'class-btn';
      btn.dataset.class = cls.id;

      btn.innerHTML = `
        <div class="class-btn-icon-container">
          <span class="class-btn-emoji">${cls.emoji}</span>
        </div>
        <div class="class-btn-name">${cls.name}</div>
        <div class="class-btn-style">${cls.style}</div>
        <div class="class-btn-desc">${cls.desc}</div>
        <div class="class-btn-trait class-btn-starting-relic">✦ 고유 특성: ${cls.traitName}</div>
        <div class="class-btn-relic class-btn-starting-relic">${itemInfo}</div>
      `;

      const traitEl = btn.querySelector('.class-btn-trait');
      if (traitEl) {
        traitEl.style.cursor = 'help';
        traitEl.addEventListener('mouseenter', (e) => {
          e.stopPropagation();
          this._showTooltip(e, cls.traitTitle, cls.traitDesc);
        });
        traitEl.addEventListener('mouseleave', () => this._hideTooltip());
      }

      const relicEl = btn.querySelector('.class-btn-relic');
      if (relicEl && startItem) {
        relicEl.style.cursor = 'help';
        relicEl.addEventListener('mouseenter', (e) => {
          e.stopPropagation();
          const rarityLabel = { common: '일반', uncommon: '비범', rare: '희귀', legendary: '전설' };
          const rLabel = rarityLabel[startItem.rarity] || '일반';
          this._showTooltip(e, `${startItem.icon} ${startItem.name} (${rLabel})`, startItem.desc || '시작 유물');
        });
        relicEl.addEventListener('mouseleave', () => this._hideTooltip());
      }

      container.appendChild(btn);
    });
  },
};
