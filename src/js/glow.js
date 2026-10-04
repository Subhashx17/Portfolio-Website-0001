/*
 * Cursor slash: a single smooth, tapered white streak with a soft glow.
 * It follows the direction you move, is thin at both ends, thickest near the
 * head, and fades away when you stop.  No colours, no swirls, no dependencies.
 */
(() => {
  if (!matchMedia('(hover: hover) and (pointer: fine)').matches) return;
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  /* ---------------- tweak here ---------------- */
  const CFG = {
    color: '255,255,255',  // white only
    life: 620,             // ms the tail takes to vanish (longer = longer slash)
    maxWidth: 64,          // thickest part of the slash (px)
    follow: 0.38,          // 0-1, how tightly it tracks the cursor (lower = smoother/lazier)
    glow: 64,              // softness of the halo (px blur)
    coreAlpha: 0.6,        // brightness of the slash body
    haloAlpha: 0.45,       // brightness of the soft halo
    speedFull: 38,         // px/frame at which the slash reaches full width
    peak: 0.72,            // where along the slash it is thickest (0 = tail, 1 = head)
  };

  const canvas = document.createElement('canvas');
  canvas.className = 'glow-canvas';
  document.body.appendChild(canvas);
  const ctx = canvas.getContext('2d');

  let W = 0, H = 0, dpr = 1;
  const resize = () => {
    dpr = Math.min(devicePixelRatio || 1, 2);
    W = innerWidth; H = innerHeight;
    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };
  resize();
  addEventListener('resize', resize);

  const target = { x: 0, y: 0, has: false };
  const smooth = { x: 0, y: 0 };
  let pts = [];              // {x, y, t, s}  s = speed factor 0..1
  let running = false, speedAvg = 0;

  addEventListener('pointermove', e => {
    if (e.pointerType === 'touch') return;
    target.x = e.clientX; target.y = e.clientY;
    if (!target.has) { smooth.x = target.x; smooth.y = target.y; target.has = true; }
    if (!running) { running = true; requestAnimationFrame(frame); }
  }, { passive: true });

  document.documentElement.addEventListener('mouseleave', () => { target.has = false; });

  /* build one tapered, smooth ribbon from the point history */
  const ribbon = (list, widthScale) => {
    const n = list.length;
    if (n < 3) return null;
    const L = [], R = [];
    for (let i = 0; i < n; i++) {
      const a = list[Math.max(i - 1, 0)], b = list[Math.min(i + 1, n - 1)];
      let nx = -(b.y - a.y), ny = b.x - a.x;
      const len = Math.hypot(nx, ny) || 1; nx /= len; ny /= len;

      const u = i / (n - 1);                                   // 0 tail -> 1 head
      const shape = u < CFG.peak
        ? Math.sin((u / CFG.peak) * Math.PI / 2)               // ease up from the tail
        : Math.cos(((u - CFG.peak) / (1 - CFG.peak)) * Math.PI / 2); // taper to a point at the head
      const age = Math.max(0, 1 - (performance.now() - list[i].t) / CFG.life);
      const w = CFG.maxWidth * widthScale * Math.pow(shape, 1.1) * age * list[i].s * 0.5;

      L.push([list[i].x + nx * w, list[i].y + ny * w]);
      R.push([list[i].x - nx * w, list[i].y - ny * w]);
    }
    return { L, R };
  };

  const trace = (edge, move) => {
    if (move) ctx.moveTo(edge[0][0], edge[0][1]);
    for (let i = 1; i < edge.length - 1; i++) {
      const mx = (edge[i][0] + edge[i + 1][0]) / 2, my = (edge[i][1] + edge[i + 1][1]) / 2;
      ctx.quadraticCurveTo(edge[i][0], edge[i][1], mx, my);
    }
    ctx.lineTo(edge[edge.length - 1][0], edge[edge.length - 1][1]);
  };

  const fillRibbon = (r, alpha, blur) => {
    if (!r) return;
    ctx.save();
    ctx.beginPath();
    trace(r.L, true);
    const R = r.R.slice().reverse();
    ctx.lineTo(R[0][0], R[0][1]);
    trace(R, false);
    ctx.closePath();
    ctx.shadowColor = `rgba(${CFG.color},1)`;
    ctx.shadowBlur = blur * dpr;
    ctx.fillStyle = `rgba(${CFG.color},${alpha})`;
    ctx.fill();
    ctx.restore();
  };

  function frame(now) {
    ctx.clearRect(0, 0, W, H);

    if (target.has) {
      const px = smooth.x, py = smooth.y;
      smooth.x += (target.x - smooth.x) * CFG.follow;
      smooth.y += (target.y - smooth.y) * CFG.follow;
      const sp = Math.hypot(smooth.x - px, smooth.y - py);
      speedAvg += (sp - speedAvg) * 0.25;
      if (sp > 0.4) pts.push({ x: smooth.x, y: smooth.y, t: now, s: Math.min(1, speedAvg / CFG.speedFull) });
    }

    while (pts.length && now - pts[0].t > CFG.life) pts.shift();
    if (pts.length > 80) pts.splice(0, pts.length - 80);

    if (pts.length > 2) {
      fillRibbon(ribbon(pts, 2.4), CFG.haloAlpha, CFG.glow);   // wide soft halo
      fillRibbon(ribbon(pts, 1.0), CFG.coreAlpha, CFG.glow * 0.7); // clean slash body
    }

    if (pts.length > 0 || (target.has && Math.hypot(target.x - smooth.x, target.y - smooth.y) > 0.5)) {
      requestAnimationFrame(frame);
    } else {
      running = false;
      speedAvg = 0;
    }
  }
})();
