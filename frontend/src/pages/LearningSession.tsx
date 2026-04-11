import React, { useState, useEffect } from 'react';
import { useAppStore } from '../store/useAppStore';
import type { CustomCard } from '../types';
import { Flashcard } from '../components/learning/Flashcard';
import { MultipleChoice } from '../components/learning/MultipleChoice';
import { SentenceBuilder } from '../components/learning/SentenceBuilder';
import { FeedbackButtons } from '../components/learning/FeedbackButtons';
import { Button } from '../components/common/Button';
import { Link } from 'react-router-dom';

export const LearningSession: React.FC = () => {
  const {
    questions,
    currentQuestionIndex,
    nextQuestion,
    submitAnswer,
    showResults,
    stats,
    resetSession,
  } = useAppStore();

  // Custom cards session state
  const [customCards, setCustomCards] = useState<CustomCard[]>([]);
  const [customMode, setCustomMode] = useState(false);
  const [customCardIndex, setCustomCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [answered, setAnswered] = useState(false);
  const [sessionComplete, setSessionComplete] = useState(false);

  // Initialize custom cards from session storage
  useEffect(() => {
    const mode = sessionStorage.getItem('learning_session_mode');
    if (mode === 'custom') {
      const stored = sessionStorage.getItem('learning_session_custom_cards');
      if (stored) {
        try {
          const cards: CustomCard[] = JSON.parse(stored);
          const shuffled = [...cards].sort(() => Math.random() - 0.5);
          setCustomCards(shuffled);
          setCustomMode(true);
        } catch { /* fallback */ }
      }
    }
  }, []);

  const currentQuestion = questions[currentQuestionIndex];
  const currentCard = customCards[customCardIndex];

  useEffect(() => {
    setSelectedOption(null);
    setAnswered(false);
    setIsFlipped(false);
  }, [currentQuestionIndex, customCardIndex]);

  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  const handleOptionSelect = (option: string) => {
    if (answered) return;
    setSelectedOption(option);
  };

  const handleCheck = (_sentence: string, isCorrect: boolean) => {
    if (answered) return;
    if (currentQuestion) {
      submitAnswer(isCorrect, currentQuestion.id);
    }
    setAnswered(true);
  };

  const handleFeedback = () => {
    if (!answered && selectedOption && currentQuestion) {
      const isActuallyCorrect = selectedOption === currentQuestion.correct_answer;
      submitAnswer(isActuallyCorrect, currentQuestion.id);
      setAnswered(true);
    }
  };

  const handleCustomFeedback = (isCorrect: boolean) => {
    if (answered) return;
    if (currentCard) {
      submitAnswer(isCorrect, currentCard.id, true);
    }
    setAnswered(true);
  };

  const handleNext = () => {
    if (customMode) {
      if (customCardIndex < customCards.length - 1) {
        setCustomCardIndex(prev => prev + 1);
        setAnswered(false);
        setIsFlipped(false);
      } else {
        setSessionComplete(true);
      }
    } else {
      nextQuestion();
    }
  };

  const handleFlip = () => {
    setIsFlipped(prev => !prev);
  };

  const handleBackToCards = () => {
    sessionStorage.removeItem('learning_session_mode');
    sessionStorage.removeItem('learning_session_custom_cards');
    window.location.href = '/my-cards';
  };

  // --- Custom cards session results ---
  if (customMode && sessionComplete) {
    return (
      <div className="max-w-2xl mx-auto text-center space-y-6">
        <div className="text-6xl mb-4">🎉</div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Тренировка завершена!
        </h1>
        <p className="text-gray-500 dark:text-gray-400">
          Вы повторили {customCards.length} {customCards.length === 1 ? 'карточку' : customCards.length < 5 ? 'карточки' : 'карточек'}
        </p>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-4xl font-bold text-green-600">{stats.correct}</p>
              <p className="text-gray-600 dark:text-gray-400">Правильно</p>
            </div>
            <div className="text-center">
              <p className="text-4xl font-bold text-red-600">{stats.incorrect}</p>
              <p className="text-gray-600 dark:text-gray-400">Ошибок</p>
            </div>
            <div className="text-center">
              <p className="text-4xl font-bold text-blue-600">{stats.accuracy}%</p>
              <p className="text-gray-600 dark:text-gray-400">Успех</p>
            </div>
          </div>
          <div className="pt-4 flex gap-3 justify-center">
            <Button variant="primary" size="lg" onClick={handleBackToCards}>
              📝 К моим карточкам
            </Button>
            <Link to="/">
              <Button variant="secondary" size="lg">🏠 На главную</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // --- Normal session results ---
  if (showResults && !customMode) {
    return (
      <div className="max-w-2xl mx-auto text-center space-y-6">
        <div className="text-6xl mb-4">🎉</div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Сессия завершена!
        </h1>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-8 space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-4xl font-bold text-green-600">{stats.correct}</p>
              <p className="text-gray-600 dark:text-gray-400">Правильно</p>
            </div>
            <div className="text-center">
              <p className="text-4xl font-bold text-red-600">{stats.incorrect}</p>
              <p className="text-gray-600 dark:text-gray-400">Ошибок</p>
            </div>
            <div className="text-center">
              <p className="text-4xl font-bold text-blue-600">{stats.accuracy}%</p>
              <p className="text-gray-600 dark:text-gray-400">Успех</p>
            </div>
          </div>
          <div className="pt-4 flex gap-3 justify-center">
            <Link to="/">
              <Button variant="primary" size="lg" onClick={resetSession}>
                На главную
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // --- No content ---
  if (!currentQuestion && !customMode) {
    return (
      <div className="max-w-2xl mx-auto text-center space-y-6">
        <div className="text-6xl mb-4">📚</div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Выберите уровень и тему для начала обучения
        </h1>
        <p className="text-gray-500 dark:text-gray-400">
          Или создайте свои собственные карточки
        </p>
        <div className="flex gap-3 justify-center">
          <Link to="/">
            <Button variant="primary" size="lg">📖 Начать обучение</Button>
          </Link>
          <Link to="/my-cards">
            <Button variant="secondary" size="lg">📝 Мои карточки</Button>
          </Link>
        </div>
      </div>
    );
  }

  // --- Custom cards session ---
  if (customMode && currentCard) {
    const progress = ((customCardIndex + 1) / customCards.length) * 100;

    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div
            className="bg-gradient-to-r from-amber-500 to-orange-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="flex justify-between items-center text-sm text-gray-600 dark:text-gray-400">
          <span>📝 Карточка {customCardIndex + 1} из {customCards.length}</span>
          <button
            onClick={handleBackToCards}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            ✕ Закрыть
          </button>
        </div>

        <div onClick={handleFlip} className="cursor-pointer select-none">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 min-h-[300px] flex flex-col items-center justify-center border-2 border-gray-100 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 transition-colors">
            <span className="text-sm text-gray-400 mb-6">
              {currentCard.type === 'translation' ? '🔄 Перевод' : '💬 Фраза'}
            </span>

            {!isFlipped ? (
              <div className="text-center">
                <p className="text-sm text-gray-400 mb-4">Нажмите, чтобы увидеть ответ</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                  {currentCard.front_text}
                </p>
                {currentCard.hint && (
                  <p className="text-sm text-gray-400 italic bg-gray-50 dark:bg-gray-700 px-4 py-2 rounded-lg">
                    💡 {currentCard.hint}
                  </p>
                )}
              </div>
            ) : (
              <div className="text-center">
                <p className="text-sm text-gray-400 mb-4">Перевод</p>
                <p className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-4">
                  {currentCard.back_text}
                </p>
                <p className="text-lg text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-700 px-6 py-3 rounded-lg">
                  {currentCard.front_text}
                </p>
              </div>
            )}
          </div>
        </div>

        {isFlipped && !answered && (
          <div className="space-y-3">
            <p className="text-center text-sm text-gray-500 dark:text-gray-400">Вы знали ответ?</p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => handleCustomFeedback(true)}
                className="px-8 py-3 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-xl font-medium hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors"
              >
                ✅ Да, знал
              </button>
              <button
                onClick={() => handleCustomFeedback(false)}
                className="px-8 py-3 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-xl font-medium hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
              >
                ❌ Не знал
              </button>
            </div>
          </div>
        )}

        {answered && (
          <div className="flex justify-center">
            <Button variant="primary" size="lg" onClick={handleNext}>
              {customCardIndex < customCards.length - 1 ? 'Следующая карточка →' : 'Завершить тренировку ✓'}
            </Button>
          </div>
        )}
      </div>
    );
  }

  // --- Normal questions session ---
  if (!currentQuestion) return null;

  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;
  const displayAnswer = answered ? currentQuestion.correct_answer : '';

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
        <div
          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>
      <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
        <span>Вопрос {currentQuestionIndex + 1} из {questions.length}</span>
        <span>Уровень: {currentQuestion.level}</span>
      </div>

      <Flashcard question={currentQuestion.question_text} answer={displayAnswer}>
        {currentQuestion.type === 'multiple_choice' && (
          <div className="mt-4 w-full">
            <MultipleChoice
              question=""
              options={currentQuestion.options as string[]}
              selectedOption={selectedOption}
              onSelect={handleOptionSelect}
              disabled={answered}
            />
          </div>
        )}
        {currentQuestion.type === 'construction' && (
          <div className="mt-4 w-full">
            <SentenceBuilder
              words={currentQuestion.options as string[]}
              correctSentence={currentQuestion.correct_answer}
              onCheck={handleCheck}
              disabled={answered}
            />
          </div>
        )}
      </Flashcard>

      {currentQuestion.type === 'multiple_choice' && selectedOption && !answered && (
        <FeedbackButtons onCorrect={handleFeedback} onIncorrect={handleFeedback} />
      )}

      {answered && (
        <div className="flex justify-center">
          <Button variant="primary" size="lg" onClick={handleNext}>
            {currentQuestionIndex < questions.length - 1 ? 'Следующий вопрос →' : 'Завершить сессию ✓'}
          </Button>
        </div>
      )}
    </div>
  );
};
