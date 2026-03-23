const CLASS_PROGRESSION_STYLE_ID = 'class-progression-style';
const CHARACTER_SELECT_LAYOUT_STYLE_ID = 'character-select-layout-style';
const CLASS_PROGRESSION_STYLE_HREF = new URL('../../../../../css/class_progression.css', import.meta.url).href;
const CHARACTER_SELECT_LAYOUT_STYLE_HREF = new URL('../../../../../css/character_select_layout.css', import.meta.url).href;

function ensureStyleLink(doc, id, href) {
  const resolvedDoc = doc || (typeof document !== 'undefined' ? document : null);
  if (!resolvedDoc?.head || resolvedDoc.getElementById?.(id)) return;

  const link = resolvedDoc.createElement('link');
  link.id = id;
  link.rel = 'stylesheet';
  link.href = href;
  resolvedDoc.head.appendChild(link);
}

export function ensureCharacterSelectUiStyle(doc) {
  ensureStyleLink(doc, CLASS_PROGRESSION_STYLE_ID, CLASS_PROGRESSION_STYLE_HREF);
  ensureStyleLink(doc, CHARACTER_SELECT_LAYOUT_STYLE_ID, CHARACTER_SELECT_LAYOUT_STYLE_HREF);
}
