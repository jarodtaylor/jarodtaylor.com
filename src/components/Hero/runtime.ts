/**
 * Hero runtime: one small module for every brand. CSS owns every beat; this only moves state on <html>
 * (data-peek-state, .intro, .building, .settling), keeps the clock, writes Peek's readouts and paints the hero's
 * canvas (the lattice figure, or the plotter ground). It reads the brand's choices from tokens (--hero-intro, --hero-figure), so a brand switch
 * (html[data-brand] changing) just re-reads them. Nothing here adds or removes elements in <body>.
 *
 * The intro is decided before first paint by the inline script in index.astro (once per session, never under
 * reduced motion, ?intro forces it). That script arms every intro; this module runs the one the brand names.
 */
export {}; // a module, so these names stay out of the global scope (window.stop exists)

const root = document.documentElement;
const $ = <T extends Element = HTMLElement>(sel: string) => document.querySelector<T>(sel);
const $$ = <T extends Element = HTMLElement>(sel: string) => [...document.querySelectorAll<T>(sel)];
const token = (name: string) => getComputedStyle(root).getPropertyValue(name).trim();

/** A duration custom property in ms. Read through a probe, because a custom property's value is unresolved calc(). */
function ms(name: string): number {
  const probe = document.createElement('i');
  probe.style.transitionDuration = `var(${name})`;
  document.body.append(probe);
  const s = parseFloat(getComputedStyle(probe).transitionDuration);
  probe.remove();
  return s * 1000;
}

const reduced = matchMedia('(prefers-reduced-motion: reduce)');
const toggle = $('[data-peek-toggle]')!;

// Peek: one state machine ------------------------------------------------------------------------------------

let timers: number[] = [];
const later = (wait: number, fn: () => void) => timers.push(window.setTimeout(fn, wait));
const stop = () => {
  timers.forEach(clearTimeout);
  timers = [];
};
const setState = (s: 'arm' | 'on' | 'leaving' | null) => {
  if (s) root.dataset.peekState = s;
  else delete root.dataset.peekState;
};

/** Arm, commit the reset with a style flush, then draw. Starting from arm every time lets the intro and the button share one choreography. */
function show() {
  stop();
  readouts();
  setState('arm');
  void root.offsetWidth;
  setState('on');
}

function hide() {
  stop();
  if (!root.dataset.peekState) return;
  setState('leaving');
  later(ms('--_peek-leave') + 80, () => {
    setState(null);
    root.classList.remove('intro');
  });
}

function setPeek(on: boolean) {
  toggle.setAttribute('aria-pressed', String(on));
  if (!on) return hide();
  // Pressed while an intro is still running: this is Peek now, so the intro hands over.
  listen(false);
  seen();
  root.classList.remove('intro', 'building');
  show();
}

// Readouts: Peek prints each brand's computed type scale and grid, so it can never drift from the CSS ----------

const px = (n: string) => `${Math.round(parseFloat(n))}px`;
const lh = (cs: CSSStyleDeclaration) => (parseFloat(cs.lineHeight) / parseFloat(cs.fontSize)).toFixed(2);

function readouts() {
  const cs = (sel: string) => getComputedStyle($(sel)!);
  const [name, tagline, bio, hero] = ['.name', '.tagline', '.bio', '.hero'].map(cs) as CSSStyleDeclaration[];
  const vals: Record<string, string> = {
    display: px(name!.fontSize),
    'display-lh': lh(name!),
    lead: px(tagline!.fontSize),
    'lead-lh': lh(tagline!),
    body: px(bio!.fontSize),
    measure: px(bio!.maxWidth),
    label: px(cs('.social').fontSize),
    small: px(cs('.info').fontSize),
    face: `${name!.fontFamily.split(',')[0]!.replace(/"/g, '')} ${name!.fontWeight}`,
    'page-x': px(hero!.paddingLeft),
    cols: `${hero!.gridTemplateColumns.split(' ').length} × gap ${px(hero!.columnGap)}`,
  };
  $$('[data-readout]').forEach((el) => (el.textContent = vals[el.dataset.readout!] ?? '--'));
  $$('[data-tpl]').forEach((el) => {
    el.dataset.spec = el.dataset.tpl!.replace(/\{([\w-]+)\}/g, (_, key: string) => vals[key] ?? '--');
  });
}

