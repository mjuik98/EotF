import { buildTitleRunContractBuilders } from './build_title_run_contracts.js';
import { buildTitleStoryContractBuilders } from './build_title_story_contracts.js';

export function createTitleContractCapabilities() {
  return {
    buildRun: buildTitleRunContractBuilders,
    buildStory: buildTitleStoryContractBuilders,
  };
}
