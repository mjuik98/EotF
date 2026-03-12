import { buildRestOptions } from '../../../domain/event/rest/build_rest_options.js';

export function createRestEventService({ regionResolver, uiActions }) {
  return {
    create(gs, data) {
      const activeRegionId = regionResolver(gs);
      const options = buildRestOptions(gs, {
        activeRegionId,
        upgradeMap: data?.upgradeMap,
      });

      return {
        id: 'rest',
        eyebrow: '휴식',
        title: '잔향의 안식처',
        desc: '고요한 공명 속에서 덱을 정비할 수 있다.',
        choices: options.map((option) => ({
          text: option.text,
          isDisabled: option.isDisabled,
          disabledReason: option.disabledReason,
          effect: (state) => uiActions.handleChoice(option.id, state, data),
        })),
      };
    },
  };
}