// Intros ----------------------------------------------------------------------------------------------------------

const seen = () => {
  try {
    sessionStorage.setItem('jt-intro', '1');
  } catch {}
};
const SKIP_ON = ['keydown', 'pointerdown', 'wheel', 'touchmove', 'scroll'] as const;
let skip: () => void = () => {};
const onSkip = () => skip();
const listen = (on: boolean) =>
  SKIP_ON.forEach((t) => (on ? addEventListener : removeEventListener)(t, onSkip, { capture: true, passive: true } as AddEventListenerOptions));

/** Land on the resting state at once: one frame without transitions. */
function settle() {
  stop();
  listen(false);
  seen();
  root.classList.add('settling');
  setState(null);
  root.classList.remove('intro', 'building');
  toggle.setAttribute('aria-pressed', 'false');
  requestAnimationFrame(() => requestAnimationFrame(() => root.classList.remove('settling')));
}

/** peek: the Peek layer played once on arrival (on, hold, leave). Any key, click, wheel, touch or scroll skips it. */
function peekIntro() {
  root.classList.remove('building');
  skip = settle;
  const go = () => {
    if (root.dataset.peekState !== 'arm') return;
    show();
    listen(true);
    later(ms('--_peek-settled') + ms('--_peek-hold'), () => {
      listen(false);
      seen();
      hide();
    });
  };
  // Boxes and readouts measure real text, so wait for the real fonts (capped, so a slow font never holds the page).
  Promise.race([document.fonts.ready, new Promise((r) => setTimeout(r, 700))]).then(go);
}

/** assemble: the figure's parts slide together. CSS runs it; this skips it on demand and hands the page back. */
function assembleIntro() {
  setState(null);
  seen();
  // Only the build's own, finite animations count (the status ring and the pen breathe forever).
  const build = () => document.getAnimations().filter((a) => a.effect?.getComputedTiming().endTime !== Infinity);
  const done = () => {
    listen(false);
    root.classList.remove('intro', 'building');
  };
  skip = () => {
    build().forEach((a) => a.finish());
    done();
  };
  listen(true);
  requestAnimationFrame(() => Promise.all(build().map((a) => a.finished)).then(done, done));
}

// The lattice: the monogram's own 60° lattice at page scale, painted on the canvas --------------------------------
// The mark is cut from a downward equilateral triangle divided 14 times along each side; every stroke runs at 0°, 60°
// or 120°. The lattice fills the first viewport, the mark is drawn by the lattice inside it, and a slow ring of light
// leaves the mark every few seconds. Paused offscreen; one still frame under reduced motion.

