(() => {
  'use strict';
  // Studio field: a quiet dotted landscape at the foot of the dark studio section.
  // Its logic comes from the Kahnec mark: points, with a few joined by lines. Decorative only.
  const holder = document.querySelector('.studio-field');
  const canvas = holder && holder.querySelector('canvas');
  const toggles = document.querySelectorAll('[data-background-toggle]');
  if (!canvas && !toggles.length) return;
  const context = canvas?.getContext('2d');
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const small = matchMedia('(max-width: 760px)');
  const CYCLE = 20000; // one full undulation, in milliseconds
  const NEAR = 2.2; // the nearest row; the camera looks across the field rather than down at it
  // Joined points, echoing the mark's open "<": [row, position across the row from -1 to 1]
  const LINKS = [
    [[3, -0.6], [7, -0.74], [11, -0.58]],
    [[1, 0.16], [4, 0.05], [7, 0.2]],
    [[8, 0.62], [13, 0.5], [18, 0.66]],
    [[14, -0.16], [19, -0.3], [24, -0.14]],
  ];
  let width = 0, height = 0, ratio = 1, rows = 40, spacing = 0.075;
  let visible = false, paused = false, frame = 0, last = 0, elapsed = 0;
  try { paused = sessionStorage.getItem('kahnecField') === 'paused'; } catch (error) { /* storage is optional */ }

  // Rows step back geometrically, so they sit evenly on screen as they recede.
  const depth = row => NEAR * Math.pow(1.046, row);
  // Every term uses a whole multiple of the phase, so the motion loops without a seam.
  const lift = (x, z, phase) => 0.17 * Math.sin(x * 0.9 + z * 0.8 + phase) + 0.08 * Math.sin(x * 2.1 - z * 1.3 + phase * 2);
  function place(x, z, phase) {
    return [width / 2 + (x / z) * width * 0.5, height * 0.14 + ((1 - lift(x, z, phase)) / z) * height * 0.8 * NEAR];
  }

  function draw(phase) {
    context.clearRect(0, 0, width, height);
    for (let row = rows - 1; row >= 0; row--) {
      const z = depth(row), reach = Math.ceil((z * 1.04) / spacing);
      const size = Math.max(0.9, 5.6 / z) * ratio;
      context.fillStyle = `rgba(203,184,229,${Math.min(0.62, 0.1 + 1.15 / z).toFixed(3)})`;
      for (let column = -reach; column <= reach; column++) {
        const [x, y] = place(column * spacing, z, phase);
        context.fillRect(x - size / 2, y - size / 2, size, size);
      }
    }
    for (const link of LINKS) {
      const points = link.filter(([row]) => row < rows).map(([row, across]) => {
        const z = depth(row);
        return [...place(Math.round((across * z) / spacing) * spacing, z, phase), z];
      });
      if (points.length < 3) continue;
      context.strokeStyle = 'rgba(132,138,232,.6)';
      context.lineWidth = 1.25 * ratio;
      context.beginPath();
      points.forEach(([x, y], index) => (index ? context.lineTo(x, y) : context.moveTo(x, y)));
      context.stroke();
      context.fillStyle = 'rgba(132,138,232,.95)';
      for (const [x, y, z] of points) {
        context.beginPath();
        context.arc(x, y, (1 + 8.5 / z) * ratio, 0, Math.PI * 2);
        context.fill();
      }
    }
  }

  function resize() {
    const box = holder.getBoundingClientRect();
    if (!box.width || !box.height) return;
    // Fewer rows and a lower pixel ratio on small screens keep the cost down.
    ratio = Math.min(window.devicePixelRatio || 1, small.matches ? 1.25 : 1.5);
    rows = small.matches ? 30 : 40;
    spacing = small.matches ? 0.13 : 0.075;
    width = canvas.width = Math.round(box.width * ratio);
    height = canvas.height = Math.round(box.height * ratio);
    if (visible) draw((elapsed / CYCLE) * Math.PI * 2); // nothing is drawn until the field is on screen
  }

  const shouldRun = () => visible && !paused && !document.hidden && !reduceMotion.matches;
  function tick(now) {
    frame = 0;
    if (!shouldRun()) return;
    const step = now - last;
    if (step >= 33) { // about 30 frames a second is plenty for a slow drift
      elapsed = (elapsed + Math.min(step, 100)) % CYCLE;
      last = now;
      draw((elapsed / CYCLE) * Math.PI * 2);
    }
    frame = requestAnimationFrame(tick);
  }
  function sync() {
    const run = shouldRun();
    if (holder) holder.dataset.state = run ? 'running' : 'still';
    if (run && !frame) { last = performance.now(); frame = requestAnimationFrame(tick); }
    if (!run && frame) { cancelAnimationFrame(frame); frame = 0; }
    const still = paused || reduceMotion.matches || document.hidden;
    document.documentElement.dataset.backgroundMotion = still ? 'paused' : 'running';
    const label = paused ? 'Resume ambient motion' : 'Pause ambient motion';
    for (const toggle of toggles) {
      toggle.hidden = reduceMotion.matches;
      toggle.textContent = label;
      toggle.title = label;
    }
  }

  for (const toggle of toggles) toggle.addEventListener('click', () => {
    paused = !paused;
    try { sessionStorage.setItem('kahnecField', paused ? 'paused' : 'running'); } catch (error) { /* storage is optional */ }
    sync();
  });
  document.addEventListener('visibilitychange', sync);
  reduceMotion.addEventListener('change', sync);
  if (context) {
    if ('ResizeObserver' in window) new ResizeObserver(resize).observe(holder); else addEventListener('resize', resize);
    if ('IntersectionObserver' in window) new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; if (visible) resize(); sync(); }).observe(holder); else visible = true;
    resize();
  }
  sync();
})();
