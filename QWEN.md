# English Master — QWEN Context

## Project Overview

**English Master** is a frontend-only web application for learning English through interactive flashcards. All data is stored in `localStorage` — no backend, no authentication, no database. The app works entirely offline once loaded.

- **Repository:** https://github.com/desbarsik/language-practice
- **Question bank:** 53 questions across 3 levels and 4 topics
- **Key features:** Tutorial for newcomers, 10 achievement badges, custom user-created flashcards, error review system, progress tracking with per-level stats

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 18 + TypeScript |
| Build | Vite 5 |
| Routing | React Router DOM 6 |
| Styling | Tailwind CSS 3 |
| State | Zustand 5 |
| Animations | Framer Motion 11 |
| Linting | ESLint 8 + typescript-eslint 7 |
| Storage | localStorage only |

## Project Structure

```
language-practice/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/
│   │   │   │   ├── AchievementNotification.tsx   # Badge popup (slides in, 3s display)
│   │   │   │   ├── AnimatedCard.tsx              # Framer Motion card wrapper
│   │   │   │   ├── AnimatedFeedback.tsx          # Success/error animation
│   │   │   │   ├── Button.tsx                    # Reusable button
│   │   │   │   ├── Card.tsx                      # Card wrapper
│   │   │   │   ├── Layout.tsx                    # Header + nav + footer
│   │   │   │   └── Tutorial.tsx                  # 5-step onboarding
│   │   │   └── learning/
│   │   │       ├── CardEditor.tsx                # Create/edit custom flashcards
│   │   │       ├── CardList.tsx                  # List/filter/manage custom cards
│   │   │       ├── FeedbackButtons.tsx           # Correct/incorrect buttons
│   │   │       ├── Flashcard.tsx                 # Flip animation card
│   │   │       ├── MultipleChoice.tsx            # 4-option question
│   │   │       └── SentenceBuilder.tsx           # Sentence from words (uses index-based uniqueness)
│   │   ├── data/
│   │   │   └── mockQuestions.ts                  # 53 questions (3 levels × 4 topics)
│   │   ├── pages/
│   │   │   ├── Home.tsx                          # Level/topic selection + tutorial trigger
│   │   │   ├── LearningSession.tsx               # Flashcard session (normal + custom modes)
│   │   │   ├── MyCards.tsx                       # Custom card CRUD + practice
│   │   │   ├── ReviewErrors.tsx                  # Error review with flashcard-style repeat
│   │   │   └── Statistics.tsx                    # Dashboard: stats, level achievements, custom cards stats, errors
│   │   ├── services/
│   │   │   ├── achievements.ts            # 10 badge definitions + service
│   │   │   ├── storage.ts                 # localStorage: stats, level stats, custom cards stats, errors
│   │   │   └── userCardsService.ts        # Custom card CRUD
│   │   ├── store/
│   │   │   └── useAppStore.ts             # Zustand: session, stats, achievements
│   │   ├── types/
│   │   │   └── index.ts                   # TypeScript interfaces
│   │   ├── App.tsx                        # Router (no auth guards)
│   │   ├── main.tsx                       # Entry point
│   │   └── index.css                      # Global styles + Tailwind
│   ├── vite.config.ts                     # host: 127.0.0.1
│   ├── tailwind.config.js
│   └── package.json
├── backend/            # LEGACY — not used. Safe to delete.
├── deploy.ps1          # PowerShell deploy script
├── TODO.md             # Task checklist (all done)
├── README.md           # Quick-start (outdated — still mentions backend)
├── DEPLOYMENT.md       # Deployment guide (legacy)
├── specification.md    # Original technical spec
├── vercel.json         # Legacy Vercel config
└── QWEN.md             # This file
```

## Pages & Routes

