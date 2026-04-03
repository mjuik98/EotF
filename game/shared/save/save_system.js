import { createOutboxMetrics } from './save_outbox_metrics.js';
import {
  OUTBOX_ENTRY_TTL_MS,
  OUTBOX_RETRY_BASE_MS,
  OUTBOX_RETRY_MAX_MS,
} from './save_outbox_queue.js';
import {
  DEFAULT_SAVE_SLOT,
  META_KEY,
  OUTBOX_KEY,
  SAVE_KEY,
} from './save_slot_keys.js';
import { saveSystemOutboxController } from './save_system_outbox_controller.js';
import { saveSystemPublicFacade } from './save_system_public_facade.js';

export const SaveSystem = {
  SAVE_KEY,
  META_KEY,
  OUTBOX_KEY,
  OUTBOX_ENTRY_TTL_MS,
  OUTBOX_RETRY_BASE_MS,
  OUTBOX_RETRY_MAX_MS,
  _outbox: [],
  _outboxLoaded: false,
  _outboxTimer: null,
  _outboxTimerAt: 0,
  _isFlushingOutbox: false,
  _outboxMetrics: createOutboxMetrics(),
  _selectedSlot: DEFAULT_SAVE_SLOT,
  ...saveSystemOutboxController,
  ...saveSystemPublicFacade,
};
