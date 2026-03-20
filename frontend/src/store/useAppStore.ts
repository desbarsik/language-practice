import { create } from 'zustand';
import type { Question, Level, SessionStats } from '../types';
import { mockQuestions } from '../data/mockQuestions';
import { statsService, errorTracker } from '../services/storage';

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
  
  // Actions
  startSession: (level: Level, topic?: string) => void;
  nextQuestion: () => void;
  submitAnswer: (isCorrect: boolean, questionId: string) => void;
  resetSession: () => void;
  setLevel: (level: Level) => void;
  setTopic: (topic: string) => void;
  resetStats: () => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  currentQuestionIndex: 0,
  questions: [],
  selectedLevel: null,
  selectedTopic: null,
  stats: statsService.getStats(),
  isSessionActive: false,
  showResults: false,

  startSession: (level, topic) => {
    let filtered = mockQuestions.filter((q) => q.level === level);
    if (topic) {
      filtered = filtered.filter((q) => q.topic_id === topic);
    }
    // Перемешиваем вопросы
    const shuffled = [...filtered].sort(() => Math.random() - 0.5);
    
    set({
      questions: shuffled,
      currentQuestionIndex: 0,
      selectedLevel: level,
      selectedTopic: topic || null,
      isSessionActive: true,
      showResults: false,
    });
  },

  nextQuestion: () => {
    const { currentQuestionIndex, questions } = get();
    if (currentQuestionIndex < questions.length - 1) {
      set({ currentQuestionIndex: currentQuestionIndex + 1 });
    } else {
      set({ showResults: true, isSessionActive: false });
    }
  },

  submitAnswer: (isCorrect, questionId) => {
    const newStats = statsService.updateStats(isCorrect);
    if (!isCorrect) {
      errorTracker.addError(questionId);
    }
    set({ stats: newStats });
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
}));
