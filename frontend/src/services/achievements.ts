export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  check: (stats: AchievementStats) => boolean;
}

export interface AchievementStats {
  totalCorrect: number;
  totalIncorrect: number;
  totalAnswered: number;
  currentStreak: number;
  bestStreak: number;
  errorCount: number;
  customCardsCount: number;
  customCardsCorrect: number;
  customCardsTotal: number;
  beginnerCorrect: number;
  beginnerTotal: number;
  intermediateCorrect: number;
  intermediateTotal: number;
  advancedCorrect: number;
  advancedTotal: number;
  hasCompletedAllLevels: boolean;
}

const ACHIEVEMENTS_KEY = 'english_master_achievements';

export const achievements: Achievement[] = [
  {
    id: 'first_step',
    title: 'Первый шаг',
    description: 'Ответьте на первый вопрос',
    icon: '🏅',
    check: (s) => s.totalAnswered >= 1,
  },
  {
    id: 'streak_10',
    title: 'Серия 10',
    description: '10 правильных ответов подряд',
    icon: '🔥',
    check: (s) => s.bestStreak >= 10,
  },
  {
    id: 'streak_25',
    title: 'На огне',
    description: '25 правильных ответов подряд',
    icon: '💥',
    check: (s) => s.bestStreak >= 25,
  },
  {
    id: 'marathon',
    title: 'Марафонец',
    description: 'Ответьте на все 53 вопроса',
    icon: '📚',
    check: (s) => s.totalAnswered >= 53,
  },
  {
    id: 'clean_slate',
    title: 'Чистая работа',
    description: 'Исправьте все ошибки',
    icon: '💪',
    check: (s) => s.errorCount === 0 && s.totalAnswered > 0,
  },
  {
    id: 'collector',
    title: 'Коллекционер',
    description: 'Создайте 20 своих карточек',
    icon: '🎨',
    check: (s) => s.customCardsCount >= 20,
  },
  {
    id: 'beginner_master',
    title: 'Мастер Beginner',
    description: '80%+ правильных на уровне Beginner',
    icon: '🌱',
    check: (s) => s.beginnerTotal >= 5 && s.beginnerCorrect / s.beginnerTotal >= 0.8,
  },
  {
    id: 'intermediate_pro',
    title: 'Pro Intermediate',
    description: '80%+ правильных на уровне Intermediate',
    icon: '🌿',
    check: (s) => s.intermediateTotal >= 5 && s.intermediateCorrect / s.intermediateTotal >= 0.8,
  },
  {
    id: 'advanced_expert',
    title: 'Эксперт Advanced',
    description: '80%+ правильных на уровне Advanced',
    icon: '🌳',
    check: (s) => s.advancedTotal >= 5 && s.advancedCorrect / s.advancedTotal >= 0.8,
  },
  {
    id: 'custom_master',
    title: 'Мастер карточек',
    description: '80%+ на своих карточках (мин. 10 ответов)',
    icon: '⭐',
    check: (s) => s.customCardsTotal >= 10 && s.customCardsCorrect / s.customCardsTotal >= 0.8,
  },
];

export const achievementService = {
  getUnlocked: (): string[] => {
    const stored = localStorage.getItem(ACHIEVEMENTS_KEY);
    return stored ? JSON.parse(stored) : [];
  },

  unlock: (id: string) => {
    const unlocked = achievementService.getUnlocked();
    if (!unlocked.includes(id)) {
      unlocked.push(id);
      localStorage.setItem(ACHIEVEMENTS_KEY, JSON.stringify(unlocked));
      return true; // newly unlocked
    }
    return false;
  },

  checkAndUnlock: (stats: AchievementStats): string[] => {
    const newlyUnlocked: string[] = [];
    for (const a of achievements) {
      if (a.check(stats)) {
        if (achievementService.unlock(a.id)) {
          newlyUnlocked.push(a.id);
        }
      }
    }
    return newlyUnlocked;
  },

  reset: () => {
    localStorage.removeItem(ACHIEVEMENTS_KEY);
  },
};

// This will be called from the store with stats
export const checkAchievements = (stats: AchievementStats): string[] => {
  return achievementService.checkAndUnlock(stats);
};
