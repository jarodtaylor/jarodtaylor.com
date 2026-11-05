/**
 * pnpm check:hero-runtime — the home page's hero runtime (src/components/Hero/runtime.ts) and the intro-arming
 * script (src/components/Hero/intro-arm.js, inlined in index.astro), on the built page.
 *
 * The first tests pin what a visitor sees: the intro, Peek, reduced motion. Two pin what the runtime must also do for
 * the Storybook hero story: follow inline token overrides on <html>, and survive the arming script running again
 * before its 4 s failsafe fires. Then Remix: a live brand switch for every brand pair (at rest, mid-intro, mid-Peek)
 * must land like a fresh load, and each brand's intro plays once per tab. Last, the plotter ground keeps off the text.
 */
import { expect, test, type Page } from '@playwright/test';

const html = (page: Page) => page.locator('html');

/** A checksum of the hero canvas's pixels, so two samples tell a moving figure from a still one. */
const canvasSum = (page: Page) =>
  page.evaluate(() => {
    const canvas = document.querySelector<HTMLCanvasElement>('canvas.field')!;
    if (!canvas.width || !canvas.height) return 0;
    const { data } = canvas.getContext('2d')!.getImageData(0, 0, canvas.width, canvas.height);
    let sum = 0;
    for (let i = 3; i < data.length; i += 4) sum = (sum + data[i]! * (i % 9973)) % 2_147_483_647;
    return sum;
  });

/** Run the arming script again, as the hero story will on each mount: its text, from the page, as a fresh script. */
const rearm = (page: Page) =>
  page.evaluate(() => {
    const source = [...document.scripts].find((s) => s.textContent?.includes('jt-intro'));
    if (!source) throw new Error('intro-arming script not found in the page');
    const s = document.createElement('script');
    s.textContent = source.textContent;
    document.head.append(s);
  });

test('backstage ?intro: the intro plays, then the page settles', async ({ page }) => {
  await page.goto('/?brand=backstage&intro');
  await expect(html(page)).toHaveClass(/\bintro\b/);
  await expect(html(page)).toHaveAttribute('data-peek-state', 'on');
  await expect(html(page)).not.toHaveClass(/\bintro\b/, { timeout: 15_000 });
  await expect(html(page)).not.toHaveAttribute('data-peek-state');
});

test('backstage ?intro: once the intro leaves, the Skip button goes with it, as keys and pointer stop skipping', async ({ page }) => {
  await page.goto('/?brand=backstage&intro');
  const skip = page.locator('[data-skip-intro]');
  await expect(html(page)).toHaveAttribute('data-peek-state', 'on');
  await expect(skip).toBeVisible();
  // Read in the page, on the first frame of the leave: a retrying assertion would pass once the leave had ended.
  const leaving = await page.waitForFunction(
    () => {
      const root = document.documentElement;
      if (root.dataset.peekState !== 'leaving') return false;
      return { intro: root.classList.contains('intro'), skip: getComputedStyle(document.querySelector('[data-skip-intro]')!).display };
    },
    null,
    { polling: 'raf', timeout: 15_000 },
  );
  expect(await leaving.jsonValue()).toEqual({ intro: true, skip: 'none' });
});

test('clean: no intro, and the Peek toggle opens and closes Peek', async ({ page }) => {
  await page.goto('/?brand=clean');
  const toggle = page.locator('[data-peek-toggle]');
  await expect(html(page)).not.toHaveClass(/\bintro\b/);
  await expect(html(page)).not.toHaveAttribute('data-peek-state');

  await toggle.click();
  await expect(toggle).toHaveAttribute('aria-pressed', 'true');
  await expect(html(page)).toHaveAttribute('data-peek-state', 'on');

  await toggle.click();
  await expect(toggle).toHaveAttribute('aria-pressed', 'false');
  await expect(html(page)).not.toHaveAttribute('data-peek-state', { timeout: 5_000 });
});

