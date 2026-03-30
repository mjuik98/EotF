import { playAttackSlash } from '../../ports/public_audio_runtime_capabilities.js';
import { unlockEventFlow } from '../../state/event_runtime_flow_ports.js';
import { Logger } from '../../../../shared/logging/public.js';

const EventChoiceFlowLogger = Logger.child('resolveEvent');

export function handleResolveEventChoiceFlowError(gs, audioEngine, err) {
  EventChoiceFlowLogger.error('choice effect error:', err);
  unlockEventFlow(gs);
  playAttackSlash(audioEngine);
  return null;
}
