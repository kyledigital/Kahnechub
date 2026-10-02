(() => {
  'use strict';
  const motionButton = document.getElementById('motionToggle');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  let motionPaused = reducedMotion.matches;
  let updateReachMotion = () => {};
  const setMotionState = () => {
    document.body.classList.toggle('motion-paused',motionPaused);
    if (motionButton) {
      motionButton.setAttribute('aria-pressed',String(motionPaused));
      motionButton.querySelector('.motion-toggle-label').textContent = motionPaused ? 'Resume page motion' : 'Pause page motion';
      motionButton.hidden = reducedMotion.matches;
    }
    updateReachMotion();
  };
  setMotionState();
  if (motionButton) motionButton.addEventListener('click',() => {motionPaused=!motionPaused;setMotionState()});
  reducedMotion.addEventListener('change',() => {motionPaused=reducedMotion.matches;setMotionState()});
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      entry.target.classList.toggle('motion-idle',!entry.isIntersecting);
    }), {rootMargin:'120px'});
    document.querySelectorAll('.hero,.work-section,.learning-section,.contact-section').forEach(section => observer.observe(section));
  }
  const projects = {
    vwplus: {name:'VWPlus',title:'Find the right workshop conversation.',description:'Service exploration and a guided enquiry help drivers explain their car and what needs attention.',url:'https://vwplus-website.vercel.app/',domain:'vwplus-website.vercel.app'},
    decorators: {name:'New Best Decorators',title:'Picture the possibilities. Start an estimate.',description:'A visual service guide brings drapes, blinds and furnishings together, with a clear route to an estimate.',url:'https://newbestdecorators.kahnec.com/',domain:'newbestdecorators.kahnec.com'},
    asher: {name:'Asher’s Fleet',title:'Find a car. Start the rental conversation.',description:'A vehicle showcase and date-based enquiry help visitors explain their plans and check availability with the team.',url:'https://ashers-fleet.vercel.app/',domain:'ashers-fleet.vercel.app'}
  };
  const explorer = document.querySelector('[data-project-explorer]');
  if (explorer) {
    let selected = 'vwplus';
    let device = 'desktop';
    const image = document.getElementById('project-image');
    const render = () => {
      const project = projects[selected];
      explorer.querySelectorAll('[data-project]').forEach(button => button.setAttribute('aria-pressed',String(button.dataset.project === selected)));
      explorer.querySelectorAll('[data-device]').forEach(button => button.setAttribute('aria-pressed',String(button.dataset.device === device)));
      document.getElementById('project-title').textContent = project.title;
      document.getElementById('project-description').textContent = project.description;
      document.getElementById('project-domain').textContent = project.domain;
      const link = document.getElementById('project-link');
      link.href = project.url;
      link.textContent = 'Visit ' + project.name;
      link.setAttribute('aria-label','Visit ' + project.name + ' (opens in a new tab)');
      image.src = 'assets/images/projects/' + selected + '-' + device + '.webp';
      if (device === 'desktop') {
        image.srcset = 'assets/images/projects/' + selected + '-desktop-720.webp 720w, assets/images/projects/' + selected + '-desktop.webp 1440w';
        image.sizes = '(max-width:650px) calc(100vw - 40px), 65vw';
      } else {
        image.removeAttribute('srcset');
        image.removeAttribute('sizes');
      }
      image.alt = (device === 'desktop' ? 'Desktop' : 'Mobile') + ' preview of the ' + project.name + ' website';
      image.width = device === 'desktop' ? 1440 : 390;
      image.height = device === 'desktop' ? 1000 : 760;
      document.getElementById('project-stage').classList.toggle('is-mobile',device === 'mobile');
    };
    explorer.querySelectorAll('[data-project]').forEach(button => button.addEventListener('click',() => {selected=button.dataset.project;render()}));
    explorer.querySelectorAll('[data-device]').forEach(button => button.addEventListener('click',() => {device=button.dataset.device;render()}));
  }
  const services = document.querySelector('[data-service-explorer]');
  if (services) {
    const tabs = Array.from(services.querySelectorAll('[role=tab]'));
    const tablist = services.querySelector('[role=tablist]');
    const mobileTabs = window.matchMedia('(max-width:650px)');
    const setOrientation = () => tablist.setAttribute('aria-orientation',mobileTabs.matches ? 'horizontal' : 'vertical');
    setOrientation();
    mobileTabs.addEventListener('change',setOrientation);
    const show = selected => {
      services.dataset.activeService = selected;
      tabs.forEach(button => {
        const active = button.dataset.servicePanel === selected;
        button.setAttribute('aria-selected',String(active));
        button.tabIndex = active ? 0 : -1;
      });
      services.querySelectorAll('[data-panel]').forEach(panel => {panel.hidden=panel.dataset.panel!==selected});
    };
    services.classList.add('is-ready');
    show('websites');
    tabs.forEach((button,index) => {
      button.addEventListener('click',() => show(button.dataset.servicePanel));
      button.addEventListener('keydown',event => {
        let next;
        if (event.key === 'ArrowRight' || event.key === 'ArrowDown') next = (index+1)%tabs.length;
        if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') next = (index+tabs.length-1)%tabs.length;
        if (event.key === 'Home') next = 0;
        if (event.key === 'End') next = tabs.length-1;
        if (next === undefined) return;
        event.preventDefault();
        show(tabs[next].dataset.servicePanel);
        tabs[next].focus();
      });
    });
    services.querySelectorAll('[data-select-service]').forEach(link => link.addEventListener('click',event => {
      event.preventDefault();
      const selected = link.dataset.selectService;
      show(selected);
      if (location.hash !== link.hash) history.pushState(null,'',link.hash);
      services.closest('section').scrollIntoView({block:'start'});
      const tab = tabs.find(button => button.dataset.servicePanel === selected);
      if (tab) tab.focus({preventScroll:true});
    }));
    const applyServiceHash = () => {
      const panel = {'#ai-training':'ai','#foundations':'marketing','#support':'marketing','#meta-ads':'marketing','#audit':'marketing'}[location.hash];
      if (panel) show(panel);
    };
    applyServiceHash();
    window.addEventListener('hashchange',applyServiceHash);
  }
  const reachFigure = document.querySelector('[data-reach-illustration]');
  if (reachFigure) {
    const replay = reachFigure.querySelector('[data-reach-replay]');
    const status = reachFigure.querySelector('[data-reach-status]');
    let hasPlayed = false;
    let visible = false;
    const play = () => {
      if (motionPaused || reducedMotion.matches || !visible) return;
      reachFigure.classList.remove('is-playing');
      void reachFigure.offsetWidth;
      reachFigure.classList.add('is-playing');
      reachFigure.dataset.motionState = 'playing';
      hasPlayed = true;
    };
    updateReachMotion = () => {
      const still = motionPaused || reducedMotion.matches;
      replay.disabled = still;
      status.textContent = reducedMotion.matches ? 'Still illustration shown' : motionPaused ? 'Motion paused' : '';
      if (reducedMotion.matches) {
        reachFigure.classList.remove('is-playing');
        reachFigure.dataset.motionState = 'still';
      } else if (visible && !hasPlayed && !still) play();
    };
    replay.addEventListener('click',() => {
      reachFigure.scrollIntoView({block:'nearest'});
      visible = true;
      reachFigure.classList.remove('motion-idle');
      play();
    });
    reachFigure.addEventListener('animationend',event => {
      if (event.animationName !== 'reach-arrive') return;
      reachFigure.classList.remove('is-playing');
      reachFigure.dataset.motionState = 'complete';
    });
    if ('IntersectionObserver' in window) {
      const reachObserver = new IntersectionObserver(entries => {
        visible = entries.some(entry => entry.isIntersecting);
        reachFigure.classList.toggle('motion-idle',!visible);
        if (visible && !hasPlayed) play();
      },{threshold:.4});
      reachObserver.observe(reachFigure);
    }
    updateReachMotion();
  }
})();