| Page | Route | Purpose |
|------|-------|---------|
| Home | `/` | Level/topic selection, custom cards promo, tutorial |
| Learning | `/learning` | Flashcard session (normal questions or custom cards) |
| My Cards | `/my-cards` | Create, edit, list, practice custom cards |
| Statistics | `/statistics` | Overall stats, level achievements, custom cards stats, error list |
| Review Errors | `/review-errors` | Error review session with flashcard-style repeat |

## Key Commands

```powershell
# Development
cd D:\qwen\language-practice\frontend
npm install
npm run dev           # → http://127.0.0.1:5173

# Production build
npm run build         # tsc -b && vite build → dist/

# Deploy to server
cd D:\qwen\language-practice
.\deploy.ps1          # Builds + scp to 192.168.199.222

# Or manually
cd D:\qwen\language-practice\frontend
npm run build
scp -P 2222 -r dist\* root@192.168.199.222:/var/www/english-master/

# Git update
cd D:\qwen\language-practice
git add -A; git commit -m "message"; git push
```

## Architecture

### State Management (Zustand — `useAppStore.ts`)

**Session state:** `questions`, `currentQuestionIndex`, `selectedLevel`, `selectedTopic`, `isSessionActive`, `showResults`

**Stats state:** `correct`, `incorrect`, `total`, `accuracy` — persisted in localStorage

**Achievements:** `newlyUnlockedAchievements` — auto-cleared after 5 seconds

**Key actions:**
- `startSession(level, topic?)` — filters mock questions, shuffles
- `submitAnswer(isCorrect, questionId, isCustomCard?)` — updates all stats + checks achievements
- `checkAchievements()` — exported, called after each answer

### localStorage Keys

| Key | Data |
|-----|------|
| `english_master_stats` | Overall: correct, incorrect, total |
| `english_master_level_stats` | Per-level: Beginner/Intermediate/Advanced stats |
| `english_master_custom_cards_stats` | Custom cards: correct, incorrect, total, streak, bestStreak |
| `english_master_errors` | Array of question IDs with errors |
| `english_master_user_cards` | Array of CustomCard objects |
| `english_master_achievements` | Array of unlocked achievement IDs |
| `english_master_tutorial_seen` | Flag — tutorial completed |
| `learning_session_custom_cards` | Temp: cards for current practice |
| `learning_session_mode` | Temp: session mode ("custom") |

### Question Data (`mockQuestions.ts`)

53 questions:

| Level | Multiple Choice | Construction | Total |
|-------|----------------|-------------|-------|
| 🌱 Beginner | 13 | 4 | 17 |
| 🌿 Intermediate | 9 | 5 | 14 |
| 🌳 Advanced | 9 | 6 | 15 |
| + mixed | 4 | 3 | 7 |

**By topic:** ✈️ Travel (13), 🍕 Food (7), 💼 Business (13), 📖 Grammar (10)

### Achievement System (10 badges)

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

### Custom Cards

- **Types:** Translation (🔄 word → translation) or Sentence (💬 phrase → translation + hint)
- **Fields:** front_text (English), back_text (Russian), hint (optional)
- **Storage:** localStorage only
- **Practice:** Shuffled session with flip + feedback buttons

### Error Review

- Errors tracked automatically on wrong answers
- `/review-errors` page shows list + starts review session
- Correct answer removes question from error list
- Results screen shows how many errors were fixed

## Development Conventions

- **TypeScript** strict mode, interfaces in `types/index.ts`
- **Tailwind CSS** classes only (no CSS modules, no Bootstrap)
- **Dark mode** via `dark:` Tailwind prefixes (system preference)
- **PascalCase** components, files match component names
- **No backend** — all data local, no API calls, no auth

## Legacy / Safe to Delete

The following are artifacts from the original full-stack design and are no longer used:

- `backend/` — entire directory
- `vercel.json`
- `DEPLOYMENT.md`
- `specification.md`
- `package.json` (root — was for `concurrently`)
- `package-lock.json` (root)
- `root@192.168.199.222/` — uploaded build files
- `english-master.tar.gz` — old archive
