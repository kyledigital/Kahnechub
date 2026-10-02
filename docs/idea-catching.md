# Idea-catching illustration

An original dimensional scene for the creative approach below Kyle's introduction. A gold-rimmed woven net gathers a lightbulb, a photograph and a conversation bubble. Those ideas settle into a website card. The illustration occupies its own media area and stays clear of copy and controls.

## Production

Blender was not installed. The original saved scene was built with Three.js and rendered by Chrome using software WebGL. One sequential 720 × 476 export used lightweight contact-shadow textures and Chrome MediaRecorder; no parallel render jobs, paid render services or new desktop applications were used. The previous four key frames remain saved separately.

- `assets/media/ideas-capture.webm`: VP9, about 9.5 seconds, 441,641 bytes.
- `assets/media/ideas-poster.webp`: final still, 14,694 bytes.
- There is no Three.js/WebGL runtime on the website.

The scene plays once when visible, with explicit Replay and shared page-pause controls. It pauses offscreen and when the document is hidden. Reduced motion shows the poster and does not fetch the video. Data Saver requires an explicit Play. A missing/unsupported video and disabled JavaScript retain the still illustration. The archery illustration pauses while this scene plays.

## Verification

Local desktop (1440px) and mobile (390px) playback, offscreen pause/resume, shared pause controls, one-time completion, keyboard replay, reduced-motion requests, Data Saver and failed-media fallback passed. Automated accessibility checks reported zero violations. All three sample-site anchors and device previews remain correct; the service guide still opens and closes normally. See ignored `output/ideas-qa/` reports and screenshots for local and hosted evidence.

The isolated `preview/idea-catching` branch begins at verified release `d620d98`. Production publication is separate and has not been attempted. The verified service-finder/sample-button release branch remains unchanged.
