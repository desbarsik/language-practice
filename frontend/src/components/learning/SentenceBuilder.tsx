import React, { useState } from 'react';
import { Button } from '../common/Button';

interface SentenceBuilderProps {
  words: string[];
  correctSentence: string;
  onCheck: (sentence: string, isCorrect: boolean) => void;
  disabled?: boolean;
}

export const SentenceBuilder: React.FC<SentenceBuilderProps> = ({
  words,
  correctSentence,
  onCheck,
  disabled = false,
}) => {
  const [selectedWords, setSelectedWords] = useState<string[]>([]);
  const [availableWords, setAvailableWords] = useState<string[]>([...words]);

  const handleWordClick = (word: string, fromSelected: boolean) => {
    if (disabled) return;

    if (fromSelected) {
      setSelectedWords(selectedWords.filter((w) => w !== word || selectedWords.filter((s) => s === word).length > 1));
      setAvailableWords([...availableWords, word]);
    } else {
      setSelectedWords([...selectedWords, word]);
      setAvailableWords(availableWords.filter((w) => w !== word || availableWords.filter((a) => a === word).length > 1));
    }
  };

  const handleCheck = () => {
    const sentence = selectedWords.join(' ');
    const isCorrect = sentence.toLowerCase() === correctSentence.toLowerCase();
    onCheck(sentence, isCorrect);
  };

  const handleReset = () => {
    setSelectedWords([]);
    setAvailableWords([...words]);
  };

  return (
    <div className="w-full space-y-6">
      <p className="text-lg font-medium text-gray-900 dark:text-white text-center">
        Составьте предложение из предложенных слов
      </p>

      {/* Область собранного предложения */}
      <div className="min-h-[60px] p-4 bg-gray-100 dark:bg-gray-700 rounded-lg flex flex-wrap gap-2 justify-center">
        {selectedWords.length === 0 ? (
          <span className="text-gray-400 dark:text-gray-500">Нажмите на слова, чтобы собрать предложение</span>
        ) : (
          selectedWords.map((word, index) => (
            <button
              key={`${word}-${index}`}
              onClick={() => handleWordClick(word, true)}
              disabled={disabled}
              className="px-3 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-60"
            >
              {word}
            </button>
          ))
        )}
      </div>

      {/* Доступные слова */}
      <div className="flex flex-wrap gap-2 justify-center">
        {availableWords.map((word, index) => (
          <button
            key={`${word}-${index}`}
            onClick={() => handleWordClick(word, false)}
            disabled={disabled}
            className="px-3 py-1.5 bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-600 rounded-md hover:border-blue-400 dark:hover:border-blue-500 transition-colors disabled:opacity-60"
          >
            {word}
          </button>
        ))}
      </div>

      {/* Кнопки действий */}
      <div className="flex gap-4 justify-center">
        <Button variant="primary" onClick={handleCheck} disabled={disabled || selectedWords.length === 0}>
          Проверить
        </Button>
        <Button variant="secondary" onClick={handleReset} disabled={disabled}>
          Сбросить
        </Button>
      </div>
    </div>
  );
};
