import { buildCharacterSelectMountPayload } from '../../features/title/platform/browser/build_character_select_mount_payload.js';
import { getModuleRegistryScope } from '../bindings/module_registry_scopes.js';

export function mountCharacterSelect({ modules, deps, fns, doc }) {
  const titleModules = getModuleRegistryScope(modules, 'title');
  const characterSelectUI = titleModules.CharacterSelectUI || modules.CharacterSelectUI;

  if (!characterSelectUI) return;
  characterSelectUI.mount(
    buildCharacterSelectMountPayload({ modules, deps, fns, doc }),
  );
}
