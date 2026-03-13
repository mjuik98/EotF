import { EndingScreenUI } from './ending_screen_ui.js';
import {
  ensureStoryPieces,
  getData,
  getGS,
  getInscriptionLevel,
  pickNextLockedFragment,
  setInscriptionLevel,
} from './story_ui_helpers.js';
import { renderHiddenEndingOverlay } from './story_ui_render.js';

export function unlockNextFragmentRuntime(deps = {}) {
  const gs = getGS(deps);
  const data = getData(deps);
  if (!gs?.meta) return;

  const storyPieces = ensureStoryPieces(gs);
  const frag = pickNextLockedFragment(gs, data);
  if (frag && !storyPieces.includes(frag.id)) storyPieces.push(frag.id);
}

function scheduleFragmentUnlockRewards(gs, data, storyPieces, deps, alreadyUnlocked) {
  if (!alreadyUnlocked && storyPieces.length > 4) {
    if (getInscriptionLevel(gs, 'echo_memory') === 0 && data.inscriptions?.echo_memory) {
      setInscriptionLevel(gs, 'echo_memory', 1);
      setTimeout(() => {
        deps.showWorldMemoryNotice?.('새로운 각인 해금: 잔향의 기억');
      }, 300);
    }
  }

  if (!alreadyUnlocked && storyPieces.length > 7 && !gs.meta._hiddenEndingHinted) {
    gs.meta._hiddenEndingHinted = true;
    setTimeout(() => {
      deps.showWorldMemoryNotice?.('진실이 가까워지고 있다 - 각인 없이 클리어하라');
    }, 500);
  }
}

export function showRunFragmentRuntime(ui, deps = {}) {
  const gs = getGS(deps);
  const data = getData(deps);
  if (!gs?.meta) return false;

  const storyPieces = ensureStoryPieces(gs);
  const frag = pickNextLockedFragment(gs, data);
  if (!frag) return false;

  const alreadyUnlocked = storyPieces.includes(frag.id);
  if (!alreadyUnlocked) storyPieces.push(frag.id);

  const shown = ui.displayFragment(frag, deps);
  if (shown === false) {
    if (!alreadyUnlocked) {
      const idx = storyPieces.lastIndexOf(frag.id);
      if (idx !== -1) storyPieces.splice(idx, 1);
    }
    return false;
  }

  scheduleFragmentUnlockRewards(gs, data, storyPieces, deps, alreadyUnlocked);
  return true;
}

export function checkHiddenEndingRuntime(deps = {}) {
  const gs = getGS(deps);
  if (!gs?.meta) return false;
  const noIns = !Object.values(gs.meta.inscriptions).some((v) => v);
  return noIns && gs.meta.storyPieces.length > 9;
}

export function showEndingRuntime(isHidden, deps = {}) {
  const gs = getGS(deps);
  if (!gs?.meta || !gs.player || !gs.stats) return false;

  if (!isHidden) {
    EndingScreenUI.show(false, deps);
    return true;
  }

  renderHiddenEndingOverlay(deps);
  return true;
}
