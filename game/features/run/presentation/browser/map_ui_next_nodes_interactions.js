import { playSelectAnim } from './map_ui_next_nodes_overlay_helpers.js';
import { hexToRgb } from './map_ui_next_nodes_render.js';

export function createNextNodeTrigger({
  deps = {},
  moveToNodeHandlerName = 'moveToNode',
  node,
  win,
} = {}) {
  return () => {
    if (typeof deps.moveToNode === 'function') {
      deps.moveToNode(node.id);
      return;
    }
    const handler = win[moveToNodeHandlerName];
    if (typeof handler === 'function') handler(node.id);
  };
}

export function bindNextNodeCardInteractions({
  card,
  deps = {},
  doc,
  hoverTint,
  meta,
  moveToNodeHandlerName,
  node,
  win,
} = {}) {
  const rgb = hexToRgb(meta.color);
  const triggerMove = createNextNodeTrigger({
    deps,
    moveToNodeHandlerName,
    node,
    win,
  });

  card.addEventListener('mouseenter', () => {
    hoverTint.style.background = `radial-gradient(ellipse at 50% 58%,rgba(${rgb},.065) 0%,transparent 62%)`;
  });
  card.addEventListener('mouseleave', () => {
    hoverTint.style.background = 'transparent';
  });
  card.addEventListener('click', () => {
    playSelectAnim(doc, card, rgb, triggerMove, deps);
  });
}

export function createNextNodeOverlayKeyHandler({
  deps = {},
  doc,
  moveToNodeHandlerName,
  nodeMeta,
  nodes,
  overlay,
  row,
  toggleDeckView,
  win,
} = {}) {
  return (event) => {
    if (overlay.style.display === 'none') return;
    if (event.key === 'm' || event.key === 'M') {
      if (typeof deps.showFullMap === 'function') {
        deps.showFullMap();
        event.preventDefault();
      }
      return;
    }
    if (event.key === 'Tab') {
      if (typeof deps.showDeckView === 'function' || typeof deps.closeDeckView === 'function') {
        event.preventDefault();
        toggleDeckView();
      }
      return;
    }

    const index = parseInt(event.key, 10) - 1;
    if (!Number.isFinite(index) || index < 0 || index >= nodes.length) return;
    const cards = typeof row.querySelectorAll === 'function'
      ? Array.from(row.querySelectorAll('.node-card'))
      : Array.from(row.children || []).filter((child) => String(child.className || '').includes('node-card'));
    const targetCard = cards[index];
    if (!targetCard) return;

    const meta = nodeMeta[nodes[index].type] || nodeMeta.combat || { color: '#7b2fff' };
    const rgb = hexToRgb(meta.color);
    const triggerMove = createNextNodeTrigger({
      deps,
      moveToNodeHandlerName,
      node: nodes[index],
      win,
    });
    playSelectAnim(doc, targetCard, rgb, triggerMove, deps);
  };
}
