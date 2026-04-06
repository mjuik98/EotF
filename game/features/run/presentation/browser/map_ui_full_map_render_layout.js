import { DescriptionUtils } from '../../integration/ui_support_capabilities.js';
import { getMapNodeTypeOrder } from '../../application/map_node_content_queries.js';
import { getNodeStatusText } from './map_ui_full_map_render_helpers.js';

export function createFullMapLayout(doc, { ch, cw, nodeMeta, onClose, regionName, titleText }) {
  const overlay = doc.createElement('div');
  overlay.id = 'fullMapOverlay';
  overlay.style.cssText = `
        position:fixed; inset:0; z-index:300;
        background:rgba(5,5,18,0.96); backdrop-filter:blur(12px);
        display:flex; flex-direction:column; align-items:center; justify-content:center;
        cursor:default; animation:fadeInDown 0.3s ease both;
      `;

  const title = doc.createElement('div');
  title.style.cssText = "font-family:'Cinzel',serif;font-size:14px;letter-spacing:0.3em;color:var(--echo-bright,#b388ff);margin-bottom:20px;";
  title.textContent = titleText || regionName || '미확인 지역';
  overlay.appendChild(title);

  const canvasContainer = doc.createElement('div');
  canvasContainer.style.cssText = `
      width:${cw}px; height:${ch}px; overflow-y:auto; overflow-x:hidden;
      border:1px solid rgba(123,47,255,0.25); border-radius:12px;
      background:rgba(0,0,0,0.45); scrollbar-width:thin;
      scrollbar-color:rgba(123,47,255,0.4) transparent;
    `;

  const canvas = doc.createElement('canvas');
  canvas.width = cw;
  canvas.style.display = 'block';
  canvas.setAttribute?.('tabindex', '0');
  canvas.setAttribute?.('aria-label', '전체 지도. 현재 지역의 노드와 진행 경로를 확인합니다.');
  canvas.setAttribute?.('aria-describedby', 'fullMapTooltip');
  canvas.setAttribute?.('aria-keyshortcuts', 'ArrowLeft ArrowRight ArrowUp ArrowDown Home End');
  canvas.tabIndex = 0;
  canvas['aria-label'] = '전체 지도. 현재 지역의 노드와 진행 경로를 확인합니다.';
  canvasContainer.appendChild(canvas);
  overlay.appendChild(canvasContainer);

  const glitchCanvas = doc.createElement('canvas');
  glitchCanvas.width = cw;
  glitchCanvas.height = ch;
  glitchCanvas.style.cssText = `position:absolute; top:calc(50% - ${ch / 2}px); left:calc(50% - ${cw / 2}px); pointer-events:none; z-index:500; opacity:0;`;
  overlay.appendChild(glitchCanvas);

  const tooltip = doc.createElement('div');
  tooltip.id = 'fullMapTooltip';
  tooltip.setAttribute?.('role', 'tooltip');
  tooltip.style.cssText = `
      position:fixed; z-index:1000; pointer-events:none;
      background:rgba(5,5,18,0.95); border:1px solid rgba(123,47,255,0.7);
      border-radius:8px; padding:12px 16px; font-family:'Share Tech Mono',monospace;
      font-size:12px; color:#fff; transition:opacity 0.15s; opacity:0;
      box-shadow: 0 0 20px rgba(123,47,255,0.5);
      max-width: 260px;
    `;
  const tooltipTitle = doc.createElement('div');
  tooltipTitle.style.cssText = 'font-weight:700;margin-bottom:6px;font-size:14px;';
  const tooltipDesc = doc.createElement('div');
  tooltipDesc.className = 'full-map-tooltip-desc';
  tooltipDesc.style.cssText = 'color:rgba(255,255,255,0.85);line-height:1.5;margin-bottom:8px;';
  const tooltipStatus = doc.createElement('div');
  tooltipStatus.style.cssText = 'color:rgba(255,255,255,0.6);font-size:11px;padding-top:6px;border-top:1px solid rgba(255,255,255,0.1);';
  tooltip.append(tooltipTitle, tooltipDesc, tooltipStatus);
  overlay.appendChild(tooltip);

  const legend = doc.createElement('div');
  legend.style.cssText = 'display:flex;gap:18px;margin-top:20px;flex-wrap:wrap;justify-content:center;';
  getMapNodeTypeOrder().forEach((type) => {
    const meta = nodeMeta[type];
    if (!meta) return;
    const item = doc.createElement('span');
    item.style.cssText = `font-family:'Share Tech Mono',monospace;font-size:12px;color:${meta.color || '#fff'};opacity:0.8;`;
    item.textContent = `${meta.icon || '?'} ${meta.label || '노드'}`;
    legend.appendChild(item);
  });
  overlay.appendChild(legend);

  const closeBtn = doc.createElement('button');
  closeBtn.className = 'action-btn action-btn-secondary gm-close-btn gm-close-btn-footer';
  closeBtn.innerHTML = '닫기<span class="kbd-hint">ESC</span>';
  closeBtn.style.marginTop = '20px';
  closeBtn.onclick = onClose;
  overlay.appendChild(closeBtn);

  return {
    canvas,
    canvasContainer,
    closeBtn,
    glitchCanvas,
    legend,
    overlay,
    tooltip,
    tooltipDesc,
    tooltipStatus,
    tooltipTitle,
  };
}

export function updateFullMapTooltip(
  refs,
  node,
  event,
  nodeMeta,
  view = globalThis,
) {
  const {
    tooltip,
    tooltipDesc,
    tooltipStatus,
    tooltipTitle,
  } = refs;

  if (!node || !event) {
    tooltip.style.opacity = '0';
    return;
  }

  const meta = nodeMeta[node.type] || { icon: '?', label: '노드', color: '#fff', desc: '' };
  tooltipTitle.style.color = meta.color || '#fff';
  tooltipTitle.textContent = `${meta.icon || '?'} ${meta.label || '노드'}`;
  tooltipDesc.innerHTML = DescriptionUtils.highlight(meta.desc || '다음 이동 경로를 확인하세요.');
  tooltipStatus.textContent = `${node.floor}F - ${getNodeStatusText(node)}`;
  tooltip.style.opacity = '1';

  const rect = tooltip.getBoundingClientRect();
  let left = event.clientX + 20;
  let top = event.clientY + 20;
  const winW = Number(view.innerWidth || 1280);
  const winH = Number(view.innerHeight || 720);
  if (left + rect.width > winW) left = event.clientX - rect.width - 20;
  if (top + rect.height > winH) top = event.clientY - rect.height - 20;
  tooltip.style.left = `${left}px`;
  tooltip.style.top = `${top}px`;
}