test('Peek pressed again while it leaves redraws at full strength', async ({ page }) => {
  await page.goto('/?brand=backstage');
  const toggle = page.locator('[data-peek-toggle]');
  await toggle.click();
  await expect(html(page)).toHaveAttribute('data-peek-state', 'on');
  await page.waitForTimeout(2_000); // let the build land
  // The two timed presses run in the page, so test-runner latency can't push the re-press past the leave.
  const { was, layer } = await page.evaluate(async () => {
    const root = document.documentElement;
    const button = document.querySelector<HTMLElement>('[data-peek-toggle]')!;
    const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));
    button.click(); // start leaving
    await wait(150); // mid-fade
    const was = root.dataset.peekState;
    button.click(); // press again
    await wait(300); // where the bug read 0.06
    return { was, layer: Number(getComputedStyle(root).getPropertyValue('--_layer')) };
  });
  expect(was).toBe('leaving');
  expect(layer).toBeGreaterThan(0.99);
});

test('reduced motion: no intro classes are ever added, and Peek still works', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  // Record every class <html> ever has, from before the first script runs.
  await page.addInitScript(() => {
    const w = window as unknown as { introClasses: string[] };
    w.introClasses = [];
    new MutationObserver(() => {
      for (const c of document.documentElement.classList) if (c === 'intro' || c === 'building') w.introClasses.push(c);
    }).observe(document, { attributes: true, attributeFilter: ['class'], subtree: true });
  });
  // ?intro forces the intro; reduced motion must still win.
  await page.goto('/?brand=backstage&intro');
  const toggle = page.locator('[data-peek-toggle]');
  await toggle.click();
  await expect(html(page)).toHaveAttribute('data-peek-state', 'on');
  await toggle.click();
  await expect(html(page)).not.toHaveAttribute('data-peek-state', { timeout: 5_000 });
  expect(await page.evaluate(() => (window as unknown as { introClasses: string[] }).introClasses)).toEqual([]);
});

test('an inline --hero-figure / --hero-ground on <html> switches the running figure without a reload', async ({ page }) => {
  await page.goto('/?brand=clean');
  await page.evaluate(() => ((window as unknown as { sameDocument: boolean }).sameDocument = true));
  // Clean paints the lattice, whose ring moves every frame.
  await expect.poll(() => canvasSum(page)).not.toBe(0);

  // Switch to the plotter: its head parks for 1.4 s before it moves, so two close samples match.
  await page.evaluate(() => {
    document.documentElement.style.setProperty('--hero-figure', 'construction');
    document.documentElement.style.setProperty('--hero-ground', 'plotter');
  });
  await page.waitForTimeout(300);
  const a = await canvasSum(page);
  await page.waitForTimeout(250);
  const b = await canvasSum(page);
  expect(a, 'the plotter painted nothing').not.toBe(0);
  expect(b, 'the canvas kept animating: the lattice is still running').toBe(a);
  // …and then the plotter's head walks.
  await expect.poll(() => canvasSum(page), { timeout: 5_000 }).not.toBe(b);
  expect(await page.evaluate(() => (window as unknown as { sameDocument?: boolean }).sameDocument)).toBe(true);
});

test('arming twice within 4 s: the second arming is not cancelled by the first failsafe', async ({ page }) => {
  await page.goto('/?brand=backstage&intro');
  await expect(html(page)).not.toHaveClass(/\bintro\b/, { timeout: 15_000 });

  await rearm(page);
  await expect(html(page)).toHaveClass(/\bintro\b/);
  await page.waitForTimeout(2_000);
  await rearm(page);
  // Past the first arming's 4 s (with 2 s of slack, so a slow runner can't re-arm after it fired): the second
  // arming still holds the page.
  await page.waitForTimeout(2_500);
  await expect(html(page)).toHaveClass(/\bintro\b/);
  await expect(html(page)).toHaveAttribute('data-peek-state', 'arm');
  // The second arming's own failsafe hands the page back.
  await expect(html(page)).not.toHaveClass(/\bintro\b/, { timeout: 5_000 });
  await expect(html(page)).not.toHaveAttribute('data-peek-state');
});

// Remix: a live brand switch (data-brand changing on a running page) -------------------------------------------

const BRANDS = ['clean', 'backstage', 'blocks'] as const;
type Brand = (typeof BRANDS)[number];

