import {
  getStoryOverlayElement,
  isActivePanel,
  isInlineBlockVisible,
  isTitleSurfaceActive,
  isVisibleElement,
} from '../../../shared/runtime/runtime_debug_snapshot_utils.js';

export function collectUiRuntimeDebugSnapshot({ doc, win }) {
  const view = win || doc?.defaultView || null;
  if (!doc) return { panels: [] };

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
  ]
    .filter(([, element, isVisible]) => isVisible(element))
    .map(([id]) => id);

  return { panels };
}
