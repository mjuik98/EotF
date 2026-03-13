export function bindFinalizeRunOutcome(finalizeRunOutcome, saveSystem) {
  return (kind = 'defeat', options = {}, extraDeps = {}) => finalizeRunOutcome(kind, options, { saveSystem, ...extraDeps });
}
