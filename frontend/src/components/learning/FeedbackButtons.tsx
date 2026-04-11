import React from 'react';
import { Button } from '../common/Button';

interface FeedbackButtonsProps {
  onCorrect: () => void;
  onIncorrect: () => void;
  disabled?: boolean;
}

export const FeedbackButtons: React.FC<FeedbackButtonsProps> = ({
  onCorrect,
  onIncorrect,
  disabled = false,
}) => {
  return (
    <div className="flex gap-4 justify-center mt-4">
      <Button
        variant="success"
        size="lg"
        onClick={onCorrect}
        disabled={disabled}
        className="flex-1 max-w-[150px]"
      >
        ✓ Правильно
      </Button>
      <Button
        variant="danger"
        size="lg"
        onClick={onIncorrect}
        disabled={disabled}
        className="flex-1 max-w-[150px]"
      >
        ✗ Ошибка
      </Button>
    </div>
  );
};
