import { composeStory } from '@storybook/react-vite';
import { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import buttonMeta, { AsButton } from '../src/components/Button/Button.stories';

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
