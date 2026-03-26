function shiftHandIndex(index, removedIndex) {
  if (!Number.isInteger(index) || index < 0) return null;
  if (index === removedIndex) return null;
  if (index > removedIndex) return index - 1;
  return index;
}

function cloneCascadeCards(player) {
  const cascadeCards = player?._handScopedRuntime?.cascadeCards ?? player?._cascadeCards;
  if (!(cascadeCards instanceof Map)) return null;
  return new Map(cascadeCards);
}

function definePlayerHandScopedRuntime(player, runtime) {
  if (!player) return null;
  Object.defineProperty(player, '_handScopedRuntime', {
    configurable: true,
    enumerable: false,
    value: runtime,
    writable: true,
  });
  return runtime;
}

function getRuntimeCascadeCards(runtime, player) {
  if (player?._cascadeCards instanceof Map) {
    runtime.cascadeCards = player._cascadeCards;
    return runtime.cascadeCards;
  }
  if (runtime.cascadeCards instanceof Map) return runtime.cascadeCards;
  runtime.cascadeCards = new Map();
  return runtime.cascadeCards;
}

export function getHandScopedRuntimeState(state) {
  if (!state) return null;
  const playerRuntime = state.player?._handScopedRuntime;
  if (!state._handScopedRuntime || typeof state._handScopedRuntime !== 'object') {
    if (playerRuntime && typeof playerRuntime === 'object') state._handScopedRuntime = playerRuntime;
    else {
    state._handScopedRuntime = {
        costTargets: {
          glitch0Index: null,
          glitchPlusIndex: null,
          oilTargetIndex: null,
        },
      };
    }
  } else if (!state._handScopedRuntime.costTargets || typeof state._handScopedRuntime.costTargets !== 'object') {
    state._handScopedRuntime.costTargets = {
      costTargets: {
        glitch0Index: null,
        glitchPlusIndex: null,
        oilTargetIndex: null,
      },
    }.costTargets;
  }
  const runtime = state._handScopedRuntime;
  runtime.costTargets ||= {
    glitch0Index: null,
    glitchPlusIndex: null,
    oilTargetIndex: null,
  };
  runtime.cascadeCards = getRuntimeCascadeCards(runtime, state.player);
  if (state.player) {
    state.player._cascadeCards = runtime.cascadeCards;
    definePlayerHandScopedRuntime(state.player, runtime);
  }
  return state._handScopedRuntime;
}

export function getHandScopedCostTargets(state) {
  return getHandScopedRuntimeState(state)?.costTargets || null;
}

export function setHandScopedCostTarget(state, key, index) {
  const costTargets = getHandScopedCostTargets(state);
  if (!costTargets || !key) return null;
  costTargets[key] = Number.isInteger(index) && index >= 0 ? index : null;
  return costTargets[key];
}

export function clearHandScopedCostTargets(state, keys = null) {
  const costTargets = getHandScopedCostTargets(state);
  if (!costTargets) return false;

  const targetKeys = Array.isArray(keys) && keys.length > 0
    ? keys
    : Object.keys(costTargets);
  targetKeys.forEach((key) => {
    if (Object.prototype.hasOwnProperty.call(costTargets, key)) costTargets[key] = null;
  });
  return true;
}

export function clearHandScopedRuntimeState(state) {
  if (!state) return false;
  state._handScopedRuntime = null;
  if (state.player) {
    state.player._cascadeCards = new Map();
    definePlayerHandScopedRuntime(state.player, null);
  }
  return true;
}

export function captureHandScopedRuntimeState(state) {
  const costTargets = getHandScopedCostTargets(state);
  return {
    cascadeCards: cloneCascadeCards(state?.player),
    glitch0Index: Number.isInteger(costTargets?.glitch0Index) ? costTargets.glitch0Index : null,
    glitchPlusIndex: Number.isInteger(costTargets?.glitchPlusIndex) ? costTargets.glitchPlusIndex : null,
    oilTargetIndex: Number.isInteger(costTargets?.oilTargetIndex) ? costTargets.oilTargetIndex : null,
  };
}

export function restoreHandScopedRuntimeState(state, snapshot) {
  if (!state || !snapshot) return false;

  const runtime = getHandScopedRuntimeState(state);
  if (!runtime) return false;
  runtime.cascadeCards = snapshot.cascadeCards instanceof Map ? new Map(snapshot.cascadeCards) : new Map();
  if (state.player) state.player._cascadeCards = runtime.cascadeCards;

  const costTargets = runtime.costTargets;
  if (!costTargets) return false;
  costTargets.glitch0Index = Number.isInteger(snapshot.glitch0Index) ? snapshot.glitch0Index : null;
  costTargets.glitchPlusIndex = Number.isInteger(snapshot.glitchPlusIndex) ? snapshot.glitchPlusIndex : null;
  costTargets.oilTargetIndex = Number.isInteger(snapshot.oilTargetIndex) ? snapshot.oilTargetIndex : null;
  return true;
}

export function reindexHandScopedRuntimeState(state, removedIndex) {
  if (!state || !Number.isInteger(removedIndex) || removedIndex < 0) return false;

  const runtime = getHandScopedRuntimeState(state);
  if (runtime?.cascadeCards instanceof Map) {
    const remapped = new Map();
    for (const [index, cardId] of runtime.cascadeCards.entries()) {
      const nextIndex = shiftHandIndex(index, removedIndex);
      if (Number.isInteger(nextIndex)) remapped.set(nextIndex, cardId);
    }
    runtime.cascadeCards = remapped;
    if (state.player) state.player._cascadeCards = remapped;
  }

  const costTargets = runtime?.costTargets;
  if (costTargets) {
    costTargets.glitch0Index = shiftHandIndex(costTargets.glitch0Index, removedIndex);
    costTargets.glitchPlusIndex = shiftHandIndex(costTargets.glitchPlusIndex, removedIndex);
    costTargets.oilTargetIndex = shiftHandIndex(costTargets.oilTargetIndex, removedIndex);
  }
  return true;
}

export function getPlayerCascadeCards(player) {
  const runtimeCascade = player?._handScopedRuntime?.cascadeCards;
  if (runtimeCascade instanceof Map) return runtimeCascade;
  if (player?._cascadeCards instanceof Map) return player._cascadeCards;
  return null;
}

export function setHandScopedCascadeEntry(state, handIndex, cardId) {
  const runtime = getHandScopedRuntimeState(state);
  if (!(runtime?.cascadeCards instanceof Map) || !Number.isInteger(handIndex) || handIndex < 0 || !cardId) return false;
  runtime.cascadeCards.set(handIndex, cardId);
  if (state.player) state.player._cascadeCards = runtime.cascadeCards;
  return true;
}

export function resetHandScopedCascadeCards(state) {
  const runtime = getHandScopedRuntimeState(state);
  if (!runtime) return false;
  runtime.cascadeCards = new Map();
  if (state.player) state.player._cascadeCards = runtime.cascadeCards;
  return true;
}
