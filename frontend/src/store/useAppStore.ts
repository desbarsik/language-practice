import { create } from 'zustand';
import type { Question, Level, SessionStats } from '../types';
import { mockQuestions } from '../data/mockQuestions';
import { statsService, errorTracker } from '../services/storage';
import { userCardsService } from '../services/userCardsService';
import { achievementService, type AchievementStats } from '../services/achievements';

export interface CustomCardsSessionStats {
  correct: number;
  incorrect: number;
  total: number;
  streak: number;
  bestStreak: number;
  accuracy: number;
}

interface AppState {
  // Session state
  currentQuestionIndex: number;
  questions: Question[];
  selectedLevel: Level | null;
  selectedTopic: string | null;

  // Stats state
  stats: SessionStats & { accuracy: number };

  // UI state
  isSessionActive: boolean;
  showResults: boolean;

  // Loading state
  isLoading: boolean;
  error: string | null;

  // Achievements
  newlyUnlockedAchievements: string[];

  // Actions
  startSession: (level: Level, topic?: string) => Promise<void>;
  nextQuestion: () => void;
  submitAnswer: (isCorrect: boolean, questionId: string, isCustomCard?: boolean) => void;
  updateCustomCardStats: (isCorrect: boolean) => CustomCardsSessionStats;
  resetSession: () => void;
  setLevel: (level: Level) => void;
  setTopic: (topic: string) => void;
  resetStats: () => void;
}

export const useAppStore = create<AppState>((set, get) => {
  return {
  currentQuestionIndex: 0,
  questions: [],
  selectedLevel: null,
  selectedTopic: null,
  stats: statsService.getStats(),
  isSessionActive: false,
  showResults: false,
  isLoading: false,
  error: null,
  newlyUnlockedAchievements: [],

  startSession: async (level, topic) => {
    set({ isLoading: true, error: null });
    try {
      // Always use mock questions (no backend)
      let filtered = mockQuestions.filter((q) => q.level === level);
      if (topic) {
        filtered = filtered.filter((q) => q.topic_id === topic);
      }

      // Shuffle
      const shuffled = [...filtered].sort(() => Math.random() - 0.5);

      set({
        questions: shuffled,
        currentQuestionIndex: 0,
        selectedLevel: level,
        selectedTopic: topic || null,
        isSessionActive: true,
        showResults: false,
        isLoading: false,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error occurred';
      set({ error: message, isLoading: false });
    }
  },

  nextQuestion: () => {
    const { currentQuestionIndex, questions } = get();
    if (currentQuestionIndex < questions.length - 1) {
      set({ currentQuestionIndex: currentQuestionIndex + 1 });
    } else {
      set({ showResults: true, isSessionActive: false });
    }
  },

  submitAnswer: (isCorrect, questionId, isCustomCard) => {
    const { questions, currentQuestionIndex } = get();
    const currentQuestion = questions[currentQuestionIndex];
    const level = currentQuestion?.level || null;

    // Custom cards — отдельная статистика
    if (isCustomCard) {
      statsService.updateCustomCardsStats(isCorrect);
      const newStats = statsService.updateStats(isCorrect, undefined);
      if (!isCorrect) {
        errorTracker.addError(questionId);
      }
      set({ stats: newStats });
      checkAchievements();
      return;
    }

    // Normal cards
    const newStats = statsService.updateStats(isCorrect, level || undefined);
    if (!isCorrect) {
      errorTracker.addError(questionId);
    }
    set({ stats: newStats });
    checkAchievements();
  },

  updateCustomCardStats: (isCorrect) => {
    const cs = statsService.getCustomCardsStats();
    const newStreak = isCorrect ? cs.streak + 1 : 0;
    const updated = {
      correct: cs.correct + (isCorrect ? 1 : 0),
      incorrect: cs.incorrect + (isCorrect ? 0 : 1),
      total: cs.total + 1,
      streak: newStreak,
      bestStreak: Math.max(cs.bestStreak, newStreak),
      accuracy: cs.total + 1 > 0 ? Math.round(((cs.correct + (isCorrect ? 1 : 0)) / (cs.total + 1)) * 100) : 0,
    };
    return updated;
  },

  resetSession: () => {
    set({
      isSessionActive: false,
      showResults: false,
      currentQuestionIndex: 0,
      questions: [],
      selectedTopic: null,
    });
  },

  setLevel: (level) => {
    set({ selectedLevel: level });
  },

  setTopic: (topic) => {
    set({ selectedTopic: topic });
  },

  resetStats: () => {
    statsService.resetStats();
    errorTracker.clearErrors();
    set({ stats: { correct: 0, incorrect: 0, total: 0, accuracy: 0 } });
  },
  };
});

// Check achievements after answer
export const checkAchievements = () => {
  const state = useAppStore.getState();
  const mainStats = state.stats;
  const levelStats = statsService.getLevelStats();
  const customStats = statsService.getCustomCardsStats();
  const errorCount = errorTracker.getErrors().length;
  const customCardsCount = userCardsService.count();

  const achievementStats: AchievementStats = {
    totalCorrect: mainStats.correct,
    totalIncorrect: mainStats.incorrect,
    totalAnswered: mainStats.total,
    currentStreak: customStats.streak,
    bestStreak: customStats.bestStreak,
    errorCount,
    customCardsCount,
    customCardsCorrect: customStats.correct,
    customCardsTotal: customStats.total,
    beginnerCorrect: levelStats.Beginner.correct,
    beginnerTotal: levelStats.Beginner.total,
    intermediateCorrect: levelStats.Intermediate.correct,
    intermediateTotal: levelStats.Intermediate.total,
    advancedCorrect: levelStats.Advanced.correct,
    advancedTotal: levelStats.Advanced.total,
    hasCompletedAllLevels: false,
  };

  const newlyUnlocked = achievementService.checkAndUnlock(achievementStats);
  if (newlyUnlocked.length > 0) {
    useAppStore.setState({ newlyUnlockedAchievements: newlyUnlocked });
    setTimeout(() => useAppStore.setState({ newlyUnlockedAchievements: [] }), 5000);
  }
};
