export function renderEnemyCodexTab(state, doc, content, enemies, codex, helpers = {}) {
  const {
    applyFilter,
    renderSection,
    renderEmpty,
    makeEnemyCard,
  } = helpers;
  const sections = [
    { title: '일반 적', icon: '✦', filter: (enemy) => !enemy.isBoss && !enemy.isElite && !enemy.isMiniBoss },
    { title: '엘리트 적', icon: '◆', filter: (enemy) => !!enemy.isElite && !enemy.isBoss },
    { title: '중간 보스', icon: '◈', filter: (enemy) => !!enemy.isMiniBoss },
    { title: '보스', icon: '✹', filter: (enemy) => !!enemy.isBoss },
  ];

  let hasEntries = false;
  sections.forEach((section) => {
    const entries = applyFilter(state, enemies.filter(section.filter), codex, 'enemies');
    if (!entries.length) return;
    hasEntries = true;
    renderSection(
      state,
      doc,
      content,
      section.title,
      section.icon,
      entries,
      (entry, index, navList, entryDoc) => makeEnemyCard(state, entry, index, navList, entryDoc),
      entries,
    );
  });

  if (!hasEntries) renderEmpty(content);
}

export function renderCardsCodexTab(state, doc, content, data, codex, helpers = {}) {
  const {
    applyFilter,
    renderSection,
    renderEmpty,
    makeCardEntry,
    getBaseCodexCards,
  } = helpers;
  const sections = [
    { title: '공격 카드', icon: '⚔', filter: (card) => String(card.type || '').toUpperCase() === 'ATTACK' },
    { title: '스킬 카드', icon: '✧', filter: (card) => String(card.type || '').toUpperCase() === 'SKILL' },
    { title: '파워 카드', icon: '☼', filter: (card) => String(card.type || '').toUpperCase() === 'POWER' },
  ];

  let hasEntries = false;
  sections.forEach((section) => {
    const entries = applyFilter(state, getBaseCodexCards(data).filter(section.filter), codex, 'cards');
    if (!entries.length) return;
    hasEntries = true;
    renderSection(
      state,
      doc,
      content,
      section.title,
      section.icon,
      entries,
      (entry, index, navList, entryDoc) => makeCardEntry(state, entry, index, navList, entryDoc),
      entries,
    );
  });

  if (!hasEntries) renderEmpty(content);
}

export function renderItemsCodexTab(state, doc, content, data, gs, codex, helpers = {}) {
  const {
    applyFilter,
    renderEmpty,
    renderSection,
    renderSetView,
    makeItemCard,
  } = helpers;
  const items = Object.values(data.items || {});
  if (state.filter === 'all' && !state.search) {
    renderSetView(state, doc, content, data, gs);
  }

  const entries = applyFilter(state, items, codex, 'items');
  if (!entries.length) {
    renderEmpty(content);
    return;
  }

  renderSection(
    state,
    doc,
    content,
    '전체 유물',
    '❖',
    entries,
    (entry, index, navList, entryDoc) => makeItemCard(state, entry, index, navList, entryDoc),
    entries,
  );
}
