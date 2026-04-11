import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';
import { Button } from '../components/common/Button';
import { Card } from '../components/common/Card';
import { Tutorial } from '../components/common/Tutorial';
import { levels, topics } from '../data/mockQuestions';
import type { Level } from '../types';

const TUTORIAL_KEY = 'english_master_tutorial_seen';

export const Home: React.FC = () => {
  const navigate = useNavigate();
  const { startSession, stats, isLoading, error } = useAppStore();
  const [showTutorial, setShowTutorial] = useState(false);

  useEffect(() => {
    const seen = localStorage.getItem(TUTORIAL_KEY);
    if (!seen) {
      setShowTutorial(true);
    }
  }, []);

  const handleTutorialComplete = () => {
    localStorage.setItem(TUTORIAL_KEY, 'true');
    setShowTutorial(false);
  };

  const handleStartLevel = async (level: Level) => {
    await startSession(level);
    if (!error) {
      navigate('/learning');
    }
  };

  const handleStartTopic = async (topicId: string) => {
    // Определяем уровень по теме
    const topic = topics.find((t) => t.id === topicId);
    if (topic) {
      await startSession(topic.level, topicId);
      if (!error) {
        navigate('/learning');
      }
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

  const levelIcons: Record<Level, string> = {
    Beginner: '🌱',
    Intermediate: '🌿',
    Advanced: '🌳',
  };

  return (
    <div className="space-y-8">
      {showTutorial && <Tutorial onComplete={handleTutorialComplete} />}

      {/* Заголовок */}
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
          Welcome to English Master
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
          Learn English effectively with interactive flashcards
        </p>
      </div>

      {/* Loading indicator */}
      {isLoading && (
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="rounded-md bg-red-50 dark:bg-red-900/20 p-4">
          <div className="text-sm text-red-700 dark:text-red-400">{error}</div>
        </div>
      )}

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

      {/* Мои карточки — промо */}
      <Card className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/10 dark:to-orange-900/10 border-2 border-amber-200 dark:border-amber-800">
        <div className="flex items-center gap-4">
          <div className="text-5xl">📝</div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
              Создавайте свои карточки!
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
              Добавляйте слова и фразы, которые хотите выучить. Без тем и уровней — только то, что нужно вам.
            </p>
            <Link to="/my-cards">
              <Button variant="primary" size="sm">
                🎨 Открыть мои карточки
              </Button>
            </Link>
          </div>
        </div>
      </Card>

      {/* Выбор уровня */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          📚 Выберите уровень
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {levels.map((level) => (
            <Card
              key={level}
              hoverable
              className={`bg-gradient-to-br ${levelColors[level]} text-white`}
            >
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{levelIcons[level]}</span>
                  <h3 className="text-xl font-bold">{level}</h3>
                </div>
                <p className="text-sm opacity-90">{levelDescriptions[level]}</p>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => handleStartLevel(level)}
                  className="mt-4 w-full"
                >
                  🚀 Начать
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* Выбор темы */}
      <section>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          🎯 Или выберите тему
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {topics.map((topic) => (
            <Card key={topic.id} hoverable className="text-center">
              <div className="text-3xl mb-2">
                {topic.id === 'travel' && '✈️'}
                {topic.id === 'food' && '🍕'}
                {topic.id === 'business' && '💼'}
                {topic.id === 'grammar' && '📖'}
              </div>
              <h3 className="font-semibold text-gray-900 dark:text-white">
                {topic.title}
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {levelIcons[topic.level]} {topic.level}
              </p>
              <Button
                variant="primary"
                size="sm"
                onClick={() => handleStartTopic(topic.id)}
                className="mt-3 w-full"
              >
                📖 Учить
              </Button>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
};
