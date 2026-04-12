import React from 'react';

interface MultipleChoiceProps {
  question: string;
  options: string[];
  selectedOption: string | null;
  onSelect: (option: string) => void;
  disabled?: boolean;
}

export const MultipleChoice: React.FC<MultipleChoiceProps> = ({
  question,
  options,
  selectedOption,
  onSelect,
  disabled = false,
}) => {
  // Use composite key (index + value) to handle duplicate option values
  const keys = options.map((opt, i) => `${i}-${opt}`);

  return (
    <div className="w-full space-y-4">
      <p className="text-lg font-medium text-gray-900 dark:text-white text-center">
        {question}
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
        {options.map((option, index) => (
          <button
            key={keys[index]}
            onClick={() => onSelect(option)}
            disabled={disabled}
            className={`p-4 rounded-lg border-2 text-left transition-all duration-200 ${
              selectedOption === option
                ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-400'
                : 'border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600'
            } ${disabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}
          >
            <span className="font-medium text-gray-900 dark:text-white">
              {String.fromCharCode(65 + index)}. {option}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};
