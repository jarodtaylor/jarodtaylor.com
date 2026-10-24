// Hero: one Peek layer, played two ways. On arrival it is the intro (arm, on, hold, leaving); on demand it is the
// Peek backstage button (arm, on; press again for leaving). CSS owns every beat; this only moves
// data-peek-state on <html> and keeps the clock, reading every duration from the custom properties in styles.css.
(() => {
  const root = document.documentElement;
  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => [...document.querySelectorAll(sel)];
  const prop = (name) => getComputedStyle(root).getPropertyValue(name).trim();
  const ms = (name) => parseFloat(prop(name)) * 1000;
  const toggle = $('[data-peek-toggle]');
  const NS = 'http://www.w3.org/2000/svg';
  const path = (d, attrs = {}) => {
    const p = document.createElementNS(NS, 'path');
    p.setAttribute('d', d);
    p.setAttribute('pathLength', '1');
    Object.assign(p.style, attrs);
    return p;
  };

  // The bleed: every construction line of the mark, continued out of both ends far past any screen edge (the stage
  // clips it). Built from the guides themselves, so the bleed is always the mark's own geometry.
  const bleed = $('.mono-bleed');
  $$('.mono-guides path:not(.g-tri)').forEach((g) => {
    const d = g.getAttribute('d');
    const [x1, y1, a, b] = d.match(/-?[\d.]+/g).map(Number);
    const [x2, y2] = d.includes('H') ? [a, y1] : d.includes('V') ? [x1, a] : [a, b];
    const len = Math.hypot(x2 - x1, y2 - y1);
    const reach = 5000 / len;
    const delay = g.style.getPropertyValue('--d');
    for (const [x, y, s] of [[x1, y1, -1], [x2, y2, 1]]) {
      const p = path(`M${x} ${y}L${(x + s * (x2 - x1) * reach).toFixed(1)} ${(y + s * (y2 - y1) * reach).toFixed(1)}`);
      p.style.setProperty('--d', delay);
      bleed.append(p);
    }
  });

  // The resting pen: a copy of the outline that a short ink dash laps, slowly (CSS animates it).
  const pen = $('.mono-line').cloneNode(true);
  pen.setAttribute('class', 'mono-pen');
  $('.mono-line').after(pen);

  // Live readouts: Peek prints the computed type scale, grid and faces, so it can never drift from the CSS
  // (or from whatever pairing fonts.css loads).
  const px = (n) => Math.round(parseFloat(n)) + 'px';
  $$('[data-spec]').forEach((el) => { el.dataset.tpl = el.dataset.spec; });
  const readouts = () => {
    const cs = (sel) => getComputedStyle($(sel));
    const hero = cs('.hero');
    const vals = {
      display: px(cs('.name').fontSize),
      lead: px(cs('.tagline').fontSize),
      body: px(cs('.bio').fontSize),
      label: px(cs('.info').fontSize),
      'page-x': px(hero.paddingLeft),
      cols: `${hero.getPropertyValue('--cols').trim()} × gap ${px(hero.columnGap)}`,
    };
    $$('[data-readout]').forEach((el) => { el.textContent = vals[el.dataset.readout]; });
    $$('[data-tpl]').forEach((el) => {
      const f = getComputedStyle(el.querySelector('h1') || el);
      el.dataset.spec = el.dataset.tpl.replace('{f}', `${f.fontFamily.split(',')[0].replace(/"/g, '')} ${f.fontWeight}`);
    });
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
    later(ms('--peek-leave') + 80, () => { setState(null); root.classList.remove('intro'); });
  };
  const setPeek = (on) => {
    toggle.setAttribute('aria-pressed', String(on));
    // Pressed while the intro is still leaving: this is Peek now, not the intro, so drop the intro's text gating.
    if (on) { listen(false); seen(); root.classList.remove('intro'); show(); } else hide();
  };
  toggle.addEventListener('click', () => setPeek(toggle.getAttribute('aria-pressed') !== 'true'));

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

  // Phone menu ------------------------------------------------------------------
  const menu = $('[data-nav-toggle]');
  const openMenu = (open) => menu.setAttribute('aria-expanded', String(open));
  menu.addEventListener('click', () => openMenu(menu.getAttribute('aria-expanded') !== 'true'));

  addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    if (menu.getAttribute('aria-expanded') === 'true') { openMenu(false); menu.focus(); }
    if (toggle.getAttribute('aria-pressed') === 'true') setPeek(false);
  });

  $('[data-skip-intro]').addEventListener('click', settle);
  timeVertices();
  readouts();
  addEventListener('resize', readouts);
  document.fonts.ready.then(readouts);
  if (root.dataset.peekState === 'arm') intro();

  // Prototype control: replay the intro.
  $('[data-replay]').addEventListener('click', () => {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    settle();
    requestAnimationFrame(() => requestAnimationFrame(() => {
      root.classList.add('intro');
      setState('arm');
      intro();
    }));
  });
})();
