import { removeFloatingPlayerHpPanel } from '../shared/player_hp_panel_ui.js';

function _getDoc(deps) {
  return deps?.doc || document;
}

export const ScreenUI = {
  switchScreen(screen, deps = {}) {
    const doc = _getDoc(deps);
    doc.querySelectorAll('.screen').forEach(el => el.classList.remove('active'));
    const target = doc.getElementById(`${screen}Screen`);
    if (target) target.classList.add('active');

    if (deps?.gs) deps.gs.currentScreen = screen;
    if (screen !== 'game' && screen !== 'combat') {
      removeFloatingPlayerHpPanel({ doc });
    }
    if (screen === 'title' && typeof deps.onEnterTitle === 'function') {
      deps.onEnterTitle();
    }
  },
};
