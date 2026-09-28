"use client";

import { useEffect, useRef, type RefObject } from "react";

/**
 * Living terrain background for the home hero.
 *
 * A seeded procedural landscape is drawn as topographic contours. Raindrops
 * land on it and follow the steepest way down (the same idea as the D8 rule in
 * the Hydrology Lab); their fading trails converge into river networks.
 * Moving the pointer (or tapping) over `pointerTarget` makes it rain there.
 *
 * - prefers-reduced-motion: renders a single still frame (contours + rivers).
 * - Pauses when off-screen or when the tab is hidden.
 * - Colours come from the --contour / --map-stream theme tokens.
 */

const CELL = 6; // heightfield resolution (CSS px)
const FEATURE = 300; // size of the largest terrain features (CSS px)
const SEED = 20260928;

function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Smooth value noise on an integer lattice, 0…1 */
function makeNoise(seed: number) {
  const hash = (x: number, y: number) => {
    let h = (x * 374761393 + y * 668265263 + seed * 2246822519) | 0;
    h = Math.imul(h ^ (h >>> 13), 1274126177);
    return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
  };
  const fade = (t: number) => t * t * (3 - 2 * t);
  return (x: number, y: number) => {
    const xi = Math.floor(x);
    const yi = Math.floor(y);
    const xf = fade(x - xi);
    const yf = fade(y - yi);
    const a = hash(xi, yi);
    const b = hash(xi + 1, yi);
    const c = hash(xi, yi + 1);
    const d = hash(xi + 1, yi + 1);
    return a + (b - a) * xf + (c - a) * yf + (a - b - c + d) * xf * yf;
  };
}

function readColor(name: string, fallback: string) {
  const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return v || fallback;
}

