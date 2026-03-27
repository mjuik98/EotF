export function isEventChoiceDisabled(choice, state) {
  if (!choice) return false;
  if (typeof choice.isDisabled === 'function') return !!choice.isDisabled(state);
  return !!choice.disabled;
}

export function createEventChoiceResult(resultText, {
  isFail = false,
  shouldClose = false,
  isItemShop = false,
  acquiredCard,
  acquiredItem,
} = {}) {
  const resolution = {
    resultText: resultText ?? null,
    isFail,
    shouldClose,
    isItemShop,
  };
  if (acquiredCard) resolution.acquiredCard = acquiredCard;
  if (acquiredItem) resolution.acquiredItem = acquiredItem;
  return resolution;
}

export function createFailedEventChoiceResult(resultText, extra = {}) {
  return createEventChoiceResult(resultText, {
    ...extra,
    isFail: true,
    shouldClose: false,
  });
}

export function normalizeEventChoiceResult(event, result) {
  if (!result) {
    return createEventChoiceResult(null, { shouldClose: true });
  }
  if (result === '__item_shop_open__') {
    return createEventChoiceResult(null, { shouldClose: false, isItemShop: true });
  }
  if (typeof result === 'object' && result !== null) {
    const isFail = result.isFail === true;
    return createEventChoiceResult(result.resultText, {
      isFail,
      shouldClose: typeof result.shouldClose === 'boolean'
        ? result.shouldClose
        : !event?.persistent && !isFail,
      isItemShop: result.isItemShop === true,
      acquiredCard: result.acquiredCard,
      acquiredItem: result.acquiredItem,
    });
  }
  return createEventChoiceResult(result, { shouldClose: !event?.persistent });
}

export function pickRandomEventPolicy(gs, data) {
  if (!gs || !data?.events) return null;
  const pool = data.events.filter((event) => {
    if (event.layer === 2 && gs.currentFloor < 2) return false;
    if (typeof event?.isAvailable === 'function' && !event.isAvailable(gs, data)) return false;
    return true;
  });
  if (!pool.length) return null;
  return pool[Math.floor(Math.random() * pool.length)];
}
