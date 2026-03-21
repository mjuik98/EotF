import { createLazyEventModule } from '../../../features/event/platform/browser/create_lazy_event_module.js';

export function registerEventModules() {
  return {
    EventUI: createLazyEventModule(),
  };
}
