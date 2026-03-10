import { typeToCategory } from './card_popup_ui.js';

export function groupLogsByTurn(logs = []) {
  const groups = new Map();

  logs.forEach((entry) => {
    const rawTurn = entry?.turn;
    const turn = Number.isFinite(rawTurn) ? rawTurn : 0;
    if (!groups.has(turn)) groups.set(turn, []);
    groups.get(turn).push(entry);
  });

  return Array.from(groups.entries())
    .sort(([a], [b]) => a - b)
    .map(([turn, entries]) => ({ turn, entries }));
}

function sumByRegex(msg, regex) {
  if (!msg) return 0;
  const match = msg.match(regex);
  return match ? Number.parseInt(match[1], 10) || 0 : 0;
}

export function summarizeTurnStats(entries = []) {
  let totalDamage = 0;
  let totalHeal = 0;
  let totalShield = 0;

  entries.forEach(({ msg, type }) => {
    const category = typeToCategory(type);
    if (category === 'action') {
      totalDamage += sumByRegex(msg, /(?:[:\s])(\d+)\s*피해/);
    }
    if (type === 'heal' || category === 'support') {
      totalHeal += sumByRegex(msg, /(\d+)\s*회복/);
    }
    if (type === 'shield' || category === 'support') {
      totalShield += sumByRegex(msg, /방어막\s*\+?(\d+)/);
    }
  });

  return { totalDamage, totalHeal, totalShield };
}

export function renderTurnSummaryCard(doc, group) {
  const { turn, entries } = group;
  const wrapper = doc.createElement('div');
  wrapper.className = 'chronicle-turn-group';
  wrapper.dataset.turn = String(turn);

  const header = doc.createElement('div');
  header.className = 'chronicle-turn-header';
  header.textContent = turn <= 0 ? '전투 시작' : `턴 ${turn}`;
  wrapper.appendChild(header);

  const stats = summarizeTurnStats(entries);
  if (stats.totalDamage > 0 || stats.totalHeal > 0 || stats.totalShield > 0) {
    const summary = doc.createElement('div');
    summary.className = 'chronicle-turn-stats';
    const parts = [];
    if (stats.totalDamage > 0) parts.push(`피해 ${stats.totalDamage}`);
    if (stats.totalHeal > 0) parts.push(`회복 ${stats.totalHeal}`);
    if (stats.totalShield > 0) parts.push(`방어막 ${stats.totalShield}`);
    summary.textContent = parts.join('  ·  ');
    wrapper.appendChild(summary);
  }

  entries.forEach((entry) => {
    const line = doc.createElement('div');
    line.className = `log-entry ${entry?.type || ''}`.trim();
    line.dataset.category = typeToCategory(entry?.type);
    line.textContent = entry?.msg || '';
    wrapper.appendChild(line);
  });

  return wrapper;
}

export function renderBattleChronicleEntries(doc, list, logs = []) {
  if (!list) return;
  list.textContent = '';
  groupLogsByTurn(logs).forEach((group) => {
    list.appendChild(renderTurnSummaryCard(doc, group));
  });
}
