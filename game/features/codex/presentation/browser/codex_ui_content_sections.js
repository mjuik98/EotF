export const ENEMY_CODEX_SECTIONS = [
  { title: '일반 적', icon: '✦', filter: (enemy) => !enemy.isBoss && !enemy.isElite && !enemy.isMiniBoss },
  { title: '엘리트 적', icon: '◆', filter: (enemy) => !!enemy.isElite && !enemy.isBoss },
  { title: '중간 보스', icon: '◈', filter: (enemy) => !!enemy.isMiniBoss },
  { title: '보스', icon: '✹', filter: (enemy) => !!enemy.isBoss },
];

export const CARD_CODEX_SECTIONS = [
  { title: '공격 카드', icon: '⚔', filter: (card) => String(card.type || '').toUpperCase() === 'ATTACK' },
  { title: '스킬 카드', icon: '✧', filter: (card) => String(card.type || '').toUpperCase() === 'SKILL' },
  { title: '파워 카드', icon: '☼', filter: (card) => String(card.type || '').toUpperCase() === 'POWER' },
];

export function renderCodexCategorizedSections(state, doc, content, sourceEntries, codex, options = {}) {
  const {
    sections = [],
    category,
    applyFilter,
    renderSection,
    renderEmpty,
    buildEntry,
  } = options;

  let hasEntries = false;
  sections.forEach((section) => {
    const entries = applyFilter(state, sourceEntries.filter(section.filter), codex, category);
    if (!entries.length) return;
    hasEntries = true;
    renderSection(
      state,
      doc,
      content,
      section.title,
      section.icon,
      entries,
      (entry, index, navList, entryDoc) => buildEntry(state, entry, index, navList, entryDoc),
      entries,
    );
  });

  if (!hasEntries) renderEmpty(content);
}
