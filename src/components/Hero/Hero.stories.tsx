import type { Meta, StoryObj } from '@storybook/react-vite';
import { useLayoutEffect } from 'react';
import { tokenArgs, tokenArgTypes } from '../../../.storybook/token-controls';
import { Header } from '../Header/Header';
import { InfoStrip } from '../InfoStrip/InfoStrip';
import { PeekColumns, SkipIntro } from '../Peek/Peek';
import { Stage } from '../Stage/Stage';
import { Hero } from './Hero';
import introArm from './intro-arm.js?raw';
import { init } from './runtime';

const KNOBS = ['hero-figure', 'hero-layout', 'hero-intro', 'hero-cue', 'hero-ground', 'link-underline'] as const;
type Args = Record<(typeof KNOBS)[number], string>;

/**
 * The home page's first viewport, assembled as index.astro does, with its runtime. On every mount the intro is
 * re-armed the way the page arms it before first paint: the same intro-arm.js text, run as a fresh classic script
 * (a module import would run only once), then init(). Unmounting runs the disposer.
 */
function FirstViewport() {
  useLayoutEffect(() => {
    // The page plays the intro once per tab via the jt-intro session flag; the story plays it on every mount. Hosted
    // on the site's origin, the story shares that flag, so it is cleared for the mount and restored after.
    let flag: string | null = null;
    try {
      flag = sessionStorage.getItem('jt-intro');
      sessionStorage.removeItem('jt-intro');
    } catch {}
    const arm = document.createElement('script');
    arm.textContent = introArm;
    document.head.appendChild(arm).remove();
    const dispose = init();
    return () => {
      dispose();
      try {
        if (flag === null) sessionStorage.removeItem('jt-intro');
        else sessionStorage.setItem('jt-intro', flag);
      } catch {}
    };
  }, []);

  return (
    <>
      <Stage>
        <PeekColumns />
        <Header />
        <main id="main">
          <InfoStrip />
          <Hero />
        </main>
      </Stage>
      <SkipIntro />
    </>
  );
}

const meta = {
  title: 'Page/Hero',
  args: tokenArgs(KNOBS),
  argTypes: tokenArgTypes(KNOBS),
  // The intro is armed before first paint, so changing it remounts the assembly and plays the chosen intro.
  render: (args) => <FirstViewport key={args['hero-intro']} />,
} satisfies Meta<Args>;

export default meta;

export const FirstViewportStory: StoryObj<Args> = { name: 'First viewport' };
