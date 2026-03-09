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

export function applyChronicleFilter(list, filter) {
  const groups = list.querySelectorAll('.chronicle-turn-group');
  groups.forEach((group) => {
    const lines = group.querySelectorAll('.log-entry');
    let visibleCount = 0;

    lines.forEach((line) => {
      const category = line.dataset.category || 'status';
      const visible = filter === 'all' || category === filter;
      line.style.display = visible ? '' : 'none';
      if (visible) visibleCount += 1;
    });

    group.style.display = visibleCount > 0 ? '' : 'none';
  });
}

export function bindChronicleFilters(doc, list) {
  const filterBar = doc.getElementById('chronicleFilterBar');
  if (!filterBar || filterBar.dataset.bound === '1') return;

  filterBar.addEventListener('click', (event) => {
    const btn = event.target.closest('.chronicle-filter-btn');
    if (!btn) return;

    const filter = btn.dataset.filter || 'all';
    filterBar.querySelectorAll('.chronicle-filter-btn').forEach((element) => element.classList.remove('active'));
    btn.classList.add('active');
    applyChronicleFilter(list, filter);
  });

  filterBar.dataset.bound = '1';
}

function resolveEventElement(event) {
  const target = event?.target;
  if (typeof Element !== 'undefined' && target instanceof Element) return target;
  if (target && typeof target === 'object' && target.parentElement && (typeof Element === 'undefined' || target.parentElement instanceof Element)) {
    return target.parentElement;
  }
  return null;
}

function normalizeWheelDelta(event, list) {
  let delta = Number(event?.deltaY ?? event?.deltaX ?? 0);
  if (!Number.isFinite(delta) || delta === 0) {
    const legacy = Number(event?.wheelDelta || 0);
    if (legacy) delta = -legacy;
  }
  if (event?.deltaMode === 1) delta *= 16;
  else if (event?.deltaMode === 2) delta *= Math.max(1, list?.clientHeight || 1);
  return Number.isFinite(delta) ? delta : 0;
}

export function bindChronicleWheel(panel, list) {
  if (!panel || !list) return;

  if (panel._wheelAbort) {
    panel._wheelAbort.abort();
  }
  const controller = new AbortController();
  panel._wheelAbort = controller;
  const signal = controller.signal;

  list.addEventListener('wheel', (event) => {
    event.preventDefault();
    event.stopPropagation();
    const maxScroll = Math.max(0, list.scrollHeight - list.clientHeight);
    if (maxScroll <= 0) return;
    const delta = normalizeWheelDelta(event, list);
    if (!delta) return;
    list.scrollTop = Math.max(0, Math.min(maxScroll, list.scrollTop + delta));
  }, { passive: false, signal });

  panel.addEventListener('wheel', (event) => {
    const targetElement = resolveEventElement(event);
    if (targetElement?.closest?.('#battleChronicleList')) return;
    event.preventDefault();
    const maxScroll = Math.max(0, list.scrollHeight - list.clientHeight);
    if (maxScroll <= 0) return;
    const delta = normalizeWheelDelta(event, list);
    if (!delta) return;
    list.scrollTop = Math.max(0, Math.min(maxScroll, list.scrollTop + delta));
  }, { passive: false, signal });
}

export function isChronicleOverlayOpen(overlay, doc) {
  if (!overlay) return false;
  if (overlay.classList?.contains('active')) return true;
  const inlineDisplay = String(overlay.style?.display || '').trim().toLowerCase();
  if (inlineDisplay === 'none') return false;
  if (inlineDisplay) return true;
  const view = doc?.defaultView || globalThis;
  if (typeof view?.getComputedStyle !== 'function') return false;
  return view.getComputedStyle(overlay).display !== 'none';
}

export function openBattleChronicleOverlay(doc, logs = [], options = {}) {
  const overlay = doc.getElementById('battleChronicleOverlay');
  const panel = overlay?.querySelector?.('.battle-chronicle-panel');
  const list = doc.getElementById('battleChronicleList');
  if (!overlay || !list) return false;

  list.textContent = '';
  groupLogsByTurn(logs).forEach((group) => {
    list.appendChild(renderTurnSummaryCard(doc, group));
  });

  const filterBar = doc.getElementById('chronicleFilterBar');
  if (filterBar) {
    filterBar.querySelectorAll('.chronicle-filter-btn').forEach((btn) => btn.classList.remove('active'));
    filterBar.querySelector('.chronicle-filter-btn[data-filter="all"]')?.classList.add('active');
  }

  bindChronicleFilters(doc, list);
  applyChronicleFilter(list, 'all');

  overlay.style.display = 'flex';
  overlay.classList.add('active');

  const scheduleFrame = options.requestAnimationFrame || globalThis.requestAnimationFrame || ((callback) => setTimeout(callback, 16));
  scheduleFrame(() => {
    bindChronicleWheel(panel, list);
    list.scrollTop = list.scrollHeight;
  });

  return true;
}

export function closeBattleChronicleOverlay(doc) {
  const overlay = doc.getElementById('battleChronicleOverlay');
  if (!overlay) return false;

  const panel = overlay.querySelector?.('.battle-chronicle-panel');
  if (panel?._wheelAbort) {
    panel._wheelAbort.abort();
    panel._wheelAbort = null;
  }

  overlay.classList.remove('active');
  overlay.style.display = 'none';
  return true;
}
