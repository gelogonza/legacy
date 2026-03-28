# Legacy — Your path to college starts here

**Track 3: Economic Empowerment & Education**  
Built for first-generation Black college students.

---

## Quick Start

```bash
npm install
npm run dev   # → http://localhost:3000
```

Requires an Anthropic API key. The app calls `https://api.anthropic.com/v1/messages` directly.

---

## Project Structure

```
src/
├── App.jsx                    ← Router — all 5 routes live here
├── tokens.css                 ← Design tokens (colors, fonts, spacing)
├── hooks/
│   └── useClaude.js           ← Claude API + system prompts + rec extractor
└── pages/
    ├── Landing.jsx            ← Home screen (matches Figma design)
    ├── Landing.module.css
    ├── ChatPage.jsx           ← Reusable chat UI (all 4 features use this)
    └── ChatPage.module.css
```

---

## Features

| Route | Feature | System Prompt Focus |
|---|---|---|
| `/scholarships` | Scholarship matcher | Personalized scholarship discovery |
| `/fafsa` | FAFSA guide | Plain-language financial aid navigation |
| `/essay` | Essay coach | Authentic college essay feedback |
| `/roadmap` | College roadmap | Personalized college planning timeline |

---

## Adding a New Feature

1. Add a system prompt to `useClaude.js` → `SYSTEM_PROMPTS`
2. Add starter prompts to `ChatPage.jsx` → `STARTERS`
3. Add metadata to `ChatPage.jsx` → `FEATURE_META`
4. Add a card to `Landing.jsx` → `FEATURES`
5. Add a route to `App.jsx`

---

## Design Tokens

All colors are in `tokens.css` as CSS variables:

```css
--orange:       #e8701a   /* Primary CTA, scholarship feature */
--green:        #2d8a45   /* FAFSA feature */
--amber:        #e8a832   /* Stats, essay feature */
--green-light:  #5ec47a   /* Pills, roadmap feature */
--bg:           #0a0a0a   /* Page background */
```

---

## Judging Criteria Alignment

| Criterion | How Legacy addresses it |
|---|---|
| **Impact Potential (25pts)** | Specific population (first-gen Black students), real problem ($7B unclaimed scholarships) |
| **Technical Execution (30pts)** | 4 working AI features, image upload, conversation history, structured rec extraction |
| **Ethical Alignment (25pts)** | Empowers users with information, never makes decisions for them, culturally aware prompts |
| **Presentation (20pts)** | Stats-led pitch opening, clear demo path through all 4 features |
