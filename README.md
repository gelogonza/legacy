# Legacy — Your path to college starts here

An AI-powered college navigation platform built for first-generation, low-income students. Legacy helps students find scholarships, navigate FAFSA, write essays, plan their college journey, discover local resources, and explore careers.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, React Router v6 |
| Styling | CSS Modules, Geist font, Playfair Display |
| Auth | Supabase Auth (email/password, implicit flow) |
| Database | Supabase (Postgres) — `profiles`, `saved_scholarships` tables |
| AI | Claude API (Anthropic) — direct browser calls |
| Backend (optional) | Quarkus + LangChain4j — Java REST API with strategy-based counseling |
| Testing | Vitest, React Testing Library |

---

## Prerequisites

- **Node.js** 18+
- **npm** 9+
- A **Supabase** project with `profiles` and `saved_scholarships` tables
- An **Anthropic API key**

For the optional Java backend:
- **Java 25** (or lower to 17 in `pom.xml`)
- **Maven** (or use the included `./mvnw` wrapper)

---

## Setup

### 1. Clone and install

```bash
git clone https://github.com/gelogonza/legacy.git
cd legacy
npm install
```

### 2. Environment variables

Copy the example env file and fill in your keys:

```bash
cp .env.example .env
```

Your `.env` needs three values:

```
VITE_ANTHROPIC_KEY=sk-ant-api03-...
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGci...
```

