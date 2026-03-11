function toFiniteNumber(value, fallback = 0) {
  const num = Number(value);
  return Number.isFinite(num) ? num : fallback;
}

function isVisibleElement(element, view) {
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

function isInlineBlockVisible(element) {
  const inlineDisplay = String(element?.style?.display || '').trim().toLowerCase();
  return inlineDisplay === 'block' || inlineDisplay === 'flex';
}

function isActivePanel(element) {
  return !!element?.classList?.contains('active');
}

function readTextContent(element) {
  return String(element?.textContent || '').replace(/\s+/g, ' ').trim();
}

function getStoryOverlayElement(doc) {
  return doc?.getElementById?.('storyContinueBtn')?.parentElement || null;
}

function isTitleSurfaceActive(doc, view) {
  const titleScreen = doc?.getElementById?.('titleScreen');
  if (!titleScreen) return true;
  return isActivePanel(titleScreen) || isVisibleElement(titleScreen, view);
}

function collectVisibleRuntimePanels(doc, view) {
  if (!doc) return [];
  const panels = [
    ['mainTitle', doc.getElementById('mainTitleSubScreen'), (element) => isTitleSurfaceActive(doc, view) && isVisibleElement(element, view)],
    ['characterSelect', doc.getElementById('charSelectSubScreen'), (element) => isTitleSurfaceActive(doc, view) && isVisibleElement(element, view)],
    ['introCinematic', doc.getElementById('introCinematicOverlay'), (element) => isVisibleElement(element, view)],
    ['storyFragment', getStoryOverlayElement(doc), (element) => isVisibleElement(element, view)],
    ['runStartBlackout', doc.getElementById('runStartHandoffBlackoutOverlay'), (element) => isVisibleElement(element, view)],
    ['runEntryTransition', doc.getElementById('runEntryTransitionOverlay'), (element) => isVisibleElement(element, view)],
    ['runStageTransition', doc.getElementById('runStageFadeTransitionOverlay'), (element) => isVisibleElement(element, view)],
    ['runSettings', doc.getElementById('runSettingsModal'), (element) => isActivePanel(element) || isInlineBlockVisible(element)],
    ['codex', doc.getElementById('codexModal'), (element) => isActivePanel(element) || isInlineBlockVisible(element)],
    ['combatOverlay', doc.getElementById('combatOverlay'), (element) => isActivePanel(element)],
    ['reward', doc.getElementById('rewardScreen'), (element) => isActivePanel(element)],
    ['event', doc.getElementById('eventModal'), (element) => isActivePanel(element) || isInlineBlockVisible(element)],
    ['deckView', doc.getElementById('deckViewModal'), (element) => isActivePanel(element) || isInlineBlockVisible(element)],
    ['settings', doc.getElementById('settingsModal'), (element) => isActivePanel(element) || isInlineBlockVisible(element)],
  ];

  return panels
    .filter(([, element, isVisible]) => isVisible(element))
    .map(([id]) => id);
}

function collectEnemyState(enemies = []) {
  return enemies.map((enemy, index) => ({
    index,
    id: enemy?.id || enemy?.key || enemy?.name || `enemy-${index}`,
    hp: toFiniteNumber(enemy?.hp),
    maxHp: toFiniteNumber(enemy?.maxHp),
    alive: toFiniteNumber(enemy?.hp) > 0,
    intent: enemy?.nextAction || enemy?.intent || null,
    statusKeys: Object.keys(enemy?.status || enemy?.statuses || {}),
  }));
}

function getCanvasCandidates(doc) {
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

function getCanvasPriority(canvas, gs) {
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

function getViewportSummary(doc, win, gs) {
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

function getEnemyAnchor(index, total, viewport) {
  return {
    x: Math.round(viewport.width / 2 + (index - (total / 2 - 0.5)) * 200),
    y: Math.round(viewport.height * 0.35),
  };
}

function resolveNodePosition(node, fallbackIndex) {
  const candidates = [node?.pos, node?.lane, node?.idx, fallbackIndex];
  const position = candidates.find((value) => Number.isFinite(Number(value)));
  return toFiniteNumber(position, fallbackIndex);
}

function resolveNodeTotal(nodes, floor, fallback = 1) {
  const sameFloorNodes = nodes.filter((node) => toFiniteNumber(node?.floor, -1) === floor);
  return Math.max(fallback, sameFloorNodes.length);
}

function collectMapSummary(gs) {
  const currentFloor = toFiniteNumber(gs?.currentFloor, 0);
  const mapNodes = Array.isArray(gs?.mapNodes) ? gs.mapNodes : [];
  const nextNodes = mapNodes
    .filter((node) => Number(node?.floor) === currentFloor + 1 && node?.accessible)
    .map((node, index) => ({
      id: node?.id || node?.nodeId || `${node?.floor ?? 'f'}-${node?.lane ?? node?.idx ?? 'x'}`,
      type: node?.type || null,
      floor: toFiniteNumber(node?.floor, currentFloor + 1),
      pos: resolveNodePosition(node, index),
      total: resolveNodeTotal(mapNodes, toFiniteNumber(node?.floor, currentFloor + 1)),
      visited: !!node?.visited,
      xRatio: Number(
        (
          (resolveNodePosition(node, index) + 1)
          / (resolveNodeTotal(mapNodes, toFiniteNumber(node?.floor, currentFloor + 1)) + 1)
        ).toFixed(3)
      ),
    }));

  return {
    coordinateSystem: 'map floor increases downward, node position increases rightward',
    currentRegion: toFiniteNumber(gs?.currentRegion, 0),
    currentFloor,
    currentNode: gs?.currentNode?.id || gs?.currentNode?.type || gs?.currentNode || null,
    currentNodeType: gs?.currentNode?.type || null,
    canChoosePath: !!(gs?.currentScreen === 'game' && !gs?.combat?.active && nextNodes.length > 0),
    nextNodes,
    reachableNodeIds: nextNodes.map((node) => node.id),
    accessibleNodeCount: nextNodes.length,
  };
}

function collectPlayerSummary(gs) {
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

function collectIntroSummary(doc) {
  const overlay = doc?.getElementById?.('introCinematicOverlay');
  if (!overlay) return null;
  const overlayChildren = Array.from(overlay?.children || []);
  const textBox = overlayChildren.find((child) => child?.style?.cssText?.includes('max-width: 560px'));
  const lines = Array.from(textBox?.children || []).map((child) => readTextContent(child)).filter(Boolean);
  const skipHint = readTextContent(overlayChildren[overlayChildren.length - 1]);
  return {
    active: true,
    lineCount: lines.length,
    lines,
    skipHint: skipHint || null,
  };
}

function collectStoryFragmentSummary(doc) {
  const button = doc?.getElementById?.('storyContinueBtn');
  const overlay = button?.parentElement || null;
  if (!button || !overlay) return null;
  const children = Array.from(overlay.children || []);
  return {
    active: true,
    title: readTextContent(children[0]),
    text: readTextContent(children[1]),
    continueLabel: readTextContent(button),
  };
}

function collectRunStartOverlaySummary(doc) {
  const activeOverlayIds = [
    'runStartHandoffBlackoutOverlay',
    'runEntryTransitionOverlay',
    'runStageFadeTransitionOverlay',
  ].filter((id) => !!doc?.getElementById?.(id));

  return {
    active: activeOverlayIds.length > 0,
    activeOverlayIds,
  };
}

export function createRuntimeDebugSnapshot({ modules, doc, win }) {
  const gs = modules?.GS || {};
  const view = win || doc?.defaultView || null;
  const viewport = getViewportSummary(doc, view, gs);
  const enemies = Array.isArray(gs?.combat?.enemies) ? gs.combat.enemies : [];
  const characterSelect = modules?.CharacterSelectUI?.getSelectionSnapshot?.() || null;
  const introCinematic = collectIntroSummary(doc);
  const storyFragment = collectStoryFragmentSummary(doc);
  const runStart = collectRunStartOverlaySummary(doc);
  const enemyStates = collectEnemyState(enemies).map((enemy) => ({
    ...enemy,
    anchor: getEnemyAnchor(enemy.index, enemies.length, viewport),
    targetable: enemy.alive,
  }));
  const targetableEnemyIndexes = enemyStates
    .filter((enemy) => enemy.targetable)
    .map((enemy) => enemy.index);

  return {
    coordinateSystem: 'screen-space origin=(top-left), +x=right, +y=down',
    screen: gs?.currentScreen || null,
    panels: collectVisibleRuntimePanels(doc, view),
    title: {
      selectedClass: modules?.ClassSelectUI?.getSelectedClass?.() || null,
      characterSelect,
      introCinematic,
    },
    overlays: {
      storyFragment,
      runStart,
    },
    player: collectPlayerSummary(gs),
    combat: {
      active: !!gs?.combat?.active,
      playerTurn: !!gs?.combat?.playerTurn,
      turn: toFiniteNumber(gs?.combat?.turn),
      selectedTarget: toFiniteNumber(gs?._selectedTarget, -1),
      selectedEnemyId: enemyStates.find((enemy) => enemy.index === toFiniteNumber(gs?._selectedTarget, -1))?.id || null,
      layout: {
        viewport,
        playerAnchor: {
          x: Math.round(viewport.width / 2),
          y: Math.round(viewport.height * 0.78),
        },
      },
      aliveEnemyCount: targetableEnemyIndexes.length,
      targetableEnemyIndexes,
      enemies: enemyStates,
      logSize: Array.isArray(gs?.combat?.log) ? gs.combat.log.length : 0,
    },
    map: collectMapSummary(gs),
    runtime: {
      gameStarted: !!modules?._gameStarted,
      selectedTarget: toFiniteNumber(gs?._selectedTarget, -1),
      overlayMode: storyFragment?.active
        ? 'storyFragment'
        : introCinematic?.active
          ? 'introCinematic'
          : runStart.active
            ? runStart.activeOverlayIds[0]
            : null,
    },
  };
}

function resolveSetTimeout(win) {
  if (typeof win?.setTimeout === 'function') return win.setTimeout.bind(win);
  return setTimeout;
}

function resolveAnimationFrame(win) {
  if (typeof win?.requestAnimationFrame === 'function') return win.requestAnimationFrame.bind(win);
  return null;
}

function waitForFrame(win, callback) {
  const raf = resolveAnimationFrame(win);
  if (raf) {
    raf(() => callback());
    return;
  }
  resolveSetTimeout(win)(callback, 16);
}

function waitForFrames(win, count, callback) {
  const frames = Math.max(1, toFiniteNumber(count, 1));
  const step = (remaining) => {
    if (remaining <= 0) {
      callback();
      return;
    }
    waitForFrame(win, () => step(remaining - 1));
  };
  step(frames);
}

function createAdvanceTimeHook({ modules, fns, win }) {
  return (ms = 16) => {
    const duration = Math.max(0, toFiniteNumber(ms, 16));
    const frameCount = Math.max(1, Math.round(duration / (1000 / 60)));
    const timeout = resolveSetTimeout(win);

    return new Promise((resolve) => {
      timeout(() => {
        waitForFrames(win, frameCount, () => {
          try {
            fns?.updateUI?.();
            if (modules?.GS?.combat?.active) {
              fns?.renderCombatEnemies?.();
              fns?.renderCombatCards?.();
              fns?.updateCombatLog?.();
              fns?.updateEchoSkillBtn?.();
            }
            if (modules?.GS?.currentScreen === 'game') {
              fns?.renderMinimap?.();
            }
          } catch (error) {
            console.warn('[RuntimeDebugHooks] advanceTime refresh failed:', error);
          }
          resolve(duration);
        });
      }, duration);
    });
  };
}

export function registerRuntimeDebugHooks({ modules, fns, doc, win }) {
  const renderGameToText = () => JSON.stringify(createRuntimeDebugSnapshot({ modules, doc, win }));
  const advanceTime = createAdvanceTimeHook({ modules, fns, win });

  modules?.exposeGlobals?.({
    render_game_to_text: renderGameToText,
    advanceTime,
  });

  return {
    render_game_to_text: renderGameToText,
    advanceTime,
  };
}
