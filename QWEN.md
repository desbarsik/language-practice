# English Master — QWEN Context

## Project Overview

**English Master** is a frontend-only web application for learning English through interactive flashcards. It was originally designed as a full-stack app but has been simplified to work entirely without a backend — all data is stored in `localStorage`.

- **Current state:** Fully functional frontend with no backend dependency. Auth, registration, and API layers have been removed.
- **Question bank:** 53 questions across 3 levels (Beginner, Intermediate, Advanced) and 4 topics (Travel, Food, Business, Grammar).
- **Key features:** Tutorial for newcomers, achievement/badge system, custom user-created flashcards, error review, progress tracking with per-level stats.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend Framework | React 18 + TypeScript |
| Frontend Build | Vite 5 |
| Routing | React Router DOM 6 |
| Styling | Tailwind CSS 3 |
| State Management | Zustand 5 |
| Animations | Framer Motion 11 |
| Linting | ESLint 8 + typescript-eslint 7 |
| Storage | localStorage (stats, errors, achievements, custom cards) |

## Project Structure

```
language-practice/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/
│   │   │   │   ├── AchievementNotification.tsx  # Achievement popup (slides in from right)
│   │   │   │   ├── AnimatedCard.tsx             # Framer Motion animated card wrapper
│   │   │   │   ├── AnimatedFeedback.tsx         # Success/error animation component
│   │   │   │   ├── Button.tsx                   # Reusable button component
│   │   │   │   ├── Card.tsx                     # Card wrapper component
│   │   │   │   ├── Layout.tsx                   # App layout with header/nav/footer
│   │   │   │   └── Tutorial.tsx                 # 5-step onboarding tutorial
│   │   │   └── learning/
│   │   │       ├── CardEditor.tsx               # Create/edit custom flashcards
│   │   │       ├── CardList.tsx                 # List/filter/manage custom cards
│   │   │       ├── FeedbackButtons.tsx          # Correct/incorrect feedback buttons
│   │   │       ├── Flashcard.tsx                # Flashcard with flip animation
│   │   │       ├── MultipleChoice.tsx           # Multiple choice question component
│   │   │       └── SentenceBuilder.tsx          # Sentence construction from words
│   │   ├── data/
│   │   │   └── mockQuestions.ts                 # 53 seed questions (levels + topics)
│   │   ├── pages/
│   │   │   ├── Home.tsx                         # Level & topic selection + custom cards promo
│   │   │   ├── LearningSession.tsx              # Flashcard session (normal + custom modes)
│   │   │   ├── MyCards.tsx                      # Custom card management (create/edit/list/practice)
│   │   │   ├── ReviewErrors.tsx                 # Error review session with flashcard-style cards
│   │   │   └── Statistics.tsx                   # Stats dashboard with level achievements + custom cards stats
│   │   ├── services/
│   │   │   ├── achievements.ts           # Achievement definitions + service (10 badges)
│   │   │   ├── storage.ts                # localStorage service (stats, level stats, custom cards stats, error tracking)
│   │   │   └── userCardsService.ts       # Custom card CRUD (localStorage)
│   │   ├── store/
│   │   │   └── useAppStore.ts            # Zustand store (session, stats, achievements)
│   │   ├── types/
│   │   │   └── index.ts                  # TypeScript interfaces
│   │   ├── App.tsx                       # Router setup (no auth guards)
│   │   ├── main.tsx                      # Entry point
│   │   └── index.css                     # Global styles + Tailwind
│   ├── package.json
│   ├── vite.config.ts                    # Vite config (host: 127.0.0.1)
│   ├── tailwind.config.js
│   └── tsconfig.json
├── backend/            # Legacy — not used anymore. Can be deleted.
├── specification.md    # Full technical specification
├── TODO.md             # Task checklist (Этапы 1-12, all complete)
├── README.md           # Quick-start guide
├── DEPLOYMENT.md       # Deployment guide (legacy — for when backend existed)
├── vercel.json         # Vercel deployment config
├── package.json        # Root workspace (concurrently — legacy)
└── QWEN.md             # This file
```

## Key Commands

### Frontend only

```bash
cd frontend
npm install
npm run dev           # Start Vite dev server (http://127.0.0.1:5173)
npm run build         # Type check + production build (tsc -b && vite build)
npm run lint          # Run ESLint
npm run preview       # Preview production build
```

### Note

The `backend/` directory and root-level `package.json` with `concurrently` are **legacy artifacts**. The app no longer uses any backend. You can safely remove `backend/`, `vercel.json`, `DEPLOYMENT.md`, and the root `package.json` if desired.

## Architecture

### Pages & Routes

| Page | Route | Purpose |
|------|-------|---------|
| Home | `/` | Level & topic selection + custom cards promo + tutorial |
| Learning Session | `/learning` | Flashcard-based learning — normal or custom mode |
| My Cards | `/my-cards` | Create, edit, list, and practice with custom cards |
| Statistics | `/statistics` | Dashboard with metrics, level achievements, custom cards stats, error list |
| Review Errors | `/review-errors` | Dedicated error review session with flashcard-style cards |

