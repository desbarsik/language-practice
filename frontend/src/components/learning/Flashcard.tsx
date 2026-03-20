import React from 'react';
import { Card } from '../common/Card';

interface FlashcardProps {
  question: string;
  answer: string;
  explanation?: string;
  children?: React.ReactNode;
}

export const Flashcard: React.FC<FlashcardProps> = ({
  question,
  answer,
  explanation,
  children,
}) => {
  return (
    <div className="w-full max-w-2xl mx-auto">
      <Card className="min-h-[300px] flex flex-col items-center justify-center">
        <div className="text-center space-y-4 w-full">
          <span className="text-sm font-medium text-blue-600 dark:text-blue-400 uppercase tracking-wide">
            Вопрос
          </span>
          <p className="text-2xl font-semibold text-gray-900 dark:text-white">
            {question}
          </p>
          {children}
        </div>
      </Card>

      {/* Ответ показывается после того, как пользователь дал ответ */}
      {answer && (
        <Card className="min-h-[200px] flex flex-col items-center justify-center bg-gradient-to-br from-green-50 to-blue-50 dark:from-gray-800 dark:to-gray-700 mt-4">
          <div className="text-center space-y-4">
            <span className="text-sm font-medium text-green-600 dark:text-green-400 uppercase tracking-wide">
              Правильный ответ
            </span>
            <p className="text-2xl font-semibold text-gray-900 dark:text-white">
              {answer}
            </p>
            {explanation && (
              <div className="mt-4 p-4 bg-white/50 dark:bg-gray-800/50 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  <span className="font-medium">Пояснение:</span> {explanation}
                </p>
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  );
};
