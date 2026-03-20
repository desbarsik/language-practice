import type { SessionStats } from '../types';

const STATS_KEY = 'english_master_stats';
const ERRORS_KEY = 'english_master_errors';

export interface StatsData extends SessionStats {
  accuracy: number;
}

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

  updateStats: (isCorrect: boolean): StatsData => {
    const current = statsService.getStats();
    const updated: SessionStats = {
      correct: current.correct + (isCorrect ? 1 : 0),
      incorrect: current.incorrect + (isCorrect ? 0 : 1),
      total: current.total + 1,
    };
    statsService.saveStats(updated);
    return {
      ...updated,
      accuracy: Math.round((updated.correct / updated.total) * 100),
    };
  },

  resetStats: () => {
    localStorage.removeItem(STATS_KEY);
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
