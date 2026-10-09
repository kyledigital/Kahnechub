# Apple interface treatment

Primary mode: Premium Commercial, with Product principles for the service, preview and enquiry controls.

The objective is to make choosing and enquiring about website work, paid advertising, learning materials, workshops and custom projects feel calm, clear and responsive. Visitors should still understand “I build websites and manage ads” immediately. Real project screenshots, Kyle's background and the attributed learning prototype carry the proof.

The visual idea is a quiet studio around working examples: white and cool gray surfaces, Kahnec violet for actions, natural system typography, generous but useful spacing, and translucent navigation above solid content. Existing explanatory SVGs and the net scene remain the distinctive moments. Decorative background forms remain subdued and finite.

The user-requested reference is https://github.com/emilkowalski/skills/blob/main/skills/apple-design/SKILL.md. Apply its immediate feedback, interruptible critically damped motion, spatial consistency, system typography and accessibility principles to the existing static site. Native HTML semantics and the current content and service routes remain authoritative.

System: system-ui body text, 16–18px readable copy, tighter large headings, 8px spacing rhythm, 1184px containers, 16–24px surface corners, neutral borders, violet action/focus and green WhatsApp. Content has solid surfaces; translucency is reserved for navigation and the modal task. Mobile uses a compact header, touch-sized controls and stacked compositions.

Motion: selected surfaces follow service/project/device choices with independent critically damped X/Y springs. Targets can change before settling; current position and velocity are retained. Press feedback starts on pointer/keyboard down. Animation frames stop when settled, hidden, globally paused or reduced motion is requested. No new library, media or renderer is required.

Conversion: retain the separate website and advertising actions, existing-site review, editable finder draft, scoped custom enquiry, booking and floating WhatsApp access. Preserve all labels, disclosures, prices, client attribution and contact details. Verify the whole enquiry journey, responsive composition, contrast, zoom/reflow, interruption, pause and reduced-motion/transparency modes.

## Verification and quality review

Chrome checks passed at 1440, 1024, 768, 430, 390 and 320 CSS pixels. All four service panels, project/device selections, modal bounds, mobile menu and static JavaScript-off presentation passed. Axe reported zero violations in the checked homepage states and all eleven supporting pages. The existing 28 finder paths, legacy advertising-prefill alias, visitor-written message preservation and mocked form success also passed.

Motion checks confirm input-down feedback, selection re-targeting from the current position, complete selection after interruption, global pause, reduced motion, reduced transparency and increased contrast. The native frame scheduler has no pending frames after settling. The modal pauses the net video and background illustrations, then allows playback to resume after close. The text-size reflow check used a 200% root font size at desktop width.

The isolated interaction sample observed approximately 0.015 cumulative layout shift, no long tasks of 50ms or more, and zero pending animation frames at idle. The new interface CSS and JS total approximately 7.6KB using a local gzip estimate. No new library or media asset was added. These are Chrome diagnostics, not a physical-device or field-performance benchmark.

The rendered review corrected the existing square logo asset's excess whitespace through CSS framing, small-label contrast and redundant dividers. Supporting-page repairs restore the existing Ad Leak Check script from the preserved desktop source, repair article skip-link targets and a missing helper-image reference, and retain the site's existing icons. The offline calculator and its result state pass the checked flow and contrast review. No real enquiry, WhatsApp message or ad was sent during verification.

Quality gate: the first screen retains the explicit offer, real work and direct enquiry actions; service controls remain clear with immediate selected states; mobile is composed separately; existing illustrations and project examples provide the memorable moments. The current services, prices, attribution and contact information remain intact. Physical iOS/Android interaction testing and feedback from real visitors remain outside this run. Evidence is retained in ignored output/playwright/ and the publication workspace's apple-local reports.
