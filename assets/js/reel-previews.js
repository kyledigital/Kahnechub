(() => {
  'use strict';
  const panel = document.getElementById('proof-ai-video');
  if (!panel) return;

  const root = document.documentElement;
  const message = panel.querySelector('.reel-preview-message');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const canHover = matchMedia('(any-hover: hover)');
  let active;
  let hoverTimer;

  function stop() {
    clearTimeout(hoverTimer);
    if (!active) return;
    const { card, video, button, title } = active;
    active = null;
    video.pause();
    delete card.dataset.preview;
    button.setAttribute('aria-label', 'Play preview of ' + title);
  }

  async function play(item, explicit) {
    stop();
    if (document.hidden || panel.hidden) return;
    if (!explicit && (reduced.matches || root.dataset.backgroundMotion !== 'running' || navigator.connection?.saveData)) return;

    const { card, video, button, title } = item;
    const attempt = { ...item };
    active = attempt;
    message.textContent = '';
    card.dataset.preview = 'loading';
    button.setAttribute('aria-label', 'Stop preview of ' + title);
    try {
      if (!video.hasAttribute('src') || video.error) video.src = video.dataset.previewSrc;
      video.muted = true;
      video.currentTime = 0;
      await video.play();
      if (active === attempt) card.dataset.preview = 'playing';
    } catch {
      if (active !== attempt) return;
      stop();
      if (explicit) message.textContent = 'The preview for ' + title + ' could not play. Open the full reel on Instagram using its title.';
    }
  }

  const inView = 'IntersectionObserver' in window && new IntersectionObserver(entries => {
    if (entries.some(entry => !entry.isIntersecting && entry.target === active?.card)) stop();
  });
  for (const video of panel.querySelectorAll('video[data-preview-src]')) {
    const card = video.closest('li');
    const button = card.querySelector('.reel-preview-toggle');
    const title = card.querySelector('.reel-title').textContent;
    const item = { card, video, button, title };
    button.hidden = false;
    if (inView) inView.observe(card);

    card.addEventListener('pointerenter', event => {
      if (event.pointerType !== 'mouse' || !canHover.matches || active?.card === card) return;
      clearTimeout(hoverTimer);
      hoverTimer = setTimeout(() => play(item, false), 150);
    });
    card.addEventListener('pointerleave', event => {
      if (event.pointerType !== 'mouse') return;
      clearTimeout(hoverTimer);
      if (active?.card === card) stop();
    });
    button.addEventListener('click', () => {
      if (active?.card === card) stop();
      else play(item, true);
    });
    card.addEventListener('focusout', event => {
      if (active?.card === card && !card.contains(event.relatedTarget)) stop();
    });
    video.addEventListener('ended', () => { if (active?.card === card) stop(); });
    video.addEventListener('error', () => {
      if (card.dataset.preview === 'playing') stop();
    });
  }

  document.addEventListener('keydown', event => { if (event.key === 'Escape') stop(); });
  document.addEventListener('visibilitychange', () => { if (document.hidden) stop(); });
  window.addEventListener('pagehide', stop);
  reduced.addEventListener('change', stop);
  new MutationObserver(() => { if (panel.hidden) stop(); }).observe(panel, { attributes: true, attributeFilter: ['hidden'] });
  new MutationObserver(() => { if (root.dataset.backgroundMotion === 'paused') stop(); }).observe(root, { attributes: true, attributeFilter: ['data-background-motion'] });
})();
