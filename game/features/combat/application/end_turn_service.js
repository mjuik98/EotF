import { endPlayerTurnPolicy } from '../../../domain/combat/turn/end_player_turn_policy.js';

export function endPlayerTurnService({
  gs,
  data,
  canPlay,
  classMechanics,
  endTurnPolicyOptions,
}) {
  const result = endPlayerTurnPolicy(gs, data, {
    canPlayFn: canPlay,
    ...endTurnPolicyOptions,
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
