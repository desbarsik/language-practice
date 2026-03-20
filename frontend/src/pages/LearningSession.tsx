import React, { useState } from 'react';
import { useAppStore } from '../store/useAppStore';
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

  const [isFlipped, setIsFlipped] = useState(false);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [answered, setAnswered] = useState(false);

  const currentQuestion = questions[currentQuestionIndex];

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const handleOptionSelect = (option: string) => {
    if (answered) return;
    setSelectedOption(option);
  };

  const handleCheck = (_sentence: string, isCorrect: boolean) => {
    if (answered) return;
    submitAnswer(isCorrect, currentQuestion.id);
    setAnswered(true);
  };

  const handleFeedback = (isCorrect: boolean) => {
    if (!answered && selectedOption) {
      submitAnswer(isCorrect, currentQuestion.id);
      setAnswered(true);
    }
  };

  const handleNext = () => {
    setIsFlipped(false);
    setSelectedOption(null);
    setAnswered(false);
    nextQuestion();
  };

  if (showResults) {
    return (
      <div className="max-w-2xl mx-auto text-center space-y-6">
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
          <div className="pt-4">
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

  if (!currentQuestion) {
    return (
      <div className="max-w-2xl mx-auto text-center space-y-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Выберите уровень и тему для начала обучения
        </h1>
        <Link to="/">
          <Button variant="primary" size="lg">
            Начать обучение
          </Button>
        </Link>
      </div>
    );
  }

  const progress = ((currentQuestionIndex + 1) / questions.length) * 100;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Прогресс бар */}
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

      {/* Карточка с вопросом */}
      <Flashcard
        question={currentQuestion.question_text}
        answer={currentQuestion.correct_answer}
        onFlip={handleFlip}
      >
        {currentQuestion.type === 'multiple_choice' && !isFlipped && (
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
        {currentQuestion.type === 'construction' && !isFlipped && (
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

      {/* Кнопки обратной связи */}
      {isFlipped && currentQuestion.type === 'multiple_choice' && (
        <>
          {!answered && selectedOption && (
            <FeedbackButtons
              onCorrect={() => handleFeedback(true)}
              onIncorrect={() => handleFeedback(false)}
            />
          )}
          {answered && (
            <div className="flex justify-center">
              <Button variant="primary" size="lg" onClick={handleNext}>
                {currentQuestionIndex < questions.length - 1 ? 'Следующий вопрос' : 'Завершить'}
              </Button>
            </div>
          )}
        </>
      )}

      {/* Для SentenceBuilder показываем кнопку Next после ответа */}
      {currentQuestion.type === 'construction' && answered && (
        <div className="flex justify-center">
          <Button variant="primary" size="lg" onClick={handleNext}>
            {currentQuestionIndex < questions.length - 1 ? 'Следующий вопрос' : 'Завершить'}
          </Button>
        </div>
      )}
    </div>
  );
};