function lattice(canvas: HTMLCanvasElement): () => void {
  const ctx = canvas.getContext('2d');
  if (!ctx) return () => {};
  const SIDE = 575.65;
  const DIV = 14;
  const PERIOD = 9000;
  const STEP = 0.02;
  const FRAME = 33;
  const marks = $$<SVGPathElement>('.mono-line path').map((p) => p.getAttribute('d')!);
  const colors = [token('--figure-line'), token('--figure-mark')];
  let edges = new Float32Array();
  let mark = new Path2D();
  let reach = 0;
  let w = 0;
  let h = 0;
  let raf = 0;
  let last = 0;
  let visible = true;

  function layout() {
    const dpr = Math.min(devicePixelRatio || 1, 2);
    w = canvas.clientWidth;
    h = canvas.clientHeight;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    // Large and bleeding off the right edge on wide screens, behind the top on phones.
    const phone = w < 48 * parseFloat(getComputedStyle(root).fontSize);
    const W = phone ? w * 1.2 : Math.min(w * 0.6, h * 1.25);
    const s = W / DIV;
    const r = (s * Math.sqrt(3)) / 2;
    const x0 = phone ? w - W * 0.88 : w - W * 0.9;
    // The brand can drop the mark by whole lattice rows (e.g. clear of the header's rule), per band.
    const drop = parseFloat(token(phone ? '--hero-lattice-drop-phone' : '--hero-lattice-drop-wide')) || 0;
    const y0 = (phone ? h * 0.2 : h * 0.06) + drop * r;
    const cx = x0 + W / 2;
    const cy = y0 + W * 0.36;
    reach = Math.hypot(Math.max(cx, w - cx), Math.max(cy, h - cy)) + s * 3;
    mark = new Path2D();
    const m = new DOMMatrix([W / SIDE, 0, 0, W / SIDE, x0, y0]);
    marks.forEach((d) => mark.addPath(new Path2D(d), m));
    // Lattice vertices: row k at y0 + k·r, column j at x0 + (j + k/2)·s. From each: one edge right, down-right, down-left.
    const list: number[] = [];
    for (let k = Math.floor(-y0 / r) - 1; k <= Math.ceil((h - y0) / r); k++) {
      const y = y0 + k * r;
      const off = x0 + (k / 2) * s;
      for (let j = Math.floor(-off / s) - 1; j <= Math.ceil((w - off) / s) + 1; j++) {
        const x = off + j * s;
        for (const [dx, dy] of [[s, 0], [s / 2, r], [-s / 2, r]] as const)
          list.push(x, y, x + dx, y + dy, Math.hypot(x + dx / 2 - cx, y + dy / 2 - cy));
      }
    }
    edges = new Float32Array(list);
    ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx!.lineWidth = 1;
  }

  /** Stroke every edge, grouped by quantised alpha so a frame is a dozen strokes, not thousands. */
  function pass(color: string, base: number, gain: number, glowAt: (d: number) => number) {
    const groups = new Map<number, number[]>();
    for (let e = 0; e < edges.length; e += 5) {
      const level = Math.round((base + glowAt(edges[e + 4]!) * gain) / STEP);
      if (!groups.has(level)) groups.set(level, []);
      groups.get(level)!.push(e);
    }
    ctx!.strokeStyle = color;
    groups.forEach((list, level) => {
      ctx!.globalAlpha = level * STEP;
      ctx!.beginPath();
      for (const e of list) {
        ctx!.moveTo(edges[e]!, edges[e + 1]!);
        ctx!.lineTo(edges[e + 2]!, edges[e + 3]!);
      }
      ctx!.stroke();
    });
  }

  function draw(t: number | null) {
    // The ring grows over one period and fades as it travels; a still frame has no ring.
    const p = t == null ? -1 : (t % PERIOD) / PERIOD;
    const ring = p * reach;
    const band = reach * 0.06;
    const glowAt = (d: number) => (p < 0 ? 0 : Math.exp(-(((d - ring) / band) ** 2)) * (1 - p));
    ctx!.clearRect(0, 0, w, h);
    pass(colors[0]!, 0.05, 0.2, glowAt);
    // Inside the mark the same lattice switches to the accent, so the monogram is made of its own grid.
    ctx!.save();
    ctx!.clip(mark);
    ctx!.clearRect(0, 0, w, h);
    pass(colors[1]!, 0.22, 0.45, glowAt);
    ctx!.restore();
    ctx!.strokeStyle = colors[1]!;
    ctx!.globalAlpha = 0.3;
    ctx!.stroke(mark);
  }

  function tick(now: number) {
    raf = requestAnimationFrame(tick);
    if (now - last < FRAME) return;
    last = now;
    draw(now);
  }

  function update() {
    cancelAnimationFrame(raf);
    raf = 0;
    if (reduced.matches) draw(null);
    else if (visible && !document.hidden) raf = requestAnimationFrame(tick);
  }

  let pending = 0;
  const resize = new ResizeObserver(() => {
    clearTimeout(pending);
    pending = window.setTimeout(() => {
      layout();
      draw(reduced.matches ? null : last);
    }, 80);
  });
  const seenOnScreen = new IntersectionObserver(([entry]) => {
    visible = !!entry?.isIntersecting;
    update();
  });
  resize.observe(canvas);
  seenOnScreen.observe(canvas);
  document.addEventListener('visibilitychange', update);
  reduced.addEventListener('change', update);
  layout();
  update();

  return () => {
    cancelAnimationFrame(raf);
    clearTimeout(pending);
    resize.disconnect();
    seenOnScreen.disconnect();
    document.removeEventListener('visibilitychange', update);
    reduced.removeEventListener('change', update);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };
}

