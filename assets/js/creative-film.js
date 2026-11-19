(() => {
  const screen = document.querySelector('.creative-film-screen');
  if (!screen) return;

  const film = screen.querySelector('video');
  const play = screen.querySelector('.creative-film-play');
  film.controls = false;
  play.hidden = false;

  play.addEventListener('click', () => {
    play.hidden = true;
    film.controls = true;
    film.focus({ preventScroll: true });
    film.play().catch(() => { /* Native controls allow another playback attempt. */ });
  });

  film.addEventListener('ended', () => {
    const hadFocus = document.activeElement === film;
    film.controls = false;
    play.hidden = false;
    if (hadFocus) play.focus({ preventScroll: true });
  });
})();
