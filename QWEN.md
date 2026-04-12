# English Master — QWEN Context

## Project Overview

**English Master** is a web application for learning English through interactive flashcards and AI-powered conversation practice. It consists of a React frontend, a lightweight Express sync server for user-created cards, and an integrated AI tutor that uses OpenRouter API for real-time conversation practice.

- **Repository:** https://github.com/desbarsik/language-practice
- **Server deployment:** 192.168.199.222 (nginx serving static frontend + Express card sync server on port 3001)
- **Question bank:** 100 questions across 3 levels and 4 topics
- **AI Tutor:** Chat-based conversation practice with speech synthesis, powered by OpenRouter (GPT-4o-mini)

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│  Frontend (React + TypeScript + Vite)                           │
│  - 100 mock questions (embedded)                                │
│  - localStorage: stats, errors, achievements, card cache        │
│  - AI Tutor: OpenRouter API (client-side)                       │
│  - Speech Synthesis: browser built-in API                       │
└──────────────────────┬──────────────────────────────────────────┘
                       │ HTTP (auto-sync)
                       ▼
┌─────────────────────────────────────────────────────────────────┐
│  Card Sync Server (Express + JSON file, port 3001)              │
│  - Stores user-created cards in cards.json                      │
│  - CRUD: GET/POST/PUT/DELETE /api/cards                         │
│  - Runs 24/7 via systemd service                                │
└──────────────────────┬──────────────────────────────────────────┘
                       │ HTTP (AI requests)
                       ▼
