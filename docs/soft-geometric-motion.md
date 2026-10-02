# Soft geometric motion

The reviewed warm yellow circle and pale blue arch extend into five section entries: selected websites, services, learning, Kyle's introduction and enquiries. Mint tiles and lavender arches vary the palette. Ten small decorative forms occupy clipped strips in the section padding, with a clear gap above content. They cannot intercept clicks and are hidden from assistive technology.

Each pair drifts once over 10–13 seconds, then settles. The hero's existing forms also settle after their initial drift. Section introductions arrive by seven pixels without concealing content; service panels and project selections get brief feedback. Visit-website arrows respond to hover and keyboard focus. There is no scroll-jacking, pointer tracking, new renderer or media export.

New animations use transforms and opacity. IntersectionObserver pauses forms outside the viewport. The shared page-pause buttons stop the new motion, and reduced motion retains the static forms. All background motion pauses while the net or archery is the focal animation. Hidden tabs pause motion. Project preview feedback is cancelled when reduced motion is enabled.

Added source is about 7.7 KB uncompressed across one CSS and one JS file; there are no additional images, videos or external dependencies. Local desktop/mobile interaction checks passed, with zero automated accessibility violations, no page errors, no observed long tasks and negligible layout-shift readings (below 0.001). This is a browser sanity check, not a device-wide benchmark. Tablet and 320px mobile static layouts were also checked.

See ignored `output/motion-qa/` for local and hosted reports/screenshots. The service finder, real sample-site destinations, device previews and both existing focal illustrations remain present. No enquiry or message is sent by verification. The isolated branch starts at `29ae744`; production publication remains separate.
