# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: smoke.spec.ts >> the scene snapshot matches the meters on the picture
- Location: tests/e2e/smoke.spec.ts:59:1

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByTestId('lesson')
Expected: visible
Error: element(s) not found

Call log:
  - Expect "toBeVisible" getByTestId('lesson') with timeout 5000ms
  - waiting for getByTestId('lesson')
  - Target page, context or browser has been closed

```

```yaml
- main:
  - 'figure "Picture: NASA artist''s concept of a future Mars base (PIA23302). It is a drawing, not a photo - no one has built a Mars base yet."':
    - 'img "Artist''s picture of a future Mars base: tube-shaped homes, a rover and two astronauts on red, rocky ground."'
    - text: "Picture: NASA artist's concept of a future Mars base (PIA23302). It is a drawing, not a photo - no one has built a Mars base yet."
  - heading "Sol 215" [level=1]
  - text: 2024-05-07 sol 2 of 16
  - meter "Coins from science": Coins from science 0 / 100
  - meter "Power": Power 73 kWh
  - meter "Oxygen": Oxygen 215 kg
  - meter "Water": Water 4.45 kL
  - meter "Food": Food 98 kg
  - meter "Radiation dose": Radiation dose 4.67 mSv
  - meter "Waste": Waste 140 kg
  - heading "Swirling Red Dust Storm!" [level=2]
  - paragraph: A giant wall of Martian dust is blowing toward the outpost! Thick dust will coat our solar panels and cut our electricity unless we fold them away.
  - paragraph: "If nobody handles it: Power −20 kWh"
  - paragraph:
    - strong: "Yesterday (Sol 214):"
    - text: Grow food in the greenhouse. ☀️ A HUGE real solar flare (X4.5) hit today. Extra radiation reached the crew.
  - button "🛰️ Real NASA DONKI data (snapshot 2026-11-15) - where does this come from?"
  - heading "What should the crew do today?" [level=2]
  - group: 📒 Mission log (1 sols)
  - button "Drive the rover to explore Explore far away for big discoveries. The rover uses lots of power and you are outside. What this costs and gives":
    - text: Drive the rover to explore Explore far away for big discoveries. The rover uses lots of power and you are outside.
    - list "What this costs and gives":
      - listitem: Power −10 kWh
      - listitem: Oxygen −8 kg
      - listitem: Radiation dose +1 mSv
      - listitem: Coins +25
  - 'button "Leave the solar panels out Handles: Swirling Red Dust Storm! - stops half of it Keep the panels open to catch every last ray of sunlight and run the dust-wipers on max. What this costs and gives"':
    - text: "Leave the solar panels out Handles: Swirling Red Dust Storm! - stops half of it Keep the panels open to catch every last ray of sunlight and run the dust-wipers on max."
    - list "What this costs and gives":
      - listitem: Power −4 kWh
      - listitem: Waste +5 kg
      - listitem: Coins +4
  - button "Clean the solar panels Go outside and brush off the dust so the panels make more power. What this costs and gives":
    - text: Clean the solar panels Go outside and brush off the dust so the panels make more power.
    - list "What this costs and gives":
      - listitem: Power +20 kWh
      - listitem: Oxygen −5 kg
      - listitem: Radiation dose +0.5 mSv
  - 'button "Fold and retract the panels Handles: Swirling Red Dust Storm! - stops all of it Pull the solar arrays safely inside their protective covers until the storm blows past. What this costs and gives"':
    - text: "Fold and retract the panels Handles: Swirling Red Dust Storm! - stops all of it Pull the solar arrays safely inside their protective covers until the storm blows past."
    - list "What this costs and gives":
      - listitem: Power −6 kWh
```

```
Error: write EPIPE
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
> 23  |   await expect(page.getByTestId('lesson')).toBeVisible();
      |   ^ Error: write EPIPE
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
  42  |   await expect(page.getByTestId('enter')).toHaveText(/Let.s GO!/);
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
```