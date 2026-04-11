import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  hoverable?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  onClick,
  hoverable = false,
}) => {
  return (
    <div
      className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 ${
        hoverable ? 'hover:shadow-xl transition-shadow cursor-pointer' : ''
      } ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
};
