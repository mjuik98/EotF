export function prepareMazeOpenState(fovEngine, isBoss) {
  fovEngine?.generateMaze?.(21, 13);
  const size = fovEngine?.getSize?.();
  if (!size) return null;
  return {
    pendingCombat: isBoss ? 'boss' : 'combat',
    stepCount: 0,
    W: size.W,
    H: size.H,
    map: fovEngine.getMap(),
    px: 1,
    py: 1,
    fovActive: true,
  };
}

export function resolveMazeMove({ dx, dy, px, py, map, stepCount, W, H }) {
  const nextX = px + dx;
  const nextY = py + dy;
  if (!map?.[nextY] || map[nextY][nextX] !== 0) {
    return {
      moved: false,
      px,
      py,
      stepCount,
      shouldExit: false,
    };
  }

  const nextStepCount = stepCount + 1;
  return {
    moved: true,
    px: nextX,
    py: nextY,
    stepCount: nextStepCount,
    shouldExit: nextX >= W - 2 && nextY >= H - 2,
  };
}

export function handleMazeExit({
  pendingCombat,
  showWorldMemoryNotice,
  startCombat,
  setTimeoutFn = setTimeout,
}) {
  if (typeof showWorldMemoryNotice === 'function') {
    showWorldMemoryNotice('🚪 출구 발견! 전투가 시작된다...');
  }
  setTimeoutFn(() => {
    if (typeof startCombat === 'function') {
      startCombat(pendingCombat === 'boss');
    }
  }, 800);
}
