window.KH_CONFIG = {
  // Update these business details in one place.
  businessName: 'Kahnec Hub',
  founderName: 'Kyle Hector',

  // Add your live scheduler URL here when ready (Calendly, TidyCal, etc.).
  // Leave blank to keep strategy call buttons pointing to the strategy call page.
  bookingLink: '',
  fallbackBookingHref: 'strategy-call.html#contact',

  // Used in contact copy and follow-up messaging.
  responseTimeText: 'within 24 hours',

  contact: {
    email: 'kylehector12@gmail.com',
    // Digits only. No spaces or leading plus sign.
    // If you enter a 10-digit Jamaica number, the site will prepend country code 1.
    whatsappNumber: '8768547105',
    instagramHandle: '@kahnec_withkyle',
    instagramUrl: 'https://www.instagram.com/kahnec_withkyle',
    linkedinUrl: 'https://www.linkedin.com/in/kyle-hector'
  },

  // Paste your live IDs here before launch.
  integrations: {
    formspree: {
      // Example: xpwqdoqn
      auditFormId: 'xjgjznbp',
      contactFormId: 'mwvazgeb',
      newsletterFormId: 'xeevdyqj'
    },
    analytics: {
      // Example: G-ABC123XYZ9
      googleAnalyticsId: '',
      // Example: kahnechub.com
      plausibleDomain: '',
      // Example: https://plausible.io/js/script.js
      plausibleScriptUrl: '',
      // Example: 11111111-2222-3333-4444-555555555555
      umamiWebsiteId: '',
      // Example: https://cloud.umami.is/script.js
      umamiScriptUrl: ''
    }
  },

  // Form endpoints can still be set directly, but form IDs above are easier to maintain.
  forms: {
    audit: {
      subject: 'Free Audit Request - Kahnec Hub',
      successMessage: 'Thanks, your free audit request is in. We will review it and reply within 48 hours.',
      errorMessage: 'We could not send your audit request right now. Please try again or reach out by email.'
    },
    contact: {
      subject: 'New Service Enquiry - Kahnec Hub',
      successMessage: 'Thanks, your enquiry is in. We will reply with next steps within 24 hours.',
      errorMessage: 'We could not send your enquiry right now. Please try again or email us directly.'
    },
    popup: {
      subject: 'Popup Free Audit Request - Kahnec Hub',
      successMessage: 'Thanks, your audit request is in. We will follow up shortly.',
      errorMessage: 'We could not send your popup request right now. Please try again in the main audit form.'
    },
    newsletter: {
      subject: 'Newsletter Signup - Kahnec Hub',
      successMessage: 'You are subscribed. Expect useful growth insights and updates.',
      errorMessage: 'We could not add you right now. Please try again in a moment.'
    }
  }
};
