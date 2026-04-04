import { collectFeatureRuntimeDebugSnapshots } from '../composition/runtime_debug_snapshot_catalog.js';

function toFiniteNumber(value, fallback = 0) {
  const num = Number(value);
  return Number.isFinite(num) ? num : fallback;
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

function resolveCoreScope(modules) {
  return modules?.featureScopes?.core || {};
}

function resolveCoreGameState(modules) {
  return resolveCoreScope(modules).GS || modules?.GS || {};
}

export function createRuntimeDebugSnapshot({ modules, doc, win }) {
  const gs = resolveCoreGameState(modules);
  const snapshots = collectFeatureRuntimeDebugSnapshots({ modules, doc, win });
  const uiSnapshot = snapshots.ui;
  const titleSnapshot = snapshots.title;
  const runSnapshot = snapshots.run;
  const combatSnapshot = snapshots.combat;
  const introCinematic = titleSnapshot.title?.introCinematic || null;
  const storyFragment = titleSnapshot.overlays?.storyFragment || null;
  const runStart = runSnapshot.overlays?.runStart || { active: false, activeOverlayIds: [] };
  const activeOverlayIds = [
    ...(introCinematic?.active ? ['introCinematic'] : []),
    ...(storyFragment?.active ? ['storyFragment'] : []),
    ...((runStart.activeOverlayIds || []).filter(Boolean)),
  ];

  return {
    coordinateSystem: 'screen-space origin=(top-left), +x=right, +y=down',
    screen: gs?.currentScreen || null,
    ui: uiSnapshot,
    panels: uiSnapshot.panels || [],
    title: titleSnapshot.title,
    overlays: {
      storyFragment,
      runStart,
      surface: {
        activeOverlayIds,
        activeOverlayCount: activeOverlayIds.length,
      },
    },
    player: collectPlayerSummary(gs),
    combat: combatSnapshot.combat,
    map: runSnapshot.map,
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
