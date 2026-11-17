(() => {
  'use strict';
  const reduced=matchMedia('(prefers-reduced-motion: reduce)');
  const bindTabs=(list,onSelect) => {
    if(!list)return null;
    const tabs=Array.from(list.querySelectorAll('[role=tab]'));
    const show=tab => {
      tabs.forEach(button=>{const active=button===tab;button.setAttribute('aria-selected',String(active));button.tabIndex=active?0:-1;const panel=document.getElementById(button.getAttribute('aria-controls'));if(panel)panel.hidden=!active});
      if(onSelect)onSelect(tab);
    };
    tabs.forEach((button,index)=>{
      button.addEventListener('click',()=>show(button));
      button.addEventListener('keydown',event=>{
        let next;if(['ArrowRight','ArrowDown'].includes(event.key))next=(index+1)%tabs.length;
        if(['ArrowLeft','ArrowUp'].includes(event.key))next=(index+tabs.length-1)%tabs.length;
        if(event.key==='Home')next=0;if(event.key==='End')next=tabs.length-1;
        if(next===undefined)return;event.preventDefault();show(tabs[next]);tabs[next].focus();
      });
    });
    show(tabs.find(tab=>tab.getAttribute('aria-selected')==='true')||tabs[0]);
    return {tabs,show};
  };
  const primary=bindTabs(document.querySelector('[data-partner-tabs]'));
  const process=bindTabs(document.querySelector('[data-process-tabs]'));
  const proof=bindTabs(document.querySelector('[data-proof-tabs]'));
  bindTabs(document.querySelector('[data-concept-tabs]'));
  document.querySelectorAll('[data-primary-service]').forEach(link=>link.addEventListener('click',event=>{
    if(!primary)return;
    const tab=document.getElementById('offer-tab-'+link.dataset.primaryService);if(!tab)return;
    event.preventDefault();primary.show(tab);history.replaceState(null,'','#services');document.getElementById('services').scrollIntoView({block:'start'});tab.focus({preventScroll:true});
  }));
  document.querySelectorAll('[data-open-specialist]').forEach(link=>link.addEventListener('click',event=>{
    const tab=document.getElementById('tab-'+link.dataset.openSpecialist);if(!tab)return;
    event.preventDefault();const disclosure=document.getElementById('specialist-details');if(disclosure)disclosure.open=true;tab.click();history.replaceState(null,'','#specialist-services');document.getElementById('specialist-services').scrollIntoView({block:'start'});tab.focus({preventScroll:true});
  }));
  const applyHash=()=>{
    if(location.hash==='#ai-video'&&proof){const tab=document.getElementById('proof-tab-ai-video');if(tab){proof.show(tab);document.getElementById('ai-video')?.scrollIntoView({block:'start'});}}
    if(location.hash==='#how-we-work'){const details=document.getElementById('marketing-process-details');if(details)details.open=true;document.getElementById('how-we-work')?.scrollIntoView({block:'start'});}
    if(location.hash==='#ideas-title'){const details=document.getElementById('idea-net-details');if(details)details.open=true;document.getElementById('ideas-title')?.scrollIntoView({block:'start'});}
    if(['#ai-training','#learning-work','#support','#foundations','#meta-ads','#audit','#custom-projects','#specialist-services'].includes(location.hash)){const disclosure=document.getElementById('specialist-details');if(disclosure)disclosure.open=true;}
    const key={'#marketing-partner':'partner','#paid-advertising':'advertising','#creative-digital':'creative'}[location.hash];
    if(key&&primary){primary.show(document.getElementById('offer-tab-'+key));document.getElementById('services').scrollIntoView({block:'start'})}
    if(location.hash==='#learning-work'){document.getElementById('tab-learning')?.click();document.getElementById('learning-work')?.scrollIntoView({block:'start'})}
  };
  applyHash();window.addEventListener('hashchange',applyHash);
  const menu=document.querySelector('.nav-service-menu');
  if(menu){document.addEventListener('click',event=>{if(!menu.contains(event.target)||event.target.closest('a'))menu.open=false});document.addEventListener('keydown',event=>{if(event.key==='Escape')menu.open=false})}
  const orientation=()=>{document.querySelector('[data-partner-tabs]')?.setAttribute('aria-orientation',matchMedia('(max-width:650px)').matches?'vertical':'horizontal')};orientation();window.addEventListener('resize',orientation,{passive:true});
  const figure=document.querySelector('[data-partner-flow]');
  if(!figure)return;
  const replay=figure.querySelector('[data-flow-replay]'),status=figure.querySelector('[data-flow-status]'),caption=figure.querySelector('[data-flow-caption]');
  const descriptions={ideation:'I find the angle, shape the story and develop ideas that give content a clear purpose.',photography:'Create visuals that express the idea and give the content its starting material.',content:'Shape the visuals and story into videos, posts and other campaign assets.',advertising:'Put the finished message in front of relevant audiences through the right channels.',enquiries:'Give interested people a clear next step to contact the business.',insights:'Review responses and performance, then use what you learn to shape the next idea.'};
  const flow=figure.querySelector('.capability-flow'),flowButtons=Array.from(flow.querySelectorAll('[data-flow-key]')),flowHint=figure.querySelector('[data-flow-scroll-hint]');
  const updateFlowHint=()=>{if(flowHint)flowHint.hidden=flow.scrollWidth<=flow.clientWidth+1;};
  if('ResizeObserver' in window)new ResizeObserver(updateFlowHint).observe(flow);else window.addEventListener('resize',updateFlowHint,{passive:true});updateFlowHint();
  const revealFlowButton=button=>{const item=button.getBoundingClientRect(),strip=flow.getBoundingClientRect();if(item.left<strip.left+6||item.right>strip.right-6)flow.scrollBy({left:item.left-strip.left-(flow.clientWidth-item.width)/2,behavior:reduced.matches||document.body.classList.contains('motion-paused')?'auto':'smooth'});};
  let visible=false,played=false;
  const paused=()=>reduced.matches||document.hidden||document.body.classList.contains('motion-paused')||document.documentElement.classList.contains('finder-open');
  const play=()=>{if(paused()||!visible)return;flowButtons.forEach((button,index)=>button.setAttribute('aria-pressed',String(index===0)));caption.textContent=descriptions.ideation;flow.scrollTo({left:0,behavior:'auto'});played=true;figure.classList.remove('flow-playing');void figure.offsetWidth;figure.classList.add('flow-playing');figure.dataset.motionState='playing'};
  const update=()=>{
    figure.classList.toggle('flow-idle',!visible);figure.classList.toggle('flow-suspended',paused());replay.disabled=paused();
    status.textContent=reduced.matches?'Still connections shown':document.body.classList.contains('motion-paused')?'Motion paused':'';
    if(reduced.matches){figure.classList.remove('flow-playing');figure.dataset.motionState='still'}else if(visible&&!played&&!paused())play();
  };
  replay.hidden=false;replay.addEventListener('click',play);
  figure.addEventListener('animationend',event=>{
    if(event.animationName!=='partner-flow-complete'||reduced.matches||!figure.classList.contains('flow-playing'))return;
    const pending=figure.querySelector('.capability-flow li:last-child .flow-point').getAnimations().some(animation=>animation.currentTime===null||animation.currentTime<animation.effect.getComputedTiming().endTime-1);
    if(pending)return;figure.classList.remove('flow-playing');figure.dataset.motionState='complete';
  });
  flowButtons.forEach((button,index)=>{
    button.addEventListener('keydown',event=>{
      const next=event.key==='ArrowRight'?Math.min(index+1,flowButtons.length-1):event.key==='ArrowLeft'?Math.max(index-1,0):event.key==='Home'?0:event.key==='End'?flowButtons.length-1:null;
      if(next===null)return;event.preventDefault();flowButtons[next].focus({preventScroll:true});flowButtons[next].click();
    });
    button.addEventListener('click',()=>{
    played=true;figure.classList.remove('flow-playing');figure.dataset.motionState='complete';figure.querySelectorAll('[data-flow-key]').forEach(item=>item.setAttribute('aria-pressed',String(item===button)));caption.textContent=descriptions[button.dataset.flowKey];
    revealFlowButton(button);
    });
  });
  if('IntersectionObserver' in window)new IntersectionObserver(entries=>{visible=entries.some(entry=>entry.isIntersecting);update()},{threshold:.35}).observe(figure);
  const watcher=new MutationObserver(update);watcher.observe(document.body,{attributes:true,attributeFilter:['class']});watcher.observe(document.documentElement,{attributes:true,attributeFilter:['class']});
  reduced.addEventListener('change',update);document.addEventListener('visibilitychange',update);update();
})();
