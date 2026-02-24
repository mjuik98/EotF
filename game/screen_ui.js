'use strict';

(function initScreenUI(globalObj) {
  function _getDoc(deps) {
    return deps?.doc || document;
  }

  const ScreenUI = {
    switchScreen(screen, deps = {}) {
      const doc = _getDoc(deps);
      doc.querySelectorAll('.screen').forEach(el => el.classList.remove('active'));
      const target = doc.getElementById(`${screen}Screen`);
      if (target) target.classList.add('active');

      // hoverHud는 body-level이므로 game 화면에서만 표시
      const hud = doc.getElementById('hoverHud');
      if (hud) hud.style.display = (screen === 'game') ? '' : 'none';

      if (deps?.gs) deps.gs.currentScreen = screen;
      if (screen === 'title' && typeof deps.onEnterTitle === 'function') {
        deps.onEnterTitle();
      }
    },
  };

  globalObj.ScreenUI = ScreenUI;
})(window);
