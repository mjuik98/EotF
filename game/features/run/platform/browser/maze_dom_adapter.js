export function createMazeDomAdapter(deps = {}) {
  function getDoc() {
    return deps.doc || document;
  }

  function getWin() {
    return deps.win || getDoc()?.defaultView || null;
  }

  return {
    getCanvas() {
      return getDoc().getElementById('mazeCanvas');
    },
    getMinimap() {
      return getDoc().getElementById('mazeMinimap');
    },
    getDoc,
    getWin,
    hideOverlay() {
      const overlay = getDoc().getElementById('mazeOverlay');
      if (overlay) overlay.style.display = 'none';
    },
    removeGuide() {
      getDoc().getElementById('mazeGuide')?.remove();
    },
    showOverlay() {
      const overlay = getDoc().getElementById('mazeOverlay');
      if (overlay) overlay.style.display = 'flex';
    },
  };
}
