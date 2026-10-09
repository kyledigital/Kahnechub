(function () {
  const form = document.querySelector('[data-ad-leak-form]');
  const emptyState = document.querySelector('[data-result-empty]');
  const readyState = document.querySelector('[data-result-ready]');
  const leadForm = document.getElementById('adLeakLeadForm');

  if (!form || !emptyState || !readyState) {
    return;
  }

  const scoreRing = document.querySelector('[data-score-ring]');
  const healthScore = document.querySelector('[data-health-score]');
  const resultLabel = document.querySelector('[data-result-label]');
  const resultTitle = document.querySelector('[data-result-title]');
  const verdict = document.querySelector('[data-kahni-verdict]');
  const recList = document.querySelector('[data-recommendations]');
  const nextStep = document.querySelector('[data-next-step]');
  const nextStepCopy = document.querySelector('[data-next-step-copy]');
  const resultCta = document.querySelector('[data-result-cta]');
  const printButton = document.querySelector('[data-print-result]');

  const points = {
    tracking_status: { verified: 28, some: 16, not_sure: 7, no: 0 },
    lead_cost_known: { yes: 13, roughly: 9, not_sure: 3, no: 0 },
    search_terms: { weekly: 13, monthly: 9, rarely: 3, never: 0 },
    negative_keywords: { monthly: 11, sometimes: 7, not_sure: 2, no: 0 },
    landing_page: { dedicated: 14, service: 10, homepage: 3, not_sure: 2 },
    brand_split: { yes: 8, not_sure: 3, no: 0 },
    action_tracking: { all: 9, some: 5, not_sure: 2, no: 0 },
    follow_up: { same_day: 4, next_day: 2, slow: 0, not_sure: 1 }
  };

  function valueFor(name) {
    const field = form.querySelector(`[name="${name}"]`);
    return field ? field.value : '';
  }

  function checkedValues(name) {
    return Array.from(form.querySelectorAll(`[name="${name}"]:checked`)).map((field) => field.value);
  }

  function hasRootOnlyPath(url) {
    try {
      const parsed = new URL(url);
      const path = parsed.pathname.replace(/\/+$/, '');
      return !path || path === '';
    } catch {
      return true;
    }
  }

  function getWebsiteHint(url) {
    if (!url) {
      return 'No website URL was added, so the landing page should be checked manually.';
    }

    if (hasRootOnlyPath(url)) {
      return 'Your URL looks like a homepage. If ads go there, check whether the page has one clear offer and one obvious enquiry path.';
    }

    return 'Your URL looks more specific than a homepage. Check whether this page matches the ad promise and has trackable calls, forms, or WhatsApp clicks.';
  }

  function scoreFromMap(name) {
    const value = valueFor(name);
    return points[name] && Object.prototype.hasOwnProperty.call(points[name], value) ? points[name][value] : 0;
  }

  function calculateScore() {
    const channels = checkedValues('channels');
    const url = form.querySelector('[data-ad-url]').value.trim();
    const rawScore = Object.keys(points).reduce((total, name) => total + scoreFromMap(name), 0);
    const channelBonus = channels.length ? 0 : -5;
    const urlBonus = url ? 3 : 0;
    const score = Math.max(0, Math.min(100, rawScore + channelBonus + urlBonus));

    const subscores = {
      tracking: Math.round(((scoreFromMap('tracking_status') + scoreFromMap('action_tracking')) / 37) * 100),
      spend: Math.round(((scoreFromMap('lead_cost_known') + scoreFromMap('search_terms') + scoreFromMap('negative_keywords') + scoreFromMap('brand_split')) / 45) * 100),
      page: Math.round((scoreFromMap('landing_page') / 14) * 100),
      followup: Math.round((scoreFromMap('follow_up') / 4) * 100)
    };

    return { score, subscores, channels, url };
  }

  function riskLabel(score) {
    if (score < 45) {
      return 'High leak risk';
    }

    if (score < 70) {
      return 'Medium leak risk';
    }

    return 'Lower leak risk';
  }

  function buildRecommendations(data) {
    const recs = [];
    const channels = data.channels;

    if (valueFor('tracking_status') !== 'verified' || valueFor('action_tracking') !== 'all') {
      recs.push('Verify that forms, calls, WhatsApp clicks, and other real lead actions are tracked before increasing spend.');
    }

    if (valueFor('lead_cost_known') === 'no' || valueFor('lead_cost_known') === 'not_sure') {
      recs.push('Set a target cost per lead or sale so campaign performance has a clear pass/fail line.');
    }

    if (channels.some((item) => ['Google Search', 'Performance Max'].includes(item)) && ['rarely', 'never'].includes(valueFor('search_terms'))) {
      recs.push('Review real search terms and exclude irrelevant searches that are quietly eating budget.');
    }

    if (['not_sure', 'no'].includes(valueFor('negative_keywords'))) {
      recs.push('Build a negative keyword habit so the account stops paying for poor-fit traffic.');
    }

    if (['homepage', 'not_sure'].includes(valueFor('landing_page'))) {
      recs.push('Send ad clicks to a focused offer or quote page instead of making visitors figure out the next step.');
    }

    if (['not_sure', 'no'].includes(valueFor('brand_split'))) {
      recs.push('Separate brand demand from new-customer demand so results are easier to trust.');
    }

    if (valueFor('follow_up') === 'slow' || valueFor('follow_up') === 'not_sure') {
      recs.push('Tighten lead follow-up. Paid leads lose value quickly when response time is unclear.');
    }

    recs.push(getWebsiteHint(data.url));

    return recs.slice(0, 5);
  }

  function getNextStep(score) {
    if (score < 45) {
      return {
        service: 'Full Google Ads Audit',
        projectType: 'Need advice first',
        title: 'Full account audit',
        copy: 'The score suggests tracking or spend leaks that need evidence from the real account.'
      };
    }

    if (score < 70) {
      return {
        service: 'Google Ads Walkthrough',
        projectType: 'Need advice first',
        title: 'Guided walkthrough',
        copy: 'Use a live session to verify the biggest risks and decide what to fix first.'
      };
    }

    return {
      service: 'Google Ads Management',
      projectType: 'Monthly support',
      title: 'Optimization review',
      copy: 'The foundation looks better, so the next move is refinement, testing, and clearer reporting.'
    };
  }

  function updateLeadFields(result) {
    if (!leadForm) {
      return;
    }

    const fields = {
      score: `${result.score}/100`,
      risk: riskLabel(result.score),
      website: result.url,
      recommendations: result.recommendations.join(' | '),
      next_step: result.next.service
    };

    Object.entries(fields).forEach(([key, value]) => {
      const field = leadForm.querySelector(`[data-lead-result="${key}"]`);
      if (field) {
        field.value = value;
      }
    });

    const message = leadForm.querySelector('[name="message"]');
    if (message && !message.value.trim()) {
      message.value = `My Kahni Ad Leak Check score is ${fields.score} (${fields.risk}). I want help reviewing the biggest likely leaks.`;
    }
  }

  function updateSubscore(name, value) {
    const label = document.querySelector(`[data-subscore="${name}"]`);
    const bar = document.querySelector(`[data-subbar="${name}"]`);

    if (label) {
      label.textContent = `${value}%`;
    }

    if (bar) {
      bar.style.width = `${Math.max(4, value)}%`;
    }
  }

  function renderResult(event) {
    event.preventDefault();

    const data = calculateScore();
    const recommendations = buildRecommendations(data);
    const next = getNextStep(data.score);
    const risk = riskLabel(data.score);
    const result = { ...data, recommendations, next };

    emptyState.hidden = true;
    readyState.hidden = false;

    healthScore.textContent = String(data.score);
    resultLabel.textContent = risk;
    resultTitle.textContent = data.score < 45 ? 'Your ads may be leaking money.' : data.score < 70 ? 'Your setup needs a closer look.' : 'Your setup has a better foundation.';
    verdict.textContent = data.score < 45
      ? 'Kahni sees enough uncertainty here that a real audit is the smart next move before spending more.'
      : data.score < 70
        ? 'Kahni found a few practical leaks to verify. You may not need a rebuild yet, but you do need clarity.'
        : 'Kahni sees a stronger base. Keep tightening tracking, landing pages, and reporting before scaling.';

    scoreRing.style.setProperty('--score', `${data.score}%`);
    scoreRing.dataset.risk = data.score < 45 ? 'high' : data.score < 70 ? 'medium' : 'low';

    Object.entries(data.subscores).forEach(([name, value]) => updateSubscore(name, value));

    recList.innerHTML = recommendations.map((item) => `<li>${item}</li>`).join('');
    nextStep.textContent = next.title;
    nextStepCopy.textContent = next.copy;

    if (resultCta) {
      resultCta.dataset.prefillService = next.service;
      resultCta.dataset.prefillProjectType = next.projectType;
    }

    updateLeadFields(result);

    if (typeof window.trackEvent === 'function') {
      window.trackEvent('view_ad_leak_result', {
        score: data.score,
        risk,
        channels: data.channels.join(', ')
      });
    }
  }

  form.addEventListener('submit', renderResult);

  if (printButton) {
    printButton.addEventListener('click', () => window.print());
  }
})();
