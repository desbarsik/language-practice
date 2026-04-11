import React, { useState } from 'react';

interface TutorialStep {
  title: string;
  description: string;
  icon: string;
}

const tutorialSteps: TutorialStep[] = [
  {
    title: 'Добро пожаловать в English Master! 🎉',
    description: 'Учите английский с интерактивными карточками. Это просто и увлекательно!',
    icon: '👋',
  },
  {
    title: 'Выберите уровень 📚',
    description:
      'На главной странице выберите свой уровень: Beginner (начинающий), Intermediate (средний) или Advanced (продвинутый).',
    icon: '🌱',
  },
  {
    title: 'Отвечайте на вопросы 💡',
    description:
      'В сессии вам будут показываться вопросы. После ответа отметьте, знали ли вы правильный ответ.',
    icon: '✅',
  },
  {
    title: 'Создавайте свои карточки 📝',
    description:
      'На странице «Мои карточки» добавляйте собственные слова и фразы для изучения — без ограничений по уровню!',
    icon: '🎨',
  },
  {
    title: 'Следите за прогрессом 📊',
    description:
      'На странице статистики видно ваш прогресс по каждому уровню и список вопросов для повторения.',
    icon: '🏆',
  },
];

interface TutorialProps {
  onComplete: () => void;
}

export const Tutorial: React.FC<TutorialProps> = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);

  const step = tutorialSteps[currentStep];
  const isLast = currentStep === tutorialSteps.length - 1;

  const handleNext = () => {
    if (isLast) {
      onComplete();
    } else {
      setCurrentStep(currentStep + 1);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-lg w-full p-8 space-y-6 animate-fade-in">
        {/* Иконка */}
        <div className="text-6xl text-center">{step.icon}</div>

        {/* Заголовок */}
        <h2 className="text-2xl font-bold text-center text-gray-900 dark:text-white">
          {step.title}
        </h2>

        {/* Описание */}
        <p className="text-gray-600 dark:text-gray-300 text-center text-lg leading-relaxed">
          {step.description}
        </p>

        {/* Прогресс-точки */}
        <div className="flex justify-center gap-2">
          {tutorialSteps.map((_, i) => (
            <div
              key={i}
              className={`w-2.5 h-2.5 rounded-full transition-colors ${
                i <= currentStep ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
              }`}
            />
          ))}
        </div>

        {/* Кнопки */}
        <div className="flex gap-3 justify-center pt-2">
          {!isLast && (
            <button
              onClick={onComplete}
              className="px-6 py-2.5 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
            >
              Пропустить
            </button>
          )}
          <button
            onClick={handleNext}
            className="px-8 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-sm"
          >
            {isLast ? '🚀 Начать!' : 'Далее →'}
          </button>
        </div>
      </div>
    </div>
  );
};
