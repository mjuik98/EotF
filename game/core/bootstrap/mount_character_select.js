import {
  buildCharacterSelectMountPayload,
  ensureCharacterSelectShell,
} from '../../features/title/ports/runtime/public_title_runtime_surface.js';
import { getModuleRegistryScope } from '../bindings/module_registry_scopes.js';

export function mountCharacterSelect({ modules, deps, fns, doc }) {
  const coreModules = getModuleRegistryScope(modules, 'core');
  const runModules = getModuleRegistryScope(modules, 'run');
  const titleModules = getModuleRegistryScope(modules, 'title');
  const characterSelectUI = titleModules.CharacterSelectUI;

  if (!characterSelectUI) return;
  ensureCharacterSelectShell(doc);
  characterSelectUI.mount(
    buildCharacterSelectMountPayload({
      gs: coreModules.GS,
      audioEngine: coreModules.AudioEngine,
      saveSystem: runModules.SaveSystem,
      deps,
      fns,
      doc,
    }),
  );
}
