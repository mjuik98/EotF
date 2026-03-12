import {
  applyEndingRank,
  appendEndingFragmentChoices,
  buildEndingPayload,
  buildEndingScreenDOM,
  decorateEndingPayloadForOutcome,
  docOf,
  ensureEndingScreenStyle,
  findRankIndexByGlyph,
  getEndingRanks,
  populateEndingMeta,
  winOf,
} from './ending_screen_helpers.js';
import { burstEndingWisps, initEndingFx } from './ending_screen_fx.js';
import { playEventResonanceBurst } from '../../domain/audio/audio_event_helpers.js';
import { scheduleEndingRestartAction } from './ending_screen_action_helpers.js';

export function buildEndingSessionPayload(outcome = 'victory', deps = {}) {
  return decorateEndingPayloadForOutcome(buildEndingPayload(deps?.gs, deps?.data), outcome);
}

export function mountEndingScreenRoot(doc, payload) {
  ensureEndingScreenStyle(doc);
  const root = buildEndingScreenDOM(doc, payload);
  doc.body.appendChild(root);
  return root;
}

export function createEndingSessionState(payload) {
  return { cleanups: [], timers: [], payload };
}

export function populateEndingScreenSession({
  doc,
  deps = {},
  hooks = {},
  outcome = 'victory',
  payload,
  session,
} = {}) {
  populateEndingMeta(doc, payload, session, deps);
  appendEndingFragmentChoices(doc, deps, outcome, session, hooks.cleanup);
  applyEndingRank(doc, payload.rank, payload.score);
  return initEndingFx(doc, deps, session);
}

export function prepareEndingScreenSession(outcome = 'victory', deps = {}, hooks = {}) {
  const doc = docOf(deps);
  const payload = buildEndingSessionPayload(outcome, deps);
  hooks.cleanup?.({ doc, win: deps?.win });
  const root = mountEndingScreenRoot(doc, payload);
  const session = createEndingSessionState(payload);

  const { wisps } = populateEndingScreenSession({
    doc,
    deps,
    hooks,
    outcome,
    payload,
    session,
  });
  return { payload, root, session, wisps };
}

export function bindEndingSigilCycle(doc, deps, payload, session, wisps) {
  const sigil = doc.getElementById('sigilWrap');
  const ranks = getEndingRanks();
  let rankIndex = findRankIndexByGlyph(payload.rank.glyph);

  const onSigil = () => {
    rankIndex = (rankIndex + 1) % ranks.length;
    applyEndingRank(doc, ranks[rankIndex], payload.score);
    const rect = sigil?.getBoundingClientRect?.();
    if (rect) {
      burstEndingWisps(wisps, rect.left + (rect.width / 2), rect.top + (rect.height / 2), 12);
    }
  };

  sigil?.addEventListener('click', onSigil);
  session.cleanups.push(() => sigil?.removeEventListener('click', onSigil));
}

export function bindEndingRestartButton(doc, deps, session, wisps, hooks = {}) {
  const restartButton = doc.getElementById('btnR');
  const onRestart = () => {
    const rect = restartButton?.getBoundingClientRect?.();
    const audio = deps.audioEngine || null;

    if (rect) {
      for (let i = 0; i < 5; i += 1) {
        session.timers.push(
          winOf(deps).setTimeout(() => {
            burstEndingWisps(
              wisps,
              rect.left + (rect.width / 2) + ((Math.random() - 0.5) * rect.width * 0.85),
              rect.top + (rect.height / 2),
              14,
            );
          }, i * 70),
        );
      }
    }

    playEventResonanceBurst(audio);
    scheduleEndingRestartAction(deps, {
      cleanup: hooks.cleanup,
      session,
    });
  };

  restartButton?.addEventListener('click', onRestart);
  session.cleanups.push(() => restartButton?.removeEventListener('click', onRestart));
}
