import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/common/Button';
import { Card } from '../components/common/Card';

export const Home: React.FC = () => {
  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
          Welcome to English Master
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
          Learn English effectively with interactive flashcards
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card hoverable className="text-center">
          <div className="text-4xl mb-4">📚</div>
          <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
            Learn Words
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Expand your vocabulary with curated word lists
          </p>
          <Link to="/learning">
            <Button variant="primary">Start Learning</Button>
          </Link>
        </Card>

        <Card hoverable className="text-center">
          <div className="text-4xl mb-4">📊</div>
          <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
            Track Progress
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            Monitor your improvement over time
          </p>
          <Link to="/statistics">
            <Button variant="secondary">View Stats</Button>
          </Link>
        </Card>

        <Card hoverable className="text-center">
          <div className="text-4xl mb-4">🎯</div>
          <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
            All Levels
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            From Beginner to Advanced
          </p>
          <Button variant="secondary" disabled>Coming Soon</Button>
        </Card>
      </div>
    </div>
  );
};
