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

export function prepareEndingScreenSession(outcome = 'victory', deps = {}, hooks = {}) {
  const doc = docOf(deps);
  const payload = decorateEndingPayloadForOutcome(buildEndingPayload(deps?.gs, deps?.data), outcome);

  hooks.cleanup?.({ doc, win: deps?.win });
  ensureEndingScreenStyle(doc);

  const root = buildEndingScreenDOM(doc, payload);
  doc.body.appendChild(root);

  const session = { cleanups: [], timers: [], payload };
  populateEndingMeta(doc, payload, session, deps);
  appendEndingFragmentChoices(doc, deps, outcome, session, hooks.cleanup);
  applyEndingRank(doc, payload.rank, payload.score);

  const { wisps } = initEndingFx(doc, deps, session);
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
    const restart = deps.restartFromEnding;

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
    session.timers.push(winOf(deps).setTimeout(() => {
      hooks.cleanup?.({ doc, win: deps?.win });
      if (typeof restart === 'function') restart();
    }, 420));
  };

  restartButton?.addEventListener('click', onRestart);
  session.cleanups.push(() => restartButton?.removeEventListener('click', onRestart));
}
