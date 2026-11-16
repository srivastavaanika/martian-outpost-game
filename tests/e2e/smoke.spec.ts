import { expect, test } from '@playwright/test';
import type { Page } from '@playwright/test';

/** Mirrors `MartianOdysseyHook` in src/ui/testHook.ts (the e2e tsconfig has no DOM types). */
interface Hook {
  sceneReady: boolean;
  sol?: number;
  canvasCount: number;
  modules?: Record<string, { value: number }>;
}
type HookGlobal = { __MARTIAN_ODYSSEY__?: Hook };

async function cardIds(page: Page): Promise<(string | null)[]> {
  const cards = page.locator('[data-testid^="choice-"]');
  const ids: (string | null)[] = [];
  for (let i = 0; i < (await cards.count()); i++) ids.push(await cards.nth(i).getAttribute('data-testid'));
  return ids;
}

/** Tap the first card, check it flips to its lesson, then continue to the next sol. */
async function pickFirstCard(page: Page): Promise<void> {
  await page.locator('[data-testid^="choice-"]').first().click();
  await expect(page.getByTestId('lesson')).toBeVisible();
  await page.getByTestId('continue').click();
}

function trackErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(`${message.text()} ${message.location().url}`);
  });
  return errors;
}

test('a player can fly to Mars, enter the outpost and play until the debrief', async ({ page }) => {
  const errors = trackErrors(page);
  await page.goto('/?e2e&seed=1');
  await expect(page.getByRole('heading', { name: /Martian Odyssey/ })).toBeVisible();

  await page.getByRole('button', { name: /Skip/ }).click();
  await expect(page.getByTestId('enter')).toHaveText(/Let.s GO!/);
  await page.getByTestId('enter').click();

  await expect(page.getByRole('heading', { name: /Sol 215/ })).toBeVisible();
  await expect(page.getByTestId('event')).toBeVisible();
  await expect(page.locator('[data-testid="scene"] canvas')).toHaveCount(1);
  await page.waitForFunction(() => (globalThis as HookGlobal).__MARTIAN_ODYSSEY__?.sceneReady === true);

  for (let sol = 0; sol < 20; sol++) {
    if (await page.getByTestId('debrief').isVisible()) break;
    await pickFirstCard(page);
  }
  await expect(page.getByTestId('debrief')).toBeVisible();
  await expect(page.getByText('Real NASA science:')).toBeVisible();
  expect(errors).toEqual([]);
});

test('the scene snapshot matches the meters on the picture', async ({ page }) => {
  await page.goto('/?e2e&seed=1');
  await page.getByRole('button', { name: /Skip/ }).click();
  await page.getByTestId('enter').click();

  for (let sol = 0; sol < 3; sol++) {
    const expectedSol = sol + 1;
    await page.waitForFunction((n) => (globalThis as HookGlobal).__MARTIAN_ODYSSEY__?.sol === n, expectedSol);
    const hook = await page.evaluate(() => (globalThis as HookGlobal).__MARTIAN_ODYSSEY__);
    expect(hook?.canvasCount).toBe(1);
    for (const key of ['power', 'oxygen', 'water', 'food', 'radiation', 'waste'] as const) {
      const meterValue = await page.getByTestId(`meter-${key}`).getAttribute('aria-valuenow');
      expect(hook?.modules?.[key]?.value, key).toBe(Number(meterValue));
    }
    await pickFirstCard(page);
  }
});

test('Phaser loads only after Enter, and a restart leaves one canvas', async ({ page }) => {
  const sceneRequests: string[] = [];
  page.on('request', (request) => {
    if (/\/assets\/scene-[^/]+\.js$/.test(request.url())) sceneRequests.push(request.url());
  });
  await page.goto('/?seed=1');
  await page.getByRole('button', { name: /Skip/ }).click();
  await expect(page.getByTestId('enter')).toBeVisible();
  expect(sceneRequests).toEqual([]);

  await page.getByTestId('enter').click();
  await expect(page.locator('canvas')).toHaveCount(1);
  expect(sceneRequests).toHaveLength(1);

  for (let sol = 0; sol < 20; sol++) {
    if (await page.getByTestId('debrief').isVisible()) break;
    await pickFirstCard(page);
  }
  await page.getByRole('button', { name: /Try another mission/ }).click();
  await page.getByRole('button', { name: /Skip/ }).click();
  await page.getByTestId('enter').click();
  await expect(page.getByRole('heading', { name: /Sol 215/ })).toBeVisible();
  await expect(page.locator('canvas')).toHaveCount(1);
});

test('a meter explains itself on hover, keyboard focus and tap', async ({ page }) => {
  await page.goto('/?seed=1');
  await page.getByRole('button', { name: /Skip/ }).click();
  await page.getByTestId('enter').click();
  const meter = page.getByTestId('meter-oxygen');
  const tooltip = page.getByRole('tooltip', { name: /Oxygen \(kg\)/ });

  await meter.hover();
  await expect(tooltip).toBeVisible();
  await page.mouse.move(0, 0);
  await expect(tooltip).toBeHidden();

  await meter.focus();
  await expect(tooltip).toBeVisible();
  await meter.blur();
  await expect(tooltip).toBeHidden();

  await meter.dispatchEvent('click');
  await expect(tooltip).toBeVisible();
  await expect(meter).toHaveAttribute('aria-describedby', /.+/);
});

test('the same seed replays the same events and cards', async ({ page }) => {
  const play = async () => {
    await page.goto('/?e2e&seed=1');
    await page.getByRole('button', { name: /Skip/ }).click();
    await page.getByTestId('enter').click();
    const trail: string[] = [];
    for (let sol = 0; sol < 3; sol++) {
      const event = await page.getByTestId('event').locator('h2').innerText();
      trail.push(`${event}|${(await cardIds(page)).join(',')}`);
      await pickFirstCard(page);
    }
    return trail;
  };
  expect(await play()).toEqual(await play());
});
