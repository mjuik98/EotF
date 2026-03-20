import { playAttackSlash } from '../../../../domain/audio/audio_event_helpers.js';
import { unlockEventFlow } from '../../../../shared/state/runtime_flow_controls.js';

export function handleResolveEventChoiceFlowError(gs, audioEngine, err) {
  console.error('[resolveEvent] choice effect error:', err);
  unlockEventFlow(gs);
  playAttackSlash(audioEngine);
  return null;
}
