import { Actions } from './state_actions.js';

export const CoreEvents = Object.freeze({
  LOG_ADD: 'log:add',
});

const ACTION_ENVELOPE_REQUIRED_KEYS = ['type', 'ts'];

export const EventContracts = Object.freeze(
  Object.fromEntries(
    Object.values(Actions).map((eventName) => [
      eventName,
      { required: ACTION_ENVELOPE_REQUIRED_KEYS },
    ]),
  ),
);

function isActionEvent(eventName) {
  return typeof eventName === 'string' && eventName.includes(':');
}

export function normalizeEventPayload(eventName, payload) {
  if (!isActionEvent(eventName)) return payload;

  if (payload && typeof payload === 'object' && !Array.isArray(payload)) {
    // Dispatch envelope already in place; enrich with standard metadata.
    if ('payload' in payload && 'result' in payload && 'gs' in payload) {
      return {
        type: eventName,
        ts: Date.now(),
        ...payload,
      };
    }
  }

  return {
    type: eventName,
    ts: Date.now(),
    payload: payload ?? null,
  };
}

export function validateEventPayload(eventName, payload) {
  const contract = EventContracts[eventName];
  if (!contract) return [];

  const missing = [];
  for (const key of contract.required || []) {
    if (!payload || !(key in payload)) missing.push(key);
  }
  return missing;
}

