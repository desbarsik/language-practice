import type { SessionStats, Level } from '../types';

const STATS_KEY = 'english_master_stats';
const ERRORS_KEY = 'english_master_errors';
const LEVEL_STATS_KEY = 'english_master_level_stats';
const CUSTOM_CARDS_STATS_KEY = 'english_master_custom_cards_stats';

export interface StatsData extends SessionStats {
  accuracy: number;
}

export interface LevelStats {
  correct: number;
  incorrect: number;
  total: number;
}

export interface AllLevelStats {
  Beginner: LevelStats;
  Intermediate: LevelStats;
  Advanced: LevelStats;
}

export interface CustomCardsStats {
  correct: number;
  incorrect: number;
  total: number;
  streak: number;
  bestStreak: number;
}

const defaultLevelStats: AllLevelStats = {
  Beginner: { correct: 0, incorrect: 0, total: 0 },
  Intermediate: { correct: 0, incorrect: 0, total: 0 },
  Advanced: { correct: 0, incorrect: 0, total: 0 },
};

const defaultCustomCardsStats: CustomCardsStats = {
  correct: 0,
  incorrect: 0,
  total: 0,
  streak: 0,
  bestStreak: 0,
};

export const statsService = {
  getStats: (): StatsData => {
    const stored = localStorage.getItem(STATS_KEY);
    if (stored) {
      const stats = JSON.parse(stored) as SessionStats;
      return {
        ...stats,
        accuracy: stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0,
      };
    }
    return { correct: 0, incorrect: 0, total: 0, accuracy: 0 };
  },

  saveStats: (stats: SessionStats) => {
    localStorage.setItem(STATS_KEY, JSON.stringify(stats));
  },

  updateStats: (isCorrect: boolean, level?: Level): StatsData => {
    const current = statsService.getStats();
    const updated: SessionStats = {
      correct: current.correct + (isCorrect ? 1 : 0),
      incorrect: current.incorrect + (isCorrect ? 0 : 1),
      total: current.total + 1,
    };
    statsService.saveStats(updated);

    if (level) {
      const levelStats = statsService.getLevelStats();
      levelStats[level] = {
        correct: levelStats[level].correct + (isCorrect ? 1 : 0),
        incorrect: levelStats[level].incorrect + (isCorrect ? 0 : 1),
        total: levelStats[level].total + 1,
      };
      statsService.saveLevelStats(levelStats);
    }

    return {
      ...updated,
      accuracy: Math.round((updated.correct / updated.total) * 100),
    };
  },

  getLevelStats: (): AllLevelStats => {
    const stored = localStorage.getItem(LEVEL_STATS_KEY);
    if (stored) {
      try {
        return JSON.parse(stored) as AllLevelStats;
      } catch {
        return defaultLevelStats;
      }
    }
    return defaultLevelStats;
  },

  saveLevelStats: (stats: AllLevelStats) => {
    localStorage.setItem(LEVEL_STATS_KEY, JSON.stringify(stats));
  },

  // --- Custom cards stats ---
  getCustomCardsStats: (): CustomCardsStats => {
    const stored = localStorage.getItem(CUSTOM_CARDS_STATS_KEY);
    if (stored) {
      try {
        return JSON.parse(stored) as CustomCardsStats;
      } catch {
        return defaultCustomCardsStats;
      }
    }
    return defaultCustomCardsStats;
  },

  updateCustomCardsStats: (isCorrect: boolean): CustomCardsStats => {
    const current = statsService.getCustomCardsStats();
    const newStreak = isCorrect ? current.streak + 1 : 0;
    const updated: CustomCardsStats = {
      correct: current.correct + (isCorrect ? 1 : 0),
      incorrect: current.incorrect + (isCorrect ? 0 : 1),
      total: current.total + 1,
      streak: newStreak,
      bestStreak: Math.max(current.bestStreak, newStreak),
    };
    localStorage.setItem(CUSTOM_CARDS_STATS_KEY, JSON.stringify(updated));
    return updated;
  },

  resetStats: () => {
    localStorage.removeItem(STATS_KEY);
    localStorage.removeItem(LEVEL_STATS_KEY);
    localStorage.removeItem(CUSTOM_CARDS_STATS_KEY);
  },
};

export const errorTracker = {
  getErrors: (): string[] => {
    const stored = localStorage.getItem(ERRORS_KEY);
    return stored ? JSON.parse(stored) : [];
  },

  addError: (questionId: string) => {
    const errors = errorTracker.getErrors();
    if (!errors.includes(questionId)) {
      errors.push(questionId);
      localStorage.setItem(ERRORS_KEY, JSON.stringify(errors));
    }
  },

  removeError: (questionId: string) => {
    const errors = errorTracker.getErrors().filter((id) => id !== questionId);
    localStorage.setItem(ERRORS_KEY, JSON.stringify(errors));
  },

  hasError: (questionId: string): boolean => {
    return errorTracker.getErrors().includes(questionId);
  },

  clearErrors: () => {
    localStorage.removeItem(ERRORS_KEY);
  },
};
