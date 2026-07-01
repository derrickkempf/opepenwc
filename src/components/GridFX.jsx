import { useEffect } from 'react';

/* Background grid + "crowd flash" squares, from the art-world-cup prototype.

   anchorGrid() sizes and positions the body's CSS grid so one grid cell equals
   1/18 of the match board (#stage, rendered by Board in views.jsx) and a line
   sits exactly on the board's top-left corner — every board pixel-cell boundary
   lands on a page grid line. On routes without a board it falls back to the
   CSS default (min(100vw/18, 100px), origin 0,0).

   gridFX draws ambient + hover flash squares on a fixed, pointer-transparent
   canvas behind the page, aligned to the same grid. */

const fallbackU = () => Math.min(window.innerWidth / 18, 100);

function measure() {
  const el = document.getElementById('stage');
  const r = el && el.getBoundingClientRect();
  if (r && r.width) return { u: r.width / 18, x: r.left, y: r.top }; // board = 18 cells wide
  return { u: fallbackU(), x: 0, y: 0 };
}

function anchorGrid() {
  const { u, x, y } = measure();
  const ox = (((x + window.scrollX) % u) + u) % u;
  const oy = (((y + window.scrollY) % u) + u) % u;
  document.body.style.backgroundSize = `${u}px ${u}px, ${u}px ${u}px, auto, auto`;
  document.body.style.backgroundPosition = `${ox}px ${oy}px, ${ox}px ${oy}px, 0 0, 0 0`;
}

export default function GridFX() {
  useEffect(() => {
    anchorGrid();
    const ro = new ResizeObserver(anchorGrid); // catches route swaps + layout shifts
    ro.observe(document.body);
    window.addEventListener('resize', anchorGrid);
    window.addEventListener('hashchange', anchorGrid);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(anchorGrid);

    // ---- flash canvas ----
    let cleanupFx = () => {};
    if (!matchMedia('(prefers-reduced-motion: reduce)').matches) {
      const cv = document.createElement('canvas');
      cv.style.cssText = 'position:fixed; inset:0; z-index:-1; pointer-events:none;';
      document.body.appendChild(cv);
      const ctx = cv.getContext('2d');
      let W = 0, H = 0;
      const resize = () => {
        const dpr = Math.min(2, window.devicePixelRatio || 1);
        W = innerWidth; H = innerHeight;
        cv.width = Math.floor(W * dpr); cv.height = Math.floor(H * dpr);
        cv.style.width = W + 'px'; cv.style.height = H + 'px';
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      };
      resize();
      window.addEventListener('resize', resize);

      // viewport-space grid (canvas is position:fixed)
      const grid = () => {
        const { u, x, y } = measure();
        return { u, ox: ((x % u) + u) % u, oy: ((y % u) + u) % u };
      };

      let flashes = [];
      const spawn = (c, r, dur, peak, warm) => {
        flashes.push({ c, r, t0: performance.now(), dur, peak, warm });
        if (flashes.length > 300) flashes.splice(0, flashes.length - 300);
      };

      const startT = performance.now(), INTRO = 2400; // opening burst, then ambient
      let ambientTO = 0;
      const ambient = () => {
        const g = grid();
        const e = performance.now() - startT, boost = e < INTRO ? 1 - e / INTRO : 0;
        const n = 2 + Math.floor(Math.random() * 6) + Math.round(boost * 16);
        for (let i = 0; i < n; i++) {
          spawn(
            Math.floor((Math.random() * (W + g.u) - g.ox) / g.u),
            Math.floor((Math.random() * (H + g.u) - g.oy) / g.u),
            650 + Math.random() * 800,
            0.08 + Math.random() * 0.12 + boost * 0.06,
            Math.random() < 0.18 + boost * 0.12
          );
        }
        ambientTO = setTimeout(ambient, 80 + Math.random() * 180 + (1 - boost) * (540 + Math.random() * 1400));
      };
      ambient();

      let onMove = null;
      if (matchMedia('(hover: hover)').matches) {
        let lc = null, lr = null;
        onMove = (e) => {
          const g = grid();
          const c = Math.floor((e.clientX - g.ox) / g.u), r = Math.floor((e.clientY - g.oy) / g.u);
          if (c !== lc || r !== lr) { lc = c; lr = r; spawn(c, r, 520, 0.22, false); }
        };
        window.addEventListener('mousemove', onMove);
      }

      let raf = 0;
      const frame = (now) => {
        ctx.clearRect(0, 0, W, H);
        const g = grid();
        flashes = flashes.filter((f) => now - f.t0 < f.dur);
        for (const f of flashes) {
          const p = (now - f.t0) / f.dur, a = Math.sin(p * Math.PI) * f.peak;
          if (a <= 0) continue;
          ctx.fillStyle = f.warm ? `rgba(243,207,38,${a})` : `rgba(255,255,255,${a})`;
          ctx.fillRect(g.ox + f.c * g.u + 1, g.oy + f.r * g.u + 1, g.u - 2, g.u - 2);
        }
        raf = requestAnimationFrame(frame);
      };
      raf = requestAnimationFrame(frame);

      cleanupFx = () => {
        cancelAnimationFrame(raf); clearTimeout(ambientTO);
        window.removeEventListener('resize', resize);
        if (onMove) window.removeEventListener('mousemove', onMove);
        cv.remove();
      };
    }

    return () => {
      ro.disconnect();
      window.removeEventListener('resize', anchorGrid);
      window.removeEventListener('hashchange', anchorGrid);
      cleanupFx();
    };
  }, []);

  return null;
}
