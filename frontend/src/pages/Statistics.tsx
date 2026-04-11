import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { errorTracker, statsService } from '../services/storage';
import { mockQuestions } from '../data/mockQuestions';
import type { Level } from '../types';
import type { LevelStats } from '../services/storage';

export const Statistics: React.FC = () => {
  const { stats, resetStats } = useAppStore();
  const [levelStats, setLevelStats] = useState<Record<Level, LevelStats>>({
    Beginner: { correct: 0, incorrect: 0, total: 0 },
    Intermediate: { correct: 0, incorrect: 0, total: 0 },
    Advanced: { correct: 0, incorrect: 0, total: 0 },
  });
  const customCardsStats = statsService.getCustomCardsStats();
  const errors = errorTracker.getErrors();

  // Мапим ID ошибок в текст вопросов
  const errorDetails = errors.map((id) => {
    const q = mockQuestions.find((q) => q.id === id);
    return {
      id,
      text: q ? q.question_text : `Вопрос #${id}`,
      answer: q ? q.correct_answer : '',
      level: q ? q.level : null,
    };
  });

  useEffect(() => {
    setLevelStats(statsService.getLevelStats());
  }, []);

  const levelIcons: Record<Level, string> = {
    Beginner: '🌱',
    Intermediate: '🌿',
    Advanced: '🌳',
  };

  const levelDescriptions: Record<Level, string> = {
    Beginner: 'A1-A2: Базовые слова и фразы',
    Intermediate: 'B1-B2: Средний уровень',
    Advanced: 'C1-C2: Продвинутый уровень',
  };

  const getLevelAccuracy = (ls: LevelStats): number => {
    return ls.total > 0 ? Math.round((ls.correct / ls.total) * 100) : 0;
  };

  const getLevelStatus = (ls: LevelStats): { label: string; color: string; bgColor: string } => {
    if (ls.total === 0) return { label: 'Не начато', color: 'text-gray-400', bgColor: 'bg-gray-200 dark:bg-gray-600' };
    const accuracy = getLevelAccuracy(ls);
    if (accuracy >= 80) return { label: `${accuracy}% ✓ Отлично!`, color: 'text-green-600 dark:text-green-400', bgColor: 'bg-green-500' };
    if (accuracy >= 60) return { label: `${accuracy}% — Хорошо`, color: 'text-yellow-600 dark:text-yellow-400', bgColor: 'bg-yellow-500' };
    return { label: `${accuracy}% — Нужно практика`, color: 'text-red-600 dark:text-red-400', bgColor: 'bg-red-500' };
  };

  const handleResetStats = () => {
    resetStats();
    // Перезагружаем levelStats после сброса
    setLevelStats(statsService.getLevelStats());
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white text-center">
        📊 Ваша статистика
      </h1>

      {/* Основные метрики */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="text-center">
          <p className="text-4xl font-bold text-blue-600">{stats.total}</p>
          <p className="text-gray-600 dark:text-gray-400 mt-2">Всего вопросов</p>
        </Card>
        <Card className="text-center">
          <p className="text-4xl font-bold text-green-600">{stats.correct}</p>
          <p className="text-gray-600 dark:text-gray-400 mt-2">Правильно</p>
        </Card>
        <Card className="text-center">
          <p className="text-4xl font-bold text-red-600">{stats.incorrect}</p>
          <p className="text-gray-600 dark:text-gray-400 mt-2">Ошибок</p>
        </Card>
        <Card className={`text-center ${stats.accuracy >= 80 ? 'bg-green-100 dark:bg-green-900/20' : stats.accuracy >= 60 ? 'bg-yellow-100 dark:bg-yellow-900/20' : 'bg-red-100 dark:bg-red-900/20'}`}>
          <p className={`text-4xl font-bold ${stats.accuracy >= 80 ? 'text-green-600' : stats.accuracy >= 60 ? 'text-yellow-600' : 'text-red-600'}`}>{stats.accuracy}%</p>
          <p className="text-gray-600 dark:text-gray-400 mt-2">Успех</p>
        </Card>
      </div>

      {/* Прогресс бар успеха */}
      <Card>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          📈 Прогресс успеха
        </h2>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-6">
          <div
            className={`h-6 rounded-full transition-all duration-500 ${
              stats.accuracy >= 80 ? 'bg-green-500' : stats.accuracy >= 60 ? 'bg-yellow-500' : 'bg-red-500'
            }`}
            style={{ width: `${stats.accuracy}%` }}
          />
        </div>
        <div className="flex justify-between mt-2 text-sm text-gray-600 dark:text-gray-400">
          <span>0%</span>
          <span>50%</span>
          <span>100%</span>
        </div>
      </Card>

      {/* Статистика пользовательских карточек */}
      {customCardsStats.total > 0 && (
        <Card className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/10 dark:to-pink-900/10 border-purple-200 dark:border-purple-800">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            📝 Мои карточки — статистика
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{customCardsStats.total}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Всего</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">{customCardsStats.correct}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Правильно</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">🔥 {customCardsStats.streak}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Серия</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">⭐ {customCardsStats.bestStreak}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Лучшая серия</p>
            </div>
          </div>
        </Card>
      )}

      {/* Достижения по уровням */}
      <Card>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          🏆 Достижения по уровням
        </h2>
        <div className="space-y-4">
          {(['Beginner', 'Intermediate', 'Advanced'] as Level[]).map((level) => {
            const ls = levelStats[level];
            const status = getLevelStatus(ls);
            const accuracy = getLevelAccuracy(ls);
            return (
              <div key={level} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{levelIcons[level]}</span>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{level}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {levelDescriptions[level]}
                      </p>
                    </div>
                  </div>
                  <span className={`text-sm font-medium ${status.color}`}>
                    {status.label}
                  </span>
                </div>
                {ls.total > 0 && (
                  <div className="ml-10">
                    <div className="flex justify-between text-xs text-gray-400 mb-1">
                      <span>Правильно: {ls.correct}</span>
                      <span>Всего: {ls.total}</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-500 ${status.bgColor}`}
                        style={{ width: `${accuracy}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </Card>

      {/* Ошибки */}
      {errors.length > 0 && (
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              🔧 Вопросы на повторение
            </h2>
            <Link
              to="/review-errors"
              className="px-4 py-2 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 rounded-lg text-sm font-medium hover:bg-amber-200 dark:hover:bg-amber-900/50 transition-colors"
            >
              🚀 Начать работу
            </Link>
          </div>
          <div className="space-y-2">
            {errorDetails.slice(0, 5).map((err) => (
              <div key={err.id} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
                <span className="text-red-500 shrink-0 mt-0.5">⚠️</span>
                <div className="min-w-0">
                  <p className="truncate font-medium text-gray-800 dark:text-gray-200">{err.text}</p>
                  <p className="text-xs text-gray-400">✓ {err.answer}</p>
                </div>
              </div>
            ))}
            {errorDetails.length > 5 && (
              <p className="text-sm text-gray-400 mt-2">
                И ещё {errorDetails.length - 5} {errorDetails.length - 5 === 1 ? 'вопрос' : 'вопросов'}...
              </p>
            )}
          </div>
        </Card>
      )}

      {errors.length === 0 && (
        <Card className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/10 dark:to-emerald-900/10 border-green-200 dark:border-green-800">
          <div className="flex items-center gap-4">
            <div className="text-4xl">🎉</div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                Ошибок нет!
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Отличная работа! Все вопросы усвоены правильно
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Сброс статистики */}
      <div className="text-center">
        <Button variant="danger" onClick={handleResetStats}>
          Сбросить статистику
        </Button>
      </div>
    </div>
  );
};
