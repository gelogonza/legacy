# Legacy — Your path to college starts here

Built for first-generation, low-income college students.

---

## Quick Start

```bash
npm install
npm run dev
```

Requires a `VITE_ANTHROPIC_KEY` in `.env`. The app calls the Anthropic API directly from the browser.

---

## Project Structure

```
src/
├── App.jsx                          ← Router (6 routes)
├── tokens.css                       ← Design tokens (colors, fonts, spacing)
├── hooks/
│   ├── useClaude.js                 ← Claude API, system prompts, profile injection, scholarship parsing
│   └── useProfile.js                ← Persistent student profile (localStorage)
├── components/
│   ├── ScholarshipCard.jsx          ← Structured scholarship result card
│   ├── ScholarshipCard.module.css
│   └── SkyBackground.jsx            ← Animated sky gradient background
└── pages/
    ├── Landing.jsx                  ← Home screen
    ├── Landing.module.css
    ├── ChatPage.jsx                 ← Reusable chat UI (all 4 AI features)
    ├── ChatPage.module.css
    ├── Tracker.jsx                  ← Saved scholarships + status tracking
    └── Tracker.module.css
```

---

## Features

| Route | Feature | Description |
|---|---|---|
| `/scholarships` | Scholarship Matcher | AI-powered scholarship discovery with structured JSON cards |
| `/fafsa` | FAFSA Guide | Plain-language financial aid navigation |
| `/essay` | Essay Coach | Authentic college essay feedback |
| `/roadmap` | College Roadmap | Personalized college planning timeline |
| `/tracker` | Saved Scholarships | Deadline tracking with status toggles |

---

## Key Functionality

- **Student Profile** — persisted in localStorage, auto-injected into every AI conversation
- **Structured Scholarships** — Claude returns `<scholarships>` JSON tags, parsed into cards with deadline badges
- **Scholarship Tracker** — save scholarships, track status (Not started → In progress → Submitted)
- **Document Upload** — image/document analysis via Claude's vision capability

---

## Design Tokens

All colors in `tokens.css` — sky blue palette:

```css
--orange:       #0077b6   /* Primary action (Bright Teal Blue) */
--green:        #00b4d8   /* Secondary (Turquoise Surf) */
--green-light:  #48cae4   /* Tertiary (Sky Aqua) */
--amber:        #90e0ef   /* Highlight (Frosted Blue) */
--bg:           #020c18   /* Deep navy background */
```

Fonts: Geist (display + body), Playfair Display (hero italic accent).

---

## Judging Criteria Alignment

| Criterion | How Legacy addresses it |
|---|---|
| **Impact Potential (25pts)** | Specific population (first-gen Black students), real problem ($7B unclaimed scholarships) |
| **Technical Execution (30pts)** | 4 working AI features, image upload, conversation history, structured rec extraction |
| **Ethical Alignment (25pts)** | Empowers users with information, never makes decisions for them, culturally aware prompts |
| **Presentation (20pts)** | Stats-led pitch opening, clear demo path through all 4 features |
