import {
  readTextContent,
} from '../../ui/ports/public_runtime_debug_support_capabilities.js';

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
  const selectedClass = titleModules?.ClassSelectUI?.getSelectedClass?.() || null;
  const characterSelect = titleModules?.CharacterSelectUI?.getSelectionSnapshot?.() || null;
  const introCinematic = collectIntroSummary(doc);
  const storyFragment = collectStoryFragmentSummary(doc);
  return {
    title: {
      selectedClass,
      characterSelect,
      introCinematic,
      ui: {
        selectedClass,
        characterSelectClassId: characterSelect?.classId || null,
        characterSelectPhase: characterSelect?.phase || null,
        introCinematicActive: !!introCinematic?.active,
        storyFragmentActive: !!storyFragment?.active,
      },
      surface: {
        selectedClass,
        characterSelectClassId: characterSelect?.classId || null,
        characterSelectPhase: characterSelect?.phase || null,
        introCinematicActive: !!introCinematic?.active,
        storyFragmentActive: !!storyFragment?.active,
      },
    },
    overlays: {
      storyFragment,
    },
  };
}
