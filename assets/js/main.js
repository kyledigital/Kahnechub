/* ============================================================
   Kahnec Hub - Main JavaScript
   Shared config, lead capture, CTA tracking, and UI behavior
   ============================================================ */

(function () {
  const DEFAULT_CONFIG = {
    businessName: 'Kahnec Hub',
    founderName: 'Kyle Hector',
    bookingLink: '',
    fallbackBookingHref: 'index.html?service=Strategy%20Call&project_type=Need%20advice%20first#contact',
    responseTimeText: 'within 24 hours',
    contact: {
      email: '',
      whatsappNumber: '',
      instagramHandle: '',
      instagramUrl: '',
      linkedinUrl: ''
    },
    integrations: {
      formspree: {
        auditFormId: '',
        contactFormId: '',
        newsletterFormId: ''
      },
      analytics: {
        googleAnalyticsId: '',
        plausibleDomain: '',
        plausibleScriptUrl: '',
        umamiWebsiteId: '',
        umamiScriptUrl: ''
      }
    },
    forms: {}
  };

  const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  function getConfig() {
    return mergeDeep(DEFAULT_CONFIG, window.KH_CONFIG || {});
  }

  function mergeDeep(base, overrides) {
    const result = { ...base };

    Object.keys(overrides || {}).forEach((key) => {
      const baseValue = result[key];
      const overrideValue = overrides[key];

      if (isPlainObject(baseValue) && isPlainObject(overrideValue)) {
        result[key] = mergeDeep(baseValue, overrideValue);
        return;
      }

      result[key] = overrideValue;
    });

    return result;
  }

  function isPlainObject(value) {
    return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
  }

  function getBookingHref(config) {
    const bookingLink = (config.bookingLink || '').trim();
    if (bookingLink) {
      return bookingLink;
    }

    if (document.getElementById('contactForm')) {
      return '#contact';
    }

    return config.fallbackBookingHref || 'index.html?service=Strategy%20Call&project_type=Need%20advice%20first#contact';
  }

  function injectScript(src, attributes) {
    if (!src || document.querySelector(`script[src="${src}"]`)) {
      return;
    }

    const script = document.createElement('script');
    script.src = src;
    script.async = true;

    Object.entries(attributes || {}).forEach(([key, value]) => {
      if (value) {
        script.setAttribute(key, value);
      }
    });

    document.head.appendChild(script);
  }

  function initAnalytics(config) {
    const analytics = config.integrations && config.integrations.analytics
      ? config.integrations.analytics
      : {};

    const gaId = (analytics.googleAnalyticsId || '').trim();
    if (gaId) {
      window.dataLayer = window.dataLayer || [];
      window.gtag = window.gtag || function gtag() {
        window.dataLayer.push(arguments);
      };

      window.gtag('js', new Date());
      window.gtag('config', gaId);
      injectScript(`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(gaId)}`);
    }

    const plausibleDomain = (analytics.plausibleDomain || '').trim();
    if (plausibleDomain) {
      injectScript(
        (analytics.plausibleScriptUrl || 'https://plausible.io/js/script.js').trim(),
        { 'data-domain': plausibleDomain }
      );
    }

    const umamiWebsiteId = (analytics.umamiWebsiteId || '').trim();
    if (umamiWebsiteId) {
      injectScript(
        (analytics.umamiScriptUrl || 'https://cloud.umami.is/script.js').trim(),
        { 'data-website-id': umamiWebsiteId }
      );
    }
  }

  function getWhatsAppHref(config) {
    let digits = (config.contact.whatsappNumber || '').replace(/\D/g, '');

    // WhatsApp requires international format; Jamaica numbers commonly need leading 1.
    if (digits.length === 10) {
      digits = `1${digits}`;
    }

    return digits ? `https://wa.me/${digits}` : '#contact';
  }

  function getEmailHref(config) {
    return config.contact.email ? `mailto:${config.contact.email}` : '#contact';
  }

  function isExternalUrl(href) {
    if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:')) {
      return false;
    }

    try {
      return new URL(href, window.location.href).origin !== window.location.origin;
    } catch {
      return false;
    }
  }

  function getTemplateValues(config) {
    return {
      businessName: config.businessName,
      founderName: config.founderName,
      contactEmail: config.contact.email,
      instagramHandle: config.contact.instagramHandle,
      responseTimeText: config.responseTimeText,
      bookingHref: getBookingHref(config),
      whatsappHref: getWhatsAppHref(config),
      emailHref: getEmailHref(config),
      instagramUrl: config.contact.instagramUrl,
      linkedinUrl: config.contact.linkedinUrl
    };
  }

  function applySiteConfig(config) {
    const values = getTemplateValues(config);

    document.querySelectorAll('[data-kh-text]').forEach((element) => {
      const key = element.dataset.khText;
      if (values[key]) {
        element.textContent = values[key];
      }
    });

    document.querySelectorAll('[data-kh-href]').forEach((element) => {
      const key = element.dataset.khHref;
      if (!values[key]) {
        return;
      }

      element.setAttribute('href', values[key]);

      if (isExternalUrl(values[key])) {
        element.setAttribute('target', '_blank');
        element.setAttribute('rel', 'noopener noreferrer');
      } else if (element.getAttribute('target') === '_blank') {
        element.removeAttribute('target');
        element.removeAttribute('rel');
      }
    });

    document.querySelectorAll('.js-book-call').forEach((element) => {
      const bookingHref = values.bookingHref;
      element.setAttribute('href', bookingHref);

      if (isExternalUrl(bookingHref)) {
        element.setAttribute('target', '_blank');
        element.setAttribute('rel', 'noopener noreferrer');
      } else {
        element.removeAttribute('target');
        element.removeAttribute('rel');
      }

      if (bookingHref === '#contact') {
        element.dataset.prefillService = element.dataset.prefillService || 'Free Discovery Call';
        element.dataset.prefillProjectType = element.dataset.prefillProjectType || 'Need advice first';
      }
    });
  }

  function trackEvent(name, data) {
    try {
      if (typeof window.gtag === 'function') {
        window.gtag('event', name, data || {});
      }

      if (typeof window.plausible === 'function') {
        window.plausible(name, { props: data || {} });
      }

      if (window.umami && typeof window.umami.track === 'function') {
        window.umami.track(name, data || {});
      }

      if (Array.isArray(window.dataLayer)) {
        window.dataLayer.push({ event: name, ...(data || {}) });
      }
    } catch {
      // Analytics is optional. Fail silently.
    }
  }

  window.trackEvent = trackEvent;

  function initTracking() {
    document.addEventListener('click', (event) => {
      const trackedElement = event.target.closest('[data-track]');
      if (!trackedElement) {
        return;
      }

      trackEvent(trackedElement.dataset.track, {
        href: trackedElement.getAttribute('href') || '',
        label: trackedElement.textContent.trim(),
        location: trackedElement.dataset.trackLocation || ''
      });
    });
  }

  function initNav() {
    const navToggle = document.getElementById('navToggle');
    const navLinks = document.getElementById('navLinks');

    if (!navToggle || !navLinks) {
      return;
    }

    navToggle.addEventListener('click', () => {
      navLinks.classList.toggle('open');
    });
  }

  function setActiveServiceTab(tabName, shouldFocus) {
    const tabs = Array.from(document.querySelectorAll('[data-tab]'));
    const panels = Array.from(document.querySelectorAll('[data-tab-panel]'));

    if (!tabs.length || !panels.length) {
      return;
    }

    const activeTab = tabs.find((tab) => tab.dataset.tab === tabName) || tabs[0];
    const activeTabName = activeTab.dataset.tab;

    tabs.forEach((tab) => {
      const isActive = tab.dataset.tab === activeTabName;
      tab.classList.toggle('is-active', isActive);
      tab.setAttribute('aria-selected', String(isActive));
      tab.tabIndex = isActive ? 0 : -1;
    });

    panels.forEach((panel) => {
      const isActive = panel.dataset.tabPanel === activeTabName;
      panel.classList.toggle('is-active', isActive);
      panel.hidden = !isActive;
    });

    if (shouldFocus) {
      activeTab.focus({ preventScroll: true });
    }
  }

  function initServiceTabs() {
    const tabs = Array.from(document.querySelectorAll('[data-tab]'));
    if (!tabs.length) {
      return;
    }

    tabs.forEach((tab, index) => {
      tab.addEventListener('click', () => {
        setActiveServiceTab(tab.dataset.tab, false);
      });

      tab.addEventListener('keydown', (event) => {
        const isNext = event.key === 'ArrowRight' || event.key === 'ArrowDown';
        const isPrevious = event.key === 'ArrowLeft' || event.key === 'ArrowUp';

        if (!isNext && !isPrevious && event.key !== 'Home' && event.key !== 'End') {
          return;
        }

        event.preventDefault();

        let nextIndex = index;
        if (isNext) {
          nextIndex = (index + 1) % tabs.length;
        } else if (isPrevious) {
          nextIndex = (index - 1 + tabs.length) % tabs.length;
        } else if (event.key === 'Home') {
          nextIndex = 0;
        } else if (event.key === 'End') {
          nextIndex = tabs.length - 1;
        }

        setActiveServiceTab(tabs[nextIndex].dataset.tab, true);
      });
    });

    document.querySelectorAll('[data-open-tab]').forEach((link) => {
      link.addEventListener('click', () => {
        setActiveServiceTab(link.dataset.openTab, false);
      });
    });

    setActiveServiceTab(tabs[0].dataset.tab, false);
  }

  function openAccordionPanel(panelId) {
    const panel = document.getElementById(panelId);
    if (!panel) {
      return;
    }

    const trigger = document.querySelector(`[aria-controls="${panelId}"][data-accordion-trigger]`);
    if (trigger) {
      trigger.setAttribute('aria-expanded', 'true');
    }

    panel.hidden = false;
    panel.classList.add('open');
  }

  function initProgressiveAccordions() {
    document.querySelectorAll('[data-accordion-trigger]').forEach((trigger) => {
      const panelId = trigger.getAttribute('aria-controls');
      const panel = panelId ? document.getElementById(panelId) : null;

      if (!panel) {
        return;
      }

      trigger.addEventListener('click', () => {
        const willOpen = trigger.getAttribute('aria-expanded') !== 'true';
        trigger.setAttribute('aria-expanded', String(willOpen));
        panel.hidden = !willOpen;
        panel.classList.toggle('open', willOpen);
      });
    });

    document.querySelectorAll('[data-accordion-open]').forEach((link) => {
      link.addEventListener('click', () => {
        window.setTimeout(() => openAccordionPanel(link.dataset.accordionOpen), 80);
      });
    });
  }

  function initMotionClasses() {
    document.documentElement.classList.add('motion-ready');

    const motionGroups = [
      '.quick-svc-grid .quick-svc-card',
      '.svc-grid .svc',
      '.project-type-grid .project-type-card',
      '.deck-packages .deck-card',
      '.qp-grid .qp-card',
      '.price-row .pcard',
      '.process-row .proc',
      '.cs-row .cs',
      '.test-row .tcard',
      '.blog-grid .blog-card',
      '.ladder-row .ladder-card',
      '.start-grid .start-card',
      '.compact-service-grid .compact-service-card',
      '.work-path-grid .work-path-card',
      '.result-snapshot-grid .result-card',
      '.featured-service-grid .featured-service-card',
      '.pricing-snapshot-grid .price-chip'
    ];

    motionGroups.forEach((selector) => {
      document.querySelectorAll(selector).forEach((element, index) => {
        element.classList.add('lift-card');
        element.classList.add('motion-card');

        if (!element.classList.contains('reveal')) {
          element.classList.add('reveal');
        }

        element.classList.add(`stagger-${(index % 4) + 1}`);
      });
    });

    document.querySelectorAll('.process-row .proc').forEach((element) => {
      element.classList.add('progress-line');
      element.classList.add('motion-progress');
    });

    document.querySelectorAll('.pcard.feat, .deck-card.featured, .content-highlight-card').forEach((element) => {
      element.classList.add('featured-motion-card');
    });

    document.querySelectorAll('.svc-arrow').forEach((element) => {
      element.classList.add('motion-link');
    });

    document.querySelectorAll('.blog-card').forEach((element) => {
      element.classList.add('motion-image');
    });

    document.querySelectorAll('.lead-form').forEach((element) => {
      element.classList.add('motion-form');
    });
  }

  function initReveal() {
    const revealElements = document.querySelectorAll('.reveal');
    if (!revealElements.length) {
      return;
    }

    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          // Keep the old class and add the clearer reusable motion class.
          entry.target.classList.add('visible');
          entry.target.classList.add('is-visible');
          entry.target.classList.add('reveal-visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.07 });

    revealElements.forEach((element) => revealObserver.observe(element));
  }

  function initCounters() {
    const statsElement = document.querySelector('.hero-stats');
    if (!statsElement) {
      return;
    }

    function runCounters() {
      document.querySelectorAll('[data-target]').forEach((element) => {
        const target = Number.parseFloat(element.dataset.target || '0');
        const prefix = element.dataset.prefix || '';
        const suffix = element.dataset.suffix || '';
        const decimals = target < 10 ? 2 : 0;
        let step = 0;

        const timer = window.setInterval(() => {
          step += 1;
          const value = Math.min((target / 60) * step, target);
          const finalValue = step >= 60 ? target : Number(value.toFixed(decimals));
          element.textContent = `${prefix}${finalValue}${suffix}`;

          if (step >= 60) {
            window.clearInterval(timer);
          }
        }, 1600 / 60);
      });
    }

    const statsObserver = new IntersectionObserver((entries) => {
      if (entries[0] && entries[0].isIntersecting) {
        runCounters();
        statsObserver.disconnect();
      }
    }, { threshold: 0.3 });

    statsObserver.observe(statsElement);
  }

  window.toggleFAQ = function toggleFAQ(button) {
    const answer = button.nextElementSibling;
    const icon = button.querySelector('.faq-ico');
    const isOpen = answer.classList.contains('open');

    document.querySelectorAll('.faq-ans.open').forEach((openAnswer) => {
      openAnswer.classList.remove('open');
      const openIcon = openAnswer.previousElementSibling.querySelector('.faq-ico');
      if (openIcon) {
        openIcon.classList.remove('open');
      }
    });

    if (!isOpen) {
      answer.classList.add('open');
      if (icon) {
        icon.classList.add('open');
      }
    }
  };

  function initFieldValidation() {
    document.querySelectorAll('.lead-form input, .lead-form textarea, .lead-form select').forEach((field) => {
      const validate = () => updateFieldValidity(field);
      field.addEventListener('blur', validate);
      field.addEventListener('input', validate);
      field.addEventListener('change', validate);
    });
  }

  function updateFieldValidity(field) {
    if (!field) {
      return true;
    }

    const value = field.value.trim();

    if (field.type === 'email' && value) {
      field.setCustomValidity(EMAIL_PATTERN.test(value) ? '' : 'Enter a valid email address.');
    } else {
      field.setCustomValidity('');
    }

    field.setAttribute('aria-invalid', field.checkValidity() ? 'false' : 'true');
    return field.checkValidity();
  }

  function validateForm(form) {
    const fields = form.querySelectorAll('input, textarea, select');
    let isValid = true;

    fields.forEach((field) => {
      const fieldValid = updateFieldValidity(field);
      if (!fieldValid) {
        isValid = false;
      }
    });

    if (!isValid || !form.checkValidity()) {
      showFormStatus(form, 'error', 'Please complete the required fields and check your email address.');
      form.reportValidity();
      return false;
    }

    return true;
  }

  function normalizeOptionText(value) {
    return String(value || '')
      .replace(/[–—]/g, '-')
      .replace(/\s+/g, ' ')
      .trim();
  }

  function setSelectOptionByText(select, text) {
    if (!select || !text) {
      return;
    }

    const normalText = normalizeOptionText(text);
    const option = Array.from(select.options).find((item) => normalizeOptionText(item.textContent) === normalText)
      || Array.from(select.options).find((item) => normalizeOptionText(item.textContent).includes(normalText));

    if (option) {
      select.value = option.value || option.textContent;
      select.dispatchEvent(new Event('change', { bubbles: true }));
    }
  }

  function applyContactPrefill(form, service, projectType) {
    if (!form) {
      return;
    }

    const message = form.querySelector('[name="message"]');
    const formCard = form.closest('.contact-form-card');

    setSelectOptionByText(form.querySelector('[name="service"]'), service);
    setSelectOptionByText(form.querySelector('[name="project_type"]'), projectType);

    if (message && service && !message.value.trim()) {
      message.value = `I am interested in ${service}.`;
      message.dispatchEvent(new Event('input', { bubbles: true }));
    }

    if (formCard) {
      formCard.classList.remove('is-prefilled');
      window.requestAnimationFrame(() => formCard.classList.add('is-prefilled'));
    }
  }

  function initEnquiryPrefill() {
    const form = document.getElementById('contactForm');

    if (form) {
      const params = new URLSearchParams(window.location.search);
      const service = params.get('service') || '';
      const projectType = params.get('project_type') || '';

      if (service || projectType) {
        applyContactPrefill(form, service, projectType);
      }
    }

    document.querySelectorAll('[data-prefill-service], [data-prefill-project-type]').forEach((link) => {
      link.addEventListener('click', () => {
        applyContactPrefill(
          document.getElementById('contactForm'),
          link.dataset.prefillService || '',
          link.dataset.prefillProjectType || ''
        );
      });
    });
  }

  function initCampaignEstimator() {
    const root = document.querySelector('[data-campaign-estimator]');
    if (!root) {
      return;
    }

    const assumptions = {
      'google-search': {
        label: 'Google Search',
        model: 'cpc',
        lowCpc: 80,
        midCpc: 150,
        highCpc: 300,
        lowCtr: 0.03,
        highCtr: 0.08,
        bestFor: 'capturing people already searching',
        service: 'Google Ads Help',
        prefillService: 'Google Ads Walkthrough'
      },
      'youtube-awareness': {
        label: 'YouTube Awareness',
        model: 'cpm',
        lowCpm: 250,
        midCpm: 500,
        highCpm: 900,
        lowFrequency: 1.5,
        highFrequency: 3,
        bestFor: 'getting seen with video',
        service: 'Google Ads Help / YouTube Ads Support',
        prefillService: 'Google Ads Walkthrough'
      },
      'display-awareness': {
        label: 'Display Awareness',
        model: 'cpm',
        lowCpm: 200,
        midCpm: 450,
        highCpm: 800,
        lowFrequency: 2,
        highFrequency: 4,
        bestFor: 'low cost visibility and remarketing',
        service: 'Google Ads Help',
        prefillService: 'Google Ads Walkthrough'
      },
      'meta-awareness': {
        label: 'Meta Awareness',
        model: 'cpm',
        lowCpm: 250,
        midCpm: 600,
        highCpm: 1000,
        lowFrequency: 1.8,
        highFrequency: 3.5,
        bestFor: 'Facebook and Instagram visibility',
        service: 'Meta Ads Support',
        prefillService: 'Meta Ads Walkthrough'
      }
    };

    const budgetRange = root.querySelector('[data-estimator-budget-range]');
    const budgetInput = root.querySelector('[data-estimator-budget-input]');
    const budgetButtons = Array.from(root.querySelectorAll('[data-estimator-budget]'));
    const typeButtons = Array.from(root.querySelectorAll('[data-estimator-type]'));
    const summary = root.querySelector('[data-estimator-summary]');
    const resultsGrid = root.querySelector('[data-estimator-results]');
    const clicksCard = root.querySelector('[data-estimator-clicks-card]');
    const reachCard = root.querySelector('[data-estimator-reach-card]');
    const clicksValue = root.querySelector('[data-estimator-clicks]');
    const impressionsValue = root.querySelector('[data-estimator-impressions]');
    const reachValue = root.querySelector('[data-estimator-reach]');
    const bestFor = root.querySelector('[data-estimator-best-for]');
    const service = root.querySelector('[data-estimator-service]');
    const planCta = root.querySelector('[data-estimator-plan]');

    let currentBudget = Number(budgetInput && budgetInput.value) || 50000;
    let currentType = 'google-search';
    let currentEstimate = {};
    let updateTimer;

    function roundMetric(value) {
      if (!Number.isFinite(value)) {
        return 0;
      }
      if (value >= 10000) {
        return Math.round(value / 1000) * 1000;
      }
      if (value >= 1000) {
        return Math.round(value / 100) * 100;
      }
      return Math.round(value);
    }

    function formatNumber(value) {
      const rounded = roundMetric(value);
      if (rounded >= 1000000) {
        const millions = rounded / 1000000;
        return `${Number.isInteger(millions) ? millions : millions.toFixed(1)}M`;
      }
      if (rounded >= 1000) {
        const thousands = rounded / 1000;
        return `${Number.isInteger(thousands) ? thousands : thousands.toFixed(1)}K`;
      }
      return rounded.toLocaleString('en-US');
    }

    function formatRange(low, high) {
      return `${formatNumber(low)} - ${formatNumber(high)}`;
    }

    function formatBudget(value) {
      return `JMD $${Math.round(value).toLocaleString('en-US')}`;
    }

    function estimateBudget(budget, type) {
      const config = assumptions[type] || assumptions['google-search'];

      if (config.model === 'cpc') {
        const clicksLow = budget / config.highCpc;
        const clicksHigh = budget / config.lowCpc;
        const impressionsLow = clicksLow / config.highCtr;
        const impressionsHigh = clicksHigh / config.lowCtr;

        return {
          config,
          clicksLow: roundMetric(clicksLow),
          clicksHigh: roundMetric(clicksHigh),
          impressionsLow: roundMetric(impressionsLow),
          impressionsHigh: roundMetric(impressionsHigh),
          reachLow: '',
          reachHigh: ''
        };
      }

      const impressionsLow = (budget / config.highCpm) * 1000;
      const impressionsHigh = (budget / config.lowCpm) * 1000;
      const reachLow = impressionsLow / config.highFrequency;
      const reachHigh = impressionsHigh / config.lowFrequency;

      return {
        config,
        clicksLow: '',
        clicksHigh: '',
        impressionsLow: roundMetric(impressionsLow),
        impressionsHigh: roundMetric(impressionsHigh),
        reachLow: roundMetric(reachLow),
        reachHigh: roundMetric(reachHigh)
      };
    }

    function setEstimatorHiddenFields() {
      const form = document.getElementById('contactForm');
      if (!form || !currentEstimate.config) {
        return;
      }

      const values = {
        estimator_budget: formatBudget(currentBudget),
        estimator_campaign_type: currentEstimate.config.label,
        estimator_impressions_low: currentEstimate.impressionsLow,
        estimator_impressions_high: currentEstimate.impressionsHigh,
        estimator_clicks_low: currentEstimate.clicksLow,
        estimator_clicks_high: currentEstimate.clicksHigh,
        estimator_reach_low: currentEstimate.reachLow,
        estimator_reach_high: currentEstimate.reachHigh
      };

      Object.keys(values).forEach((key) => {
        const field = form.querySelector(`[data-estimator-field="${key}"]`);
        if (field) {
          field.value = values[key] || '';
        }
      });
    }

    function updateBudgetControls() {
      if (budgetInput) {
        budgetInput.value = Math.round(currentBudget);
      }
      if (budgetRange) {
        const min = Number(budgetRange.min) || 15000;
        const max = Number(budgetRange.max) || 200000;
        budgetRange.value = Math.min(max, Math.max(min, currentBudget));
      }

      budgetButtons.forEach((button) => {
        button.classList.toggle('is-active', Number(button.dataset.estimatorBudget) === currentBudget);
      });
    }

    function updateTypeControls() {
      typeButtons.forEach((button) => {
        const isActive = button.dataset.estimatorType === currentType;
        button.classList.toggle('is-active', isActive);
        button.setAttribute('aria-pressed', isActive ? 'true' : 'false');
      });
    }

    function renderEstimate() {
      currentEstimate = estimateBudget(currentBudget, currentType);
      const { config } = currentEstimate;

      if (summary) {
        summary.textContent = `Based on ${formatBudget(currentBudget)}, this ${config.label} campaign could roughly generate...`;
      }

      if (config.model === 'cpc') {
        if (clicksCard) {
          clicksCard.hidden = false;
        }
        if (reachCard) {
          reachCard.hidden = true;
        }
        if (clicksValue) {
          clicksValue.textContent = formatRange(currentEstimate.clicksLow, currentEstimate.clicksHigh);
        }
      } else {
        if (clicksCard) {
          clicksCard.hidden = true;
        }
        if (reachCard) {
          reachCard.hidden = false;
        }
        if (reachValue) {
          reachValue.textContent = formatRange(currentEstimate.reachLow, currentEstimate.reachHigh);
        }
      }

      if (impressionsValue) {
        impressionsValue.textContent = formatRange(currentEstimate.impressionsLow, currentEstimate.impressionsHigh);
      }
      if (bestFor) {
        bestFor.textContent = config.bestFor;
      }
      if (service) {
        service.textContent = config.service;
      }
      if (planCta) {
        planCta.dataset.prefillService = config.prefillService;
        planCta.dataset.prefillProjectType = 'Need advice first';
      }

      setEstimatorHiddenFields();

      if (resultsGrid) {
        resultsGrid.classList.remove('is-updating');
        window.clearTimeout(updateTimer);
        window.requestAnimationFrame(() => {
          resultsGrid.classList.add('is-updating');
          updateTimer = window.setTimeout(() => resultsGrid.classList.remove('is-updating'), 260);
        });
      }
    }

    function setBudget(value) {
      const nextBudget = Math.max(1000, Number(value) || 50000);
      currentBudget = nextBudget;
      updateBudgetControls();
      renderEstimate();
    }

    if (budgetRange) {
      budgetRange.addEventListener('input', () => setBudget(budgetRange.value));
    }

    if (budgetInput) {
      budgetInput.addEventListener('input', () => setBudget(budgetInput.value));
    }

    budgetButtons.forEach((button) => {
      button.addEventListener('click', () => setBudget(button.dataset.estimatorBudget));
    });

    typeButtons.forEach((button) => {
      button.addEventListener('click', () => {
        currentType = button.dataset.estimatorType || 'google-search';
        updateTypeControls();
        renderEstimate();
      });
    });

    if (planCta) {
      planCta.addEventListener('click', () => {
        setEstimatorHiddenFields();
        applyContactPrefill(
          document.getElementById('contactForm'),
          planCta.dataset.prefillService || 'Google Ads Walkthrough',
          planCta.dataset.prefillProjectType || 'Need advice first'
        );
      });
    }

    updateBudgetControls();
    updateTypeControls();
    renderEstimate();
  }

  function initKahniIntro() {
    const videos = Array.from(document.querySelectorAll('[data-kahni-video]'));
    const prefersReducedMotion = window.matchMedia
      ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
      : false;

    if (videos.length && !prefersReducedMotion) {
      if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver((entries) => {
          entries.forEach((entry) => {
            const video = entry.target;
            if (entry.isIntersecting) {
              video.play().catch(() => {});
            } else {
              video.pause();
            }
          });
        }, { threshold: 0.35 });

        videos.forEach((video) => observer.observe(video));
      } else {
        videos.forEach((video) => video.play().catch(() => {}));
      }
    }

    document.querySelectorAll('[data-kahni-start]').forEach((link) => {
      link.addEventListener('click', (event) => {
        event.preventDefault();

        const matchSection = document.getElementById('start-here');
        const startButton = document.querySelector('[data-match-start]');

        if (matchSection) {
          matchSection.scrollIntoView({
            behavior: prefersReducedMotion ? 'auto' : 'smooth',
            block: 'start'
          });
        }

        window.setTimeout(() => {
          if (startButton && !startButton.closest('[hidden]')) {
            startButton.click();
          }
        }, prefersReducedMotion ? 0 : 420);
      });
    });
  }

  function initProjectMatch() {
    const root = document.querySelector('[data-project-match]');
    if (!root) {
      return;
    }

    const intro = root.querySelector('[data-match-intro]');
    const quiz = root.querySelector('[data-match-quiz]');
    const resultContainer = root.querySelector('[data-match-result]');
    const startButton = root.querySelector('[data-match-start]');
    const backButton = root.querySelector('[data-match-back]');
    const nextButton = root.querySelector('[data-match-next]');
    const questionElement = root.querySelector('[data-match-question]');
    const optionsElement = root.querySelector('[data-match-options]');
    const stepLabel = root.querySelector('[data-match-step-label]');
    const progress = root.querySelector('[data-match-progress]');
    const helperBubble = root.querySelector('[data-match-helper-bubble]');

    const steps = [
      {
        key: 'goal',
        question: 'What are you trying to do?',
        options: [
          ['google', 'Be found on Google'],
          ['youtube', 'Be seen on YouTube'],
          ['leads', 'Get more leads'],
          ['social', 'Improve social media visibility'],
          ['content', 'Get content to post'],
          ['landing', 'Build a landing page'],
          ['deck', 'Create a deck or proposal'],
          ['ongoing', 'Get ongoing marketing support'],
          ['unsure', 'I am not sure yet']
        ]
      },
      {
        key: 'stage',
        question: 'What stage are you at?',
        options: [
          ['advice', 'I need advice first'],
          ['offer', 'I already have an offer'],
          ['running_ads', 'I am already running ads'],
          ['have_content', 'I have footage or content already'],
          ['built', 'I need something built'],
          ['monthly', 'I need monthly help']
        ]
      },
      {
        key: 'need',
        question: 'What do you need most right now?',
        options: [
          ['plan', 'A clear plan'],
          ['campaign_setup', 'A campaign setup'],
          ['better_ads', 'Better ads'],
          ['landing_page', 'A landing page'],
          ['videos_content', 'Videos or content'],
          ['video_editing', 'Video editing'],
          ['presentation_deck', 'A presentation deck'],
          ['monthly_support', 'Monthly support']
        ]
      },
      {
        key: 'timeline',
        question: 'How soon do you need help?',
        options: [
          ['asap', 'As soon as possible'],
          ['this_week', 'This week'],
          ['this_month', 'This month'],
          ['no_rush', 'No rush'],
          ['not_sure', 'Not sure yet']
        ]
      }
    ];

    const results = {
      google: {
        service: 'Google Ads Help',
        copy: 'Best for search visibility, campaign setup, account reviews, and ongoing Google Ads support.',
        why: 'You want more search visibility and need a clearer campaign path before spending more.',
        nextStep: 'Book a Google Ads session or view the service page.',
        price: 'from JMD $12,000',
        cta: 'View Google Ads Help',
        href: 'google-ads-help.html'
      },
      youtube: {
        service: 'YouTube Ads Support via Google Ads Help',
        copy: 'Best for building awareness with video campaigns and getting your business in front of more people.',
        why: 'You want video visibility, so the best route is a Google Ads conversation focused on YouTube campaign direction.',
        nextStep: 'Send an enquiry and we can shape the right YouTube Ads starting point.',
        price: 'from JMD $12,000',
        cta: 'Ask About YouTube Ads',
        href: '#contact',
        prefillService: 'Google Ads Walkthrough',
        prefillProjectType: 'Need advice first'
      },
      leads: {
        service: 'Lead Generation Setup',
        copy: 'Best for combining a clear landing page with Google or Meta campaign support.',
        why: 'You want more enquiries, so the next move is to tighten the route from attention to action.',
        nextStep: 'Start with a clear landing page or campaign enquiry.',
        price: 'from JMD $30,000',
        cta: 'Start Lead Generation Enquiry',
        href: '#contact',
        prefillService: 'Landing Page Setup',
        prefillProjectType: 'Project based work'
      },
      social: {
        service: 'Meta Ads and Content Support',
        copy: 'Best for Facebook and Instagram campaigns, creative direction, and content support.',
        why: 'You want better social visibility, so the best fit is support across Meta Ads, creative direction, and content.',
        nextStep: 'Review the social and content support options.',
        price: 'by scope',
        cta: 'See Social and Content Help',
        href: '#services',
        openTab: 'monthly-support'
      },
      content: {
        service: 'Brand Content Kit',
        copy: 'Best for short form videos, content shoots, and social ready assets.',
        why: 'You need content you can actually post, so a compact batch of brand assets is the strongest starting point.',
        nextStep: 'Send a content enquiry and we can shape the shoot or asset list.',
        price: 'from JMD $25,000',
        cta: 'Ask About Brand Content Kit',
        href: '#contact',
        prefillService: 'Brand Content Kit',
        prefillProjectType: 'Project based work'
      },
      landing: {
        service: 'Landing Page Setup',
        copy: 'Best for launches, offers, lead forms, WhatsApp enquiries, and simple service pages.',
        why: 'You need somewhere focused to send traffic, explain the offer, and collect enquiries.',
        nextStep: 'Request a landing page and share the offer you want to promote.',
        price: 'from JMD $30,000',
        cta: 'Request a Landing Page',
        href: '#contact',
        prefillService: 'Landing Page Setup',
        prefillProjectType: 'Project based work'
      },
      deck: {
        service: 'Presentation Deck Design',
        copy: 'Best for pitch decks, reports, proposals, internal meetings, and business presentations.',
        why: 'You need to turn rough notes or ideas into a deck that is easier to present and understand.',
        nextStep: 'View the deck service page and share the deck you need cleaned up or built.',
        price: 'from JMD $15,000',
        cta: 'View Deck Design',
        href: 'presentation-deck-design.html'
      },
      ongoing: {
        service: 'Ongoing Marketing Support',
        copy: 'Best for monthly help with ads, content planning, reporting, and next steps.',
        why: 'You need consistent support rather than a one off fix, so monthly marketing support is the better path.',
        nextStep: 'Ask about monthly support and share what you want help with first.',
        price: 'by scope',
        cta: 'Ask About Monthly Support',
        href: '#contact',
        prefillService: 'Ongoing Marketing Support',
        prefillProjectType: 'Monthly support'
      },
      strategy: {
        service: 'Strategy Session or Marketing Audit',
        copy: 'Best if you need help deciding what to fix, build, or promote first.',
        why: 'You are still deciding the best move, so clarity should come before more spend.',
        nextStep: 'Book a strategy session or start with an audit.',
        price: 'from JMD $8,500',
        cta: 'Book a Strategy Session',
        href: 'strategy-call.html#contact',
        secondaryCta: 'Start with an Audit',
        secondaryHref: '#audit'
      }
    };

    const answers = {};
    let currentStep = 0;

    const helperBubbleCopy = [
      'What are you trying to grow?',
      'Nice. I&rsquo;m learning what your business needs.',
      'Almost there. Let&rsquo;s narrow it down.',
      'Got it. Let&rsquo;s find your best move.'
    ];

    function setHelperBubbleCopy(copy) {
      if (helperBubble) {
        helperBubble.innerHTML = copy;
      }
    }

    function getOptionLabel(stepKey, value) {
      const step = steps.find((item) => item.key === stepKey);
      const option = step ? step.options.find((item) => item[0] === value) : null;
      return option ? option[1] : '';
    }

    function getRecommendedResult() {
      if (answers.goal === 'unsure') {
        return results.strategy;
      }

      if (answers.stage === 'monthly' || answers.need === 'monthly_support') {
        if (answers.goal === 'social') {
          return results.social;
        }
        if (answers.goal === 'ongoing') {
          return results.ongoing;
        }
      }

      if (answers.stage === 'running_ads' && answers.need === 'better_ads') {
        if (answers.goal === 'social') {
          return results.social;
        }
        if (answers.goal === 'youtube') {
          return results.youtube;
        }
        if (answers.goal === 'google') {
          return results.google;
        }
      }

      if ((answers.goal === 'leads' && answers.need === 'landing_page') || answers.goal === 'landing') {
        return answers.goal === 'landing' ? results.landing : results.leads;
      }

      if (answers.goal === 'content' && (answers.need === 'videos_content' || answers.need === 'video_editing')) {
        return results.content;
      }

      return results[answers.goal] || results.strategy;
    }

    function setQuizHiddenFields(result) {
      const form = document.getElementById('contactForm');
      if (!form) {
        return;
      }

      const values = {
        recommended_service: result.service,
        quiz_goal: getOptionLabel('goal', answers.goal),
        quiz_stage: getOptionLabel('stage', answers.stage),
        quiz_need: getOptionLabel('need', answers.need),
        quiz_timeline: getOptionLabel('timeline', answers.timeline)
      };

      Object.keys(values).forEach((key) => {
        const field = form.querySelector(`[data-quiz-field="${key}"]`);
        if (field) {
          field.value = values[key] || '';
        }
      });

      setSelectOptionByText(form.querySelector('[name="timeline"]'), values.quiz_timeline);
    }

    function applyResultToContact(result) {
      const form = document.getElementById('contactForm');
      if (!form) {
        return;
      }

      setQuizHiddenFields(result);
      applyContactPrefill(form, result.prefillService || result.service, result.prefillProjectType || '');
    }

    function renderStep() {
      const step = steps[currentStep];
      const selectedValue = answers[step.key] || '';

      setHelperBubbleCopy(helperBubbleCopy[currentStep] || helperBubbleCopy[0]);
      stepLabel.textContent = `Step ${currentStep + 1} of ${steps.length}`;
      progress.style.width = `${((currentStep + 1) / steps.length) * 100}%`;
      questionElement.textContent = step.question;
      optionsElement.innerHTML = '';

      step.options.forEach(([value, label]) => {
        const button = document.createElement('button');
        button.type = 'button';
        button.className = `match-option${selectedValue === value ? ' is-selected' : ''}`;
        button.textContent = label;
        button.dataset.matchValue = value;
        button.setAttribute('aria-pressed', selectedValue === value ? 'true' : 'false');
        button.addEventListener('click', () => {
          answers[step.key] = value;
          renderStep();
          nextButton.focus();
        });
        optionsElement.appendChild(button);
      });

      backButton.disabled = currentStep === 0;
      nextButton.disabled = !answers[step.key];
      nextButton.textContent = currentStep === steps.length - 1 ? 'See My Match' : 'Next';
    }

    function renderResult() {
      const result = getRecommendedResult();
      setQuizHiddenFields(result);
      setHelperBubbleCopy('Here&rsquo;s your best next move.');

      quiz.hidden = true;
      resultContainer.hidden = false;
      resultContainer.innerHTML = `
        <div class="match-result-card">
          <span class="match-result-label">You unlocked your best next move.</span>
          <h3>${result.service}</h3>
          <p>${result.copy}</p>
          <ul>
            <li><strong>Why this fits:</strong> ${result.why}</li>
            <li><strong>Best next step:</strong> ${result.nextStep}</li>
            <li><strong>Starting price:</strong> ${result.price}</li>
          </ul>
          <div class="match-result-actions">
            <a class="match-result-primary" href="${result.href}" data-match-primary>${result.cta} &rarr;</a>
            ${result.secondaryCta ? `<a class="match-result-secondary" href="${result.secondaryHref}">${result.secondaryCta}</a>` : ''}
          </div>
          <button type="button" class="match-retake" data-match-retake>Retake Match</button>
        </div>
      `;

      const primaryCta = resultContainer.querySelector('[data-match-primary]');
      if (primaryCta) {
        if (result.openTab) {
          primaryCta.dataset.openTab = result.openTab;
        }
        if (result.prefillService) {
          primaryCta.dataset.prefillService = result.prefillService;
        }
        if (result.prefillProjectType) {
          primaryCta.dataset.prefillProjectType = result.prefillProjectType;
        }

        primaryCta.addEventListener('click', () => {
          if (result.openTab) {
            setActiveServiceTab(result.openTab, false);
          }
          if (result.href === '#contact') {
            applyResultToContact(result);
          }
        });
      }

      const retakeButton = resultContainer.querySelector('[data-match-retake]');
      if (retakeButton) {
        retakeButton.addEventListener('click', () => {
          Object.keys(answers).forEach((key) => delete answers[key]);
          currentStep = 0;
          resultContainer.hidden = true;
          quiz.hidden = false;
          renderStep();
        });
      }
    }

    if (startButton) {
      startButton.addEventListener('click', () => {
        intro.hidden = true;
        quiz.hidden = false;
        resultContainer.hidden = true;
        currentStep = 0;
        renderStep();
      });
    }

    if (backButton) {
      backButton.addEventListener('click', () => {
        if (currentStep > 0) {
          currentStep -= 1;
          renderStep();
        }
      });
    }

    if (nextButton) {
      nextButton.addEventListener('click', () => {
        if (!answers[steps[currentStep].key]) {
          return;
        }

        if (currentStep < steps.length - 1) {
          currentStep += 1;
          renderStep();
        } else {
          renderResult();
        }
      });
    }
  }

  function getStatusElement(form) {
    const statusElement = form.querySelector('.form-status');
    if (statusElement) {
      return statusElement;
    }

    const formParent = form.parentElement;
    return formParent ? formParent.querySelector('.form-status') : null;
  }

  function clearFormStatus(form) {
    const statusElement = getStatusElement(form);
    if (!statusElement) {
      return;
    }

    statusElement.textContent = '';
    statusElement.classList.remove('is-visible', 'is-success', 'is-error');
  }

  function showFormStatus(form, type, message) {
    const statusElement = getStatusElement(form);
    if (!statusElement) {
      return;
    }

    statusElement.textContent = message;
    statusElement.classList.remove('is-success', 'is-error');
    statusElement.classList.add('is-visible', type === 'success' ? 'is-success' : 'is-error');
  }

  function setFormLoading(form, isLoading) {
    const submitButton = form.querySelector('[type="submit"]');
    form.classList.toggle('is-loading', isLoading);

    if (!submitButton) {
      return;
    }

    if (!submitButton.dataset.defaultLabel) {
      submitButton.dataset.defaultLabel = submitButton.innerHTML;
    }

    submitButton.disabled = isLoading;
    submitButton.setAttribute('aria-busy', isLoading ? 'true' : 'false');
    submitButton.innerHTML = isLoading
      ? (submitButton.dataset.loadingText || 'Sending...')
      : submitButton.dataset.defaultLabel;
  }

  function appendLeadMetadata(formData, options) {
    formData.set('lead_source', options.leadSource);
    formData.set('referring_section', options.referringSection);
    formData.set('page_url', window.location.href);
    formData.set('page_title', document.title);
    formData.set('submitted_at', new Date().toISOString());

    if (document.referrer) {
      formData.set('referrer', document.referrer);
    }
  }

  async function submitLeadForm(form, config) {
    const formKey = form.dataset.formKey;
    const formConfig = config.forms[formKey];
    const endpoint = resolveFormEndpoint(config, formKey, formConfig);

    if (!endpoint) {
      return {
        ok: false,
        message: 'This form is not connected yet. Add the live Formspree IDs in assets/js/site-config.js before launch.'
      };
    }

    const formData = new FormData(form);
    const leadSource = form.dataset.leadSource || `${formKey}_form`;
    const referringSection = form.dataset.referringSection || formKey;

    appendLeadMetadata(formData, {
      leadSource,
      referringSection
    });

    if (formConfig.subject) {
      formData.set('_subject', formConfig.subject);
    }

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        body: formData,
        headers: {
          Accept: 'application/json'
        }
      });

      let payload = {};
      try {
        payload = await response.json();
      } catch {
        payload = {};
      }

      if (!response.ok) {
        const errorText = Array.isArray(payload.errors)
          ? payload.errors.map((item) => item.message).filter(Boolean).join(' ')
          : '';

        return {
          ok: false,
          message: errorText || formConfig.errorMessage || 'We could not send your request right now. Please try again.'
        };
      }

      return {
        ok: true,
        message: formConfig.successMessage || 'Thanks, your request was sent successfully.'
      };
    } catch {
      return {
        ok: false,
        message: 'Network error. Please try again or contact us directly by email.'
      };
    }
  }

  function initLeadForms(config) {
    document.querySelectorAll('.lead-form').forEach((form) => {
      form.addEventListener('submit', async (event) => {
        event.preventDefault();
        clearFormStatus(form);

        if (!validateForm(form)) {
          return;
        }

        setFormLoading(form, true);
        const result = await submitLeadForm(form, config);
        setFormLoading(form, false);

        if (result.ok) {
          showFormStatus(form, 'success', result.message);
          form.reset();
          form.querySelectorAll('input, textarea, select').forEach((field) => {
            field.setAttribute('aria-invalid', 'false');
          });

          trackEvent(form.dataset.trackSubmit || `submit_${form.dataset.formKey}`, {
            lead_source: form.dataset.leadSource || '',
            section: form.dataset.referringSection || ''
          });

          const closeDelay = Number.parseInt(form.dataset.closeOnSuccess || '', 10);
          if (Number.isFinite(closeDelay) && closeDelay > 0) {
            window.setTimeout(() => {
              const popup = document.getElementById('popupBg');
              if (popup && popup.classList.contains('show')) {
                window.closePopup();
              }
            }, closeDelay);
          }

          return;
        }

        showFormStatus(form, 'error', result.message);
      });
    });
  }

  function resolveFormEndpoint(config, formKey, formConfig) {
    const directEndpoint = formConfig && typeof formConfig.endpoint === 'string'
      ? formConfig.endpoint.trim()
      : '';

    if (directEndpoint && !directEndpoint.includes('YOUR_')) {
      return directEndpoint;
    }

    const formspree = config.integrations && config.integrations.formspree
      ? config.integrations.formspree
      : {};

    const formIdMap = {
      audit: formspree.auditFormId,
      contact: formspree.contactFormId,
      popup: formspree.auditFormId,
      newsletter: formspree.newsletterFormId
    };

    const formId = (formIdMap[formKey] || '').trim();
    return formId ? `https://formspree.io/f/${formId}` : '';
  }

  function initPopup() {
    let popupShown = window.sessionStorage.getItem('kh_popup');
    const popup = document.getElementById('popupBg');

    if (!popup) {
      return;
    }

    window.showPopup = function showPopup() {
      if (!popupShown) {
        popup.classList.add('show');
        window.sessionStorage.setItem('kh_popup', '1');
        popupShown = '1';
      }
    };

    window.closePopup = function closePopup() {
      popup.classList.remove('show');
    };

    document.addEventListener('mouseleave', (event) => {
      if (event.clientY <= 0) {
        window.showPopup();
      }
    });

    window.setTimeout(() => {
      if (!popupShown) {
        window.showPopup();
      }
    }, 50000);

    popup.addEventListener('click', (event) => {
      if (event.target === popup) {
        window.closePopup();
      }
    });
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function buildTrackedLink(href, label, eventName, isExternal) {
    const target = isExternal ? ' target="_blank" rel="noopener noreferrer"' : '';
    return `<a href="${escapeHtml(href)}" data-track="${escapeHtml(eventName)}"${target} style="color:var(--accent);">${escapeHtml(label)}</a>`;
  }

  function buildChatBookingLink(config) {
    const bookingHref = getBookingHref(config);
    return buildTrackedLink(bookingHref, 'book a free discovery call', 'click_book_call', isExternalUrl(bookingHref));
  }

  function buildChatWhatsAppLink(config) {
    return buildTrackedLink(getWhatsAppHref(config), 'message us on WhatsApp', 'click_whatsapp', true);
  }

  function initChatbot(config) {
    const chatPanel = document.getElementById('chatPanel');
    const chatMessages = document.getElementById('chatMsgs');
    const chatInput = document.getElementById('chatInp');

    if (!chatPanel || !chatMessages || !chatInput) {
      return;
    }

    let chatOpen = false;
    let chatStep = 0;
    let captureStep = '';
    const chatAnswers = {};
    const chatLead = {};

    const chatFlow = [
      {
        msg: 'What do you need help with right now?',
        choices: ['Quick advice / audit', 'Google or Meta ads', 'Deck or presentation', 'Landing page', 'Content shoot or editing', 'Monthly support']
      },
      {
        msg: 'How soon do you need this?',
        choices: ['As soon as possible', 'This week', 'This month', 'No rush', 'Not sure yet']
      },
      {
        msg: 'What budget range feels closest?',
        choices: ['Under $500/month', '$500-$1,500/month', '$1,500-$5,000/month', '$5,000+/month', 'Prefer to discuss']
      }
    ];

    function getRecommendation() {
      const need = chatAnswers.need || '';
      const budget = chatAnswers.budget || '';
      const timeline = chatAnswers.timeline || '';

      if (need.includes('Deck')) {
        return 'A <strong>presentation deck project</strong> looks like the right path. Send the goal, deadline, and any rough notes you already have.';
      }

      if (need.includes('Landing')) {
        return 'A <strong>landing page setup</strong> is likely the best fit. We can shape the page around one offer, one audience, and one enquiry action.';
      }

      if (need.includes('Content')) {
        return 'A <strong>content shoot or Brand Content Kit</strong> looks like a strong next step, especially if you need usable assets quickly.';
      }

      if (need.includes('Monthly')) {
        return 'You likely need <strong>ongoing marketing support</strong> with ads, content, reporting, and steady execution.';
      }

      if (need.includes('ads')) {
        return 'You likely need <strong>paid ads support</strong>. Start with a walkthrough or audit if things are unclear, or management if you are ready for ongoing optimisation.';
      }

      if (budget.includes('Under') || timeline.includes('Not sure')) {
        return 'A <strong>free discovery call, strategy session, or marketing audit</strong> is a sensible first move before committing to a bigger project.';
      }

      return 'A <strong>strategy session</strong> looks like the best next step, with room to move into project work or monthly support when the scope is clear.';
    }

    function getLeadService() {
      const need = chatAnswers.need || '';

      if (need.includes('Deck')) return 'Presentation Deck Design';
      if (need.includes('Landing')) return 'Landing Page Setup';
      if (need.includes('Content')) return 'Content Shoot';
      if (need.includes('Monthly')) return 'Ongoing Marketing Support';
      if (need.includes('ads')) return 'Google Ads Management';
      if (need.includes('Quick')) return 'Strategy Session';

      return 'Not sure yet';
    }

    function getLeadProjectType() {
      const need = chatAnswers.need || '';

      if (need.includes('Monthly')) return 'Monthly support';
      if (need.includes('Quick')) return 'Need advice first';
      return 'Project based work';
    }

    function buildLeadSummary() {
      const lines = [
        'Kahnec Hub project enquiry',
        `Need: ${chatAnswers.need || 'Not sure yet'}`,
        `Timeline: ${chatAnswers.timeline || 'Not sure yet'}`,
        `Budget: ${chatAnswers.budget || 'Prefer to discuss'}`,
        `Name: ${chatLead.name || ''}`,
        `Contact: ${chatLead.contact || ''}`
      ];

      if (chatLead.details) {
        lines.push(`Extra details: ${chatLead.details}`);
      }

      return lines.filter((line) => !line.endsWith(': ')).join('\n');
    }

    function getWhatsAppLeadHref() {
      const baseHref = getWhatsAppHref(config);
      const separator = baseHref.includes('?') ? '&' : '?';
      return `${baseHref}${separator}text=${encodeURIComponent(buildLeadSummary())}`;
    }

    function setSelectByText(select, text) {
      if (!select || !text) {
        return;
      }

      setSelectOptionByText(select, text);
    }

    function applyChatLeadToForm() {
      const form = document.getElementById('contactForm');

      if (!form) {
        try {
          window.sessionStorage.setItem('kh_chat_lead', JSON.stringify({ chatAnswers, chatLead }));
        } catch {
          // Session storage is optional.
        }

        window.location.href = 'index.html#contact';
        return;
      }

      const nameField = form.querySelector('[name="name"]');
      const emailField = form.querySelector('[name="email"]');
      const messageField = form.querySelector('[name="message"]');

      if (nameField && chatLead.name) {
        nameField.value = chatLead.name;
      }

      if (emailField && EMAIL_PATTERN.test(chatLead.contact || '')) {
        emailField.value = chatLead.contact;
      }

      setSelectByText(form.querySelector('[name="budget"]'), chatAnswers.budget);
      setSelectByText(form.querySelector('[name="timeline"]'), chatAnswers.timeline);
      setSelectByText(form.querySelector('[name="service"]'), getLeadService());
      setSelectByText(form.querySelector('[name="project_type"]'), getLeadProjectType());

      if (messageField) {
        messageField.value = buildLeadSummary();
        messageField.dispatchEvent(new Event('input', { bubbles: true }));
      }

      form.querySelectorAll('input, textarea, select').forEach((field) => {
        field.setAttribute('aria-invalid', 'false');
      });

      const contactSection = document.getElementById('contact');
      if (contactSection) {
        contactSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }

      addChatMessage('I added your chat details to the enquiry form. You can review it and send when ready.', 'bot');
    }

    function applyStoredChatLead() {
      let storedLead = null;

      try {
        storedLead = JSON.parse(window.sessionStorage.getItem('kh_chat_lead') || 'null');
        window.sessionStorage.removeItem('kh_chat_lead');
      } catch {
        storedLead = null;
      }

      if (!storedLead || window.location.hash !== '#contact') {
        return;
      }

      Object.assign(chatAnswers, storedLead.chatAnswers || {});
      Object.assign(chatLead, storedLead.chatLead || {});
      window.setTimeout(applyChatLeadToForm, 350);
    }

    function addChatMessage(text, role) {
      const element = document.createElement('div');
      element.className = `cm ${role}`;
      element.innerHTML = text;
      chatMessages.appendChild(element);
      chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    function addChatChoices(items, onSelect) {
      const row = document.createElement('div');
      row.className = 'chat-choices';
      row.id = 'chatChoices';

      items.forEach((choice) => {
        const button = document.createElement('button');
        button.className = 'cch';
        button.type = 'button';
        button.textContent = choice;
        button.addEventListener('click', () => {
          row.remove();
          if (typeof onSelect === 'function') {
            onSelect(choice);
            return;
          }

          handleChatChoice(choice);
        });
        row.appendChild(button);
      });

      chatMessages.appendChild(row);
      chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    function addLeadActions() {
      const row = document.createElement('div');
      row.className = 'chat-choices';

      const formButton = document.createElement('button');
      formButton.className = 'cch';
      formButton.type = 'button';
      formButton.textContent = 'Fill enquiry form';
      formButton.addEventListener('click', applyChatLeadToForm);

      const whatsAppLink = document.createElement('a');
      whatsAppLink.className = 'cch chat-link-choice';
      whatsAppLink.href = getWhatsAppLeadHref();
      whatsAppLink.target = '_blank';
      whatsAppLink.rel = 'noopener noreferrer';
      whatsAppLink.textContent = 'Open WhatsApp summary';
      whatsAppLink.setAttribute('data-track', 'click_whatsapp');
      whatsAppLink.setAttribute('data-track-location', 'chat_lead_summary');

      row.appendChild(formButton);
      row.appendChild(whatsAppLink);
      chatMessages.appendChild(row);
      chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    function addTypingIndicator() {
      const element = document.createElement('div');
      element.className = 'chat-typing';
      element.id = 'chatTyping';
      element.innerHTML = '<div class="tdot"></div><div class="tdot"></div><div class="tdot"></div>';
      chatMessages.appendChild(element);
      chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    function removeTypingIndicator() {
      const typingElement = document.getElementById('chatTyping');
      if (typingElement) {
        typingElement.remove();
      }
    }

    function handleChatChoice(choice) {
      const choicesElement = document.getElementById('chatChoices');
      if (choicesElement) {
        choicesElement.remove();
      }

      addChatMessage(choice, 'user');

      if (chatStep === 0) {
        chatAnswers.need = choice;
      }
      if (chatStep === 1) {
        chatAnswers.timeline = choice;
      }
      if (chatStep === 2) {
        chatAnswers.budget = choice;
      }

      chatStep += 1;

      window.setTimeout(() => {
        addTypingIndicator();
        window.setTimeout(() => {
          removeTypingIndicator();

          if (chatStep < chatFlow.length) {
            addChatMessage(chatFlow[chatStep].msg, 'bot');
            window.setTimeout(() => addChatChoices(chatFlow[chatStep].choices), 200);
            return;
          }

          addChatMessage(getRecommendation(), 'bot');
          window.setTimeout(() => {
            addChatMessage('Want to turn this into a quick enquiry?', 'bot');
            window.setTimeout(() => {
              addChatChoices(['Yes, build my enquiry', 'No, show me the links'], handleLeadPromptChoice);
            }, 200);
          }, 600);
        }, 900);
      }, 200);
    }

    function handleLeadPromptChoice(choice) {
      addChatMessage(choice, 'user');

      if (!choice.includes('Yes')) {
        window.setTimeout(() => {
          addChatMessage(
            `No problem. Best next step: ${buildChatBookingLink(config)} or ${buildChatWhatsAppLink(config)}.`,
            'bot'
          );
        }, 500);
        return;
      }

      captureStep = 'name';
      window.setTimeout(() => {
        addChatMessage('Great. What name should we put on the enquiry?', 'bot');
      }, 500);
    }

    function handleLeadInput(value) {
      if (captureStep === 'name') {
        chatLead.name = value;
        captureStep = 'contact';
        addChatMessage(escapeHtml(value), 'user');
        window.setTimeout(() => {
          addChatMessage('What is the best email or WhatsApp number to reply to?', 'bot');
        }, 500);
        return;
      }

      if (captureStep === 'contact') {
        chatLead.contact = value;
        captureStep = 'details';
        addChatMessage(escapeHtml(value), 'user');
        window.setTimeout(() => {
          addChatMessage('Last thing: add one sentence about what you need, or type "skip".', 'bot');
        }, 500);
        return;
      }

      if (captureStep === 'details') {
        chatLead.details = value.toLowerCase() === 'skip' ? '' : value;
        captureStep = '';
        addChatMessage(escapeHtml(value), 'user');
        window.setTimeout(() => {
          addChatMessage('Done. I prepared a short project enquiry from your answers.', 'bot');
          addLeadActions();
        }, 500);
      }
    }

    window.sendChat = function sendChat() {
      const value = chatInput.value.trim();
      if (!value) {
        return;
      }

      const choicesElement = document.getElementById('chatChoices');
      if (choicesElement) {
        choicesElement.remove();
      }

      chatInput.value = '';

      if (captureStep) {
        handleLeadInput(value);
        return;
      }

      addChatMessage(escapeHtml(value), 'user');

      window.setTimeout(() => {
        addTypingIndicator();
        window.setTimeout(() => {
          removeTypingIndicator();
          addChatMessage(
            `Thanks for reaching out. The fastest way forward is to ${buildChatBookingLink(config)} or ${buildChatWhatsAppLink(config)}.`,
            'bot'
          );
        }, 900);
      }, 200);
    };

    window.toggleChat = function toggleChat() {
      chatOpen = !chatOpen;
      chatPanel.classList.toggle('open', chatOpen);

      if (chatOpen && chatStep === 0 && !chatMessages.children.length) {
        window.setTimeout(() => {
          addTypingIndicator();
          window.setTimeout(() => {
            removeTypingIndicator();
            addChatMessage(chatFlow[0].msg, 'bot');
            window.setTimeout(() => addChatChoices(chatFlow[0].choices), 200);
          }, 1000);
        }, 300);
      }
    };

    applyStoredChatLead();

    chatInput.addEventListener('keydown', (event) => {
      if (event.key === 'Enter') {
        window.sendChat();
      }
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    const config = getConfig();
    initAnalytics(config);
    applySiteConfig(config);
    initTracking();
    initNav();
    initServiceTabs();
    initProgressiveAccordions();
    initMotionClasses();
    initReveal();
    initCounters();
    initFieldValidation();
    initEnquiryPrefill();
    initProjectMatch();
    initKahniIntro();
    initCampaignEstimator();
    initLeadForms(config);
    initPopup();
    initChatbot(config);
  });
})();
