export const WorldCanvasUI = {
  renderNodeInfo(ctx, w, h, deps = {}) {
    const gs = deps.gs;
    const getRegionData = deps.getRegionData;
    if (!gs || typeof getRegionData !== 'function') return;
    if (gs.combat.active) return;

    const region = getRegionData(gs.currentRegion, gs) || {};
    const nextFloor = gs.currentFloor + 1;
    const nextNodes = gs.mapNodes.filter(n => n.floor === nextFloor && n.accessible && !n.visited);

    if (nextNodes.length === 0) {
      ctx.save();
      ctx.textAlign = 'center';
      ctx.font = "13px 'Share Tech Mono', monospace";
      ctx.fillStyle = 'rgba(176,180,216,0.25)';
      ctx.fillText(gs.currentNode ? '보상을 받고 계속 진행하세요' : '지도에서 경로를 선택하세요', w / 2, h / 2);
      ctx.restore();
      return;
    }

    ctx.save();
    ctx.textAlign = 'center';
    ctx.font = "11px 'Cinzel', serif";
    ctx.fillStyle = (region?.accent || '#7b2fff') + '66';
    ctx.fillText(this.getFloorStatusText(gs.currentRegion, gs.currentFloor, deps), w / 2, 36);
    ctx.restore();
  },

  getFloorStatusText(regionId, floor, deps = {}) {
    const gs = deps.gs;
    const getRegionData = deps.getRegionData;
    if (!gs || typeof getRegionData !== 'function') return '';
    const region = getRegionData(regionId, gs);
    if (!region) return '';
    const regionName = region.name;

    if (floor >= 13) return `${regionName} — 보스 구역`;
    if (floor >= 7) return `${regionName} — 중간 보스 구역`;
    if (floor >= 1) return `${regionName} — 일반 구역`;

    if (floor === 0) {
      const entryLines = {
        0: '잔향이 깨어난다',
        1: '도시의 침묵이 너를 감싼다',
        2: '기억이 뒤엉킨 공간',
        3: '신들이 잠든 땅을 밟는다',
        4: '에코의 심연, 끝이 가깝다',
      };
      return `${regionName}  ·  ${entryLines[regionId] ?? '새로운 땅에 발을 딛는다'}`;
    }

    const clearLines = {
      0: ['숲의 첫 번째 잔향', '균열이 넓어진다', '더 깊이 울린다', '보스의 기척이 느껴진다'],
      1: ['소음이 퍼져나간다', '파수꾼들이 웅성인다', '침묵이 무거워진다', '도시의 심장이 박동한다'],
      2: ['기억이 흔들린다', '잔상들이 모여든다', '왜곡이 심해진다', '기억의 군주가 기다린다'],
      3: ['신의 잔재가 저항한다', '무덤이 울부짖는다', '저주가 짙어진다', '고대의 힘이 깨어난다', '신의 분노가 극에 달한다'],
      4: ['핵심이 진동한다', '에코가 포효한다', '루프가 흔들린다', '끝이 — 보인다'],
    };
    const lines = clearLines[regionId] ?? [];
    const line = lines[Math.min(floor - 1, lines.length - 1)] ?? `${floor}층`;
    return `${regionName}  ·  ${line}`;
  },

  wrapCanvasText(ctx, text, x, y, maxW, lineH) {
    let line = '';
    let ly = y;
    for (const ch of text) {
      const test = line + ch;
      if (ctx.measureText(test).width > maxW && line.length > 0) {
        ctx.fillText(line, x + maxW / 2, ly);
        line = ch;
        ly += lineH;
      } else {
        line = test;
      }
    }
    if (line) ctx.fillText(line, x + maxW / 2, ly);
  },

  roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.arcTo(x + w, y, x + w, y + r, r);
    ctx.lineTo(x + w, y + h - r);
    ctx.arcTo(x + w, y + h, x + w - r, y + h, r);
    ctx.lineTo(x + r, y + h);
    ctx.arcTo(x, y + h, x, y + h - r, r);
    ctx.lineTo(x, y + r);
    ctx.arcTo(x, y, x + r, y, r);
    ctx.closePath();
  },

  roundRectTop(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.lineTo(x + w, y + h);
    ctx.lineTo(x, y + h);
    ctx.arcTo(x, y, x + r, y, r);
    ctx.closePath();
  },
};
