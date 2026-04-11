import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { errorTracker } from '../services/storage';
import { mockQuestions as allQuestions } from '../data/mockQuestions';
import type { Question } from '../types';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';

export const ReviewErrors: React.FC = () => {
  const [errorCards, setErrorCards] = useState<Question[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [reviewMode, setReviewMode] = useState<'list' | 'session'>('list');

  useEffect(() => {
    const errorIds = errorTracker.getErrors();
    const errorQuestions: Question[] = errorIds
      .map(id => allQuestions.find(q => q.id === id))
      .filter((q): q is Question => q !== undefined);
    setErrorCards(errorQuestions);
    setIsLoading(false);
  }, []);

  const handleStartReview = () => {
    if (errorCards.length === 0) return;
    setReviewMode('session');
  };

  const handleBackToList = () => {
    setReviewMode('list');
    const errorIds = errorTracker.getErrors();
    const errorQuestions: Question[] = errorIds
      .map(id => allQuestions.find(q => q.id === id))
      .filter((q): q is Question => q !== undefined);
    setErrorCards(errorQuestions);
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto text-center py-16">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-500 dark:text-gray-400">Загрузка ошибок...</p>
      </div>
    );
  }

  if (reviewMode === 'session') {
    return (
      <ErrorReviewSession
        cards={errorCards}
        onBack={handleBackToList}
        onCorrect={(id) => {
          errorTracker.removeError(id);
        }}
      />
    );
  }

  if (errorCards.length === 0) {
    return (
      <div className="max-w-4xl mx-auto text-center py-16 space-y-6">
        <div className="text-6xl">🎉</div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Ошибок нет!
        </h1>
        <p className="text-gray-500 dark:text-gray-400 text-lg">
          Отличная работа! У вас нет вопросов, требующих повторения.
        </p>
        <div className="flex gap-3 justify-center">
          <Link to="/">
            <Button variant="primary" size="lg">🏠 На главную</Button>
          </Link>
          <Link to="/statistics">
            <Button variant="secondary" size="lg">📊 Статистика</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          🔧 Работа над ошибками
        </h1>
        <p className="text-gray-500 dark:text-gray-400">
          Повторите вопросы, в которых вы допустили ошибки
        </p>
      </div>

      <Card className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/10 dark:to-orange-900/10 border-amber-200 dark:border-amber-800">
        <div className="flex items-center gap-4">
          <div className="text-4xl">💪</div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
              {errorCards.length} {errorCards.length === 1 ? 'вопрос' : errorCards.length < 5 ? 'вопроса' : 'вопросов'} на повторение
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              После правильного ответа вопрос будет убран из списка ошибок
            </p>
          </div>
        </div>
      </Card>

      <div className="space-y-3">
        {errorCards.map((q, index) => (
          <Card key={q.id} className="flex items-start gap-4">
            <span className="text-lg font-mono text-gray-400 w-6 shrink-0">{index + 1}</span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                  q.level === 'Beginner' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                  q.level === 'Intermediate' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                  'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                }`}>
                  {q.level}
                </span>
                <span className="text-xs text-gray-400">
                  {q.type === 'multiple_choice' ? '📋 Выбор' : '✏️ Составление'}
                </span>
              </div>
              <p className="font-medium text-gray-900 dark:text-white truncate">
                {q.question_text}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                ✓ {q.correct_answer}
              </p>
            </div>
          </Card>
        ))}
      </div>

      <div className="flex gap-3 justify-center pt-4">
        <Button variant="primary" size="lg" onClick={handleStartReview}>
          🚀 Начать повторение
        </Button>
        <Link to="/statistics">
          <Button variant="secondary" size="lg">← К статистике</Button>
        </Link>
      </div>
    </div>
  );
};

interface ErrorReviewSessionProps {
  cards: Question[];
  onBack: () => void;
  onCorrect: (id: string) => void;
}

const ErrorReviewSession: React.FC<ErrorReviewSessionProps> = ({ cards, onBack, onCorrect }) => {
  const [index, setIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [answered, setAnswered] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [sessionComplete, setSessionComplete] = useState(false);

  const currentCard = cards[index];
  const progress = ((index + 1) / cards.length) * 100;

  const handleNext = (wasCorrect: boolean) => {
    if (wasCorrect && currentCard) {
      onCorrect(currentCard.id);
      setCorrectCount(prev => prev + 1);
    }
    setAnswered(false);
    setIsFlipped(false);

    if (index < cards.length - 1) {
      setIndex(prev => prev + 1);
    } else {
      setSessionComplete(true);
    }
  };

  if (sessionComplete) {
    const allCorrect = correctCount === cards.length;
    return (
      <div className="max-w-2xl mx-auto text-center space-y-6 py-12">
        <div className="text-6xl">{allCorrect ? '🏆' : '💪'}</div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          {allCorrect ? 'Все ошибки исправлены!' : 'Повторение завершено!'}
        </h1>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 space-y-4">
          <p className="text-lg text-gray-600 dark:text-gray-300">
            Вы правильно ответили на <span className="font-bold text-green-600">{correctCount}</span> из <span className="font-bold">{cards.length}</span> вопросов
          </p>
          {allCorrect && (
            <p className="text-green-600 dark:text-green-400 font-medium">
              🎉 Отлично! Все вопросы убраны из списка ошибок
            </p>
          )}
          {!allCorrect && (
            <p className="text-gray-500 dark:text-gray-400">
              Вопросы с ошибками остались в списке — попробуйте ещё раз!
            </p>
          )}
          <div className="pt-4 flex gap-3 justify-center">
            <Button variant="primary" size="lg" onClick={onBack}>
              📊 К списку ошибок
            </Button>
            <Link to="/">
              <Button variant="secondary" size="lg">🏠 На главную</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!currentCard) return null;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
        <button onClick={onBack} className="hover:text-gray-700 dark:hover:text-gray-200 transition-colors">
          ← Назад
        </button>
        <span>🔧 Работа над ошибками</span>
        <span>{index + 1} / {cards.length}</span>
      </div>
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
        <div
          className="bg-gradient-to-r from-amber-500 to-orange-500 h-2 rounded-full transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div
        onClick={() => !answered && setIsFlipped(prev => !prev)}
        className="cursor-pointer select-none"
      >
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 min-h-[280px] flex flex-col items-center justify-center border-2 border-amber-200 dark:border-amber-800 hover:border-amber-400 dark:hover:border-amber-600 transition-colors">
          {!isFlipped ? (
            <div className="text-center space-y-4">
              <div className="flex items-center gap-2 justify-center">
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                  currentCard.level === 'Beginner' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                  currentCard.level === 'Intermediate' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                  'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                }`}>
                  {currentCard.level}
                </span>
                <span className="text-xs text-gray-400">
                  {currentCard.type === 'multiple_choice' ? '📋 Выбор ответа' : '✏️ Составление'}
                </span>
              </div>
              <p className="text-sm text-amber-600 dark:text-amber-400 font-medium">
                ⚠️ Здесь была ошибка
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {currentCard.question_text}
              </p>
              <p className="text-sm text-gray-400">Нажмите, чтобы увидеть ответ</p>
            </div>
          ) : (
            <div className="text-center space-y-4">
              <p className="text-sm text-green-600 dark:text-green-400 font-medium">
                ✓ Правильный ответ
              </p>
              <p className="text-3xl font-bold text-green-700 dark:text-green-300">
                {currentCard.correct_answer}
              </p>
              <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <p className="text-gray-600 dark:text-gray-300">{currentCard.question_text}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {isFlipped && !answered && (
        <div className="space-y-3">
          <p className="text-center text-sm text-gray-500 dark:text-gray-400">
            Вы знали правильный ответ?
          </p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => {
                setAnswered(true);
                handleNext(true);
              }}
              className="px-8 py-3 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-xl font-medium hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors"
            >
              ✅ Да, теперь знаю
            </button>
            <button
              onClick={() => {
                setAnswered(true);
                handleNext(false);
              }}
              className="px-8 py-3 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-xl font-medium hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
            >
              ❌ Всё ещё не знаю
            </button>
          </div>
        </div>
      )}

      {answered && (
        <div className="flex justify-center">
          <Button variant="primary" size="lg" onClick={() => {}}>
            {index < cards.length - 1 ? 'Следующий →' : 'Результаты'}
          </Button>
        </div>
      )}
    </div>
  );
};
