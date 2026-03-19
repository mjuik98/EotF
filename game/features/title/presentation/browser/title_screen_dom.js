function resolveDoc(doc) {
  if (doc) return doc;
  return typeof document !== 'undefined' ? document : null;
}

export function getTitleScreenRefs(doc = null) {
  const resolvedDoc = resolveDoc(doc);
  return {
    classContainer: resolvedDoc?.getElementById?.('classSelectContainer') || null,
    characterSelect: resolvedDoc?.getElementById?.('charSelectSubScreen') || null,
    mainTitle: resolvedDoc?.getElementById?.('mainTitleSubScreen') || null,
  };
}

export function showCharacterSelectScreen(doc = null) {
  const refs = getTitleScreenRefs(doc);
  if (refs.mainTitle) refs.mainTitle.style.display = 'none';
  if (refs.characterSelect) refs.characterSelect.style.display = 'block';
  return refs;
}

export function showMainTitleScreen(doc = null) {
  const refs = getTitleScreenRefs(doc);
  if (refs.mainTitle) refs.mainTitle.style.display = '';
  if (refs.characterSelect) refs.characterSelect.style.display = 'none';
  return refs;
}

export function hideTitleSubscreens(doc = null) {
  const refs = getTitleScreenRefs(doc);
  if (refs.mainTitle) refs.mainTitle.style.display = 'none';
  if (refs.characterSelect) refs.characterSelect.style.display = 'none';
  return refs;
}
