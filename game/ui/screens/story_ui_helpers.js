export function getGS(deps) {
  return deps?.gs;
}

export function getData(deps) {
  return deps?.data;
}

export function getDoc(deps) {
  return deps?.doc || document;
}

export function getInscriptionLevel(gs, id) {
  const inscriptions = gs?.meta?.inscriptions;
  if (!inscriptions) return 0;
  const val = inscriptions[id];
  if (typeof val === 'boolean') return val ? 1 : 0;
  return Math.max(0, Math.floor(Number(val) || 0));
}

export function setInscriptionLevel(gs, id, level) {
  if (!gs?.meta) return;
  if (!gs.meta.inscriptions) gs.meta.inscriptions = {};
  gs.meta.inscriptions[id] = Math.max(0, Math.floor(Number(level) || 0));
}

export function ensureStoryPieces(gs) {
  if (!gs?.meta) return [];
  if (!Array.isArray(gs.meta.storyPieces)) gs.meta.storyPieces = [];
  return gs.meta.storyPieces;
}

export function getSortedStoryFragments(data) {
  if (!Array.isArray(data?.storyFragments)) return [];
  return [...data.storyFragments]
    .filter((frag) => frag && frag.id !== undefined)
    .sort((a, b) => {
      const runA = Number.isFinite(Number(a?.run)) ? Number(a.run) : Number.POSITIVE_INFINITY;
      const runB = Number.isFinite(Number(b?.run)) ? Number(b.run) : Number.POSITIVE_INFINITY;
      if (runA !== runB) return runA - runB;

      const idA = Number.isFinite(Number(a?.id)) ? Number(a.id) : Number.POSITIVE_INFINITY;
      const idB = Number.isFinite(Number(b?.id)) ? Number(b.id) : Number.POSITIVE_INFINITY;
      return idA - idB;
    });
}

export function pickNextLockedFragment(gs, data) {
  const storyPieces = ensureStoryPieces(gs);
  const unlocked = new Set(storyPieces);
  const fragments = getSortedStoryFragments(data);
  if (!fragments.length) return null;
  return fragments.find((frag) => !unlocked.has(frag.id)) || null;
}