| Variable | Where to find it |
|---|---|
| `VITE_ANTHROPIC_KEY` | [console.anthropic.com](https://console.anthropic.com) > API Keys |
| `VITE_SUPABASE_URL` | Supabase Dashboard > Settings > API > Project URL |
| `VITE_SUPABASE_ANON_KEY` | Supabase Dashboard > Settings > API > `anon` `public` key |

### 3. Supabase setup

In your Supabase project:

**Authentication > Providers > Email:**
- Enable email provider
- For development: turn OFF "Confirm email" (allows instant sign-up without email verification)

**Authentication > URL Configuration:**
- Site URL: `http://localhost:5173`
- Redirect URLs: `http://localhost:5173/auth/callback`

**Database tables** (must already exist — do not recreate if they're there):

`profiles` columns:
```
id, user_id, name, profile_type, grade, state, gpa,
major_interest, first_gen, household_income, notes, created_at, updated_at
```

`saved_scholarships` columns:
```
id, user_id, name, amount, deadline, eligibility,
url, match_reason, status, created_at
```

### 4. Run the app

```bash
npm run dev
```

Opens at `http://localhost:5173`. You'll see the Landing page. Click **Sign up** to create an account, then fill out your profile.

### 5. Run tests

```bash
npx vitest run
```

### 6. Build for production

```bash
npm run build
```

---

## Optional: Java Backend (Quarkus)

Jonathan's Quarkus backend provides a server-side AI counseling API with strategy-based prompts and a deadline service tool.

### Setup

```bash
# Set your API key
export ANTHROPIC_API_KEY=sk-ant-api03-...

# Run the backend (requires Java 25)
./mvnw quarkus:dev
```

The backend runs on `http://localhost:8080` with a single endpoint:

```
POST /chat
Content-Type: application/json

{
  "userType": "HIGH_SCHOOL",
  "message": "What scholarships can I apply for?"
}
```

Valid `userType` values: `HIGH_SCHOOL`, `COLLEGE`, `RETURNING`, `GENERAL`

> **Note:** The frontend and backend currently run independently. The frontend calls the Claude API directly from the browser. The backend is a separate service that could replace direct API calls in a production deployment.

---

## Project Structure

```
legacy/
├── .env.example                         ← Template for environment variables
├── package.json                         ← Frontend dependencies
├── pom.xml                              ← Backend dependencies (Quarkus/Maven)
├── vite.config.js                       ← Vite configuration
│
├── src/                                 ← Frontend (React)
│   ├── main.jsx                         ← App entry point (React StrictMode)
│   ├── App.jsx                          ← Router, ProtectedRoute, AuthCallback
│   ├── tokens.css                       ← Design tokens (colors, fonts, radii)
│   │
│   ├── lib/
│   │   └── supabase.js                  ← Supabase client (implicit auth flow)
│   │
│   ├── hooks/
│   │   ├── useAuth.js                   ← Auth state (getSession, onAuthStateChange, signOut)
│   │   ├── useProfile.js               ← Profile CRUD via Supabase (user_id)
│   │   ├── useProfile.test.js
│   │   ├── useClaude.js                 ← Claude API, system prompts, structured parsing
│   │   └── useClaude.test.js
│   │
│   ├── components/
│   │   ├── SkyBackground.jsx            ← Animated sky gradient with floating orbs
│   │   ├── ScholarshipCard.jsx          ← Scholarship result card (Save/Remove)
│   │   ├── ScholarshipCard.module.css
│   │   ├── ScholarshipCard.test.jsx
│   │   ├── RoadmapTimeline.jsx          ← Milestone timeline from <roadmap> JSON
│   │   ├── RoadmapTimeline.module.css
│   │   └── RoadmapTimeline.test.jsx
│   │
│   └── pages/
│       ├── Auth.jsx                     ← Sign in / sign up (email + password)
│       ├── Landing.jsx                  ← Public landing page (auth-aware nav)
│       ├── Landing.module.css
│       ├── Landing.test.jsx
│       ├── Profile.jsx                  ← Student profile form
│       ├── Profile.module.css
│       ├── Profile.test.jsx
│       ├── ChatPage.jsx                 ← Reusable chat UI (all 6 AI features)
│       ├── ChatPage.module.css
│       ├── Tracker.jsx                  ← Saved scholarships + status tracking
│       ├── Tracker.module.css
│       └── Tracker.test.jsx
│
└── src/main/                            ← Backend (Quarkus/Java)
    ├── resources/
    │   └── application.properties       ← Quarkus config (model, tokens, temperature)
    └── java/com/impact/
        ├── agent/
        │   └── CounselorAgent.java      ← LangChain4j AI service (Claude)
        ├── model/
        │   └── UserType.java            ← Enum: HIGH_SCHOOL, COLLEGE, RETURNING, GENERAL
        ├── rest/
        │   ├── ChatResource.java        ← POST /chat endpoint
        │   └── ChatRequest.java         ← Request DTO
        ├── service/
        │   └── DeadlineService.java     ← Tool: upcoming deadlines per user type
        └── strategy/
            ├── GuidanceStrategy.java    ← Strategy interface
            ├── BaseGuidanceStrategy.java ← Base prompt + template method
            ├── GuidanceStrategyFactory.java ← Factory: userType → strategy
            ├── HighSchoolStrategy.java  ← ScholarTrack, dual-credit, FAFSA
            ├── CollegeStudentStrategy.java ← Hidden curriculum, internships, mentors
            ├── ReturningStudentStrategy.java ← Fresh Start, credit recovery
            └── GeneralStrategy.java     ← Base guidance only
```

---

## Features

| Route | Feature | Description |
|---|---|---|
| `/` | Landing | Public marketing page with stats, feature cards, auth-aware nav |
| `/auth` | Auth | Email/password sign up and sign in |
| `/profile` | Profile | Student profile (type, grade, state, GPA, major, income) |
| `/scholarships` | Scholarship Matcher | AI-powered scholarship discovery with structured cards |
| `/fafsa` | FAFSA Guide | Plain-language financial aid navigation |
| `/essay` | Essay Coach | College essay feedback and topic discovery |
| `/roadmap` | College Roadmap | Personalized timeline with milestone phases |
| `/local` | Local Opportunities | Community programs, local scholarships, regional resources |
| `/career` | Career Advisor | Career exploration, major-to-career mapping |
| `/tracker` | Scholarship Tracker | Saved scholarships with status cycling (Not started / In progress / Submitted) |

---

## Auth Flow

1. Visitor lands on `/` (public Landing page)
2. Clicks **Sign up** or any feature card → redirected to `/auth`
3. Creates account with email + password → auto-signed in
4. Redirected to `/` → personalized Landing with avatar pill
5. All feature routes are protected by `ProtectedRoute`
6. **Sign out** link in nav clears the session

Auth uses Supabase Auth with implicit flow. Session persists across refreshes via Supabase's built-in token storage.

---

## Data Flow

- **Profile** → stored in Supabase `profiles` table, keyed by `user_id` (from Supabase Auth)
- **Saved scholarships** → stored in `saved_scholarships` table, keyed by `user_id`
- **Chat messages** → in-memory only (not persisted)
- **AI responses** → Claude API called directly from browser with `VITE_ANTHROPIC_KEY`

---

## Design Tokens

All colors defined in `tokens.css`:

```css
--orange:       #0077b6   /* Primary action (Bright Teal Blue) */
--green:        #00b4d8   /* Secondary (Turquoise Surf) */
--green-light:  #48cae4   /* Tertiary (Sky Aqua) */
--amber:        #90e0ef   /* Highlight (Frosted Blue) */
--bg:           #020c18   /* Deep navy background */
```

Fonts: **Geist** (display + body), **Playfair Display** (hero italic accent).

---

## Judging Criteria Alignment

| Criterion | How Legacy addresses it |
|---|---|
| **Impact Potential (25pts)** | Specific population (first-gen students), real problem ($7B unclaimed scholarships) |
| **Technical Execution (30pts)** | 6 AI features, Supabase auth + database, structured output parsing, optimistic UI, 115 tests |
| **Ethical Alignment (25pts)** | Empowers users with information, never makes decisions for them, culturally aware prompts |
| **Presentation (20pts)** | Stats-led pitch opening, clear demo path through all features |
