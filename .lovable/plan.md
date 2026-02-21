

# FPL Copilot — AI-Powered Fantasy Premier League Decision Support

## Overview
A polished, demo-ready web app that acts as an AI copilot for FPL managers. It uses real FPL public data and Lovable AI to deliver personalized, explainable weekly recommendations — captaincy, starting XI, bench order, and transfer suggestions — all tied to the user's actual squad and upcoming fixtures.

**Visual Style:** FPL-branded color palette (purple `#37003c`, green `#00ff87`, light backgrounds) for instant familiarity.

---

## Phase 1: Foundation & Data Layer

### Backend Setup (Lovable Cloud)
- **FPL Proxy Edge Function** — Proxies requests to the official FPL API (`bootstrap-static`, `fixtures`, `entry` endpoints) to avoid CORS issues. Includes in-memory caching so repeated requests within a session are instant.
- **AI Chat Edge Function** — Connects to Lovable AI gateway. Receives the user's squad context + question, returns structured recommendations with explanations. Handles 429/402 errors gracefully.

### Data Models & Metrics
- Player data: name, team, position, price, recent points, minutes, form
- Fixtures: upcoming opponents, home/away, fixture difficulty rating (FDR)
- Computed metrics:
  - **Form Score** — Last 5 GW points average
  - **Minutes Reliability** — Minutes trend + rotation risk
  - **Fixture Score** — Next 3 fixtures weighted (home boosted)
  - **Captain Score** — Form × Fixture × Minutes reliability

### Local State
- Store imported squad + gameweek selection in browser localStorage so refreshes don't lose data

---

## Phase 2: Landing / Setup Page

- App title "FPL Copilot" with elevator pitch: *"Your AI-powered weekly decision assistant for Fantasy Premier League"*
- **Team ID input** — Enter FPL Team ID to load real squad
- **"Use Demo Squad" button** — Loads a realistic pre-filled 15-player squad instantly (no API needed)
- **Gameweek selector** dropdown
- Status indicators: data loading state, errors, last refreshed timestamp
- If FPL API errors → friendly message + auto-switch to demo squad

---

## Phase 3: Main Dashboard

Three-column layout (responsive — stacks on mobile):

### Left Column: Squad Overview
- Full 15-player squad list grouped by position (GK, DEF, MID, FWD)
- Each player shows: name, team badge abbreviation, price, form score, next fixture
- Visual indicators for minutes risk or good fixtures

### Middle Column: Recommendation Cards

**Captain Recommendation Card**
- Top 3 captain choices from user's squad
- Each with: fixture, form, minutes reliability, opponent strength
- Confidence indicator (Low/Med/High) with reasoning

**Starting XI + Bench Order Card**
- Recommended starting 11 in a formation view
- Bench order (1st–4th) with explanation
- Reasoning: minutes risk, fixture strength, position balance

**Transfer Suggestions Card**
- 3 transfer tiers: Safe (no hit), Upside (higher variance), Aggressive (-4 hit)
- Respects position constraints and 3-per-team limit
- Assumes 0.0 ITB if budget unknown (stated explicitly)
- Toggle: "What changes if I take a -4?" scenario view

**Every recommendation includes:**
- Bulleted key factors
- Explicit assumptions
- Evidence cards (recent points, minutes trend, next 3 fixtures)
- "Why not [alternative]?" note

### Right Column: AI Chat Panel
- Conversational Q&A about the user's squad
- AI responses include: direct answer, actionable recommendation, explanation tied to squad/fixtures, follow-up suggestion
- Pre-filled sample question chips:
  - "Who should I captain this GW?"
  - "Is a -4 worth it?"
  - "Who should I bench?"
  - "Suggest 1 safe transfer and explain."
- Streaming responses for real-time feel
- If AI unavailable → fallback to rules-based assistant labeled "Offline Mode"

### Dashboard Controls
- Filters: "Show only my players", "Show fixtures next 3"
- Toggle: "Assume -4 hit allowed"
- "Refresh Data" button

---

## Phase 4: Player Explorer Page

- Searchable player list with all Premier League players
- Key stats: form, price, minutes, upcoming fixtures with FDR colors
- **Compare view** — Select two players side-by-side to compare stats, fixtures, and suitability

---

## Phase 5: Polish & Demo Safety

### Error Handling
- FPL API failure → auto-switch to demo squad + cached sample data with clear messaging
- AI failure → rules-based fallback with "Offline Mode" label
- Loading skeletons throughout
- All states visible (loading, error, empty, success)

### About / How It Works Section
- Data sources explained (FPL public API)
- Metric calculations described
- Assumptions and limitations listed
- Disclaimer that this is a decision-support tool, not financial advice

### Demo-Ready Details
- No placeholder screens — everything clickable and functional
- Fast interactions with optimistic UI
- Mobile-responsive layout
- Sample data pre-loaded for immediate demo capability

