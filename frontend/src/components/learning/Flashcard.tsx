import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card } from '../common/Card';

interface FlashcardProps {
  question: string;
  answer: string;
  explanation?: string;
  onFlip?: () => void;
  children?: React.ReactNode;
}

export const Flashcard: React.FC<FlashcardProps> = ({
  question,
  answer,
  explanation,
  onFlip,
  children,
}) => {
  const [isFlipped, setIsFlipped] = useState(false);

  const handleFlip = () => {
    const newFlipped = !isFlipped;
    setIsFlipped(newFlipped);
    onFlip?.();
  };

  return (
    <div className="perspective-1000 w-full max-w-2xl mx-auto" style={{ perspective: '1000px' }}>
      <motion.div
        className="relative w-full"
        initial={false}
        animate={{ rotateY: isFlipped ? 180 : 0 }}
        transition={{ duration: 0.6, animationDirection: 'normal' }}
        style={{
          transformStyle: 'preserve-3d',
          backfaceVisibility: 'hidden',
        }}
        onClick={handleFlip}
      >
        {/* Лицевая сторона */}
        <Card
          className="min-h-[300px] flex flex-col items-center justify-center cursor-pointer"
          hoverable
        >
          <div className="text-center space-y-4">
            <span className="text-sm font-medium text-blue-600 dark:text-blue-400 uppercase tracking-wide">
              Вопрос
            </span>
            <p className="text-2xl font-semibold text-gray-900 dark:text-white">
              {question}
            </p>
            {children}
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-8">
              Нажмите, чтобы перевернуть
            </p>
          </div>
        </Card>

        {/* Обратная сторона */}
        <div
          className="absolute inset-0 w-full h-full"
          style={{
            transform: 'rotateY(180deg)',
            backfaceVisibility: 'hidden',
          }}
        >
          <Card className="min-h-[300px] flex flex-col items-center justify-center bg-gradient-to-br from-green-50 to-blue-50 dark:from-gray-800 dark:to-gray-700">
            <div className="text-center space-y-4">
              <span className="text-sm font-medium text-green-600 dark:text-green-400 uppercase tracking-wide">
                Ответ
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
        </div>
      </motion.div>
    </div>
  );
};
