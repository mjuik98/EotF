import { buildCharacterSelectMountPayload } from '../../features/title/platform/browser/build_character_select_mount_payload.js';

export function mountCharacterSelect({ modules, deps, fns, doc }) {
  if (!modules.CharacterSelectUI) return;
  modules.CharacterSelectUI.mount(
    buildCharacterSelectMountPayload({ modules, deps, fns, doc }),
  );
}
