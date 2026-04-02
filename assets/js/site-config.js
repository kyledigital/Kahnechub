window.KH_CONFIG = {
  // Update these business details in one place.
  businessName: 'Kahnec Hub',
  founderName: 'Kyle Hector',

  // Leave blank to keep strategy call buttons pointing to the contact section.
  bookingLink: '',
  fallbackBookingHref: '#contact',

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

  // Replace these placeholder endpoints before going live.
  forms: {
    audit: {
      endpoint: 'https://formspree.io/f/YOUR_AUDIT_FORM_ID',
      subject: 'Free Audit Request - Kahnec Hub',
      successMessage: 'Thanks, your free audit request is in. We will review it and reply within 48 hours.',
      errorMessage: 'We could not send your audit request right now. Please try again or reach out by email.'
    },
    contact: {
      endpoint: 'https://formspree.io/f/YOUR_CONTACT_FORM_ID',
      subject: 'New Service Enquiry - Kahnec Hub',
      successMessage: 'Thanks, your enquiry is in. We will reply with next steps within 24 hours.',
      errorMessage: 'We could not send your enquiry right now. Please try again or email us directly.'
    },
    popup: {
      endpoint: 'https://formspree.io/f/YOUR_AUDIT_FORM_ID',
      subject: 'Popup Free Audit Request - Kahnec Hub',
      successMessage: 'Thanks, your audit request is in. We will follow up shortly.',
      errorMessage: 'We could not send your popup request right now. Please try again in the main audit form.'
    },
    newsletter: {
      endpoint: 'https://formspree.io/f/YOUR_NEWSLETTER_FORM_ID',
      subject: 'Newsletter Signup - Kahnec Hub',
      successMessage: 'You are subscribed. Expect useful growth insights and updates.',
      errorMessage: 'We could not add you right now. Please try again in a moment.'
    }
  }
};
