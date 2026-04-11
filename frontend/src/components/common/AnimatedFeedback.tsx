import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface AnimatedFeedbackProps {
  isCorrect: boolean;
  children: React.ReactNode;
}

export const AnimatedFeedback: React.FC<AnimatedFeedbackProps> = ({ isCorrect, children }) => {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={isCorrect ? 'correct' : 'incorrect'}
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.8 }}
        transition={{ duration: 0.2 }}
        className={`${
          isCorrect
            ? 'bg-green-100 dark:bg-green-900/20 border-green-500'
            : 'bg-red-100 dark:bg-red-900/20 border-red-500'
        } border-l-4 p-4 rounded`}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
};
