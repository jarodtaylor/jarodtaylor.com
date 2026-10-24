// Step 1 being built. The CSS owns the choreography (html.intro); this file only remembers that
// it played, lets the visitor skip it, and hands the page back in its assembled state.
(() => {
  const root = document.documentElement;
  if (!root.classList.contains('intro')) return;
  try { sessionStorage.setItem('jt-assembly', '1'); } catch {}

  const skipEvents = ['keydown', 'pointerdown', 'wheel', 'touchstart'];
  const done = () => {
    root.classList.remove('intro');
    skipEvents.forEach((e) => removeEventListener(e, skip, true));
  };
  // Skipping jumps every animation to its last frame, which is the assembled page.
  function skip() {
    document.getAnimations().forEach((a) => a.finish());
    done();
  }
  skipEvents.forEach((e) => addEventListener(e, skip, { capture: true, passive: true }));
  document.querySelector('.skip-intro')?.addEventListener('click', skip);

  // The last thing to land is the CTA arrow; when it does, the class goes and nothing changes on screen.
  addEventListener('load', () => {
    Promise.all(document.getAnimations().map((a) => a.finished)).then(done, done);
  });
})();
