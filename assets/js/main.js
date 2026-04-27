/* ============================================================
   Kahnec Hub - Main JavaScript
   Shared config, lead capture, CTA tracking, and UI behavior
   ============================================================ */

(function () {
  const DEFAULT_CONFIG = {
    businessName: 'Kahnec Hub',
    founderName: 'Kyle Hector',
    bookingLink: '',
    fallbackBookingHref: 'strategy-call.html#contact',
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
    return bookingLink || config.fallbackBookingHref || '#contact';
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

  function initReveal() {
    const revealElements = document.querySelectorAll('.reveal');
    if (!revealElements.length) {
      return;
    }

    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
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

  function initEnquiryPrefill() {
    document.querySelectorAll('[data-prefill-service], [data-prefill-project-type]').forEach((link) => {
      link.addEventListener('click', () => {
        const form = document.getElementById('contactForm');
        if (!form) {
          return;
        }

        const service = link.dataset.prefillService || '';
        const projectType = link.dataset.prefillProjectType || '';
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
      });
    });
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
    return buildTrackedLink(bookingHref, 'book a strategy call', 'click_book_call', isExternalUrl(bookingHref));
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
        return 'A <strong>strategy call or marketing audit</strong> is a sensible first move before committing to a bigger project.';
      }

      return 'A <strong>strategy call</strong> looks like the best next step, with room to move into project work or monthly support when the scope is clear.';
    }

    function getLeadService() {
      const need = chatAnswers.need || '';

      if (need.includes('Deck')) return 'Presentation Deck Design';
      if (need.includes('Landing')) return 'Landing Page Setup';
      if (need.includes('Content')) return 'Content Shoot';
      if (need.includes('Monthly')) return 'Ongoing Marketing Support';
      if (need.includes('ads')) return 'Google Ads Management';
      if (need.includes('Quick')) return 'Strategy Call';

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
    initReveal();
    initCounters();
    initFieldValidation();
    initEnquiryPrefill();
    initLeadForms(config);
    initPopup();
    initChatbot(config);
  });
})();