/** Switch the brand live, wait past the runtime's two settling frames, and list the CSS transitions still running. */
const switchBrand = (page: Page, brand: Brand) =>
  page.evaluate(async (b) => {
    document.documentElement.dataset.brand = b;
    const frame = () => new Promise((r) => requestAnimationFrame(r));
    await frame();
    await frame();
    await frame();
    return document
      .getAnimations()
      .filter((a) => a instanceof CSSTransition && a.playState === 'running')
      .map((a) => `${(a as CSSTransition).transitionProperty} on ${(a.effect as KeyframeEffect).target?.nodeName}`);
  }, brand);

/** The scroll cue as CSS resolves it: hidden or shown, in flow or not, its words clipped or not. */
const cueState = (page: Page) =>
  page.evaluate(() => {
    const pick = (sel: string, props: string[]) => {
      const cs = getComputedStyle(document.querySelector(sel)!);
      return Object.fromEntries(props.map((p) => [p, cs.getPropertyValue(p)]));
    };
    return {
      cue: pick('.cue', ['display', 'position', 'visibility']),
      label: pick('.cue-label', ['clip-path', 'position']),
    };
  });

/** What a fresh load of the brand resolves, at rest (reduced motion, so no intro plays first). */
async function restingCue(page: Page, brand: Brand) {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto(`/?brand=${brand}`);
  const state = await cueState(page);
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  return state;
}

const PAIRS = BRANDS.flatMap((from) => BRANDS.filter((to) => to !== from).map((to) => [from, to] as const));

for (const [from, to] of PAIRS) {
  for (const phase of ['at rest', 'mid-intro', 'mid-Peek'] as const) {
    if (phase === 'mid-intro' && from === 'clean') continue; // clean has no intro
    test(`live switch ${from} → ${to} ${phase}: lands like a fresh load, with nothing still tweening`, async ({ page }) => {
      const expected = await restingCue(page, to);
      await page.goto(`/?brand=${from}${phase === 'mid-intro' ? '&intro' : ''}`);
      if (phase === 'mid-intro') {
        await expect(html(page)).toHaveClass(/\bintro\b/);
        await page.waitForTimeout(600);
        await expect(html(page)).toHaveClass(/\bintro\b/);
      } else {
        await expect(html(page)).not.toHaveClass(/\bintro\b/, { timeout: 15_000 });
      }
      if (phase === 'mid-Peek') {
        await page.locator('[data-peek-toggle]').click();
        await expect(html(page)).toHaveAttribute('data-peek-state', 'on');
        await page.waitForTimeout(300); // mid-build
      }

      expect.soft(await switchBrand(page, to), 'CSS transitions still running after the switch').toEqual([]);
      await expect(html(page)).not.toHaveClass(/\b(intro|building|settling)\b/);

      if (phase === 'mid-Peek') {
        await page.keyboard.press('Escape');
        await expect(html(page)).not.toHaveAttribute('data-peek-state', { timeout: 5_000 });
      }
      expect(await cueState(page)).toEqual(expected);
    });
  }
}

test('a live switch during Peek\'s leave lands Peek at rest at once', async ({ page }) => {
  const expected = await restingCue(page, 'clean');
  await page.goto('/?brand=backstage');
  await expect(html(page)).not.toHaveClass(/\bintro\b/, { timeout: 15_000 });
  await page.locator('[data-peek-toggle]').click();
  await expect(html(page)).toHaveAttribute('data-peek-state', 'on');
  await page.keyboard.press('Escape');
  await expect(html(page)).toHaveAttribute('data-peek-state', 'leaving');

  await switchBrand(page, 'clean');
  await expect(html(page)).not.toHaveAttribute('data-peek-state', { timeout: 100 });
  expect(await cueState(page)).toEqual(expected);
});

test('a second switch one frame after the first still lands without tweening', async ({ page }) => {
  await page.goto('/?brand=clean');
  await expect(html(page)).not.toHaveClass(/\bintro\b/);
  const settlingAfterSecond = await page.evaluate(async () => {
    const root = document.documentElement;
    const frame = () => new Promise((r) => requestAnimationFrame(r));
    root.dataset.brand = 'backstage';
    await frame();
    root.dataset.brand = 'blocks';
    await frame();
    await new Promise((r) => setTimeout(r)); // after every callback of that frame, the first switch's removal included
    return root.classList.contains('settling');
  });
  expect(settlingAfterSecond, 'the first switch must not end the second switch\'s quiet frames').toBe(true);
});