### State Management (Zustand — `useAppStore.ts`)

The store manages three concerns:

1. **Session state** — `questions`, `currentQuestionIndex`, `selectedLevel`, `selectedTopic`, `isSessionActive`, `showResults`
2. **Stats state** — `correct`, `incorrect`, `total`, `accuracy` (persisted in `localStorage`)
3. **Achievements** — `newlyUnlockedAchievements` (auto-cleared after 5 seconds)

Key actions:
- `startSession(level, topic?)` — filters mock questions by level/topic, shuffles
- `submitAnswer(isCorrect, questionId, isCustomCard?)` — updates stats + level stats + custom cards stats + error tracking + checks achievements
- `checkAchievements()` — exported function called after each answer; checks 10 achievement conditions

### localStorage Services

**`storage.ts`:**
- **`statsService`** — `getStats()`, `updateStats(isCorrect, level?)`, `resetStats()`, `getLevelStats()`, `saveLevelStats()`, `getCustomCardsStats()`, `updateCustomCardsStats(isCorrect)`
- **`errorTracker`** — `getErrors()`, `addError(questionId)`, `removeError(questionId)`, `clearErrors()`

**`userCardsService.ts`:**
- **CRUD** — `getAll()`, `addCard()`, `updateCard()`, `deleteCard()`, `clearAll()`, `count()`

**`achievements.ts`:**
- **10 achievements** — defined with id, title, description, icon, and check function
- **`achievementService`** — `getUnlocked()`, `unlock()`, `checkAndUnlock(stats)`, `reset()`

### Mock Data (`data/mockQuestions.ts`)

53 questions across 3 levels and 4 topics:

| Level | Multiple Choice | Construction | Total |
|-------|----------------|-------------|-------|
| 🌱 Beginner | 13 | 4 | 17 |
| 🌿 Intermediate | 9 | 5 | 14 |
| 🌳 Advanced | 9 | 6 | 15 |
| + mixed | 4 | 3 | 7 |

**By topic:** ✈️ Travel (13), 🍕 Food (7), 💼 Business (13), 📖 Grammar (10)

### Custom Cards

Users can create their own flashcards without topic/level restrictions:
- **Types:** Translation (🔄 word → translation) or Sentence (💬 phrase → translation + explanation)
- **Fields:** front_text (English), back_text (Russian), hint (optional)
- **Features:** Create, edit, delete, filter by type, search, practice session
- **Storage:** localStorage only

### Achievement System

10 badges that unlock automatically:

| Badge | Icon | Condition |
|-------|------|-----------|
| Первый шаг | 🏅 | Answer first question |
| Серия 10 | 🔥 | 10 correct answers in a row |
| На огне | 💥 | 25 correct answers in a row |
| Марафонец | 📚 | Answer all 53 questions |
| Чистая работа | 💪 | Clear all errors |
| Коллекционер | 🎨 | Create 20 custom cards |
| Мастер Beginner | 🌱 | 80%+ on Beginner level |
| Pro Intermediate | 🌿 | 80%+ on Intermediate level |
| Эксперт Advanced | 🌳 | 80%+ on Advanced level |
| Мастер карточек | ⭐ | 80%+ on custom cards (min 10) |

When unlocked, a notification slides in from the top-right with a 3-second display time.

### Tutorial

Shown once on first visit to Home page. 5 steps:
1. Welcome
2. How to choose a level
3. How to answer questions
4. How to create custom cards
5. How to track progress

Flag stored in localStorage as `english_master_tutorial_seen`.

## Development Conventions

- **TypeScript** is used throughout with strict typing via interfaces in `types/index.ts`.
- **Tailwind CSS** classes are used directly in components (no CSS modules, no Bootstrap).
- **Dark mode** support via `dark:` Tailwind prefixes (depends on system/browser setting).
- **Components** follow PascalCase naming; files match component names.
- **localStorage keys** are prefixed with `english_master_`.
- **No backend** — all data is local. No API calls, no auth, no JWT.

## Running the Application

```bash
cd frontend
npm install
npm run dev
```

Open **http://127.0.0.1:5173** in your browser.

## localStorage Keys

| Key | Purpose |
|-----|---------|
| `english_master_stats` | Overall stats (correct, incorrect, total) |
| `english_master_level_stats` | Per-level stats (Beginner, Intermediate, Advanced) |
| `english_master_custom_cards_stats` | Custom cards stats (correct, incorrect, total, streak, bestStreak) |
| `english_master_errors` | Array of question IDs with errors |
| `english_master_user_cards` | Array of custom card objects |
| `english_master_achievements` | Array of unlocked achievement IDs |
| `english_master_tutorial_seen` | Flag (string "true") if tutorial was completed |
| `learning_session_custom_cards` | Temp: custom cards for current practice session |
| `learning_session_mode` | Temp: session mode ("custom") |
