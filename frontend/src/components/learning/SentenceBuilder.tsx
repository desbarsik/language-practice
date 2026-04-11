import React, { useState } from 'react';
import { Button } from '../common/Button';

interface WordItem {
  word: string;
  index: number; // original position for uniqueness
}

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
  // Each word gets a unique id based on its original index
  const allWords: WordItem[] = words.map((word, i) => ({ word, index: i }));
  const [selectedWords, setSelectedWords] = useState<WordItem[]>([]);
  const [availableWords, setAvailableWords] = useState<WordItem[]>([...allWords]);

  const handleWordClick = (item: WordItem, fromSelected: boolean) => {
    if (disabled) return;

    if (fromSelected) {
      // Remove this specific instance from selected, return to available
      setSelectedWords(selectedWords.filter((w) => w.index !== item.index));
      setAvailableWords([...availableWords, item]);
    } else {
      // Move this specific instance from available to selected
      setSelectedWords([...selectedWords, item]);
      setAvailableWords(availableWords.filter((w) => w.index !== item.index));
    }
  };

  const handleCheck = () => {
    const sentence = selectedWords.map(w => w.word).join(' ');
    const isCorrect = sentence.toLowerCase() === correctSentence.toLowerCase();
    onCheck(sentence, isCorrect);
  };

  const handleReset = () => {
    setSelectedWords([]);
    setAvailableWords([...allWords]);
  };

  return (
    <div className="w-full space-y-6">
      <p className="text-lg font-semibold text-gray-800 dark:text-white text-center">
        Составьте предложение из предложенных слов
      </p>

      {/* Область собранного предложения */}
      <div className="min-h-[60px] p-4 bg-blue-50 dark:bg-gray-700/50 rounded-xl flex flex-wrap gap-2 justify-center border-2 border-dashed border-blue-200 dark:border-blue-800">
        {selectedWords.length === 0 ? (
          <span className="text-gray-400 dark:text-gray-500">Нажмите на слова, чтобы собрать предложение</span>
        ) : (
          selectedWords.map((item) => (
            <button
              key={item.index}
              onClick={() => handleWordClick(item, true)}
              disabled={disabled}
              className="px-4 py-2 bg-blue-600 text-white font-medium text-base rounded-lg hover:bg-blue-700 transition-all shadow-sm hover:shadow disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {item.word}
            </button>
          ))
        )}
      </div>

      {/* Доступные слова */}
      <div className="flex flex-wrap gap-2 justify-center">
        {availableWords.map((item) => (
          <button
            key={item.index}
            onClick={() => handleWordClick(item, false)}
            disabled={disabled}
            className="px-4 py-2 bg-white dark:bg-gray-700 border-2 border-gray-300 dark:border-gray-500 text-gray-800 dark:text-gray-100 font-medium text-base rounded-lg hover:border-blue-500 dark:hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-gray-600 transition-all disabled:opacity-60 disabled:cursor-not-allowed active:scale-95"
          >
            {item.word}
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
