import { TurnManager } from '../../combat/turn_manager.js';

export function endPlayerTurnService({
  gs,
  data,
  canPlay,
  classMechanics,
}) {
  const result = TurnManager.endPlayerTurnLogic(gs, data, {
    canPlayFn: canPlay,
  });
  if (!result) return null;

  const classMech = classMechanics?.[gs?.player?.class];
  if (classMech && typeof classMech.onTurnEnd === 'function') {
    classMech.onTurnEnd(gs);
  }

  return {
    result,
    ui: {
      resetChain: true,
      setEnemyTurn: true,
      cleanupTooltips: true,
      enemyTurnDelayMs: 700,
    },
  };
}
