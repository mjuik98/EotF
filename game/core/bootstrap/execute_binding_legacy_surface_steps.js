export function executeBindingLegacySurfaceSteps(context, steps) {
  for (const step of steps) {
    step(context);
  }
}
