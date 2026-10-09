(() => {
  'use strict';
  const dialog = document.getElementById('service-finder');
  if (!dialog || typeof dialog.showModal !== 'function') return;
  const form = document.getElementById('finder-form');
  const content = document.getElementById('finder-content');
  const back = document.getElementById('finder-back');
  const next = document.getElementById('finder-continue');
  const copy = document.getElementById('finder-copy');
  const whatsapp = document.getElementById('finder-whatsapp');
  const status = document.getElementById('finder-status');
  const announcement = document.getElementById('finder-announcement');
  const actions = dialog.querySelector('.finder-actions');
  let opener;
  const emptyState = () => ({step:1,goal:'',situation:'',support:false,timing:'',notes:'',draft:'',draftKey:'',draftEdited:false,stale:false});
  let state = emptyState();
  const goals = [
    ['partner','Ongoing marketing support'],
    ['discovery','Paid advertising'],
    ['creative','A creative or digital project'],
    ['unsure',"I'm not sure where to start"]
  ];
  const questions = {
    partner:{title:'Where would ongoing support help most?',options:[['planning','Planning and prioritising the marketing'],['production','Creating content consistently'],['campaigns','Managing campaigns and reporting'],['connected','Bringing the work together']]},
    creative:{title:'What kind of project do you have in mind?',options:[['new','A new website'],['existing','A review of my current website'],['production','Photography, video or audio'],['learning','Interactive training materials'],['ai','Practical AI training'],['custom','A journal, workbook or another idea']]},
    new:{title:'Where do your enquiries come from now?',options:[['referrals','Mostly referrals'],['social','Social media'],['launch','I am preparing to launch'],['mixed','A mix of places']]},
    existing:{title:'What needs to work better?',options:[['services','Explaining my services'],['mobile','The mobile experience'],['contact','Making it easier to get in touch'],['unsure','I am not sure yet']]},
    discovery:{title:'Where could your ads lead?',options:[['ready','A website I am happy with'],['improve','A website that needs improving'],['social','Mostly social media or WhatsApp'],['unsure','I need help choosing an enquiry route']]},
    learning:{title:'What do you have to work with?',options:[['material','Existing training material'],['knowledge','Product knowledge to organise'],['idea','A new team training idea'],['unsure','I am not sure yet']]},
    ai:{title:'What would help your team?',options:[['content','Creating and checking content'],['workflow','Repeatable everyday workflows'],['start','Getting started with AI'],['unsure','I am not sure yet']]},
    custom:{title:'What do you have in mind?',options:[['journals','A journal or workbook'],['resource','A digital resource or tool'],['idea','Another creative idea'],['unsure','I would like to talk it through']]},
    unsure:{title:'Where does the business feel stuck?',options:[['enquiries','Helping people understand and contact us'],['visibility','Getting noticed'],['team','Helping the team learn or work better'],['unsure','I would rather talk it through']]}
  };
  const timings = ['I am exploring options','Within the next few months','I have a date in mind'];
  const proof = {
    vwplus:{name:'VWPlus',description:'A specialist service website with a guided enquiry.',image:'assets/images/projects/vwplus-desktop-720.webp',url:'https://vwplus-website.vercel.app/'},
    decorators:{name:'New Best Decorators',description:'A visual service guide with a route to an estimate.',image:'assets/images/projects/decorators-desktop-720.webp',url:'https://newbestdecorators.kahnec.com/'},
    asher:{name:"Asher's Fleet",description:'A vehicle showcase with a clear enquiry route.',image:'assets/images/projects/asher-desktop-720.webp',url:'https://ashers-fleet.vercel.app/'},
    learning:{name:'Yello Academy',description:'Ongoing prototype, developed in my role at Yello Media Group.',image:'assets/images/projects/sales-academy.webp',url:'https://yello-media-stakeholder-report.vercel.app/training'},
    kyle:{name:'Kyle Hector',description:'Explore the work and background of the person you would work with.',image:'assets/images/kyle-hector-400.webp',url:'https://kylehector.com'}
  };
  const recommendations = {
    partner:{title:'Plan ongoing marketing support',reason:'We can bring planning, production, campaigns and reporting together around agreed priorities and capacity.',service:'Ongoing Marketing Support',proof:'kyle'},
    production:{title:'Discuss a content production project',reason:'We can agree the story, format, production needs and review process for your photography, video or audio.',service:'Creative & Digital Projects',proof:'kyle'},
    website:{title:'A first website',reason:'I can help organise your services and build a clear route to calls and enquiries.',service:'Website Design & Development',proof:'vwplus'},
    review:{title:'Start with a website review',reason:'Let’s understand what is working and what needs improving before deciding on targeted updates or a rebuild.',service:'Existing Website Review',proof:'decorators'},
    promotion:{title:'Paid advertising and strategy',reason:'I can plan and manage Meta or Google Ads, working with your existing website and agreeing what to track.',service:'Paid Advertising & Strategy',proof:'kyle'},
    route:{title:'Paid advertising and strategy',reason:'We can plan the ads and decide where enquiries should go. I’ll flag any changes needed to that route before the campaign starts.',service:'Paid Advertising & Strategy',proof:'kyle'},
    learning:{title:'Scope an interactive learning project',reason:'We can shape your material into useful guides, scenarios or practice activities, with the scope agreed first.',service:'Interactive Learning Materials',proof:'learning'},
    ai:{title:'Shape a practical AI workshop',reason:'A hands-on session can focus on your team’s actual tasks, checking outputs and using judgement.',service:'Practical AI Training',proof:'kyle'},
    custom:{title:'Discuss a custom creative project',reason:'We can start with who it is for and what it needs to do, then agree the content, format, deliverables and quote.',service:'Custom Creative Project',proof:'kyle'},
    conversation:{title:'Start with a discovery conversation',reason:'A short conversation about your business can help us agree what to look at first, without choosing a package now.',service:'Discovery conversation',proof:'kyle'}
  };
  const recommend = () => {
    if (state.goal === 'partner') return recommendations.partner;
    if (state.goal === 'creative') return ({new:recommendations.website,existing:recommendations.review,production:recommendations.production,learning:recommendations.learning,ai:recommendations.ai,custom:recommendations.custom})[state.situation];
    if (state.goal === 'new') return recommendations.website;
    if (state.goal === 'existing') return recommendations.review;
    if (state.goal === 'learning') return recommendations.learning;
    if (state.goal === 'ai') return recommendations.ai;
    if (state.goal === 'custom') return recommendations.custom;
    if (state.goal === 'discovery') return state.situation === 'ready' ? recommendations.promotion : recommendations.route;
    return recommendations.conversation;
  };
  const bounded = (value,limit) => {
    // Keep a truncated emoji and a pasted lone surrogate safe for URI encoding.
    const clean = Array.from(String(value)).filter(char => !(char.length === 1 && char.charCodeAt(0) >= 0xd800 && char.charCodeAt(0) <= 0xdfff)).join('');
    const result = clean.slice(0,limit);
    return /[\ud800-\udbff]$/.test(result) ? result.slice(0,-1) : result;
  };
  const answerKey = () => JSON.stringify([state.goal,state.situation,state.support,state.timing,state.notes]);
  const buildDraft = () => {
    const goal = goals.find(([value]) => value === state.goal)[1];
    const situation = questions[state.goal].options.find(([value]) => value === state.situation)[1];
    const lines = ['Hi Kyle, I used the Kahnec Hub service guide.','',`My goal: ${goal}.`,`My situation: ${situation}.`,`Suggested starting point: ${recommend().title}.`];
    if (state.support && state.goal === 'creative') lines.push('I would also like to discuss ongoing marketing support.');
    if (state.timing) lines.push(`Timing: ${state.timing}.`);
    if (state.notes.trim()) lines.push('',`A little context: ${state.notes.trim()}`);
    lines.push('','Could we discuss what fits my business and the scope?');
    return bounded(lines.join('\n'),1600);
  };
  const updateWhatsApp = () => {
    const draft = state.draft.trim();
    whatsapp.setAttribute('aria-disabled',String(!draft));
    copy.disabled = !draft;
    if (draft) whatsapp.href = 'https://wa.me/18768547105?text=' + encodeURIComponent(draft);
    else whatsapp.removeAttribute('href');
  };
  const radioGroup = (name,options,title) => `<fieldset class="finder-choices"><legend class="sr-only">${title}</legend>${options.map(([value,label]) => `<label class="finder-choice"><input type="radio" name="${name}" value="${value}" required><span>${label}</span></label>`).join('')}</fieldset>`;
  const focusQuestion = () => {
    const question = content.querySelector('#finder-question');
    if (question) question.focus({preventScroll:true});
    content.scrollTop = 0;
  };
  const render = (focus = true) => {
    status.textContent = '';
    document.getElementById('finder-intro').textContent = state.step === 1 ? 'A few quick questions to help you choose where to start. Kyle will confirm what fits your business.' : state.step === 2 ? 'Choose the closest answer. Extra context is optional.' : 'Review the suggestion and edit your draft before opening WhatsApp.';
    document.getElementById('finder-disclosure').hidden = state.step !== 3;
    dialog.dataset.step = String(state.step);
    dialog.querySelectorAll('[data-finder-stage]').forEach(item => {
      if (Number(item.dataset.finderStage) === state.step) item.setAttribute('aria-current','step');
      else item.removeAttribute('aria-current');
    });
    announcement.textContent = `Step ${state.step} of 3.`;
    back.hidden = state.step !== 2;
    next.hidden = state.step === 3;
    next.textContent = state.step === 1 ? 'Continue' : 'See suggestion';
    copy.hidden = whatsapp.hidden = state.step !== 3;
    actions.classList.toggle('is-review',state.step === 3);
    if (state.step === 1) {
      content.innerHTML = '<h3 id="finder-question" class="finder-question" tabindex="-1">What would you like help with?</h3>' + radioGroup('finder-goal',goals,'Choose your main goal');
      content.querySelectorAll('[name=finder-goal]').forEach(input => {input.checked=input.value===state.goal});
    } else if (state.step === 2) {
      const question = questions[state.goal];
      content.innerHTML = `<h3 id="finder-question" class="finder-question" tabindex="-1">${question.title}</h3>` + radioGroup('finder-situation',question.options,question.title) + (state.goal === 'creative' ? '<label class="finder-extra"><input type="checkbox" id="finder-support">Also discuss ongoing marketing support <span>(optional)</span></label>' : '') + '<div class="finder-field"><label for="finder-timing">Timing <span>(optional)</span></label><select id="finder-timing"><option value="">No timing to add</option>' + timings.map(timing => `<option>${timing}</option>`).join('') + '</select></div><div class="finder-field"><label for="finder-notes">Anything Kyle should know? <span>(optional)</span></label><textarea id="finder-notes" rows="2" maxlength="600" aria-describedby="finder-notes-hint"></textarea><p id="finder-notes-hint" class="finder-hint">A sentence about your business is enough. Up to 600 characters.</p></div>';
      content.querySelectorAll('[name=finder-situation]').forEach(input => {input.checked=input.value===state.situation});
      const support = document.getElementById('finder-support');if (support) support.checked = state.support;
      document.getElementById('finder-timing').value = state.timing;
      document.getElementById('finder-notes').value = state.notes;
    } else {
      const suggestion = recommend();
      const key = answerKey();
      if (state.draftKey !== key) {
        if (state.draftEdited) state.stale = true;
        else {state.draft=buildDraft();state.draftKey=key;state.stale=false}
      }
      const example = proof[suggestion.proof];
      content.innerHTML = '<div class="finder-recommendation"><p class="eyebrow">A suggested starting point</p><h3 id="finder-question" tabindex="-1"></h3><p id="finder-reason"></p></div><p class="finder-confirmation">Kyle will confirm suitability, scope and cost with you.</p><p class="finder-proof-label"></p><a class="finder-proof" target="_blank" rel="noopener noreferrer"><img alt="" width="88" height="66"><div><strong></strong><span></span></div><span class="sr-only"> (opens in a new tab)</span></a><div class="finder-field"><label for="finder-draft">Review your WhatsApp draft</label><textarea id="finder-draft" rows="7" maxlength="1600" aria-describedby="finder-disclosure"></textarea></div><div class="finder-edit-controls"><button type="button" class="finder-text-button" id="finder-edit">Edit answers</button><button type="button" class="finder-text-button" id="finder-refresh-draft" hidden>Update draft from answers</button></div><p class="finder-stale" id="finder-stale" hidden>Your answers changed. Your edited draft is kept until you update it.</p>';
      document.getElementById('finder-question').textContent = suggestion.title;
      document.getElementById('finder-reason').textContent = suggestion.reason;
      const card = content.querySelector('.finder-proof');card.href=example.url;
      card.querySelector('img').src=example.image;
      card.querySelector('strong').textContent=example.name;
      card.querySelector('div span').textContent=example.description;
      content.querySelector('.finder-proof-label').textContent = suggestion.proof === 'kyle' ? 'The person behind the work' : 'Relevant work to explore';
      document.getElementById('finder-draft').value = state.draft;
      document.getElementById('finder-stale').hidden = !state.stale;
      document.getElementById('finder-refresh-draft').hidden = !state.stale;
      updateWhatsApp();
    }
    if (focus) focusQuestion();
  };
  form.addEventListener('submit',event => {
    event.preventDefault();
    if (state.step === 3) return;
    const name = state.step === 1 ? 'finder-goal' : 'finder-situation';
    const selected = content.querySelector(`[name="${name}"]:checked`);
    if (!selected) {
      status.textContent = 'Choose one answer to continue.';
      const first = content.querySelector(`[name="${name}"]`);if (first) first.focus();
      return;
    }
    state.step += 1;
    render();
  });
  content.addEventListener('change',event => {
    const input = event.target;
    if (input.name === 'finder-goal' && state.goal !== input.value) {state.goal=input.value;state.situation='';state.support=false}
    if (input.name === 'finder-situation') state.situation=input.value;
    if (input.id === 'finder-support') state.support=input.checked;
    if (input.id === 'finder-timing') state.timing=input.value;
    status.textContent='';
  });
  content.addEventListener('input',event => {
    const input = event.target;
    if (input.id === 'finder-notes') {state.notes=bounded(input.value,600);input.value=state.notes}
    if (input.id === 'finder-draft') {state.draft=bounded(input.value,1600);input.value=state.draft;state.draftEdited=true;updateWhatsApp()}
    status.textContent='';
  });
  content.addEventListener('click',event => {
    const button = event.target.closest('button');
    if (!button) return;
    if (button.id === 'finder-edit') {state.step=2;render()}
    if (button.id === 'finder-refresh-draft') {
      state.draft=buildDraft();state.draftKey=answerKey();state.draftEdited=false;state.stale=false;
      document.getElementById('finder-draft').value=state.draft;
      document.getElementById('finder-stale').hidden=button.hidden=true;
      updateWhatsApp();status.textContent='Draft updated from your answers.';
      document.getElementById('finder-draft').focus();
    }
  });
  back.addEventListener('click',() => {state.step=1;render()});
  document.getElementById('finder-restart').addEventListener('click',() => {state=emptyState();render();status.textContent='Started again. Previous answers and draft cleared.'});
  const closeGuide = () => {
    dialog.close();
    document.documentElement.classList.remove('finder-open');
    if (opener && opener.isConnected) opener.focus({preventScroll:true});
  };
  document.getElementById('finder-close').addEventListener('click',closeGuide);
  dialog.addEventListener('cancel',event => {event.preventDefault();closeGuide()});
  dialog.addEventListener('close',() => {
    // A queued close event must not unlock or refocus a newly reopened guide.
    if (dialog.open) return;
    document.documentElement.classList.remove('finder-open');
    if (opener && opener.isConnected) opener.focus({preventScroll:true});
  });
  dialog.addEventListener('keydown',event => {
    if (event.key !== 'Tab') return;
    const controls = Array.from(dialog.querySelectorAll('a[href],button:not([disabled]),input:not([disabled]),textarea,select')).filter(element => element.getClientRects().length);
    const first=controls[0],last=controls[controls.length-1];
    if (event.shiftKey && (document.activeElement===first || document.activeElement===document.getElementById('finder-title'))) {event.preventDefault();last.focus()}
    else if (!event.shiftKey && document.activeElement===last) {event.preventDefault();first.focus()}
  });
  whatsapp.addEventListener('click',event => {if (!state.draft.trim()) event.preventDefault()});
  copy.addEventListener('click',async() => {
    if (!state.draft.trim()) return;
    try {await navigator.clipboard.writeText(state.draft);status.textContent='Draft copied. You can paste it into a message to Kyle.'}
    catch {status.textContent='Copy is unavailable here. Select and copy the draft above.';const draft=document.getElementById('finder-draft');draft.focus();draft.select()}
  });
  document.querySelectorAll('[data-finder-open]').forEach(button => {
    button.setAttribute('aria-haspopup','dialog');
    button.setAttribute('aria-controls','service-finder');
    button.hidden=false;
    button.addEventListener('click',() => {
      if (dialog.open) return;
      opener=button;render(false);dialog.showModal();document.documentElement.classList.add('finder-open');
      document.getElementById('finder-title').focus({preventScroll:true});content.scrollTop=0;
    });
  });
})();
