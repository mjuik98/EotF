export function toFiniteNumber(value, fallback = 0) {
  const num = Number(value);
  return Number.isFinite(num) ? num : fallback;
}

export function isVisibleElement(element, view) {
  if (!element) return false;
  let current = element;
  while (current) {
    const inlineDisplay = String(current.style?.display || '').trim().toLowerCase();
    if (inlineDisplay === 'none') return false;
    if (typeof view?.getComputedStyle === 'function') {
      const computed = view.getComputedStyle(current);
      if (computed?.display === 'none' || computed?.visibility === 'hidden') return false;
    }
    current = current.parentElement || null;
  }
  return true;
}

export function isInlineBlockVisible(element) {
  const inlineDisplay = String(element?.style?.display || '').trim().toLowerCase();
  return inlineDisplay === 'block' || inlineDisplay === 'flex';
}

export function isActivePanel(element) {
  return !!element?.classList?.contains('active');
}

export function readTextContent(element) {
  return String(element?.textContent || '').replace(/\s+/g, ' ').trim();
}

export function getStoryOverlayElement(doc) {
  return doc?.getElementById?.('storyContinueBtn')?.parentElement || null;
}

export function isTitleSurfaceActive(doc, view) {
  const titleScreen = doc?.getElementById?.('titleScreen');
  if (!titleScreen) return true;
  return isActivePanel(titleScreen) || isVisibleElement(titleScreen, view);
}

export function getCanvasCandidates(doc) {
  if (!doc) return [];

  const knownIds = ['gameCanvas', 'titleCanvas', 'titleWarpCanvas', 'particleCanvas', 'mazeMinimapCanvas'];
  const fromKnownIds = knownIds
    .map((id) => doc.getElementById?.(id))
    .filter(Boolean);

  const fromQuery = typeof doc.querySelectorAll === 'function'
    ? Array.from(doc.querySelectorAll('canvas'))
    : [];

  return [...new Set([...fromKnownIds, ...fromQuery])];
}

export function getCanvasPriority(canvas, gs) {
  const id = String(canvas?.id || '');
  if (gs?.currentScreen === 'game' || gs?.combat?.active) {
    if (id === 'gameCanvas') return 6;
    if (id === 'mazeMinimapCanvas') return 5;
  }
  if (id === 'particleCanvas') return 4;
  if (id === 'titleCanvas') return 3;
  if (id === 'titleWarpCanvas') return 2;
  return 1;
}

export function getViewportSummary(doc, win, gs) {
  const bestCanvas = getCanvasCandidates(doc)
    .map((canvas) => ({
      canvas,
      width: toFiniteNumber(canvas?.width || canvas?.clientWidth),
      height: toFiniteNumber(canvas?.height || canvas?.clientHeight),
      priority: getCanvasPriority(canvas, gs),
    }))
    .filter((entry) => entry.width > 0 && entry.height > 0)
    .sort((left, right) => {
      if (right.priority !== left.priority) return right.priority - left.priority;
      return (right.width * right.height) - (left.width * left.height);
    })[0];

  const width = toFiniteNumber(bestCanvas?.width, toFiniteNumber(win?.innerWidth, 1280));
  const height = toFiniteNumber(bestCanvas?.height, toFiniteNumber(win?.innerHeight, 720));
  return {
    width,
    height,
    source: bestCanvas?.canvas?.id || 'window',
  };
}

export function getEnemyAnchor(index, total, viewport) {
  return {
    x: Math.round(viewport.width / 2 + (index - (total / 2 - 0.5)) * 200),
    y: Math.round(viewport.height * 0.35),
  };
}

export function resolveNodePosition(node, fallbackIndex) {
  const candidates = [node?.pos, node?.lane, node?.idx, fallbackIndex];
  const position = candidates.find((value) => Number.isFinite(Number(value)));
  return toFiniteNumber(position, fallbackIndex);
}

export function resolveNodeTotal(nodes, floor, fallback = 1) {
  const sameFloorNodes = nodes.filter((node) => toFiniteNumber(node?.floor, -1) === floor);
  return Math.max(fallback, sameFloorNodes.length);
}

export function collectPlayerSummary(gs) {
  const player = gs?.player || {};
  return {
    class: player.class || null,
    hp: toFiniteNumber(player.hp),
    maxHp: toFiniteNumber(player.maxHp),
    shield: toFiniteNumber(player.shield),
    energy: toFiniteNumber(player.energy),
    maxEnergy: toFiniteNumber(player.maxEnergy),
    echo: toFiniteNumber(player.echo),
    maxEcho: toFiniteNumber(player.maxEcho),
    gold: toFiniteNumber(player.gold),
    drawPileCount: Array.isArray(player.drawPile) ? player.drawPile.length : 0,
    handCount: Array.isArray(player.hand) ? player.hand.length : 0,
    handPreview: Array.isArray(player.hand) ? player.hand.slice(0, 5) : [],
    deckCount: Array.isArray(player.deck) ? player.deck.length : 0,
    graveyardCount: Array.isArray(player.graveyard) ? player.graveyard.length : 0,
    graveyardPreview: Array.isArray(player.graveyard) ? player.graveyard.slice(-3) : [],
    itemCount: Array.isArray(player.items) ? player.items.length : 0,
    buffKeys: Object.keys(player.buffs || {}),
  };
}