// The plotter: the hero's real column grid, faint, with a plotter head walking it --------------------------------
// Every vertical is a gutter of the 4 / 12 column grid and every row one module (column + gutter) down, read from
// the hero's computed layout. The head, a registration target in the mark's colour, walks gutter to gutter along
// the lines only, keeps to the figure's side of the sheet, leaves a fading trail and reads out where it stops.
// Paused off-screen and in hidden tabs; one still frame (grid and parked head) under reduced motion.

function plotter(canvas: HTMLCanvasElement, hero: HTMLElement): () => void {
  const ctx = canvas.getContext('2d');
  if (!ctx) return () => {};
  const SPEED = 0.07; // px per ms: unhurried, like a pen plotter
  const PAUSE = 1400;
  const TRAIL = 7000; // ms for a stroke of trail to fade out
  type Stop = { c: number; r: number; x: number; y: number };
  let w = 0;
  let h = 0;
  let xs: number[] = [];
  let ys: number[] = [];
  let ink = { grid: '', pen: '', head: '' };
  let font = '';
  let head = { c: 0, r: 0 };
  let path: Stop[] = [];
  let seg = 0;
  let segAt = 0;
  let trail: { x: number; y: number; at: number }[] = [];
  let raf = 0;
  let last = 0;
  let visible = true;

  function layout() {
    const dpr = Math.min(devicePixelRatio || 1, 2);
    w = canvas.clientWidth;
    h = canvas.clientHeight;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
    const cs = getComputedStyle(hero);
    const cols = cs.gridTemplateColumns.split(' ').map(parseFloat);
    const gap = parseFloat(cs.columnGap);
    const left = parseFloat(cs.paddingLeft);
    const top = parseFloat(cs.paddingTop);
    const p = cols[0]! + gap;
    xs = [left, ...cols.map((c, i) => left + i * p + c + (i < cols.length - 1 ? gap / 2 : 0))];
    ys = [];
    for (let y = top; y <= h - top + 1; y += p) ys.push(y);
    ink = { grid: token('--spec-guide'), pen: token('--figure-guide-ink'), head: token('--figure-mark') };
    font = `${getComputedStyle($('.info')!).fontSize} ${token('--spec-font-family')}`;
    head = { c: xs.length - 2, r: 0 };
    path = [];
    trail = [];
  }

  // The next stop favours the figure's side of the sheet, away from the text block (bottom left).
  function plan(now: number) {
    const n = xs.length;
    const m = ys.length;
    let c: number;
    let r: number;
    do {
      c = Math.floor(Math.random() * n);
      r = Math.floor(Math.random() * m);
    } while ((c < n * 0.5 && r > m * 0.35) || (c === head.c && r === head.r));
    const turn = Math.random() < 0.5 ? { c, r: head.r } : { c: head.c, r };
    path = [head, turn, { c, r }].map((q) => ({ ...q, x: xs[q.c]!, y: ys[q.r]! }));
    seg = 0;
    segAt = now + PAUSE;
  }

  function cross(x: number, y: number, s: number) {
    ctx!.moveTo(x - s, y);
    ctx!.lineTo(x + s, y);
    ctx!.moveTo(x, y - s);
    ctx!.lineTo(x, y + s);
  }

  function frame(now: number | null) {
    const c2 = ctx!;
    c2.clearRect(0, 0, w, h);
    c2.lineWidth = 1;
    // The sheet: faint gutter lines, a cross where each meets a module row.
    c2.strokeStyle = ink.grid;
    c2.globalAlpha = 0.05;
    c2.beginPath();
    xs.forEach((x) => (c2.moveTo(x, 0), c2.lineTo(x, h)));
    ys.forEach((y) => (c2.moveTo(0, y), c2.lineTo(w, y)));
    c2.stroke();
    c2.globalAlpha = 0.28;
    c2.beginPath();
    xs.forEach((x) => ys.forEach((y) => cross(x, y, 5)));
    c2.stroke();

    let pos = { x: xs[head.c]!, y: ys[head.r]! };
    if (now != null) {
      if (!path.length) plan(now);
      const a = path[seg]!;
      const b = path[seg + 1];
      if (now > segAt && b) {
        const len = Math.hypot(b.x - a.x, b.y - a.y);
        const t = Math.min(1, (now - segAt) / (len / SPEED || 1));
        pos = { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t };
        trail.push({ ...pos, at: now });
        if (t === 1) {
          seg++;
          segAt = now;
          if (seg === path.length - 1) {
            head = path[seg]!;
            path = [];
          }
        }
      } else pos = a;
      // The pen's line, fading by age.
      trail = trail.filter((q) => now - q.at < TRAIL);
      c2.strokeStyle = ink.pen;
      for (let i = 1; i < trail.length; i++) {
        const q = trail[i]!;
        const o = trail[i - 1]!;
        if (q.at - o.at > 200) continue;
        c2.globalAlpha = 0.55 * (1 - (now - q.at) / TRAIL);
        c2.beginPath();
        c2.moveTo(o.x, o.y);
        c2.lineTo(q.x, q.y);
        c2.stroke();
      }
    }
    // The head: a registration target, and where it sits on the grid.
    c2.globalAlpha = 0.9;
    c2.strokeStyle = ink.head;
    c2.beginPath();
    c2.arc(pos.x, pos.y, 5, 0, Math.PI * 2);
    cross(pos.x, pos.y, 10);
    c2.stroke();
    const c = xs.indexOf(pos.x);
    const r = ys.indexOf(pos.y);
    if (c >= 0 && r >= 0) {
      c2.globalAlpha = 0.7;
      c2.fillStyle = ink.pen;
      c2.font = font;
      c2.fillText(`g${String(c).padStart(2, '0')} · m${String(r).padStart(2, '0')}`, pos.x + 14, pos.y - 10);
    }
  }

  function tick(now: number) {
    raf = requestAnimationFrame(tick);
    if (now - last < 33) return;
    last = now;
    frame(now);
  }

  function update() {
    cancelAnimationFrame(raf);
    raf = 0;
    if (reduced.matches) frame(null);
    else if (visible && !document.hidden) raf = requestAnimationFrame(tick);
  }

  let pending = 0;
  const resize = new ResizeObserver(() => {
    clearTimeout(pending);
    pending = window.setTimeout(() => {
      layout();
      update();
    }, 80);
  });
  const onScreen = new IntersectionObserver(([entry]) => {
    visible = !!entry?.isIntersecting;
    update();
  });
  resize.observe(canvas);
  onScreen.observe(canvas);
  document.addEventListener('visibilitychange', update);
  reduced.addEventListener('change', update);
  layout();
  update();

  return () => {
    cancelAnimationFrame(raf);
    clearTimeout(pending);
    resize.disconnect();
    onScreen.disconnect();
    document.removeEventListener('visibilitychange', update);
    reduced.removeEventListener('change', update);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };
}

