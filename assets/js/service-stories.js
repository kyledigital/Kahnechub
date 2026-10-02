(() => {
  'use strict';
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const states = Array.from(document.querySelectorAll('[data-service-story]')).map(figure => ({figure,replay:figure.querySelector('[data-story-replay]'),status:figure.querySelector('[data-story-status]'),visible:false,hasPlayed:false}));
  const stateLabel = (figure,value) => { if (figure.dataset.motionState !== value) figure.dataset.motionState = value; };
  const otherFocal = () => {
    const ideas = document.querySelector('[data-ideas-illustration]'),reach = document.querySelector('[data-reach-illustration]');
    return (ideas && ideas.dataset.motionState === 'playing') || (reach && reach.dataset.motionState === 'playing' && !reach.classList.contains('motion-idle'));
  };
  const play = state => {
    if (!state.visible || reduced.matches || document.hidden || document.body.classList.contains('motion-paused') || otherFocal()) return;
    state.hasPlayed = true;
    state.figure.classList.remove('is-playing');
    void state.figure.offsetWidth;
    state.figure.classList.add('is-playing');
    stateLabel(state.figure,'playing');
  };
  const update = () => {
    const still = reduced.matches || document.hidden || document.body.classList.contains('motion-paused');
    const other = otherFocal();
    states.forEach(state => {
      state.figure.classList.toggle('story-idle',!state.visible);
      state.figure.classList.toggle('story-suspended',still || !!other);
      state.replay.disabled = still || !!other;
      state.status.textContent = reduced.matches ? 'Still illustration shown' : document.body.classList.contains('motion-paused') ? 'Motion paused' : other && state.visible ? 'Another illustration is playing' : '';
      if (reduced.matches) { state.figure.classList.remove('is-playing'); stateLabel(state.figure,'still'); }
      else if (state.visible && !state.hasPlayed && !still && !other) play(state);
    });
  };
  states.forEach(state => {
    state.replay.hidden = false;
    state.replay.addEventListener('click',() => {
      if (state.replay.disabled) return;
      state.figure.scrollIntoView({block:'nearest'});
      state.visible = true;
      state.figure.classList.remove('story-idle');
      play(state);
    });
    state.figure.addEventListener('animationend',event => {
      if (event.animationName !== 'story-resolve') return;
      state.figure.classList.remove('is-playing');
      stateLabel(state.figure,'complete');
    });
  });
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => { const state=states.find(item=>item.figure===entry.target); state.visible=entry.isIntersecting; });
      update();
    },{threshold:.45});
    states.forEach(state => observer.observe(state.figure));
  }
  const observer = new MutationObserver(update);
  observer.observe(document.body,{attributes:true,attributeFilter:['class']});
  document.querySelectorAll('[data-ideas-illustration],[data-reach-illustration]').forEach(figure => observer.observe(figure,{attributes:true,attributeFilter:['data-motion-state','class']}));
  reduced.addEventListener('change',update);
  document.addEventListener('visibilitychange',update);
  update();
})();
