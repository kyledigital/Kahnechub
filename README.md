# Kahnec Hub — Website

A modern lead generation website for Kahnec Hub, founded by Kyle Hector.

---

## Project Structure

```
kahnec-hub/
├── index.html              ← Main HTML (all content lives here)
├── assets/
│   ├── css/
│   │   └── styles.css      ← All styles
│   ├── js/
│   │   └── main.js         ← All interactivity
│   └── images/             ← Add your photos here
└── README.md
```

---

## Setup in VS Code

1. Open the `kahnec-hub/` folder in VS Code
2. Install the **Live Server** extension (by Ritwick Dey) if you haven't
3. Right-click `index.html` → **Open with Live Server**
4. The site opens at `http://127.0.0.1:5500` — it hot-reloads on every save

---

## Things to Update Before Going Live

### 1. Connect your contact forms (Formspree — free)
Search for `YOUR_FORM_ID` in `index.html` — it appears **3 times** (audit form, contact form, popup form).

Steps:
- Go to [formspree.io](https://formspree.io) and create a free account
- Click "New Form" → give it a name → copy the form ID (looks like `xpwqdoqn`)
- Replace all 3 instances of `YOUR_FORM_ID` with your real ID
- Every submission will be emailed directly to `kylehector12@gmail.com`
- Remove the `handleAudit` / `handleContact` `preventDefault` workarounds in `main.js` once connected

### 2. Update your WhatsApp number
Search for `18761234567` in `index.html` — replace with your real number in international format (no spaces, no `+`).
Format: `1` + area code + number, e.g. `18761234567`

### 3. Add a profile photo (optional but recommended)
- Add your photo to `assets/images/` (e.g. `kyle-hector.jpg`)
- Replace the "Founder card" section in `index.html` with an `<img>` tag
- Suggested size: 400×500px, compressed to under 200KB

### 4. Update social links
Search for these in `index.html` and replace with your live URLs:
- `https://www.instagram.com/kahnec_withkyle`
- `https://www.linkedin.com/in/kyle-hector`
- `kylehector12@gmail.com`

### 5. Update the announce bar text
Find `<div class="announce">` near the top of `index.html` and update the copy anytime you have a promotion or news.

---

## Colour & Font Customisation

All colours are CSS variables in `assets/css/styles.css` at the top:

```css
:root {
  --accent:  #FF5427;   /* Main orange — change this to rebrand */
  --dark:    #0E0E0E;   /* Near-black used for nav, footer, CTA */
  --off:     #F9F6F2;   /* Warm off-white section backgrounds */
  --warm:    #FFF5EE;   /* Even warmer tint (audit section) */
  ...
}
```

Fonts are loaded from Google Fonts in `index.html`:
- **Outfit** — headings and body text
- **DM Serif Display** — italic accent words in headings

To change fonts, update the Google Fonts `<link>` in `<head>` and the font-family references in `styles.css`.

---

## Adding a New FAQ Item

Copy this block inside the `<div class="faq-wrap">` in `index.html`:

```html
<div class="faq-item reveal">
  <button class="faq-btn" onclick="toggleFAQ(this)">
    Your question here?
    <span class="faq-ico">+</span>
  </button>
  <div class="faq-ans">Your answer here.</div>
</div>
```

---

## Adding a New Testimonial

Copy a `.tcard` block inside `.test-row` and update the content.
The initials avatar uses `.a1` (orange tint) or `.a2` (dark tint).

---

## Deploying (free options)

### Option A — GitHub Pages (recommended)
1. Push the project to a GitHub repo
2. Go to Settings → Pages → Source: `main` branch, `/ (root)`
3. Your site goes live at `https://yourusername.github.io/kahnec-hub`

### Option B — Netlify (easiest)
1. Go to [netlify.com](https://netlify.com)
2. Drag and drop the `kahnec-hub/` folder onto the deploy zone
3. Done — you get a live URL instantly
4. Connect a custom domain from the Netlify dashboard

### Option C — Vercel
1. Push to GitHub
2. Import the repo at [vercel.com](https://vercel.com)
3. Vercel auto-detects static HTML and deploys immediately

---

## Lead Generation Features (summary)

| Feature | How it works |
|---|---|
| Announce bar | Always-visible strip linking to the contact section |
| Hero CTAs | "Book a Call" + "Free Audit" above the fold |
| Animated counters | Stats count up when they scroll into view |
| Floating metric cards | Animated cards in hero right column |
| Service cards | Hover accent + link to pricing/contact |
| Case studies | Real campaign numbers from Kyle's experience |
| Pricing tiers | Clear packages with "Get a Quote" CTAs |
| Free audit form | Formspree-powered lead capture with qualification |
| Contact form | Full lead qualification (budget, service, goals) |
| Chat widget | Smart qualifier chatbot → recommends right package |
| WhatsApp float | Always-visible quick-contact button (bottom-right) |
| Exit popup | Fires on mouse-leave or after 50 seconds |

---

## Questions or Issues?

Built by Claude for Kyle Hector / Kahnec Hub.
Email: kylehector12@gmail.com
