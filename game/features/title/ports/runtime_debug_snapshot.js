import {
  readTextContent,
} from '../../../shared/runtime/runtime_debug_snapshot_utils.js';

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

export function collectTitleRuntimeDebugSnapshot({ modules, doc }) {
  const titleModules = modules?.featureScopes?.title || modules || {};
  return {
    title: {
      selectedClass: titleModules?.ClassSelectUI?.getSelectedClass?.() || null,
      characterSelect: titleModules?.CharacterSelectUI?.getSelectionSnapshot?.() || null,
      introCinematic: collectIntroSummary(doc),
    },
    overlays: {
      storyFragment: collectStoryFragmentSummary(doc),
    },
  };
}
