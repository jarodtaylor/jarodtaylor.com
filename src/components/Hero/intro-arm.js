// Arms the hero intro before first paint. A classic script, not a module: index.astro inlines this file's text
// (`?raw`), and the Storybook hero story runs the same text again on every mount. The 4 s failsafe lives on a known
// global so a re-arm cancels the previous one instead of being cancelled by it. The intro plays once per brand per tab:
// the flag is keyed by data-brand, which the brand script has already set (runtime.ts writes it for the brand that played).
(() => {
  const root = document.documentElement;
  root.classList.add('js');
  let seen = false;
  try { seen = sessionStorage.getItem(`jt-intro:${root.dataset.brand}`) === '1'; } catch {}
  if (new URLSearchParams(location.search).has('intro')) seen = false;
  if (seen || !matchMedia('(prefers-reduced-motion: no-preference)').matches) return;
  root.classList.add('intro', 'building');
  root.dataset.peekState = 'arm';
  clearTimeout(window.jtIntroFailsafe);
  window.jtIntroFailsafe = setTimeout(() => {
    if (root.dataset.peekState !== 'arm') return;
    root.classList.remove('intro', 'building');
    delete root.dataset.peekState;
  }, 4000);
})();
