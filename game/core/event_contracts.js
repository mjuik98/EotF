import { Actions } from './state_actions.js';

export const CoreEvents = Object.freeze({
  LOG_ADD: 'log:add',
});

const ACTION_ENVELOPE_REQUIRED_KEYS = ['type', 'ts', 'payload'];
const ACTION_EVENT_NAMES = new Set(Object.values(Actions));

function isPlainObject(value) {
  return !!value && typeof value === 'object' && !Array.isArray(value);
}

function buildActionContracts() {
  return Object.fromEntries(
    Object.values(Actions).map((eventName) => [
      eventName,
      {
        required: ACTION_ENVELOPE_REQUIRED_KEYS,
        validate: (payload) => {
          const issues = [];
          if (!isPlainObject(payload)) {
            issues.push('payload must be an object envelope');
            return issues;
          }
          if (typeof payload.type !== 'string') issues.push('type must be a string');
          if (typeof payload.ts !== 'number') issues.push('ts must be a number');
          if (!('payload' in payload)) issues.push('payload field is required');
          return issues;
        },
      },
    ]),
  );
}

const CORE_EVENT_CONTRACTS = Object.freeze({
  [CoreEvents.LOG_ADD]: {
    required: ['msg', 'type'],
    validate: (payload) => {
      const issues = [];
      if (!isPlainObject(payload)) {
        issues.push('core payload must be an object');
        return issues;
      }
      if (typeof payload.msg !== 'string') issues.push('msg must be a string');
      if (typeof payload.type !== 'string') issues.push('type must be a string');
      return issues;
    },
  },
});

export const EventContracts = Object.freeze({
  ...buildActionContracts(),
  ...CORE_EVENT_CONTRACTS,
});

function isActionEvent(eventName) {
  return ACTION_EVENT_NAMES.has(eventName);
}

export function listContractEvents() {
  return Object.keys(EventContracts);
}

export function normalizeEventPayload(eventName, payload) {
  if (!isActionEvent(eventName)) return payload;

  if (isPlainObject(payload)) {
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

  const issues = [];
  for (const key of contract.required || []) {
    if (!payload || !(key in payload)) issues.push(`missing:${key}`);
  }

  if (typeof contract.validate === 'function') {
    const validationIssues = contract.validate(payload);
    if (Array.isArray(validationIssues)) {
      issues.push(...validationIssues.map((msg) => `invalid:${msg}`));
    }
  }

  return issues;
}