┌─────────────────────────────────────────────────────────────────┐
│  OpenRouter API (https://openrouter.ai/api/v1)                  │
│  - AI Tutor: GPT-4o-mini or other models                        │
│  - Client-side requests (API key in .env, embedded in build)    │
└─────────────────────────────────────────────────────────────────┘
```

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + TypeScript |
| Build | Vite 5 |
| Routing | React Router DOM 6 |
| Styling | Tailwind CSS 3 |
| State | Zustand 5 |
| Animations | Framer Motion 11 |
| Sync Server | Express.js (Node.js) |
| Sync Storage | JSON file (cards.json) |
| AI Tutor | OpenRouter API (GPT-4o-mini) |
| Speech | Web Speech Synthesis API (browser built-in) |
| Local Storage | Stats, errors, achievements, card cache |

## Project Structure

```
language-practice/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/
│   │   │   │   ├── AchievementNotification.tsx   # Badge popup (slides in, 5s)
│   │   │   │   ├── Button.tsx                    # Reusable button
│   │   │   │   ├── Card.tsx                      # Card wrapper
│   │   │   │   ├── Layout.tsx                    # Header + nav + footer
│   │   │   │   └── Tutorial.tsx                  # 5-step onboarding
│   │   │   └── learning/
│   │   │       ├── CardEditor.tsx                # Create/edit custom cards
│   │   │       ├── CardList.tsx                  # List/filter/manage cards
│   │   │       ├── FeedbackButtons.tsx           # Correct/incorrect buttons
│   │   │       ├── Flashcard.tsx                 # Flip animation card
│   │   │       ├── MultipleChoice.tsx            # 4-option question
│   │   │       └── SentenceBuilder.tsx           # Sentence from words (index-based)
│   │   ├── data/
│   │   │   └── mockQuestions.ts                  # 100 questions (3 levels × 4 topics)
│   │   ├── pages/
│   │   │   ├── AiTutor.tsx                       # AI conversation chat + speech
│   │   │   ├── Home.tsx                          # Level/topic/mix selection + tutorial
│   │   │   ├── LearningSession.tsx               # Flashcard session (normal + custom)
│   │   │   ├── MyCards.tsx                       # Custom card CRUD + practice + sync
│   │   │   ├── ReviewErrors.tsx                  # Error review with flashcard repeat
│   │   │   └── Statistics.tsx                    # Dashboard: stats, achievements, errors
│   │   ├── services/
│   │   │   ├── achievements.ts            # 10 badge definitions + service
│   │   │   ├── storage.ts                 # localStorage: stats, level stats, errors
│   │   │   └── userCardsService.ts        # Card CRUD with auto-sync to server
│   │   ├── store/
│   │   │   └── useAppStore.ts             # Zustand: session, stats, achievements
│   │   ├── types/
│   │   │   └── index.ts                   # TypeScript interfaces
│   │   ├── App.tsx                        # Router (no auth)
│   │   ├── main.tsx                       # Entry point
│   │   └── index.css                      # Global styles + Tailwind
│   ├── .env                               # AI API key (NOT in git)
│   ├── .env.example                       # Template for .env
│   ├── vite.config.ts                     # host: 127.0.0.1
│   ├── tailwind.config.js
│   └── package.json
├── server/
│   ├── server.js                    # Express card sync server (port 3001)
│   ├── cards.json                   # User cards (auto-created, not in git)
│   ├── package.json
│   └── .gitignore                   # node_modules/, cards.json
├── scripts/
│   └── validate-questions.js        # Pre-build validation for mockQuestions
├── deploy.ps1                       # PowerShell: build + scp to server
├── TODO.md                          # Task checklist
├── README.md                        # Quick-start
└── QWEN.md                          # This file
```

## Pages & Routes

| Page | Route | Purpose |
|------|-------|---------|
| Home | `/` | Level/topic/mix selection, custom cards promo, AI tutor promo, tutorial |
| Learning | `/learning` | Flashcard session (normal questions or custom cards) |
| My Cards | `/my-cards` | Create, edit, list, practice custom cards (auto-sync) |
| Statistics | `/statistics` | Stats, achievements, custom cards stats, error list |
| Review Errors | `/review-errors` | Error review with flashcard-style repeat |
| AI Tutor | `/ai-tutor` | AI conversation practice with speech synthesis |

## Key Commands

### Frontend (development)

```powershell
cd D:\qwen\language-practice\frontend
npm install
npm run dev           # → http://127.0.0.1:5173
npm run build         # validate-questions && tsc -b && vite build → dist/
npm run lint          # eslint .
```

### Card Sync Server (on server)

```bash
cd /var/www/english-master/server
npm install
npm start             # → http://192.168.199.222:3001
```

Managed by systemd service `english-master-server` (auto-start, auto-restart).

### Deploy to Server

```powershell
cd D:\qwen\language-practice
.\deploy.ps1          # Builds frontend + uploads frontend dist + server to 192.168.199.222
```

### Git Update

```powershell
cd D:\qwen\language-practice
git add -A; git commit -m "message"; git push
```

## Data Flow

### Quiz Questions (100 embedded)
```
Home → select level/topic/mix → startSession()
  → filter mockQuestions → shuffle → LearningSession
  → answer → submitAnswer() → update stats + check achievements
  → nextQuestion → results
```

### Custom Cards (auto-sync)
```
My Cards → create card → userCardsService.addCard()
  → POST /api/cards (server:3001) → save to cards.json
  → update localStorage cache

Open from another device → userCardsService.getAll()
  → GET /api/cards → load from server → cache in localStorage
  → Server unavailable → fallback to localStorage cache
```

### AI Tutor
```
AI Tutor → type message → send to OpenRouter API
  → system prompt (Spoken English Teacher) + conversation history
  → GPT-4o-mini responds (≤100 words, corrects errors, asks question)
  → user can click 🔊 to hear response spoken aloud (SpeechSynthesis API)
```

### Achievements
```
submitAnswer() → checkAchievements()
  → gather stats (overall, per-level, custom cards, errors)
  → achievementService.checkAndUnlock(stats)
  → if new badge unlocked → show notification (5s auto-dismiss)
```

## localStorage Keys

| Key | Data |
|-----|------|
| `english_master_stats` | Overall: correct, incorrect, total |
| `english_master_level_stats` | Per-level: Beginner/Intermediate/Advanced stats |
| `english_master_custom_cards_stats` | Custom cards: correct, incorrect, total, streak, bestStreak |
| `english_master_errors` | Array of question IDs with errors |
| `english_master_user_cards_cache` | Cache of user cards (synced from server) |
| `english_master_achievements` | Array of unlocked achievement IDs |
| `english_master_tutorial_seen` | Flag — tutorial completed |
| `learning_session_custom_cards` | Temp: cards for current practice |
| `learning_session_mode` | Temp: session mode ("custom") |

## Question Data (mockQuestions.ts)

100 questions:

| Level | Multiple Choice | Construction | Total |
|-------|----------------|-------------|-------|
| 🌱 Beginner | 24 | 10 | 34 |
| 🌿 Intermediate | 20 | 13 | 33 |
| 🌳 Advanced | 20 | 13 | 33 |
| **Итого** | **64** | **36** | **100** |

**By topic:** ✈️ Travel, 🍕 Food, 💼 Business, 📖 Grammar

## Achievement System (10 badges)

| Badge | Icon | Condition |
|-------|------|-----------|
| Первый шаг | 🏅 | Answer first question |
| Серия 10 | 🔥 | 10 correct in a row |
| На огне | 💥 | 25 correct in a row |
| Марафонец | 📚 | Answer all 100 questions |
| Чистая работа | 💪 | Clear all errors |
| Коллекционер | 🎨 | Create 20 custom cards |
| Мастер Beginner | 🌱 | 80%+ on Beginner |
| Pro Intermediate | 🌿 | 80%+ on Intermediate |
| Эксперт Advanced | 🌳 | 80%+ on Advanced |
| Мастер карточек | ⭐ | 80%+ on custom cards (min 10) |

## AI Tutor

### Configuration (`.env`)

```
VITE_AI_API_KEY=sk-or-v1-...
VITE_AI_MODEL=openai/gpt-4o-mini
```

### System Prompt
Uses the "Spoken English Teacher and Improver" prompt from prompts.chat:
- Responds in English, ≤100 words
- Strictly corrects grammar, typos, factual errors
- Always asks a question to keep conversation going

### Topics
6 conversation scenarios: Free, Restaurant, Airport, Shopping, Doctor, Interview

### Speech Synthesis
- Browser built-in `SpeechSynthesis` API (no external dependencies)
- `en-US` language, 0.9 rate (slightly slower for learning)
- 🔊 button on each AI response, ⏹️ to stop

## Custom Cards Sync

- **Types:** Translation (🔄 word → translation) or Sentence (💬 phrase → translation + hint)
- **Fields:** front_text (English), back_text (Russian), hint (optional)
- **Auto-sync:** Every create/edit/delete is immediately sent to the sync server
- **Offline fallback:** If server is unavailable, changes are cached locally and synced when reconnected
- **Multi-device:** Open from any device → cards load from server automatically

## Development Conventions

- **TypeScript** strict mode, interfaces in `types/index.ts`
- **Tailwind CSS** classes only (no CSS modules, no Bootstrap)
- **Dark mode** via `dark:` Tailwind prefixes (system preference)
- **PascalCase** components, files match component names
- **Async userCardsService** — all CRUD operations are async with server auto-sync
- **No auth** — all pages are public, no JWT, no registration
- **Pre-build validation** — `scripts/validate-questions.js` checks all 100 questions before every build
