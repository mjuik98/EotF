export function bindFinalizeRunOutcome(finalizeRunOutcome, saveSystem) {
  return (kind = 'defeat', options = {}) => finalizeRunOutcome(kind, options, { saveSystem });
}
