(() => {
  'use strict';
  const homeRoutes={
    services:'services.html#services',results:'work.html#results',about:'about.html#about',contact:'contact.html#contact',
    'marketing-partner':'marketing-partner.html#marketing-partner','monthly-support':'marketing-partner.html#monthly-support',
    'paid-advertising':'paid-advertising.html#paid-advertising','creative-digital':'creative-projects.html#creative-digital',
    'creative-strategy':'creative-strategy.html#creative-strategy','how-we-work':'creative-strategy.html#how-we-work','ideas-title':'creative-strategy.html#ideas-title',
    'specialist-services':'creative-projects.html#specialist-services','ai-training':'creative-projects.html#ai-training','learning-work':'creative-projects.html#learning-work','custom-projects':'creative-projects.html#custom-projects',
    support:'paid-advertising.html#support','meta-ads':'paid-advertising.html#meta-ads',audit:'paid-advertising.html#audit',foundations:'paid-advertising.html#foundations','quick-services':'services.html#service-catalog'
  };
  const redirectLegacy=()=>{
    const file=location.pathname.split('/').pop(),hash=location.hash.slice(1);
    let destination='';
    if(file===''||file==='index.html')destination=homeRoutes[hash]||(!hash&&new URLSearchParams(location.search).has('service')?'contact.html#contact':'');
    if(file==='services.html'&&hash==='campaign-estimator')destination='paid-advertising.html#campaign-estimator';
    if(file==='services.html'&&hash==='creative-strategy')destination='creative-strategy.html#creative-strategy';
    if(!destination)return false;
    const next=new URL(destination,location.href);next.search=location.search;location.replace(next.href);return true;
  };
  const revealHash=()=>{
    if(redirectLegacy())return;
    let id;try{id=decodeURIComponent(location.hash.slice(1));}catch{return;}
    if(!id)return;
    requestAnimationFrame(()=>{
      const target=document.getElementById(id);if(!target)return;
      for(let ancestor=target.parentElement;ancestor;ancestor=ancestor.parentElement)if(ancestor.tagName==='DETAILS')ancestor.open=true;
      const panel=target.closest('[data-tab-panel]');if(panel){const tab=document.querySelector('[data-tab="'+panel.dataset.tabPanel+'"]');if(tab)tab.click();}
      target.scrollIntoView({block:'start',behavior:'auto'});
    });
  };
  if(redirectLegacy())return;
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',revealHash,{once:true});else revealHash();
  window.addEventListener('hashchange',revealHash);
})();