/** "#rrggbb" or "rgb(...)" → [r, g, b] */
function toRgb(color: string): [number, number, number] {
  if (color.startsWith("#")) {
    const n = parseInt(color.slice(1, 7), 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  }
  const m = color.match(/\d+(\.\d+)?/g);
  return m ? [Number(m[0]), Number(m[1]), Number(m[2])] : [42, 120, 214];
}

export function RainTerrain({ pointerTarget, className = "" }: { pointerTarget?: RefObject<HTMLElement | null>; className?: string }) {
  const contourRef = useRef<HTMLCanvasElement | null>(null);
  const flowRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const contourCanvas = contourRef.current;
    const flowCanvas = flowRef.current;
    if (!contourCanvas || !flowCanvas) return;
    const host = flowCanvas.parentElement!;
    const cctx = contourCanvas.getContext("2d")!;
    const fctx = flowCanvas.getContext("2d")!;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let W = 0;
    let H = 0;
    let cols = 0;
    let rows = 0;
    let heights = new Float32Array(0);
    let raf = 0;
    let running = false;
    let visible = true;
    let frame = 0;
    let streamRgb: [number, number, number] = [42, 120, 214];
    let dark = false;

    // particles
    let N = 0;
    let px = new Float32Array(0);
    let py = new Float32Array(0);
    let vx = new Float32Array(0);
    let vy = new Float32Array(0);
    let life = new Float32Array(0);
    let stall = new Float32Array(0);
    const rand = mulberry32(SEED ^ 0x9e3779b9);

    const pointer = { x: 0, y: 0, until: 0 };

    const h = (x: number, y: number) => {
      const gx = Math.max(0, Math.min(cols - 1.001, x / CELL));
      const gy = Math.max(0, Math.min(rows - 1.001, y / CELL));
      const i = Math.floor(gx);
      const j = Math.floor(gy);
      const fx = gx - i;
      const fy = gy - j;
      const k = j * cols + i;
      const a = heights[k];
      const b = heights[k + 1];
      const c = heights[k + cols];
      const d = heights[k + cols + 1];
      return a + (b - a) * fx + (c - a) * fy + (a - b - c + d) * fx * fy;
    };

    function buildTerrain() {
      cols = Math.ceil(W / CELL) + 2;
      rows = Math.ceil(H / CELL) + 2;
      heights = new Float32Array(cols * rows);
      const n1 = makeNoise(SEED);
      const n2 = makeNoise(SEED + 17);
      let lo = Infinity;
      let hi = -Infinity;
      for (let j = 0; j < rows; j++) {
        for (let i = 0; i < cols; i++) {
          const x = (i * CELL) / FEATURE;
          const y = (j * CELL) / FEATURE;
          // domain warp gives ridge/valley shapes instead of blobs
          const wx = x + 0.9 * n2(x * 0.7, y * 0.7);
          const wy = y + 0.9 * n2(x * 0.7 + 5.2, y * 0.7 + 1.3);
          let amp = 1;
          let freq = 1;
          let sum = 0;
          let norm = 0;
          for (let o = 0; o < 5; o++) {
            sum += amp * n1(wx * freq, wy * freq);
            norm += amp;
            amp *= 0.5;
            freq *= 2.03;
          }
          // regional slope: high in the upper-left, draining to the lower-right
          const tilt = 1 - (0.55 * (i * CELL)) / Math.max(W, 1) - (0.45 * (j * CELL)) / Math.max(H, 1);
          const v = 0.72 * (sum / norm) + 0.5 * tilt;
          heights[j * cols + i] = v;
          if (v < lo) lo = v;
          if (v > hi) hi = v;
        }
      }
      const span = hi - lo || 1;
      for (let k = 0; k < heights.length; k++) heights[k] = (heights[k] - lo) / span;
    }

    function drawContours() {
      const dpr = contourCanvas!.width / Math.max(W, 1);
      cctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      cctx.clearRect(0, 0, W, H);
      const [r, g, b] = toRgb(readColor("--contour", "#c9a87c"));
      const levels = 28;
      // marching squares, one path per level
      for (let l = 1; l < levels; l++) {
        const iso = l / levels;
        const major = l % 5 === 0;
        cctx.strokeStyle = `rgba(${r},${g},${b},${major ? (dark ? 0.55 : 0.75) : dark ? 0.28 : 0.4})`;
        cctx.lineWidth = major ? 1.1 : 0.7;
        cctx.beginPath();
        for (let j = 0; j < rows - 1; j++) {
          for (let i = 0; i < cols - 1; i++) {
            const k = j * cols + i;
            const a = heights[k];
            const bb = heights[k + 1];
            const c = heights[k + cols + 1];
            const d = heights[k + cols];
            let idx = 0;
            if (a > iso) idx |= 8;
            if (bb > iso) idx |= 4;
            if (c > iso) idx |= 2;
            if (d > iso) idx |= 1;
            if (idx === 0 || idx === 15) continue;
            const x = i * CELL;
            const y = j * CELL;
            const lerp = (p: number, q: number) => (iso - p) / (q - p || 1e-9);
            const top: [number, number] = [x + CELL * lerp(a, bb), y];
            const right: [number, number] = [x + CELL, y + CELL * lerp(bb, c)];
            const bottom: [number, number] = [x + CELL * lerp(d, c), y + CELL];
            const left: [number, number] = [x, y + CELL * lerp(a, d)];
            const seg = (p: [number, number], q: [number, number]) => {
              cctx.moveTo(p[0], p[1]);
              cctx.lineTo(q[0], q[1]);
            };
            switch (idx) {
              case 1: case 14: seg(left, bottom); break;
              case 2: case 13: seg(bottom, right); break;
              case 3: case 12: seg(left, right); break;
              case 4: case 11: seg(top, right); break;
              case 6: case 9: seg(top, bottom); break;
              case 7: case 8: seg(left, top); break;
              case 5: seg(left, top); seg(bottom, right); break;
              case 10: seg(top, right); seg(left, bottom); break;
            }
          }
        }
        cctx.stroke();
      }
    }

    function spawn(k: number, x?: number, y?: number) {
      px[k] = x ?? rand() * W;
      py[k] = y ?? rand() * H;
      vx[k] = 0;
      vy[k] = 0;
      life[k] = 160 + rand() * 260;
      stall[k] = 0;
    }

    function initParticles() {
      N = Math.round(Math.min(1400, Math.max(260, (W * H) / 1100)));
      px = new Float32Array(N);
      py = new Float32Array(N);
      vx = new Float32Array(N);
      vy = new Float32Array(N);
      life = new Float32Array(N);
      stall = new Float32Array(N);
      for (let k = 0; k < N; k++) {
        spawn(k);
        life[k] *= rand(); // stagger so they don't all die together
      }
    }

    /** Advance every drop one step and draw its trail segment on `ctx`. */
    function step(fade: boolean, ctx: CanvasRenderingContext2D = fctx, alpha = dark ? 0.3 : 0.3) {
      const fctx = ctx;
      if (fade && frame % 4 === 0) {
        fctx.globalCompositeOperation = "destination-out";
        fctx.fillStyle = "rgba(0,0,0,0.06)";
        fctx.fillRect(0, 0, W, H);
        fctx.globalCompositeOperation = "source-over";
      }
      // it rains under the pointer
      if (performance.now() < pointer.until) {
        for (let s = 0; s < 7; s++) {
          const k = Math.floor(rand() * N);
          const a = rand() * Math.PI * 2;
          const r = Math.sqrt(rand()) * 46;
          spawn(k, pointer.x + Math.cos(a) * r, pointer.y + Math.sin(a) * r);
        }
      }
      const [r, g, b] = streamRgb;
      fctx.strokeStyle = `rgba(${r},${g},${b},${alpha})`;
      fctx.lineWidth = 1.15;
      fctx.lineCap = "round";
      fctx.beginPath();
      const e = CELL;
      for (let k = 0; k < N; k++) {
        const x = px[k];
        const y = py[k];
        const gx = (h(x + e, y) - h(x - e, y)) / (2 * e);
        const gy = (h(x, y + e) - h(x, y - e)) / (2 * e);
        const gm = Math.hypot(gx, gy);
        if (gm > 1e-7) {
          const pull = 0.55 + Math.min(1.2, gm * 900);
          vx[k] = vx[k] * 0.8 - (gx / gm) * 0.3 * pull;
          vy[k] = vy[k] * 0.8 - (gy / gm) * 0.3 * pull;
        }
        const sp = Math.hypot(vx[k], vy[k]);
        if (sp > 1.9) {
          vx[k] *= 1.9 / sp;
          vy[k] *= 1.9 / sp;
        }
        const nx = x + vx[k];
        const ny = y + vy[k];
        stall[k] = sp < 0.25 ? stall[k] + 1 : Math.max(0, stall[k] - 1);
        life[k] -= 1;
        if (nx < -4 || ny < -4 || nx > W + 4 || ny > H + 4 || life[k] <= 0 || stall[k] > 25) {
          spawn(k);
          continue;
        }
        fctx.moveTo(x, y);
        fctx.lineTo(nx, ny);
        px[k] = nx;
        py[k] = ny;
      }
      fctx.stroke();
      frame++;
    }

    function loop() {
      if (!running) return;
      step(true);
      raf = requestAnimationFrame(loop);
    }

    function start() {
      if (running || reduceMotion || !visible || document.hidden) return;
      running = true;
      raf = requestAnimationFrame(loop);
    }
    function stop() {
      running = false;
      cancelAnimationFrame(raf);
    }

    function setup() {
      const rect = host.getBoundingClientRect();
      W = Math.max(1, Math.round(rect.width));
      H = Math.max(1, Math.round(rect.height));
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      for (const c of [contourCanvas!, flowCanvas!]) {
        c.width = Math.round(W * dpr);
        c.height = Math.round(H * dpr);
      }
      fctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      dark = document.documentElement.getAttribute("data-atlas-dark") === "true";
      streamRgb = toRgb(readColor("--map-stream", "#2a78d6"));
      buildTerrain();
      drawContours();
      fctx.clearRect(0, 0, W, H);
      // "Carve" the river beds once: many drops, no fading, drawn faintly under the
      // contours' layer so the whole drainage network is visible on arrival.
      initParticles();
      cctx.setTransform(contourCanvas!.width / W, 0, 0, contourCanvas!.width / W, 0, 0);
      const bedAlpha = reduceMotion ? (dark ? 0.2 : 0.17) : dark ? 0.085 : 0.07;
      for (let s = 0; s < 380; s++) step(false, cctx, bedAlpha);
      // live drops on top, pre-warmed so they are already flowing
      initParticles();
      if (!reduceMotion) for (let s = 0; s < 140; s++) step(true);
    }

    setup();
    start();

    // resize (debounced)
    let resizeTimer = 0;
    const ro = new ResizeObserver(() => {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(() => {
        const rect = host.getBoundingClientRect();
        if (Math.abs(rect.width - W) < 2 && Math.abs(rect.height - H) < 2) return;
        stop();
        setup();
        start();
      }, 150);
    });
    ro.observe(host);

    // theme switch → recolour
    const mo = new MutationObserver(() => {
      stop();
      setup();
      start();
    });
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ["data-atlas-dark"] });

    // pause when off-screen / tab hidden
    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) start();
      else stop();
    });
    io.observe(host);
    const onVisibility = () => (document.hidden ? stop() : start());
    document.addEventListener("visibilitychange", onVisibility);

    // pointer rain
    const target = pointerTarget?.current ?? host;
    const onPointer = (ev: PointerEvent) => {
      const rect = flowCanvas.getBoundingClientRect();
      pointer.x = ev.clientX - rect.left;
      pointer.y = ev.clientY - rect.top;
      pointer.until = performance.now() + (ev.type === "pointerdown" ? 900 : 350);
    };
    target.addEventListener("pointermove", onPointer);
    target.addEventListener("pointerdown", onPointer);

    return () => {
      stop();
      ro.disconnect();
      mo.disconnect();
      io.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
      target.removeEventListener("pointermove", onPointer);
      target.removeEventListener("pointerdown", onPointer);
      window.clearTimeout(resizeTimer);
    };
  }, [pointerTarget]);

  return (
    <div className={`pointer-events-none ${className}`} aria-hidden="true">
      <canvas ref={contourRef} className="absolute inset-0 w-full h-full" />
      <canvas ref={flowRef} className="absolute inset-0 w-full h-full" />
    </div>
  );
}