// The intro plays once per brand per tab ------------------------------------------------------------------------

test('a brand without an intro consumes nothing: clean, then backstage plays backstage\'s intro', async ({ page }) => {
  await page.goto('/?brand=clean');
  await expect(html(page)).not.toHaveClass(/\bintro\b/);
  await page.goto('/?brand=backstage');
  await expect(html(page)).toHaveClass(/\bintro\b/);
  await expect(html(page)).toHaveAttribute('data-peek-state', 'on');
});

test('a live switch never consumes the new brand\'s intro, at rest or mid-intro', async ({ page }) => {
  // At rest: clean → backstage live, then a load of backstage still plays its intro.
  await page.goto('/?brand=clean');
  await switchBrand(page, 'backstage');
  await expect(html(page)).not.toHaveClass(/\bintro\b/);
  await page.goto('/?brand=backstage');
  await expect(html(page)).toHaveClass(/\bintro\b/);

  // Mid-intro: backstage → blocks live. Backstage's intro ran (cut short), so it is spent; blocks' is not.
  await switchBrand(page, 'blocks');
  await expect(html(page)).not.toHaveClass(/\bintro\b/);
  await page.goto('/?brand=blocks');
  await expect(html(page)).toHaveClass(/\bintro\b/);
  await expect(html(page)).not.toHaveClass(/\bintro\b/, { timeout: 15_000 });
  await page.goto('/?brand=backstage');
  await expect(html(page)).not.toHaveClass(/\bintro\b/);
});


// The plotter ground (backstage) ----------------------------------------------------------------------------------

for (const width of [390, 1440]) {
  test(`plotter at ${width}: the head, its trail and its readout never cross the text block`, async ({ page }) => {
    await page.setViewportSize({ width, height: 844 });
    await page.addInitScript(() => sessionStorage.setItem('jt-intro:backstage', '1'));
    await page.clock.install();
    await page.goto('/?brand=backstage');
    await page.clock.runFor(1_000); // fonts settle and the resize observer lays the sheet out
    // Over a minute of walking, count the pixels under the text that something other than the sheet inked. The sheet
    // is one colour (--spec-guide) at any alpha; the head, its trail and its readout are other colours.
    let foreign = 0;
    for (let i = 0; i < 120; i++) {
      await page.clock.runFor(500);
      foreign += await page.evaluate(() => {
        const canvas = document.querySelector<HTMLCanvasElement>('canvas.field')!;
        const swatch = document.createElement('canvas').getContext('2d')!;
        swatch.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--spec-guide');
        swatch.fillRect(0, 0, 1, 1);
        const sheet = swatch.getImageData(0, 0, 1, 1).data;
        const o = canvas.getBoundingClientRect();
        const k = canvas.width / canvas.clientWidth;
        let n = 0;
        for (const el of document.querySelectorAll('.name-block, .roles, .tagline, .bio, .social')) {
          const s = el.getBoundingClientRect();
          const x = Math.max(0, Math.floor((s.left - o.left) * k));
          const y = Math.max(0, Math.floor((s.top - o.top) * k));
          const w = Math.min(canvas.width - x, Math.ceil(s.width * k));
          const h = Math.min(canvas.height - y, Math.ceil(s.height * k));
          if (w <= 0 || h <= 0) continue;
          const { data } = canvas.getContext('2d')!.getImageData(x, y, w, h);
          // Faint pixels un-premultiply with rounding error, so only count ones solid enough to read the colour of.
          for (let i = 0; i < data.length; i += 4)
            if (data[i + 3]! > 40 && [0, 1, 2].some((c) => Math.abs(data[i + c]! - sheet[c]!) > 24)) n++;
        }
        return n;
      });
    }
    expect(foreign, 'pixels of the head, trail or readout under the text').toBe(0);
  });
}
