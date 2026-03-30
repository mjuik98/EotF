export async function clickIfVisible(page, selector, timeout = 4000) {
  const handle = await page.waitForSelector(selector, { timeout, state: 'visible' }).catch(() => null);
  if (!handle) return false;
  await handle.click();
  return true;
}

export async function advanceRuntimeTime(page, ms) {
  await page.evaluate(async (duration) => {
    if (typeof globalThis.advanceTime === 'function') {
      await globalThis.advanceTime(duration);
      return;
    }
    await new Promise((resolve) => setTimeout(resolve, duration));
  }, ms);
}

export async function enterRunFlow(
  page,
  {
    nodeReadySelector = '#nodeCardOverlay',
    introOverlaySelector = '#introCinematicOverlay',
    settleMs = 250,
  } = {},
) {
  await page.click('#mainStartBtn');
  await page.waitForSelector('#btnCfm', { state: 'visible', timeout: 10000 });
  await page.click('#btnCfm');
  await page.waitForSelector('#btnRealStart', { state: 'visible', timeout: 10000 });
  await page.click('#btnRealStart');
  await clickIfVisible(page, introOverlaySelector, 10000);
  await page.waitForSelector('#storyContinueBtn', { state: 'visible', timeout: 10000 });
  await page.click('#storyContinueBtn');
  await page.waitForSelector(nodeReadySelector, { state: 'visible', timeout: 15000 });
  await page.waitForTimeout(settleMs);
}

export async function enterCombatFromRun(
  page,
  {
    nodeSelector = '.node-card',
    combatSelector = '#combatOverlay.active',
    settleMs = 1200,
  } = {},
) {
  await page.click(nodeSelector);
  await page.waitForSelector(combatSelector, { state: 'attached', timeout: 15000 });
  await advanceRuntimeTime(page, settleMs);
}
