import { createTitlePorts } from '../../ports/create_title_ports.js';
import { createTitleDepProviders } from './title_dep_providers.js';
import { createTitleRuntimeEffects } from './title_runtime_effects.js';

function resolveDoc(options = {}) {
  return options.doc || null;
}

function resolveWin(options = {}, doc) {
  return options.win || doc?.defaultView || null;
}

export function createTitleBindingPorts(modules, fns, options = {}) {
  const doc = resolveDoc(options);
  const win = resolveWin(options, doc);
  const depProviders = options.depProviders || createTitleDepProviders(options.depsFactory);
  const runtimeEffects = options.runtimeEffects || createTitleRuntimeEffects();

  return createTitlePorts(modules, fns, {
    doc,
    win,
    setTimeoutFn: options.setTimeoutFn || win?.setTimeout?.bind?.(win) || setTimeout,
    ...depProviders,
    ...runtimeEffects,
  });
}
