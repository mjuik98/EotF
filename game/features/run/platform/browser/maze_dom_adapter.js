export function createMazeDomAdapter(deps = {}) {
  function getDoc() {
    if (deps.doc) return deps.doc;
    return typeof document !== 'undefined' ? document : null;
  }

  function getWin() {
    return deps.win || getDoc()?.defaultView || null;
  }

  return {
    getCanvas() {
      return getDoc()?.getElementById('mazeCanvas') || null;
    },
    getMinimap() {
      return getDoc()?.getElementById('mazeMinimap') || null;
    },
    getDoc,
    getWin,
    hideOverlay() {
      const overlay = getDoc()?.getElementById('mazeOverlay');
      if (overlay) overlay.style.display = 'none';
    },
    removeGuide() {
      getDoc()?.getElementById('mazeGuide')?.remove();
    },
    showOverlay() {
      const overlay = getDoc()?.getElementById('mazeOverlay');
      if (overlay) overlay.style.display = 'flex';
    },
  };
}
