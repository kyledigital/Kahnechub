window.KH_CONFIG = {
  // Update these business details in one place.
  businessName: 'Kahnec Hub',
  founderName: 'Kyle Hector',

  // Add your live scheduler URL here when ready (Calendly, TidyCal, etc.).
  // Leave blank to send free discovery call buttons to the main contact form.
  bookingLink: 'https://calendly.com/kylehector/15min',
  fallbackBookingHref: 'index.html?service=Free%20Discovery%20Call&project_type=Need%20advice%20first#contact',

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
      subject: 'Paid Audit Enquiry - Kahnec Hub',
      successMessage: 'Thanks, your enquiry is in. Kyle will follow up to discuss the scope and fee before any audit work begins.',
      errorMessage: 'We could not send your audit request right now. Please try again or reach out by email.'
    },
    contact: {
      subject: 'New Service Enquiry - Kahnec Hub',
      successMessage: 'Thanks, your enquiry has been sent. Kyle will follow up with the next step.',
      errorMessage: 'We could not send your enquiry right now. Please try again or email us directly.'
    },
    popup: {
      subject: 'Marketing Enquiry - Kahnec Hub',
      successMessage: 'Thanks, your enquiry is in. Kyle will follow up to discuss an appropriate next step.',
      errorMessage: 'We could not send your popup request right now. Please try again in the main audit form.'
    },
    newsletter: {
      subject: 'Newsletter Signup - Kahnec Hub',
      successMessage: 'You are subscribed. Expect useful growth insights and updates.',
      errorMessage: 'We could not add you right now. Please try again in a moment.'
    }
  }
};

