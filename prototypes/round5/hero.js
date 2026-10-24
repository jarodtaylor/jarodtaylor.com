// Hero: one Peek layer, played two ways. On arrival it is the intro (arm, on, hold, leaving); on demand it is the
// Peek backstage button (arm, on; press again for leaving). CSS owns every beat; this only moves
// data-peek-state on <html> and keeps the clock, reading every duration from the custom properties in styles.css.
(() => {
  const root = document.documentElement;
  const $$ = (sel) => [...document.querySelectorAll(sel)];
  const prop = (name) => getComputedStyle(root).getPropertyValue(name).trim();
  const ms = (name) => parseFloat(prop(name)) * 1000;
  const toggle = document.querySelector('[data-peek-toggle]');

  // Live readouts: Peek prints the computed type scale and grid, so it can never drift from the CSS.
  const px = (n) => Math.round(parseFloat(n)) + 'px';
  const readouts = () => {
    const cs = (sel) => getComputedStyle(document.querySelector(sel));
    const hero = cs('.hero');
    const vals = {
      display: px(cs('.name').fontSize),
      lead: px(cs('.tagline').fontSize),
      body: px(cs('.bio').fontSize),
      label: px(cs('.ident').fontSize),
      rhythm: px(cs('.tagline').marginTop),
      'page-x': px(hero.paddingLeft),
      cols: `${hero.getPropertyValue('--cols').trim()} × gap ${px(hero.columnGap)}`,
    };
    $$('[data-readout]').forEach((el) => { el.textContent = vals[el.dataset.readout]; });
  };

  // The outline is traced at constant speed, so each vertex can pop at the exact moment the pen reaches it:
  // find where along either path it sits, and turn that fraction into its own delay.
  const timeVertices = () => {
    const at = parseFloat(prop('--peek-trace-at'));
    const dur = parseFloat(prop('--peek-trace-dur'));
    const samples = $$('.mono-line path').flatMap((p) => {
      const len = p.getTotalLength();
      return Array.from({ length: 301 }, (_, i) => {
        const pt = p.getPointAtLength((len * i) / 300);
        return [pt.x, pt.y, i / 300];
      });
    });
    $$('.g-pts circle').forEach((c) => {
      const x = +c.getAttribute('cx'), y = +c.getAttribute('cy');
      let best = 1, gap = Infinity;
      for (const [sx, sy, f] of samples) {
        const d = (sx - x) ** 2 + (sy - y) ** 2;
        if (d < gap) { gap = d; best = f; }
      }
      c.style.setProperty('--at', `${(at + best * dur).toFixed(3)}s`);
    });
  };

  // The state machine ----------------------------------------------------------
  let timers = [];
  const later = (wait, fn) => timers.push(setTimeout(fn, wait));
  const stop = () => { timers.forEach(clearTimeout); timers = []; };
  const setState = (s) => { if (s) root.dataset.peekState = s; else delete root.dataset.peekState; };

  // Arm, commit the reset with a style flush, then draw. Starting from arm every time is what lets the intro and
  // the button share one choreography.
  const show = () => {
    stop();
    readouts();
    setState('arm');
    void root.offsetWidth;
    setState('on');
  };
  const hide = () => {
    stop();
    if (!root.dataset.peekState) return;
    setState('leaving');
    later(ms('--peek-leave'), () => { setState(null); root.classList.remove('intro'); });
  };
  const setPeek = (on) => {
    toggle.setAttribute('aria-pressed', String(on));
    // Pressed while the intro is still leaving: this is Peek now, not the intro, so drop the intro's text gating.
    if (on) { listen(false); seen(); root.classList.remove('intro'); show(); } else hide();
  };
  toggle.addEventListener('click', () => setPeek(toggle.getAttribute('aria-pressed') !== 'true'));
  addEventListener('keydown', (e) => { if (e.key === 'Escape' && toggle.getAttribute('aria-pressed') === 'true') setPeek(false); });

  // The intro -------------------------------------------------------------------
  // Peek, played once on arrival: on, hold, leave. Any key, click, wheel, touch or scroll skips straight to rest.
  const skipOn = ['keydown', 'pointerdown', 'wheel', 'touchmove', 'scroll'];
  const listen = (on) => skipOn.forEach((t) => (on ? addEventListener : removeEventListener)(t, settle, { capture: true, passive: true }));
  const seen = () => { try { sessionStorage.setItem('jt-intro', '1'); } catch {} };

  function settle() {
    stop();
    listen(false);
    seen();
    root.classList.add('settling');
    setState(null);
    root.classList.remove('intro');
    toggle.setAttribute('aria-pressed', 'false');
    requestAnimationFrame(() => requestAnimationFrame(() => root.classList.remove('settling')));
  }

  const intro = () => {
    const go = () => {
      if (root.dataset.peekState !== 'arm') return;
      show();
      listen(true);
      later(ms('--peek-settled') + ms('--peek-hold'), () => { listen(false); seen(); hide(); });
    };
    // Boxes and readouts measure real text, so wait for the real fonts (capped, so a slow font never holds the page).
    Promise.race([document.fonts.ready, new Promise((r) => setTimeout(r, 700))]).then(go);
  };

  document.querySelector('[data-skip-intro]').addEventListener('click', settle);
  timeVertices();
  readouts();
  addEventListener('resize', readouts);
  document.fonts.ready.then(readouts);
  if (root.dataset.peekState === 'arm') intro();

  // Prototype controls ---------------------------------------------------------
  const picks = $$('[data-rest-pick]');
  const pick = (id) => {
    root.dataset.rest = id;
    picks.forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.restPick === id)));
    const u = new URL(location.href);
    u.searchParams.set('rest', id);
    history.replaceState(null, '', u);
  };
  picks.forEach((b) => b.addEventListener('click', () => pick(b.dataset.restPick)));
  pick(root.dataset.rest);
  document.querySelector('[data-replay]').addEventListener('click', () => {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    settle();
    requestAnimationFrame(() => requestAnimationFrame(() => {
      root.classList.add('intro');
      setState('arm');
      intro();
    }));
  });
})();
