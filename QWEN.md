# English Master — QWEN Context

## Project Overview

**English Master** is a web application for learning English through interactive flashcards. It consists of a React frontend and a lightweight Express sync server for user-created cards. All quiz data (53 questions) is embedded in the frontend; user-created cards are stored on the sync server (JSON file) with localStorage cache fallback.

- **Repository:** https://github.com/desbarsik/language-practice
- **Server deployment:** 192.168.199.222:3001 (card sync server)
- **Question bank:** 53 questions across 3 levels and 4 topics
- **Key features:** 10 achievement badges, custom user-created flashcards with auto-sync, error review system, progress tracking with per-level stats, tutorial for newcomers

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│  Frontend (React + TypeScript + Vite)                       │
│  - 53 mock questions (embedded)                             │
│  - localStorage: stats, errors, achievements, card cache    │
│  - Auto-syncs custom cards with Card Sync Server            │
└──────────────────────┬──────────────────────────────────────┘
                       │ HTTP (auto-sync)
                       ▼
┌─────────────────────────────────────────────────────────────┐
│  Card Sync Server (Express + JSON file, port 3001)          │
│  - Stores user-created cards in cards.json                  │
│  - CRUD: GET/POST/PUT/DELETE /api/cards                     │
│  - Runs 24/7 on server                                      │
└──────────────────────┬──────────────────────────────────────┘
                       │ Manual commit
                       ▼
┌─────────────────────────────────────────────────────────────┐
│  GitHub (https://github.com/desbarsik/language-practice)    │
│  - Source code                                              │
│  - Updated manually via git push                            │
└─────────────────────────────────────────────────────────────┘
```

### What was removed (legacy):

- `backend/` — Full backend with PostgreSQL, JWT auth (no longer used)
- Authentication, registration, login — removed
- Protected routes — all pages are public

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
| Local Storage | Stats, errors, achievements, card cache |

## Project Structure

```
language-practice/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/
│   │   │   │   ├── AchievementNotification.tsx   # Badge popup (slides in, 3s)
│   │   │   │   ├── AnimatedCard.tsx              # Framer Motion wrapper
│   │   │   │   ├── AnimatedFeedback.tsx          # Success/error animation
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
│   │   │   └── mockQuestions.ts                  # 53 questions (3 levels × 4 topics)
│   │   ├── pages/
│   │   │   ├── Home.tsx                          # Level/topic selection + tutorial
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
│   ├── vite.config.ts                     # host: 127.0.0.1
│   ├── tailwind.config.js
│   └── package.json
├── server/
│   ├── server.js                    # Express card sync server (port 3001)
│   ├── cards.json                   # User cards (auto-created, not in git)
│   ├── package.json
│   └── .gitignore                   # node_modules/, cards.json
├── deploy.ps1                       # PowerShell: build + scp to server
├── TODO.md                          # Task checklist (all done)
├── README.md                        # Quick-start
└── QWEN.md                          # This file
```

## Pages & Routes

| Page | Route | Purpose |
|------|-------|---------|
| Home | `/` | Level/topic selection, custom cards promo, tutorial |
| Learning | `/learning` | Flashcard session (normal questions or custom cards) |
| My Cards | `/my-cards` | Create, edit, list, practice custom cards (auto-sync) |
| Statistics | `/statistics` | Stats, achievements, custom cards stats, error list |
| Review Errors | `/review-errors` | Error review with flashcard-style repeat |

## Key Commands

### Frontend (development)

```powershell
cd D:\qwen\language-practice\frontend
npm install
npm run dev           # → http://127.0.0.1:5173
npm run build         # tsc -b && vite build → dist/
```

### Card Sync Server (on server)

```bash
cd /var/www/english-master/server
npm install
npm start             # → http://192.168.199.222:3001
# Runs in background: npm start &
```

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

### Quiz Questions (53 embedded)
```
Home → select level/topic → startSession()
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

53 questions:

| Level | Multiple Choice | Construction | Total |
|-------|----------------|-------------|-------|
| 🌱 Beginner | 13 | 4 | 17 |
| 🌿 Intermediate | 9 | 5 | 14 |
| 🌳 Advanced | 9 | 6 | 15 |
| + mixed | 4 | 3 | 7 |

**By topic:** ✈️ Travel (13), 🍕 Food (7), 💼 Business (13), 📖 Grammar (10)

## Achievement System (10 badges)

| Badge | Icon | Condition |
|-------|------|-----------|
| Первый шаг | 🏅 | Answer first question |
| Серия 10 | 🔥 | 10 correct in a row |
| На огне | 💥 | 25 correct in a row |
| Марафонец | 📚 | Answer all 53 questions |
| Чистая работа | 💪 | Clear all errors |
| Коллекционер | 🎨 | Create 20 custom cards |
| Мастер Beginner | 🌱 | 80%+ on Beginner |
| Pro Intermediate | 🌿 | 80%+ on Intermediate |
| Эксперт Advanced | 🌳 | 80%+ on Advanced |
| Мастер карточек | ⭐ | 80%+ on custom cards (min 10) |

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
