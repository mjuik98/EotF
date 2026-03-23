import { playAttackSlash } from '../../ports/public_audio_runtime_capabilities.js';
import { unlockEventFlow } from '../../state/event_runtime_flow_ports.js';

export function handleResolveEventChoiceFlowError(gs, audioEngine, err) {
  console.error('[resolveEvent] choice effect error:', err);
  unlockEventFlow(gs);
  playAttackSlash(audioEngine);
  return null;
}