// Wiring ----------------------------------------------------------------------------------------------------------

let stopFigure = () => {};

/** Read the brand's figure and start what it needs. Runs on load and on every brand switch. */
function start() {
  stopFigure();
  stopFigure = () => {};
  const canvas = $<HTMLCanvasElement>('canvas.field');
  if (canvas && token('--hero-figure') === 'lattice') stopFigure = lattice(canvas);
  else if (canvas && token('--hero-ground') === 'plotter') stopFigure = plotter(canvas, $('.hero')!);
  readouts();
}

toggle.addEventListener('click', () => setPeek(toggle.getAttribute('aria-pressed') !== 'true'));
addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && toggle.getAttribute('aria-pressed') === 'true') setPeek(false);
});
$('[data-skip-intro]')?.addEventListener('click', () => skip());
addEventListener('resize', readouts);
document.fonts.ready.then(readouts);

// A brand switch: whatever intro was running lands at rest, and the new brand's figure starts.
new MutationObserver(() => {
  if (root.classList.contains('intro')) settle();
  start();
}).observe(root, { attributes: true, attributeFilter: ['data-brand'] });

start();
if (root.classList.contains('intro')) {
  const intro = token('--hero-intro');
  if (intro === 'peek') peekIntro();
  else if (intro === 'assemble') assembleIntro();
  else settle();
}
