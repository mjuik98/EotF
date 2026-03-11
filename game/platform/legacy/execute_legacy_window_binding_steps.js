export function executeLegacyWindowBindingSteps(context, steps) {
  for (const step of steps) {
    step(context);
  }
}
