# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: smoke.spec.ts >> a player can fly to Mars, enter the outpost and play until the debrief
- Location: tests/e2e/smoke.spec.ts:36:1

# Error details

```
Error: expect(locator).toHaveText(expected) failed

Locator: getByTestId('enter')
Expected pattern: /Let.s GO!/
Received string:  "Enter 🚪"
Timeout: 5000ms

Call log:
  - Expect "toHaveText" getByTestId('enter') with timeout 5000ms
  - waiting for getByTestId('enter')
    14 × locator resolved to <button type="button" data-testid="enter" class="min-h-14 self-start rounded-full bg-yellow-400 px-10 py-4 text-2xl font-black text-slate-950 hover:bg-yellow-300">Enter 🚪</button>
       - unexpected value "Enter 🚪"

```

```yaml
- button "Enter 🚪"
```

# Test source

```ts
  1   | import { expect, test } from '@playwright/test';
  2   | import type { Page } from '@playwright/test';
  3   | 
  4   | /** Mirrors `MartianOdysseyHook` in src/ui/testHook.ts (the e2e tsconfig has no DOM types). */
  5   | interface Hook {
  6   |   sceneReady: boolean;
  7   |   sol?: number;
  8   |   canvasCount: number;
  9   |   modules?: Record<string, { value: number }>;
  10  | }
  11  | type HookGlobal = { __MARTIAN_ODYSSEY__?: Hook };
  12  | 
  13  | async function cardIds(page: Page): Promise<(string | null)[]> {
  14  |   const cards = page.locator('[data-testid^="choice-"]');
  15  |   const ids: (string | null)[] = [];
  16  |   for (let i = 0; i < (await cards.count()); i++) ids.push(await cards.nth(i).getAttribute('data-testid'));
  17  |   return ids;
  18  | }
  19  | 
  20  | /** Tap the first card, check it flips to its lesson, then continue to the next sol. */
  21  | async function pickFirstCard(page: Page): Promise<void> {
  22  |   await page.locator('[data-testid^="choice-"]').first().click();
  23  |   await expect(page.getByTestId('lesson')).toBeVisible();
  24  |   await page.getByTestId('continue').click();
  25  | }
  26  | 
  27  | function trackErrors(page: Page): string[] {
  28  |   const errors: string[] = [];
  29  |   page.on('pageerror', (error) => errors.push(error.message));
  30  |   page.on('console', (message) => {
  31  |     if (message.type() === 'error') errors.push(`${message.text()} ${message.location().url}`);
  32  |   });
  33  |   return errors;
  34  | }
  35  | 
  36  | test('a player can fly to Mars, enter the outpost and play until the debrief', async ({ page }) => {
  37  |   const errors = trackErrors(page);
  38  |   await page.goto('/?e2e&seed=1');
  39  |   await expect(page.getByRole('heading', { name: /Martian Odyssey/ })).toBeVisible();
  40  | 
  41  |   await page.getByRole('button', { name: /Skip/ }).click();
> 42  |   await expect(page.getByTestId('enter')).toHaveText(/Let.s GO!/);
      |                                           ^ Error: expect(locator).toHaveText(expected) failed
  43  |   await page.getByTestId('enter').click();
  44  | 
  45  |   await expect(page.getByRole('heading', { name: /Sol 215/ })).toBeVisible();
  46  |   await expect(page.getByTestId('event')).toBeVisible();
  47  |   await expect(page.locator('[data-testid="scene"] canvas')).toHaveCount(1);
  48  |   await page.waitForFunction(() => (globalThis as HookGlobal).__MARTIAN_ODYSSEY__?.sceneReady === true);
  49  | 
  50  |   for (let sol = 0; sol < 20; sol++) {
  51  |     if (await page.getByTestId('debrief').isVisible()) break;
  52  |     await pickFirstCard(page);
  53  |   }
  54  |   await expect(page.getByTestId('debrief')).toBeVisible();
  55  |   await expect(page.getByText('Real NASA science:')).toBeVisible();
  56  |   expect(errors).toEqual([]);
  57  | });
  58  | 
  59  | test('the scene snapshot matches the meters on the picture', async ({ page }) => {
  60  |   await page.goto('/?e2e&seed=1');
  61  |   await page.getByRole('button', { name: /Skip/ }).click();
  62  |   await page.getByTestId('enter').click();
  63  | 
  64  |   for (let sol = 0; sol < 3; sol++) {
  65  |     const expectedSol = sol + 1;
  66  |     await page.waitForFunction((n) => (globalThis as HookGlobal).__MARTIAN_ODYSSEY__?.sol === n, expectedSol);
  67  |     const hook = await page.evaluate(() => (globalThis as HookGlobal).__MARTIAN_ODYSSEY__);
  68  |     expect(hook?.canvasCount).toBe(1);
  69  |     for (const key of ['power', 'oxygen', 'water', 'food', 'radiation', 'waste'] as const) {
  70  |       const meterValue = await page.getByTestId(`meter-${key}`).getAttribute('aria-valuenow');
  71  |       expect(hook?.modules?.[key]?.value, key).toBe(Number(meterValue));
  72  |     }
  73  |     await pickFirstCard(page);
  74  |   }
  75  | });
  76  | 
  77  | test('Phaser loads only after Enter, and a restart leaves one canvas', async ({ page }) => {
  78  |   const sceneRequests: string[] = [];
  79  |   page.on('request', (request) => {
  80  |     if (/\/assets\/scene-[^/]+\.js$/.test(request.url())) sceneRequests.push(request.url());
  81  |   });
  82  |   await page.goto('/?seed=1');
  83  |   await page.getByRole('button', { name: /Skip/ }).click();
  84  |   await expect(page.getByTestId('enter')).toBeVisible();
  85  |   expect(sceneRequests).toEqual([]);
  86  | 
  87  |   await page.getByTestId('enter').click();
  88  |   await expect(page.locator('canvas')).toHaveCount(1);
  89  |   expect(sceneRequests).toHaveLength(1);
  90  | 
  91  |   for (let sol = 0; sol < 20; sol++) {
  92  |     if (await page.getByTestId('debrief').isVisible()) break;
  93  |     await pickFirstCard(page);
  94  |   }
  95  |   await page.getByRole('button', { name: /Try another mission/ }).click();
  96  |   await page.getByRole('button', { name: /Skip/ }).click();
  97  |   await page.getByTestId('enter').click();
  98  |   await expect(page.getByRole('heading', { name: /Sol 215/ })).toBeVisible();
  99  |   await expect(page.locator('canvas')).toHaveCount(1);
  100 | });
  101 | 
  102 | test('a meter explains itself on hover, keyboard focus and tap', async ({ page }) => {
  103 |   await page.goto('/?seed=1');
  104 |   await page.getByRole('button', { name: /Skip/ }).click();
  105 |   await page.getByTestId('enter').click();
  106 |   const meter = page.getByTestId('meter-oxygen');
  107 |   const tooltip = page.getByRole('tooltip', { name: /Oxygen \(kg\)/ });
  108 | 
  109 |   await meter.hover();
  110 |   await expect(tooltip).toBeVisible();
  111 |   await page.mouse.move(0, 0);
  112 |   await expect(tooltip).toBeHidden();
  113 | 
  114 |   await meter.focus();
  115 |   await expect(tooltip).toBeVisible();
  116 |   await meter.blur();
  117 |   await expect(tooltip).toBeHidden();
  118 | 
  119 |   await meter.dispatchEvent('click');
  120 |   await expect(tooltip).toBeVisible();
  121 |   await expect(meter).toHaveAttribute('aria-describedby', /.+/);
  122 | });
  123 | 
  124 | test('the same seed replays the same events and cards', async ({ page }) => {
  125 |   const play = async () => {
  126 |     await page.goto('/?e2e&seed=1');
  127 |     await page.getByRole('button', { name: /Skip/ }).click();
  128 |     await page.getByTestId('enter').click();
  129 |     const trail: string[] = [];
  130 |     for (let sol = 0; sol < 3; sol++) {
  131 |       const event = await page.getByTestId('event').locator('h2').innerText();
  132 |       trail.push(`${event}|${(await cardIds(page)).join(',')}`);
  133 |       await pickFirstCard(page);
  134 |     }
  135 |     return trail;
  136 |   };
  137 |   expect(await play()).toEqual(await play());
  138 | });
  139 | 
```