(() => {
  'use strict';
  // Scroll reveals. The inline script in <head> adds .motion only when IntersectionObserver exists and the visitor
  // has not asked for reduced motion; it removes the class again if this file never runs, so content cannot stay hidden.
  const root = document.documentElement;
  window.kahnecMotion = true;
  if (!root.classList.contains('motion') || !('IntersectionObserver' in window)) return;

  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const observer = new IntersectionObserver(entries => {
    let order = 0;
    entries
      .slice()
      .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top || a.boundingClientRect.left - b.boundingClientRect.left)
      .forEach(entry => {
        const target = entry.target;
        // Content already scrolled past is shown at once, with no animation to sit through on the way back up.
        const passed = !entry.isIntersecting && entry.boundingClientRect.bottom <= 0;
        if (!entry.isIntersecting && !passed) return;
        if (entry.isIntersecting) target.style.setProperty('--reveal-delay', Math.min(order++, 3) * 80 + 'ms');
        target.classList.add('is-in');
        observer.unobserve(target);
      });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });

  document.querySelectorAll('[data-reveal]').forEach(element => observer.observe(element));

  reduceMotion.addEventListener('change', event => {
    if (!event.matches) return;
    observer.disconnect();
    root.classList.remove('motion');
  });
})();
