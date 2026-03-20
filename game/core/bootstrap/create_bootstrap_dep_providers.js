import * as Deps from '../deps_factory.js';

const STORY_DEP_CONTRACTS = Object.freeze({
  getStoryDeps: 'story',
});

const TITLE_BOOTSTRAP_DEP_CONTRACTS = Object.freeze({
  getClassSelectDeps: 'classSelect',
  getGameBootDeps: 'gameBoot',
  getHelpPauseDeps: 'helpPause',
});

function createStoryDepProviders(depsFactory = Deps) {
  return Deps.buildFeatureContractAccessors(STORY_DEP_CONTRACTS, depsFactory);
}

function createTitleBootstrapDepProviders(depsFactory = Deps) {
  return Deps.buildFeatureContractAccessors(TITLE_BOOTSTRAP_DEP_CONTRACTS, depsFactory);
}

export function createBootstrapDepProviders(depsFactory = Deps) {
  return {
    story: createStoryDepProviders(depsFactory),
    title: createTitleBootstrapDepProviders(depsFactory),
  };
}
