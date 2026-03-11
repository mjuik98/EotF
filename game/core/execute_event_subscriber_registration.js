export function executeEventSubscriberRegistration(ctx, registrars) {
  for (const registerSubscribers of registrars) {
    registerSubscribers(ctx);
  }
}
