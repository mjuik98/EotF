export function buildCombatEndItemTriggerPayload({
  isBoss = false,
  victory = false,
  defeated = false,
  abandoned = false,
} = {}) {
  return {
    isBoss: !!isBoss,
    victory: !!victory,
    defeated: !!defeated,
    abandoned: !!abandoned,
  };
}
