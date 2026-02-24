'use strict';

(function initClassSelectUI(globalObj) {
  let _selectedClass = null;

  function _getDoc(deps) {
    return deps?.doc || document;
  }

  const ClassSelectUI = {
    getSelectedClass() {
      return _selectedClass;
    },

    selectClass(btn, deps = {}) {
      if (!btn) return;
      if (btn._selecting) return;
      btn._selecting = true;
      setTimeout(() => { btn._selecting = false; }, 300);

      const doc = _getDoc(deps);
      doc.querySelectorAll('.class-btn').forEach(el => el.classList.remove('selected'));
      btn.classList.add('selected');

      _selectedClass = btn.dataset.class || null;
      const startBtn = doc.getElementById('startBtn');
      if (startBtn) startBtn.disabled = !_selectedClass;

      const hint = doc.getElementById('classSelectHint');
      if (hint) {
        hint.style.opacity = '0';
        hint.style.transform = 'translateY(-8px)';
        hint.style.transition = 'opacity 0.4s,transform 0.4s';
      }

      const icons = { swordsman: '⚔️', mage: '🔮', hunter: '🗡️' };
      const data = deps.data || globalObj.DATA;
      const avatarFile = data?.assets?.avatars?.[_selectedClass];
      const fallbackIcon = icons[_selectedClass] || '⚔️';

      // HUD 소형 초상화 업데이트
      const avatarEl = doc.getElementById('playerAvatar');
      if (avatarEl) {
        if (avatarFile) {
          avatarEl.innerHTML = `
            <img src="assets/images/${avatarFile}" style="width:24px;height:24px;object-fit:contain;vertical-align:middle;" 
                 onerror="this.style.display='none'; this.nextElementSibling.style.display='inline';">
            <span style="display:none;">${fallbackIcon}</span>
          `;
        } else {
          avatarEl.textContent = fallbackIcon;
        }
      }

      // 우측 패널 대령 초상화 업데이트 (미리보기)
      const largePortrait = doc.getElementById('largePlayerPortrait');
      const largeFallback = doc.getElementById('playerPortraitFallback');
      if (largePortrait && largeFallback) {
        if (avatarFile) {
          largePortrait.src = `assets/images/${avatarFile}`;
          largePortrait.style.display = 'block';
          largeFallback.style.display = 'none';
        } else {
          largePortrait.style.display = 'none';
          largeFallback.textContent = fallbackIcon;
          largeFallback.style.display = 'flex';
        }
      }

      btn.style.transition = 'transform 0.15s ease';
      btn.style.transform = 'scale(1.04) translateY(-4px)';
      setTimeout(() => { btn.style.transform = ''; }, 200);

      if (typeof deps.playClassSelect === 'function' && _selectedClass) {
        deps.playClassSelect(_selectedClass);
      }
    },

    clearSelection(deps = {}) {
      _selectedClass = null;
      const doc = _getDoc(deps);
      const startBtn = doc.getElementById('startBtn');
      if (startBtn) startBtn.disabled = true;
      doc.querySelectorAll('.class-btn').forEach(el => el.classList.remove('selected'));
    },
  };

  globalObj.ClassSelectUI = ClassSelectUI;
})(window);
