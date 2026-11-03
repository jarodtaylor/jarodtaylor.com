import { composeStory } from '@storybook/react-vite';
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import buttonMeta, { AsButton } from '../src/components/Button/Button.stories';
import heroMeta, { FirstViewportStory } from '../src/components/Hero/Hero.stories';
import shellMeta, { Default as ShellDefault } from '../src/components/SectionShell/SectionShell.stories';

let host: HTMLDivElement;
let root: Root;

beforeEach(() => {
  host = document.body.appendChild(document.createElement('div'));
  root = createRoot(host);
});

afterEach(() => {
  act(() => root.unmount());
  host.remove();
});

const html = document.documentElement;
const hero = (brand: string) => composeStory(FirstViewportStory, heroMeta, { initialGlobals: { brand } });

/** The hero's markup minus what the runtime writes from computed styles (as tests/markup-invariance.e2e.ts strips). */
function heroMarkup(): string {
  const copy = host.cloneNode(true) as HTMLElement;
  for (const el of copy.querySelectorAll('[data-readout]')) el.textContent = '';
  for (const el of copy.querySelectorAll('[data-spec], [data-tpl]')) el.removeAttribute('data-spec'), el.removeAttribute('data-tpl');
  for (const el of copy.querySelectorAll('canvas')) el.removeAttribute('width'), el.removeAttribute('height');
  return copy.innerHTML;
}

/** Render (or re-render, in the same root) the way the Storybook canvas does when a global or arg changes. */
function show(element: React.ReactElement) {
  act(() => root.render(element));
}

describe('brand toolbar', () => {
  it('AE1: switching clean → blocks restyles the Button and leaves its markup unchanged', () => {
    const InClean = composeStory(AsButton, buttonMeta, { initialGlobals: { brand: 'clean' } });
    const InBlocks = composeStory(AsButton, buttonMeta, { initialGlobals: { brand: 'blocks' } });

    show(<InClean />);
    const button = () => host.querySelector('.button')!;
    const clean = { html: host.innerHTML, bg: getComputedStyle(button()).backgroundColor, radius: getComputedStyle(button()).borderRadius };
    expect(document.documentElement.dataset.brand).toBe('clean');

    show(<InBlocks />);
    expect(document.documentElement.dataset.brand).toBe('blocks');
    expect(host.innerHTML).toBe(clean.html);
    expect(getComputedStyle(button()).backgroundColor).not.toBe(clean.bg);
    expect(getComputedStyle(button()).borderRadius).not.toBe(clean.radius);
  });
});

describe('hero story', () => {
  it('AE2: flipping hero-layout changes the layout and leaves the markup unchanged', () => {
    const Hero = hero('clean');
    show(<Hero hero-layout="stack" />);
    const before = heroMarkup();
    const details = () => getComputedStyle(host.querySelector('.details')!).display;
    expect(details()).toBe('contents');

    show(<Hero hero-layout="name-over-details" />);
    expect(html.style.getPropertyValue('--hero-layout')).toBe('name-over-details');
    expect(details()).toBe('grid');
    expect(heroMarkup()).toBe(before);
  });

  it.each(['backstage', 'blocks'])('AE3: under %s the intro plays, then settles, and the Peek toggle works', async (brand) => {
    const Hero = hero(brand);
    show(<Hero />);
    expect(html.classList.contains('intro')).toBe(true);
    await expect.poll(() => html.classList.contains('intro'), { timeout: 15_000 }).toBe(false);

    act(() => (host.querySelector('[data-peek-toggle]') as HTMLElement).click());
    expect(html.dataset.peekState).toBeTruthy();
  });

  it('flipping a token control mid-intro does not cut the intro short', async () => {
    const Hero = hero('backstage');
    show(<Hero />);
    expect(html.classList.contains('intro')).toBe(true);
    show(<Hero hero-layout="name-over-details" />);
    await new Promise((resolve) => setTimeout(resolve)); // let the runtime's MutationObserver deliver
    expect(html.classList.contains('intro')).toBe(true);
  });

  it('a brand switch mid-intro settles the intro, as on the site', async () => {
    // Two composed stories are two component types, so swapping them would remount; the toolbar re-renders the same
    // story and the brand decorator changes data-brand, which is what this does.
    const Hero = hero('backstage');
    show(<Hero />);
    expect(html.classList.contains('intro')).toBe(true);
    html.dataset.brand = 'blocks';
    await new Promise((resolve) => setTimeout(resolve)); // let the runtime's MutationObserver deliver
    expect(html.classList.contains('intro')).toBe(false);
  });

  it('changing hero-intro remounts the assembly and replays the intro', async () => {
    const Hero = hero('backstage');
    show(<Hero />);
    await expect.poll(() => html.classList.contains('intro'), { timeout: 15_000 }).toBe(false);
    show(<Hero hero-intro="assemble" />);
    expect(html.style.getPropertyValue('--hero-intro')).toBe('assemble');
    expect(html.classList.contains('intro')).toBe(true);
  });

  it('under reduced motion the intro is never armed', () => {
    const real = window.matchMedia;
    window.matchMedia = ((query: string) => ({ ...real.call(window, query), matches: query.includes('reduce') && !query.includes('no-preference') })) as typeof window.matchMedia;
    try {
      const Hero = hero('backstage');
      show(<Hero />);
      expect(html.classList.contains('intro')).toBe(false);
      expect(html.classList.contains('building')).toBe(false);
    } finally {
      window.matchMedia = real;
    }
  });

  it('keeps a token override across a brand switch (KTD3)', () => {
    const [InClean, InBlocks] = [hero('clean'), hero('blocks')];
    show(<InClean hero-figure="lattice" />);
    show(<InBlocks hero-figure="lattice" />);
    expect(html.dataset.brand).toBe('blocks');
    expect(html.style.getPropertyValue('--hero-figure')).toBe('lattice');
  });

  it('leaves nothing on <html> when the next story mounts after it', () => {
    const Hero = hero('backstage');
    show(<Hero hero-layout="stack" />);
    act(() => (host.querySelector('[data-peek-toggle]') as HTMLElement).click());
    act(() => root.unmount());
    root = createRoot(host);
    const Button = composeStory(AsButton, buttonMeta);
    show(<Button />);
    expect(html.dataset.peekState).toBeUndefined();
    expect(['intro', 'building', 'settling'].filter((c) => html.classList.contains(c))).toEqual([]);
    expect(html.getAttribute('style') ?? '').toBe('');
  });
});

describe('decorator order', () => {
  it('scrubs <html> on a story change before the new story\'s token overrides go on', () => {
    const Hero = hero('clean');
    show(<Hero hero-layout="stack" />);
    act(() => root.unmount());
    root = createRoot(host);
    const Shell = composeStory(ShellDefault, shellMeta);
    show(<Shell decoration="none" />);
    expect(html.style.getPropertyValue('--hero-layout')).toBe('');
    expect(html.style.getPropertyValue('--section-decoration')).toBe('none');
  });
});
