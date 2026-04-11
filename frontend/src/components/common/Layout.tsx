import React from 'react';
import { Link, useLocation } from 'react-router-dom';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();

  const navLinks = [
    { path: '/', label: '🏠 Главная' },
    { path: '/learning', label: '📖 Обучение' },
    { path: '/my-cards', label: '📝 Мои карточки' },
    { path: '/statistics', label: '📊 Статистика' },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      <header className="bg-white dark:bg-gray-800 shadow-sm">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link to="/" className="text-xl font-bold text-blue-600 dark:text-blue-400">
                English Master
              </Link>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-4">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`px-2 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive(link.path)
                      ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-gray-700'
                      : 'text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </nav>
      </header>

      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        {children}
      </main>

      <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <p className="text-center text-gray-500 dark:text-gray-400 text-sm">
            © 2026 English Master. Learn English effectively.
          </p>
        </div>
      </footer>
    </div>
  );
};
