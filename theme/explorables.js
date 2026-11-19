/* Explorables shared behaviour: light/dark theme, the Notes and Settings panels, and the plot
   helper every explorable draws with. Load it in <head> (not deferred) so the theme is applied
   before the page is drawn. Exposes window.XP. */
(function () {
  'use strict';
  const XP = {};
  const KEY = 'explorables-theme';

  /* Anonymous visit counting with Umami Cloud (no cookies). Added 2026-11-13 at his request; the
     reports are visible only in his Umami account. Loaded only on the live site, so local tests and
     offline copies are not counted; if it cannot load, the page works the same. */
  if (location.hostname === 'priye19.github.io') {
    const u = document.createElement('script');
    u.defer = true;
    u.src = 'https://cloud.umami.is/script.js';
    u.dataset.websiteId = 'cc6b0d13-c993-43bd-87f5-b6887c8c4e81';
    u.dataset.domains = 'priye19.github.io';
    document.head.appendChild(u);
  }

  function load() { try { return localStorage.getItem(KEY); } catch (e) { return null; } }
  function save(t) { try { localStorage.setItem(KEY, t); } catch (e) { /* private window: not kept */ } }
  const sys = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  XP.theme = load() || sys;
  document.documentElement.dataset.theme = XP.theme;

  const listeners = [];
  XP.onTheme = f => listeners.push(f);
  function label(b) { b.textContent = XP.theme === 'dark' ? '☀ Light mode' : '☾ Dark mode'; }
  XP.setTheme = t => {
    XP.theme = t; document.documentElement.dataset.theme = t; save(t);
    document.querySelectorAll('.xp-theme').forEach(label);
    listeners.forEach(f => f(t));
  };

  /* Wires the theme button and every panel. Panels: <aside class="xp-panel" id="..."> opened by
     any element with data-open="id", closed by data-close, the backdrop or the Escape key. */
  XP.init = () => {
    document.querySelectorAll('.xp-theme').forEach(b => {
      label(b);
      b.addEventListener('click', () => XP.setTheme(XP.theme === 'dark' ? 'light' : 'dark'));
    });
    let back = document.querySelector('.xp-backdrop');
    if (!back && document.querySelector('.xp-panel')) {
      back = document.createElement('div'); back.className = 'xp-backdrop'; document.body.appendChild(back);
    }
    const closeAll = () => {
      document.querySelectorAll('.xp-panel.open').forEach(p => p.classList.remove('open'));
      if (back) back.classList.remove('open');
    };
    document.querySelectorAll('[data-open]').forEach(b => b.addEventListener('click', () => {
      const p = document.getElementById(b.dataset.open); if (!p) return;
      const was = p.classList.contains('open'); closeAll();
      if (!was) { p.classList.add('open'); back.classList.add('open'); }
    }));
    document.querySelectorAll('[data-close]').forEach(b => b.addEventListener('click', closeAll));
    if (back) back.addEventListener('click', closeAll);
    document.addEventListener('keydown', e => { if (e.key === 'Escape') closeAll(); });
    XP.panelOpen = () => !!document.querySelector('.xp-panel.open');
  };

  /* The theme's colours, read from the stylesheet, for drawing on canvases. */
  XP.palette = () => {
    const s = getComputedStyle(document.documentElement), g = n => s.getPropertyValue(n).trim();
    return {
      bg: g('--plot-bg'), surface: g('--surface'), text: g('--text'), muted: g('--muted'), grid: g('--plot-grid'),
      axis: g('--plot-axis'), theory: g('--theory'), measured: g('--measured'), accent: g('--accent'),
      c1: g('--c1'), c2: g('--c2'), c3: g('--c3'), c4: g('--c4'), c5: g('--c5'), particle: g('--particle'),
      path: g('--path'), field: g('--field'), fieldGrid: g('--field-grid'), band: g('--band'),
      font: g('--font') || 'sans-serif'
    };
  };

  /* ---- numbers ---- */
  XP.fmt = v => {
    if (v === null || v === undefined || !isFinite(v)) return '-';
    if (v === 0) return '0';
    const a = Math.abs(v);
    if (a >= 1000) return Math.round(v).toLocaleString('en-US');
    const dec = Math.min(4, Math.max(0, 2 - Math.floor(Math.log10(a))));
    const s = v.toFixed(dec);
    return /^-0(\.0*)?$/.test(s) ? s.slice(1) : s;
  };
  XP.niceStep = (range, target) => {
    const raw = range / target, p = Math.pow(10, Math.floor(Math.log10(raw))), f = raw / p;
    return (f < 1.5 ? 1 : f < 3 ? 2 : f < 7 ? 5 : 10) * p;
  };
  XP.tick = (v, step) => {
    const d = Math.max(0, -Math.floor(Math.log10(step) + 1e-9));
    if (Math.abs(v) < step * 1e-6) v = 0;
    return v.toFixed(d);
  };

  /* Sizes a canvas to its box on screen (sharp on high-density screens). */
  XP.setup = cv => {
    const r = cv.getBoundingClientRect(), w = Math.round(r.width), h = Math.round(r.height);
    if (w < 30 || h < 30) return null;
    const dpr = window.devicePixelRatio || 1;
    if (cv.width !== Math.round(w * dpr) || cv.height !== Math.round(h * dpr)) { cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr); }
    const ctx = cv.getContext('2d'); ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    return { ctx, w, h };
  };

  /* A line and bar plot. Legend in rows above the plot so it never covers data; a series with
     dash is a prediction, a solid one a measurement (the design language's rule). */
  XP.plot = (cv, o) => {
    const g = XP.setup(cv); if (!g) return;
    const { ctx, w, h } = g, P = XP.palette(), F = P.font;
    ctx.fillStyle = P.bg; ctx.fillRect(0, 0, w, h);
    const items = [];
    if (o.bars && o.bars.label) items.push({ label: o.bars.label, box: o.bars.fill, color: o.bars.stroke });
    if (o.band && o.band.label) items.push({ label: o.band.label, box: o.band.fill, color: o.band.fill });
    for (const s of o.series) if (s.label) items.push(s);
    ctx.font = '12px ' + F;
    const ml = 56, avail = w - ml - 10; let lx = 0, rows = items.length ? 1 : 0;
    for (const it of items) { it.w = 34 + ctx.measureText(it.label).width + 14; if (lx > 0 && lx + it.w > avail) { rows++; lx = 0; } it.row = rows - 1; it.x = lx; lx += it.w; }
    const m = { l: ml, r: 10, t: 8 + rows * 17, b: 38 }, pw = w - m.l - m.r, ph = h - m.t - m.b;
    if (pw < 40 || ph < 30) return;
    const { xmin, xmax, ymin, ymax } = o;
    const X = v => m.l + (v - xmin) / (xmax - xmin) * pw, Y = v => m.t + ph - (v - ymin) / (ymax - ymin) * ph;
    const xs = XP.niceStep(xmax - xmin, Math.max(3, Math.min(6, Math.floor(pw / 60))));
    let ys = XP.niceStep(ymax - ymin, Math.max(3, Math.min(5, Math.floor(ph / 40))));
    /* ylog: the y values given are base-10 logarithms; ticks fall on whole powers and read 10ⁿ */
    const SUP = { '-': '⁻', '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹' };
    if (o.ylog) ys = Math.max(1, Math.round(ys));
    const ylab = v => o.ylog ? '10' + String(Math.round(v)).split('').map(c => SUP[c] || c).join('') : XP.tick(v, ys);
    ctx.lineWidth = 1; ctx.strokeStyle = P.grid; ctx.fillStyle = P.muted; ctx.font = '11.5px ' + F;
    ctx.textAlign = 'center'; ctx.textBaseline = 'top';
    for (let v = Math.ceil(xmin / xs - 1e-9) * xs; v <= xmax + xs * 1e-9; v += xs) { const px = X(v); ctx.beginPath(); ctx.moveTo(px, m.t); ctx.lineTo(px, m.t + ph); ctx.stroke(); ctx.fillText(XP.tick(v, xs), px, m.t + ph + 4); }
    ctx.textAlign = 'right'; ctx.textBaseline = 'middle';
    for (let v = Math.ceil(ymin / ys - 1e-9) * ys; v <= ymax + ys * 1e-9; v += ys) { const py = Y(v); ctx.beginPath(); ctx.moveTo(m.l, py); ctx.lineTo(m.l + pw, py); ctx.stroke(); ctx.fillText(ylab(v), m.l - 5, py); }
    ctx.fillStyle = P.text; ctx.font = '12.5px ' + F; ctx.textAlign = 'center'; ctx.textBaseline = 'bottom';
    ctx.fillText(o.xlabel, m.l + pw / 2, h - 2);
    ctx.save(); ctx.translate(12, m.t + ph / 2); ctx.rotate(-Math.PI / 2); ctx.textBaseline = 'middle'; ctx.fillText(o.ylabel, 0, 0); ctx.restore();
    ctx.save(); ctx.beginPath(); ctx.rect(m.l, m.t, pw, ph); ctx.clip();
    if (o.band) {
      const b = o.band; ctx.fillStyle = b.fill; ctx.beginPath();
      b.xs.forEach((x, i) => { const px = X(x), py = Y(b.hi[i]); i ? ctx.lineTo(px, py) : ctx.moveTo(px, py); });
      for (let i = b.xs.length - 1; i >= 0; i--) ctx.lineTo(X(b.xs[i]), Y(b.lo[i]));
      ctx.closePath(); ctx.fill();
    }
    if (o.bars) {
      const b = o.bars; ctx.fillStyle = b.fill; ctx.strokeStyle = b.stroke; ctx.lineWidth = 1;
      for (let i = 0; i < b.x0.length; i++) {
        if (b.y[i] <= 0) continue;
        const x0 = X(b.x0[i]), x1 = X(b.x1[i]), y = Y(b.y[i]), y0 = Y(0);
        ctx.fillRect(x0, y, x1 - x0, y0 - y); ctx.strokeRect(x0 + .5, y + .5, x1 - x0 - 1, y0 - y - 1);
      }
    }
    for (const s of o.series) {
      if (!s.xs.length) continue;
      ctx.strokeStyle = s.color; ctx.lineWidth = s.width || 2; ctx.setLineDash(s.dash || []);
      ctx.beginPath();
      /* a value that is not a number (NaN) breaks the line, so one series can hold separate pieces */
      let pen = false;
      for (let i = 0; i < s.xs.length; i++) {
        const x = s.xs[i], y = s.ys[i];
        if (!isFinite(x) || !isFinite(y)) { pen = false; continue; }
        const px = X(x), py = Y(y); pen ? ctx.lineTo(px, py) : ctx.moveTo(px, py); pen = true;
      }
      ctx.stroke();
    }
    ctx.setLineDash([]);
    /* dots: [{x, y, color, r, ring}] drawn on top of the lines; ring = an open circle */
    for (const d of (o.dots || [])) {
      if (!isFinite(d.x) || !isFinite(d.y)) continue;
      ctx.beginPath(); ctx.arc(X(d.x), Y(d.y), d.r || 5, 0, 2 * Math.PI);
      if (d.ring) { ctx.strokeStyle = d.color; ctx.lineWidth = 2; ctx.stroke(); }
      else { ctx.fillStyle = d.color; ctx.fill(); ctx.strokeStyle = P.bg; ctx.lineWidth = 1.5; ctx.stroke(); }
    }
    ctx.restore();
    ctx.strokeStyle = P.axis; ctx.lineWidth = 1; ctx.strokeRect(m.l + .5, m.t + .5, pw, ph);
    ctx.font = '12px ' + F;
    for (const it of items) {
      const bx = m.l + it.x, y = 9 + it.row * 17;
      if (it.box) { ctx.fillStyle = it.box; ctx.fillRect(bx, y - 5, 22, 10); ctx.strokeStyle = it.color; ctx.lineWidth = 1; ctx.strokeRect(bx + .5, y - 4.5, 21, 9); }
      else { ctx.strokeStyle = it.color; ctx.lineWidth = it.width || 2; ctx.setLineDash(it.dash || []); ctx.beginPath(); ctx.moveTo(bx, y); ctx.lineTo(bx + 22, y); ctx.stroke(); ctx.setLineDash([]); }
      ctx.fillStyle = P.text; ctx.textAlign = 'left'; ctx.textBaseline = 'middle'; ctx.fillText(it.label, bx + 28, y);
    }
  };

  window.XP = XP;
})();
