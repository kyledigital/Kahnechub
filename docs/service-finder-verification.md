# Service finder verification

Current-run evidence is in ignored `output/audit/` and `output/guide/`. The implementation is a separate preview based on preserved publication commit c68c5140e3fbab63a6edb67a160a2af5d9c866d2.

1. First screen and real work: healthy. The original paid-advertising live page was captured alongside the approved website-led preview. The new preview keeps the real VWPlus hero, adds a deliberate guide entry, and preserves direct WhatsApp and existing-site review. All three project selectors update the image, live link and explicit contribution. Screens: local-01-home-1440.png, local-01-home-390.png, local-02-services-1440.png.
2. Goal selection: healthy. Six native radio choices, explicit Continue, visible Close and direct contact; no automatic popup. Empty selection gives a concise error. Keyboard arrows, Tab/Shift+Tab, modal containment, Escape and focus return pass. Screens: local-03-goal-1440.png, local-03-goal-390.png.
3. Situation: healthy. One tailored question, optional timing/context and optional content/ads for website enquiries. Closing and reopening preserves page-memory progress. Back and restart work. Screens: local-04-situation-1440.png, local-04-situation-390.png.
4. Recommendation and evidence: healthy. All 24 goal/situation routes pass. Existing-site improvements begin with a review. A suitable existing site supports a promotion discussion; social-only businesses get an enquiry-route discussion. Learning uses the Yello prototype with explicit employment attribution. AI and unsure routes point to Kyle's background rather than fabricated workshop outcomes.
5. Review and WhatsApp: healthy. Drafts can be edited, copied and opened intentionally at `wa.me/18768547105?text=...`. Unicode, newlines, quotes, ampersands, percentages, empty drafts and bounded long inputs pass. An edited draft survives answer changes until the visitor explicitly updates it. The disclosure stays visible beside the action area: opening WhatsApp shares the draft; the user decides whether to send. Screens: local-05-draft-1440.png, local-05-draft-390.png.

Six widths/heights tested: 1440x900, 1024x768, 768x1024, 430x932, 390x844 and 320x640. No horizontal overflow, JavaScript errors or automated axe violations were detected across the closed page and all guide stages. Guide use adds no browser storage and performs no answer submissions or AI/API requests. Two WhatsApp opens were intercepted by the test; no actual message was sent. The JavaScript-off fallback keeps direct WhatsApp and review links visible.

The repeat/interruption test found that native dialog close events can be queued after a quick reopen. Cleanup now occurs synchronously on Close/Escape, and a stale close event cannot unlock or refocus a newly opened guide.

Regression checks pass at 1440 and 390px: all three website examples in desktop/mobile modes, all four service panels, enquiry prefills, preservation of custom form text, WhatsApp, booking link, mobile menu, archery replay, reduced motion and public supporting routes. Existing Formspree success/error states were tested with mocked submissions; no real enquiry was sent.

Limits: suggestions are fixed starting points, not a live conversation or a commitment to a scope/price. Automated checks do not establish full accessibility compliance. WhatsApp account availability/delivery and real form delivery were not exercised. Physical iOS/Android keyboard behaviour was not tested. Hosted preview verification is recorded separately in `output/guide/hosted-qa-report.json`.

Preview only. No retry of main publication, no domain/security change and no personal portfolio update.
