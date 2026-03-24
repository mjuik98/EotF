export function decrementStackedBuff(buffBag, buffId) {
  const buff = buffBag?.[buffId];
  if (!buff || !Number.isFinite(buff.stacks)) return false;
  buff.stacks--;
  if (buff.stacks <= 0) {
    delete buffBag[buffId];
  }
  return true;
}

export function drawFromRandomPlayerPool(gs, pools, pickIndex) {
  let remaining = pickIndex;
  for (const pool of pools) {
    if (remaining < pool.cards.length) {
      const [cardId] = pool.cards.splice(remaining, 1);
      return { poolKey: pool.key, cardId };
    }
    remaining -= pool.cards.length;
  }
  return { poolKey: null, cardId: null };
}
