import { collectCombatRuntimeDebugSnapshot } from '../../features/combat/ports/runtime_debug_snapshot.js';
import { collectRunRuntimeDebugSnapshot } from '../../features/run/ports/runtime_debug_snapshot.js';
import { collectTitleRuntimeDebugSnapshot } from '../../features/title/ports/runtime_debug_snapshot.js';
import { collectUiRuntimeDebugSnapshot } from '../../features/ui/ports/runtime_debug_snapshot.js';
import {
  collectPlayerSummary,
  toFiniteNumber,
} from '../../shared/runtime/runtime_debug_snapshot_utils.js';

function resolveCoreScope(modules) {
  return modules?.featureScopes?.core || {};
}

function resolveCoreGameState(modules) {
  return resolveCoreScope(modules).GS || modules?.GS || {};
}

export function createRuntimeDebugSnapshot({ modules, doc, win }) {
  const gs = resolveCoreGameState(modules);
  const uiSnapshot = collectUiRuntimeDebugSnapshot({ modules, doc, win });
  const titleSnapshot = collectTitleRuntimeDebugSnapshot({ modules, doc, win });
  const runSnapshot = collectRunRuntimeDebugSnapshot({ modules, doc, win });
  const combatSnapshot = collectCombatRuntimeDebugSnapshot({ modules, doc, win });
  const introCinematic = titleSnapshot.title?.introCinematic || null;
  const storyFragment = titleSnapshot.overlays?.storyFragment || null;
  const runStart = runSnapshot.overlays?.runStart || { active: false, activeOverlayIds: [] };

  return {
    coordinateSystem: 'screen-space origin=(top-left), +x=right, +y=down',
    screen: gs?.currentScreen || null,
    panels: uiSnapshot.panels || [],
    title: titleSnapshot.title,
    overlays: {
      storyFragment,
      runStart,
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
