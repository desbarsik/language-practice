import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';
import { Button } from '../components/common/Button';
import { Card } from '../components/common/Card';
import { levels, topics } from '../data/mockQuestions';
import type { Level } from '../types';

export const Home: React.FC = () => {
  const navigate = useNavigate();
  const { startSession, stats } = useAppStore();

  const handleStartLevel = (level: Level) => {
    startSession(level);
    navigate('/learning');
  };

  const handleStartTopic = (topicId: string) => {
    // Определяем уровень по теме
    const topic = topics.find((t) => t.id === topicId);
    if (topic) {
      startSession(topic.level, topicId);
      navigate('/learning');
    }
  };

  const levelColors: Record<Level, string> = {
    Beginner: 'from-green-400 to-green-600',
    Intermediate: 'from-yellow-400 to-yellow-600',
    Advanced: 'from-red-400 to-red-600',
  };

  const levelDescriptions: Record<Level, string> = {
    Beginner: 'A1-A2: Базовые слова и фразы',
    Intermediate: 'B1-B2: Средний уровень',
    Advanced: 'C1-C2: Продвинутый уровень',
  };

  return (
    <div className="space-y-8">
      {/* Заголовок */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
          Welcome to English Master
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
          Learn English effectively with interactive flashcards
        </p>
      </div>

      {/* Быстрая статистика */}
      <Card className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-3xl font-bold">{stats.total}</p>
            <p className="text-sm opacity-80">Всего вопросов</p>
          </div>
          <div>
            <p className="text-3xl font-bold">{stats.accuracy}%</p>
            <p className="text-sm opacity-80">Успех</p>
          </div>
          <div>
            <p className="text-3xl font-bold">{stats.correct}</p>
            <p className="text-sm opacity-80">Правильно</p>
          </div>
        </div>
      </Card>

      {/* Выбор уровня */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Выберите уровень
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {levels.map((level) => (
            <Card
              key={level}
              hoverable
              className={`bg-gradient-to-br ${levelColors[level]} text-white`}
            >
              <div className="space-y-2">
                <h3 className="text-xl font-bold">{level}</h3>
                <p className="text-sm opacity-90">{levelDescriptions[level]}</p>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => handleStartLevel(level)}
                  className="mt-4 w-full"
                >
                  Начать
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* Выбор темы */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Или выберите тему
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {topics.map((topic) => (
            <Card key={topic.id} hoverable className="text-center">
              <div className="text-3xl mb-2">
                {topic.id === 'travel' && '✈️'}
                {topic.id === 'food' && '🍕'}
                {topic.id === 'business' && '💼'}
                {topic.id === 'grammar' && '📚'}
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white">
                {topic.title}
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {topic.level}
              </p>
              <Button
                variant="primary"
                size="sm"
                onClick={() => handleStartTopic(topic.id)}
                className="mt-3 w-full"
              >
                Учить
              </Button>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
};
