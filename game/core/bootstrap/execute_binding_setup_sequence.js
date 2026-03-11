export function executeBindingSetupSequence(context, steps) {
  for (const step of steps) {
    step(context);
  }
  return context.fns;
}
