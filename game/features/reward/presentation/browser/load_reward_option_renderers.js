let rewardOptionRenderersPromise = null;

export async function loadRewardOptionRenderers() {
  if (!rewardOptionRenderersPromise) {
    rewardOptionRenderersPromise = import('./reward_ui_options.js').catch((error) => {
      rewardOptionRenderersPromise = null;
      throw error;
    });
  }

  return rewardOptionRenderersPromise;
}
