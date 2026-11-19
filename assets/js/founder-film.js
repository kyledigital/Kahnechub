(() => {
  const trigger = document.querySelector('.founder-film-link');
  const dialog = document.getElementById('founder-film-player');
  if (!trigger || !dialog) return;

  const preview = trigger.querySelector('.founder-film-loop');
  const motionRoot = document.documentElement;
  const connection = navigator.connection;
  let inView = false;

  function syncPreview() {
    if (!preview) return;
    const shouldPlay = inView && !dialog.open && !document.hidden && !connection?.saveData
      && motionRoot.dataset.backgroundMotion === 'running';
    if (!shouldPlay) {
      preview.pause();
      return;
    }
    if (!preview.hasAttribute('src')) preview.src = preview.dataset.src;
    if (preview.paused) preview.play().catch(() => { /* The project poster stays visible. */ });
  }

  if (preview && 'IntersectionObserver' in window) {
    preview.addEventListener('playing', () => preview.setAttribute('data-playing', ''));
    for (const name of ['pause', 'error', 'ended']) {
      preview.addEventListener(name, () => preview.removeAttribute('data-playing'));
    }
    new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting;
      syncPreview();
    }).observe(trigger);
    new MutationObserver(syncPreview).observe(motionRoot, { attributes: true, attributeFilter: ['data-background-motion'] });
    document.addEventListener('visibilitychange', syncPreview);
    connection?.addEventListener('change', syncPreview);
  }

  if (typeof dialog.showModal !== 'function') return;

  const player = dialog.querySelector('video');
  const error = dialog.querySelector('.founder-film-error');
  trigger.setAttribute('aria-haspopup', 'dialog');
  trigger.setAttribute('aria-controls', dialog.id);

  trigger.addEventListener('click', event => {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    error.hidden = true;
    dialog.showModal();
    syncPreview();
    player.poster = 'assets/video-review/signal-800.webp';
    player.src = trigger.href;
    player.play().catch(() => { /* Native controls also support manual playback. */ });
  });

  player.addEventListener('error', () => {
    if (dialog.open && player.hasAttribute('src')) error.hidden = false;
  });

  dialog.addEventListener('close', () => {
    if (dialog.open) return;
    player.pause();
    player.removeAttribute('src');
    player.load();
    trigger.focus({ preventScroll: true });
    syncPreview();
  });
})();
