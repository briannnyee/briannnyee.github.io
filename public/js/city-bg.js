/* city-bg.js — Procedural cyberpunk city background (Canvas2D, no deps)
   Renders a randomized night city skyline with neon-lit windows and rain. */
(function () {
  'use strict';

  const canvas = document.getElementById('city-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ── Config ────────────────────────────────────────────────────────────────
  const CFG = {
    buildingCount:  { min: 28, max: 40 },
    buildingWidth:  { min: 38, max: 95 },
    buildingGap:    { min: 4,  max: 14 },
    buildingHeight: { min: 0.14, max: 0.56 }, // fraction of canvas height
    windowW: 4, windowH: 3,
    windowGapX: 7, windowGapY: 6,
    windowLitChance: 0.44,
    windowFlickerChance: 0.07,
    windowColors: [
      'rgba(0,245,255,0.7)',    // cyan
      'rgba(252,238,9,0.6)',    // yellow
      'rgba(255,0,110,0.5)',    // magenta
      'rgba(220,240,255,0.35)', // white-blue
    ],
    rainCount: 280,
    rainColor: 'rgba(160,210,255,0.10)',
    rainSpeed: { min: 5, max: 10 },
    rainLength: { min: 9, max: 20 },
    rainAngle: 0.14, // radians
    lightningChance: 0.003, // per frame
  };

  // ── State ─────────────────────────────────────────────────────────────────
  let buildings = [];
  let rainDrops = [];
  let lightningAlpha = 0;
  let rafId = null;
  let hidden = false;

  // ── Helpers ───────────────────────────────────────────────────────────────
  function rand(min, max) { return min + Math.random() * (max - min); }
  function randInt(min, max) { return Math.floor(rand(min, max + 1)); }
  function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

  // ── Building generation ───────────────────────────────────────────────────
  function generateBuildings() {
    buildings = [];
    const W = canvas.width;
    const H = canvas.height;
    let x = 0;
    const count = randInt(CFG.buildingCount.min, CFG.buildingCount.max);

    for (let i = 0; i < count; i++) {
      const w = rand(CFG.buildingWidth.min, CFG.buildingWidth.max);
      const h = rand(CFG.buildingHeight.min, CFG.buildingHeight.max) * H;
      const y = H - h;

      // Windows
      const windows = [];
      const cols = Math.floor((w - 6) / (CFG.windowW + CFG.windowGapX));
      const rows = Math.floor((h - 8) / (CFG.windowH + CFG.windowGapY));
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const lit = Math.random() < CFG.windowLitChance;
          windows.push({
            x: x + 4 + c * (CFG.windowW + CFG.windowGapX),
            y: y + 6 + r * (CFG.windowH + CFG.windowGapY),
            lit,
            flicker: lit && Math.random() < CFG.windowFlickerChance,
            color: pick(CFG.windowColors),
            flickerTimer: 0,
            flickerInterval: rand(600, 2800),
          });
        }
      }

      // Neon sign (30% chance, on rooftop)
      const hasSign = Math.random() < 0.28;
      const signColor = pick(['rgba(0,245,255,0.9)', 'rgba(252,238,9,0.9)', 'rgba(255,0,110,0.9)']);
      const signW = rand(w * 0.3, w * 0.7);

      buildings.push({
        x, y, w, h,
        fill: Math.random() < 0.5 ? '#07070f' : '#090912',
        windows,
        hasSign,
        signX: x + (w - signW) / 2,
        signY: y - 2,
        signW,
        signColor,
      });

      x += w + rand(CFG.buildingGap.min, CFG.buildingGap.max);
      if (x > W + 100) break;
    }

    // Tile buildings to fill width if needed
    if (x < W) {
      // Add a few more until we cover the canvas
      while (x < W + 100) {
        const src = buildings[Math.floor(Math.random() * buildings.length)];
        if (!src) break;
        const b = { ...src, x, windows: src.windows.map(w => ({ ...w, x: w.x - src.x + x })) };
        buildings.push(b);
        x += src.w + rand(CFG.buildingGap.min, CFG.buildingGap.max);
      }
    }
  }

  // ── Rain init ─────────────────────────────────────────────────────────────
  function initRain() {
    rainDrops = [];
    for (let i = 0; i < CFG.rainCount; i++) {
      rainDrops.push({
        x: rand(0, canvas.width),
        y: rand(-canvas.height, canvas.height),
        speed: rand(CFG.rainSpeed.min, CFG.rainSpeed.max),
        length: rand(CFG.rainLength.min, CFG.rainLength.max),
      });
    }
  }

  // ── Resize ────────────────────────────────────────────────────────────────
  function resize() {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
    generateBuildings();
    initRain();
  }

  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(resize, 200);
  });

  // ── Draw ──────────────────────────────────────────────────────────────────
  function draw(ts) {
    if (hidden) { rafId = requestAnimationFrame(draw); return; }

    const W = canvas.width;
    const H = canvas.height;

    ctx.clearRect(0, 0, W, H);

    // Lightning flash overlay
    if (lightningAlpha > 0) {
      ctx.save();
      ctx.fillStyle = `rgba(200,230,255,${lightningAlpha})`;
      ctx.fillRect(0, 0, W, H);
      ctx.restore();
      lightningAlpha = Math.max(0, lightningAlpha - 0.06);
    }

    // Buildings
    for (const b of buildings) {
      // Base
      ctx.fillStyle = b.fill;
      ctx.fillRect(b.x, b.y, b.w, b.h);

      // Neon sign on roof
      if (b.hasSign) {
        ctx.save();
        ctx.strokeStyle = b.signColor;
        ctx.lineWidth = 2;
        ctx.shadowColor = b.signColor;
        ctx.shadowBlur = 6;
        ctx.beginPath();
        ctx.moveTo(b.signX, b.signY);
        ctx.lineTo(b.signX + b.signW, b.signY);
        ctx.stroke();
        ctx.restore();
      }

      // Windows
      for (const w of b.windows) {
        // Flicker logic
        if (w.flicker && !prefersReducedMotion) {
          w.flickerTimer += 16;
          if (w.flickerTimer > w.flickerInterval) {
            w.lit = !w.lit;
            w.flickerTimer = 0;
            w.flickerInterval = rand(400, 2600);
          }
        }

        if (w.lit) {
          ctx.fillStyle = w.color;
          ctx.fillRect(w.x, w.y, CFG.windowW, CFG.windowH);
        } else {
          ctx.fillStyle = 'rgba(20,20,30,0.8)';
          ctx.fillRect(w.x, w.y, CFG.windowW, CFG.windowH);
        }
      }
    }

    // Bottom fade — makes city blend into page background
    const grad = ctx.createLinearGradient(0, H * 0.75, 0, H);
    grad.addColorStop(0, 'rgba(5,5,5,0)');
    grad.addColorStop(1, 'rgba(5,5,5,1)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, H * 0.75, W, H * 0.25);

    // Top fade — sky blends out gradually
    const topGrad = ctx.createLinearGradient(0, 0, 0, H * 0.5);
    topGrad.addColorStop(0, 'rgba(5,5,5,0.95)');
    topGrad.addColorStop(1, 'rgba(5,5,5,0)');
    ctx.fillStyle = topGrad;
    ctx.fillRect(0, 0, W, H * 0.5);

    if (!prefersReducedMotion) {
      // Rain
      ctx.save();
      ctx.strokeStyle = CFG.rainColor;
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (const drop of rainDrops) {
        const dx = Math.sin(CFG.rainAngle) * drop.length;
        const dy = Math.cos(CFG.rainAngle) * drop.length;
        ctx.moveTo(drop.x, drop.y);
        ctx.lineTo(drop.x + dx, drop.y + dy);

        drop.x += Math.sin(CFG.rainAngle) * drop.speed;
        drop.y += Math.cos(CFG.rainAngle) * drop.speed;

        if (drop.y > H + 20) {
          drop.y = rand(-40, 0);
          drop.x = rand(0, W);
        }
        if (drop.x > W + 20) {
          drop.x = rand(-20, W * 0.2);
        }
      }
      ctx.stroke();
      ctx.restore();

      // Lightning
      if (Math.random() < CFG.lightningChance) {
        lightningAlpha = rand(0.04, 0.12);
      }
    }

    rafId = requestAnimationFrame(draw);
  }

  // ── Visibility ────────────────────────────────────────────────────────────
  document.addEventListener('visibilitychange', () => {
    hidden = document.hidden;
  });

  // ── Boot ──────────────────────────────────────────────────────────────────
  resize();
  rafId = requestAnimationFrame(draw);
})();
