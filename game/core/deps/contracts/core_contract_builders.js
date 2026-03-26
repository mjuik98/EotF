import { buildFeatureContractBuilderGroup } from './build_feature_contract_builder_group.js';
import { buildCombatTurnBaseContract } from './build_combat_turn_base_contract.js';
import { buildRewardContract } from './build_reward_contract.js';
import { buildSaveSystemContract } from './build_save_system_contract.js';

const CORE_FEATURE_CONTRACT_BUILDERS = Object.freeze([
  { feature: 'event', capability: 'buildEvent' },
  { feature: 'event', capability: 'buildFlow' },
  { feature: 'combat', capability: 'buildFlow' },
  { feature: 'reward', capability: 'buildFlow' },
  { feature: 'run', capability: 'buildReturn' },
  { feature: 'title', capability: 'buildStory' },
]);

export function buildCoreContractBuilders(ctx) {
  const {
    getRefs,
    buildBaseDeps,
    getHudDeps,
    getCombatDeps,
    featureContracts,
  } = ctx;
  const featureBuilderGroup = buildFeatureContractBuilderGroup({
    featureContracts,
    ctx,
    definitions: CORE_FEATURE_CONTRACT_BUILDERS,
  });

  return {
    base: () => ({
      ...buildBaseDeps('run'),
    }),

    story: featureBuilderGroup.story,

    combatTurnBase: () => buildCombatTurnBaseContract({ getRefs, getCombatDeps, getHudDeps }),

    event: featureBuilderGroup.event,

    combatFlow: featureBuilderGroup.combatFlow,

    eventFlow: featureBuilderGroup.eventFlow,

    reward: () => buildRewardContract({ getRefs, buildBaseDeps }),

    rewardFlow: featureBuilderGroup.rewardFlow,

    runReturn: featureBuilderGroup.runReturn,

    saveSystem: () => buildSaveSystemContract({ getRefs, buildBaseDeps }),
  };
}
