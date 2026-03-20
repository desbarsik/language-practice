import React from 'react';
import { useAppStore } from '../store/useAppStore';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { errorTracker } from '../services/storage';

export const Statistics: React.FC = () => {
  const { stats, resetStats } = useAppStore();
  const errors = errorTracker.getErrors();

  const accuracyColor =
    stats.accuracy >= 80
      ? 'text-green-600'
      : stats.accuracy >= 60
      ? 'text-yellow-600'
      : 'text-red-600';

  const accuracyBgColor =
    stats.accuracy >= 80
      ? 'bg-green-100 dark:bg-green-900/20'
      : stats.accuracy >= 60
      ? 'bg-yellow-100 dark:bg-yellow-900/20'
      : 'bg-red-100 dark:bg-red-900/20';

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white text-center">
        Ваша статистика
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
        <Card className={`text-center ${accuracyBgColor}`}>
          <p className={`text-4xl font-bold ${accuracyColor}`}>{stats.accuracy}%</p>
          <p className="text-gray-600 dark:text-gray-400 mt-2">Успех</p>
        </Card>
      </div>

      {/* Прогресс бар успеха */}
      <Card>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Прогресс успеха
        </h2>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-6">
          <div
            className={`h-6 rounded-full transition-all duration-500 ${
              stats.accuracy >= 80
                ? 'bg-green-500'
                : stats.accuracy >= 60
                ? 'bg-yellow-500'
                : 'bg-red-500'
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

      {/* Статистика по уровням */}
      <Card>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Достижения
        </h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🌱</span>
              <div>
                <p className="font-medium text-gray-900 dark:text-white">Beginner</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Базовый уровень
                </p>
              </div>
            </div>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {stats.total > 0 ? 'В процессе' : 'Не начато'}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🌿</span>
              <div>
                <p className="font-medium text-gray-900 dark:text-white">Intermediate</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Средний уровень
                </p>
              </div>
            </div>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {stats.total > 0 ? 'В процессе' : 'Не начато'}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🌳</span>
              <div>
                <p className="font-medium text-gray-900 dark:text-white">Advanced</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Продвинутый уровень
                </p>
              </div>
            </div>
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {stats.total > 0 ? 'В процессе' : 'Не начато'}
            </span>
          </div>
        </div>
      </Card>

      {/* Ошибки */}
      {errors.length > 0 && (
        <Card>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Вопросы на повторение
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            У вас есть {errors.length} вопросов, требующих повторения
          </p>
        </Card>
      )}

      {/* Сброс статистики */}
      <div className="text-center">
        <Button variant="danger" onClick={resetStats}>
          Сбросить статистику
        </Button>
      </div>
    </div>
  );
};
