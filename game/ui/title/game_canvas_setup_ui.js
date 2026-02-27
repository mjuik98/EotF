let _gameCanvas = null;
  let _gameCtx = null;
  let _minimapCanvas = null;
  let _minimapCtx = null;
  let _combatCanvas = null;
  let _resizeBound = false;

  function _getDoc(deps) {
    return deps?.doc || document;
  }

  export const GameCanvasSetupUI = {
    getRefs() {
      return {
        gameCanvas: _gameCanvas,
        gameCtx: _gameCtx,
        minimapCanvas: _minimapCanvas,
        minimapCtx: _minimapCtx,
        combatCanvas: _combatCanvas,
      };
    },

    init(deps = {}) {
      const doc = _getDoc(deps);
      _gameCanvas = doc.getElementById('gameCanvas');
      if (!_gameCanvas) return null;
      _gameCtx = _gameCanvas.getContext('2d');

      _minimapCanvas = doc.getElementById('minimapCanvas');
      _minimapCtx = _minimapCanvas?.getContext('2d');
      if (_minimapCanvas && !_minimapCanvas._mapOpenPatched) {
        _minimapCanvas._mapOpenPatched = true;
        _minimapCanvas.style.cursor = 'pointer';
        _minimapCanvas.addEventListener('click', () => {
          if (typeof window.showFullMap === 'function') {
            window.showFullMap();
          }
        });
      }

      _combatCanvas = _gameCanvas;
      deps.particleSystem?.init?.(_gameCanvas);
      this.resize();

      if (!_resizeBound) {
        window.addEventListener('resize', () => this.resize());
        _resizeBound = true;
      }

      return this.getRefs();
    },

    resize() {
      if (!_gameCanvas) return;
      const rect = _gameCanvas.getBoundingClientRect();
      _gameCanvas.width = Math.max(rect.width || _gameCanvas.offsetWidth || 0, 600);
      _gameCanvas.height = Math.max(rect.height || _gameCanvas.offsetHeight || 0, 400);

      if (window.ResizeObserver && !_gameCanvas._resizeObserver) {
        const ro = new ResizeObserver(() => {
          const r = _gameCanvas.getBoundingClientRect();
          if (r.width > 0) {
            _gameCanvas.width = r.width;
            _gameCanvas.height = r.height;
          }
        });
        ro.observe(_gameCanvas);
        _gameCanvas._resizeObserver = ro;
      }

      if (_minimapCanvas) {
        _minimapCanvas.width = _minimapCanvas.offsetWidth || 200;
        _minimapCanvas.height = 160;
      }
    },
  };
