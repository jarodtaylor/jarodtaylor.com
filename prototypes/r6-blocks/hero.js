// The mark being built. The CSS owns the choreography (html.intro, html.building); this file only remembers that
// it played, lets the visitor skip it, and hands the page back assembled.
(() => {
  const root = document.documentElement;
  if (!root.classList.contains('intro')) return;
  try { sessionStorage.setItem('jt-r6-blocks', '1'); } catch {}

  // The status dot breathes forever; only the build's own, finite animations count.
  const build = () => document.getAnimations().filter((a) => a.effect.getComputedTiming().endTime !== Infinity);
  const skipEvents = ['keydown', 'pointerdown', 'wheel', 'touchstart'];
  const done = () => {
    root.classList.remove('intro', 'building');
    skipEvents.forEach((e) => removeEventListener(e, skip, true));
  };
  // Skipping jumps every animation to its last frame, which is the assembled page.
  function skip() {
    build().forEach((a) => a.finish());
    done();
  }
  skipEvents.forEach((e) => addEventListener(e, skip, { capture: true, passive: true }));

  // When the last stroke lands the classes go and nothing changes on screen.
  addEventListener('load', () => {
    Promise.all(build().map((a) => a.finished)).then(done, done);
  });
})();
