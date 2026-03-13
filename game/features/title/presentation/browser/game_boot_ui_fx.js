export { countUp } from './game_boot_ui_count_fx.js';
export { startAudioWave, stopAudioWave } from './game_boot_ui_audio_fx.js';
export { startLoreTicker, stopLoreTicker } from './game_boot_ui_lore_fx.js';
export { setupKeyboardNav } from './game_boot_ui_nav_fx.js';
export { fireWarpBurst } from './game_boot_ui_warp_fx.js';

import { stopAudioWave } from './game_boot_ui_audio_fx.js';
import { stopLoreTicker } from './game_boot_ui_lore_fx.js';
import { resetKeyboardNav } from './game_boot_ui_nav_fx.js';

export function teardownTitleFx() {
  stopAudioWave();
  stopLoreTicker();
  resetKeyboardNav();
}
