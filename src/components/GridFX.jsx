import React, { useEffect } from 'react';

/* Ambient + hover "crowd flash" squares on the body grid, plus anchorGrid()
   which aligns the full-page CSS grid lines to the play stage so every stadium
   cell boundary sits exactly on a screen grid line. Ported faithfully from the
   reference prototype (index.html: anchorGrid + gridFX IIFE).

   The stage element is looked up live by id="stage" (rendered by ViewPlay). When
   the stage isn't present (other routes) anchorGrid falls back to a neutral
   position and the flashes just ride the CSS grid. Canvas is position:fixed,
   z-index:-1, pointer-events:none. */
export default function GridFX() {
  useEffect(() => {
    const getStage = () => document.getElementById('stage');

    // ---- anchorGrid: align body background grid to the stage ----
    function anchorGrid() {
      const stageEl = getStage();
      if (!stageEl) { document.body.style.backgroundPosition = '0 0, 0 0, 0 0, 0 0'; return; }
      const r = stageEl.getBoundingClientRect();
      if (!r.width) return;
      const u = r.width / 18;                       // stage is exactly 18 cells wide
      const sx = r.left + window.scrollX, sy = r.top + window.scrollY;
      const ox = ((sx % u) + u) % u, oy = ((sy % u) + u) % u;
      document.body.style.backgroundPosition = ox + 'px ' + oy + 'px, ' + ox + 'px ' + oy + 'px, 0 0, 0 0';
    }

    anchorGrid();
    window.addEventListener('resize', anchorGrid);
    window.addEventListener('scroll', anchorGrid, { passive: true });
    window.addEventListener('load', anchorGrid);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(anchorGrid);
    // Re-anchor a few times after mount as fonts/layout settle, and on hash change.
    const settle = [setTimeout(anchorGrid, 60), setTimeout(anchorGrid, 300), setTimeout(anchorGrid, 900)];
    const onHash = () => { setTimeout(anchorGrid, 0); setTimeout(anchorGrid, 120); };
    window.addEventListener('hashchange', onHash);
    // Poll gently so route swaps that mount/unmount the stage re-anchor.
    const anchorIv = setInterval(anchorGrid, 500);

    // ---- gridFX: ambient + hover crowd flashes ----
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    let cleanupFx = () => {};
    if (!reduce) {
      const canHover = matchMedia('(hover: hover)').matches;
      const cv = document.createElement('canvas');
      cv.style.cssText = 'position:fixed; inset:0; z-index:-1; pointer-events:none;';
      document.body.appendChild(cv);
      const ctx = cv.getContext('2d');
      let W = 0, H = 0, dpr = 1;
      function resize() {
        dpr = Math.min(2, window.devicePixelRatio || 1); W = innerWidth; H = innerHeight;
        cv.width = Math.floor(W * dpr); cv.height = Math.floor(H * dpr);
        cv.style.width = W + 'px'; cv.style.height = H + 'px';
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      }
      resize();
      window.addEventListener('resize', resize);

      let lastG = { u: 60, ox: 0, oy: 0 };
      function grid() {
        const stageEl = getStage();
        if (stageEl) { const r = stageEl.getBoundingClientRect(); if (r.width) { const u = r.width / 18; lastG = { u, ox: ((r.left % u) + u) % u, oy: ((r.top % u) + u) % u }; } }
        return lastG;
      }

      let flashes = [];
      function spawn(c, r, dur, peak, warm) { flashes.push({ c, r, t0: performance.now(), dur, peak, warm }); if (flashes.length > 300) flashes.splice(0, flashes.length - 300); }
      const startT = performance.now(), INTRO = 2400;
      let ambientTO = 0;
      function ambient() {
        const g = grid();
        const e = performance.now() - startT, boost = e < INTRO ? 1 - e / INTRO : 0;
        const n = 2 + Math.floor(Math.random() * 6) + Math.round(boost * 16);
        for (let i = 0; i < n; i++) {
          const c = Math.floor((Math.random() * (W + g.u) - g.ox) / g.u);
          const r = Math.floor((Math.random() * (H + g.u) - g.oy) / g.u);
          spawn(c, r, 650 + Math.random() * 800, 0.08 + Math.random() * 0.12 + boost * 0.06, Math.random() < 0.18 + boost * 0.12);
        }
        const delay = 80 + Math.random() * 180 + (1 - boost) * (540 + Math.random() * 1400);
        ambientTO = setTimeout(ambient, delay);
      }
      ambient();

      let onMove = null;
      if (canHover) {
        let lc = null, lr = null;
        onMove = (e) => {
          const g = grid();
          const c = Math.floor((e.clientX - g.ox) / g.u), r = Math.floor((e.clientY - g.oy) / g.u);
          if (c !== lc || r !== lr) { lc = c; lr = r; spawn(c, r, 520, 0.22, false); }
        };
        window.addEventListener('mousemove', onMove);
      }

      let raf = 0;
      function frame(now) {
        ctx.clearRect(0, 0, W, H); const g = grid();
        flashes = flashes.filter((f) => now - f.t0 < f.dur);
        for (const f of flashes) {
          const p = (now - f.t0) / f.dur, a = Math.sin(p * Math.PI) * f.peak; if (a <= 0) continue;
          ctx.fillStyle = f.warm ? 'rgba(243,207,38,' + a + ')' : 'rgba(255,255,255,' + a + ')';
          ctx.fillRect(g.ox + f.c * g.u + 1, g.oy + f.r * g.u + 1, g.u - 2, g.u - 2);
        }
        raf = requestAnimationFrame(frame);
      }
      raf = requestAnimationFrame(frame);

      cleanupFx = () => {
        cancelAnimationFrame(raf); clearTimeout(ambientTO);
        window.removeEventListener('resize', resize);
        if (onMove) window.removeEventListener('mousemove', onMove);
        if (cv.parentNode) cv.parentNode.removeChild(cv);
      };
    }

    return () => {
      window.removeEventListener('resize', anchorGrid);
      window.removeEventListener('scroll', anchorGrid);
      window.removeEventListener('load', anchorGrid);
      window.removeEventListener('hashchange', onHash);
      settle.forEach(clearTimeout);
      clearInterval(anchorIv);
      cleanupFx();
    };
  }, []);

  return null;
}
