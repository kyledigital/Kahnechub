(() => {
  'use strict';
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const active = new Set();
  let frame = 0, previous = 0;
  const suppressed = () => reduced.matches || document.hidden || document.body.classList.contains('motion-paused');
  const finish = () => {
    cancelAnimationFrame(frame); frame = 0; previous = 0;
    active.forEach(spring => { spring.position = [...spring.target]; spring.velocity.fill(0); spring.render(spring.position); });
    active.clear();
  };
  const tick = time => {
    frame = 0;
    if (suppressed()) { finish(); return; }
    const dt = previous ? Math.min((time - previous) / 1000, .05) : 1 / 60;
    previous = time;
    active.forEach(spring => {
      const omega = 2 * Math.PI / spring.response, decay = Math.exp(-omega * dt);
      let settled = true;
      spring.position.forEach((position, axis) => {
        // Exact critically damped step; re-targeting preserves presentation and velocity.
        const delta = position - spring.target[axis];
        const combined = spring.velocity[axis] + omega * delta;
        spring.position[axis] = spring.target[axis] + (delta + combined * dt) * decay;
        spring.velocity[axis] = (spring.velocity[axis] - omega * combined * dt) * decay;
        if (Math.abs(spring.position[axis] - spring.target[axis]) > spring.tolerance || Math.abs(spring.velocity[axis]) > spring.tolerance) settled = false;
      });
      if (settled) { spring.position = [...spring.target]; spring.velocity.fill(0); active.delete(spring); }
      spring.render(spring.position);
    });
    if (active.size) frame = requestAnimationFrame(tick);
    else previous = 0;
  };
  const createSpring = (position, render, response = .32, tolerance = .025) => {
    const spring = {position:[...position],target:[...position],velocity:position.map(() => 0),render,response,tolerance};
    spring.set = (target, immediate = false) => {
      spring.target = [...target];
      if (immediate || suppressed()) {
        active.delete(spring); spring.position = [...target]; spring.velocity.fill(0); render(spring.position);
      } else {
        active.add(spring);
        if (!frame) { previous = 0; frame = requestAnimationFrame(tick); }
      }
    };
    return spring;
  };
  const selection = (container, selector, attributes) => {
    if (!container) return;
    const indicator = document.createElement('span');
    indicator.className = 'apple-selection-indicator'; indicator.setAttribute('aria-hidden','true');
    container.append(indicator);
    const spring = createSpring([0,0], ([x,y]) => { indicator.style.transform = `translate3d(${x}px,${y}px,0)`; });
    const update = immediate => {
      const selected = container.querySelector(selector);
      if (!selected) return;
      // Layout offsets exclude the control's press transform.
      indicator.style.width = selected.offsetWidth + 'px';
      indicator.style.height = selected.offsetHeight + 'px';
      spring.set([selected.offsetLeft,selected.offsetTop],immediate);
    };
    new MutationObserver(() => update(false)).observe(container,{subtree:true,attributes:true,attributeFilter:attributes});
    if ('ResizeObserver' in window) new ResizeObserver(() => update(true)).observe(container);
    reduced.addEventListener('change',() => update(true));
    update(true);
  };
  document.body.classList.add('apple-motion-ready');
  selection(document.querySelector('.service-choices'),'[aria-selected=true]',['aria-selected']);
  selection(document.querySelector('.project-choices'),'[aria-pressed=true]',['aria-pressed']);
  selection(document.querySelector('.device-choices'),'[aria-pressed=true]',['aria-pressed']);
  const controls = '.button,.btn,.nav-toggle,.project-choice,.device-choices button,.service-choices button,.story-replay,.reach-replay,.ideas-replay,.finder-close,.finder-secondary,.quick-whatsapp';
  const presses = new WeakMap();
  let pressed;
  const release = () => { if (pressed) presses.get(pressed).set([1]); pressed = null; };
  const press = target => {
    const control = target.closest && target.closest(controls);
    if (!control || control.disabled || control.getAttribute('aria-disabled') === 'true') return;
    release();
    if (!presses.has(control)) presses.set(control,createSpring([1],([scale]) => control.style.setProperty('--apple-press-scale',String(scale)),.22,.0005));
    pressed = control; presses.get(control).set([.975]);
  };
  document.addEventListener('pointerdown',event => { if (event.isPrimary && event.button === 0) press(event.target); },{passive:true});
  window.addEventListener('pointerup',release,{passive:true});
  window.addEventListener('pointercancel',release,{passive:true});
  window.addEventListener('blur',release);
  document.addEventListener('keydown',event => { if (!event.repeat && ['Enter',' '].includes(event.key)) press(event.target); });
  document.addEventListener('keyup',event => { if (['Enter',' '].includes(event.key)) release(); });
  reduced.addEventListener('change',finish);
  document.addEventListener('visibilitychange',() => { if (document.hidden) { release(); finish(); } });
  new MutationObserver(() => { if (suppressed()) finish(); }).observe(document.body,{attributes:true,attributeFilter:['class']});
})();
