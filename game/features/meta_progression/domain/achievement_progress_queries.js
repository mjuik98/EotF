function countCollectionEntries(value) {
  if (value instanceof Set) return value.size;
  if (Array.isArray(value)) return value.length;
  if (!value || typeof value !== 'object') return 0;
  return Object.keys(value).length;
}

export function countCodexCategoryEntries(meta, category) {
  return countCollectionEntries(meta?.codex?.[category]);
}

export function getAchievementProgressValue(meta, condition = {}) {
  switch (condition.type) {
    case 'victories':
      return Number(meta?.progress?.victories ?? meta?.stats?.victories ?? 0);
    case 'cursed_victories':
      return Number(meta?.progress?.cursedVictories ?? meta?.stats?.cursedVictories ?? 0);
    case 'failures':
      return Number(meta?.progress?.failures ?? meta?.stats?.failures ?? 0);
    case 'best_chain':
      return Number(meta?.bestChain ?? 0);
    case 'world_memory_count':
      return Number(meta?.worldMemory?.[condition.key] ?? 0);
    case 'class_level':
      return Number(meta?.classProgress?.levels?.[condition.classId] || 0);
    case 'story_pieces':
      return Array.isArray(meta?.storyPieces) ? meta.storyPieces.length : 0;
    case 'codex_entries':
      return countCollectionEntries(meta?.codex?.enemies)
        + countCollectionEntries(meta?.codex?.cards)
        + countCollectionEntries(meta?.codex?.items);
    case 'codex_enemies':
      return countCodexCategoryEntries(meta, 'enemies');
    case 'codex_cards':
      return countCodexCategoryEntries(meta, 'cards');
    case 'codex_items':
      return countCodexCategoryEntries(meta, 'items');
    default:
      return 0;
  }
}
