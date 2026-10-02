(() => {
  'use strict';
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  const sections = Array.from(document.querySelectorAll('[data-ambient-section]'));
  const activeFeedback = new Set();
  const canMove = () => !reduced.matches && !document.hidden && !document.body.classList.contains('motion-paused') && !document.body.classList.contains('ambient-focal');
  const updateActivity = () => {
    const ideas = document.querySelector('[data-ideas-illustration]');
    const reach = document.querySelector('[data-reach-illustration]');
    const focal = (ideas && ideas.dataset.motionState === 'playing') || (reach && reach.dataset.motionState === 'playing' && !reach.classList.contains('motion-idle'));
    if (document.body.classList.contains('ambient-focal') !== !!focal) document.body.classList.toggle('ambient-focal',!!focal);
    document.body.classList.toggle('ambient-hidden',document.hidden);
    activeFeedback.forEach(animation => {
      if (reduced.matches) { animation.cancel(); activeFeedback.delete(animation); }
      else if (canMove()) animation.play();
      else animation.pause();
    });
  };
  document.body.classList.add('ambient-ready');
  sections.forEach(section => {
    const heading = section.querySelector('.section-heading,.learning-copy,.about-grid>div:last-child,.contact-copy');
    if (heading) heading.dataset.ambientReveal = '';
  });
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      const section = entry.target;
      section.classList.toggle('ambient-in-view',entry.isIntersecting);
      if (entry.isIntersecting && !section.classList.contains('ambient-entered')) {
        section.classList.add('ambient-entered');
        const heading = section.querySelector('[data-ambient-reveal]');
        if (heading && canMove()) heading.classList.add('ambient-arriving');
      }
    }),{threshold:.12});
    sections.forEach(section => observer.observe(section));
  }
  const observer = new MutationObserver(updateActivity);
  observer.observe(document.body,{attributes:true,attributeFilter:['class']});
  document.querySelectorAll('[data-ideas-illustration],[data-reach-illustration]').forEach(figure => observer.observe(figure,{attributes:true,attributeFilter:['data-motion-state','class']}));
  document.addEventListener('visibilitychange',updateActivity);
  reduced.addEventListener('change',updateActivity);
  const preview = document.getElementById('project-image');
  if (preview && preview.animate) {
    new MutationObserver(() => {
      if (!canMove()) return;
      activeFeedback.forEach(animation => animation.cancel());
      activeFeedback.clear();
      const animation = preview.animate([{transform:'translateY(3px)',opacity:.92},{transform:'translateY(0)',opacity:1}],{duration:220,easing:'ease-out'});
      activeFeedback.add(animation);
      animation.finished.then(() => activeFeedback.delete(animation),() => activeFeedback.delete(animation));
    }).observe(preview,{attributes:true,attributeFilter:['src']});
  }
  updateActivity();
})();
