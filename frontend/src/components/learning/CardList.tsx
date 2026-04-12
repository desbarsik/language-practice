import React, { useState } from 'react';
import type { CustomCard, CustomCardType } from '../../types';
import { userCardsService } from '../../services/userCardsService';

const TYPE_ICONS: Record<CustomCardType, string> = {
  translation: '🔄',
  sentence: '💬',
};

const TYPE_COLORS: Record<CustomCardType, string> = {
  translation: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  sentence: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
};

const TYPE_LABELS: Record<CustomCardType, string> = {
  translation: 'Перевод',
  sentence: 'Фраза',
};

interface CardListProps {
  cards: CustomCard[];
  onEdit: (card: CustomCard) => void;
  onRefresh: () => void;
  onStartSession: () => void;
}

export const CardList: React.FC<CardListProps> = ({ cards, onEdit, onRefresh, onStartSession }) => {
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<CustomCardType | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredCards = cards.filter(card => {
    const matchesType = filterType === 'all' || card.type === filterType;
    const matchesSearch =
      !searchQuery ||
      card.front_text.toLowerCase().includes(searchQuery.toLowerCase()) ||
      card.back_text.toLowerCase().includes(searchQuery.toLowerCase()) ||
      card.hint?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesType && matchesSearch;
  });

  const handleDelete = async (id: string) => {
    if (deleteConfirm === id) {
      await userCardsService.deleteCard(id);
      setDeleteConfirm(null);
      onRefresh();
    } else {
      setDeleteConfirm(id);
      setTimeout(() => setDeleteConfirm(null), 3000);
    }
  };

  const handleClearAll = async () => {
    if (deleteConfirm === 'all') {
      await userCardsService.clearAll();
      setDeleteConfirm(null);
      onRefresh();
    } else {
      setDeleteConfirm('all');
      setTimeout(() => setDeleteConfirm(null), 3000);
    }
  };

  const typeCounts = {
    translation: cards.filter(c => c.type === 'translation').length,
    sentence: cards.filter(c => c.type === 'sentence').length,
  };

  if (cards.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="text-6xl mb-4">📚</div>
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          Пока нет карточек
        </h3>
        <p className="text-gray-500 dark:text-gray-400 max-w-md mx-auto">
          Создайте свою первую карточку, чтобы начать изучение!
          Карточки сохраняются в браузере и доступны без интернета.
        </p>
        <div className="mt-6 flex gap-4 justify-center text-sm text-gray-400">
          <div className="flex items-center gap-1">
            <span>🔄</span> Перевод слов
          </div>
          <div className="flex items-center gap-1">
            <span>💬</span> Фразы и предложения
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Фильтры и поиск */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <input
            type="text"
            placeholder="🔍 Поиск по карточкам..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div className="flex gap-2">
          {(['all', 'translation', 'sentence'] as const).map((key) => (
            <button
              key={key}
              onClick={() => setFilterType(key)}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                filterType === key
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              {key === 'all'
                ? `Все (${cards.length})`
                : `${TYPE_ICONS[key]} ${TYPE_LABELS[key]} (${typeCounts[key]})`}
            </button>
          ))}
        </div>
      </div>

      {/* Кнопки действий */}
      <div className="flex justify-between items-center">
        <button
          onClick={onStartSession}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium transition-colors text-sm"
        >
          🎮 Начать тренировку
        </button>
        <button
          onClick={handleClearAll}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            deleteConfirm === 'all'
              ? 'bg-red-600 text-white'
              : 'text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20'
          }`}
        >
          {deleteConfirm === 'all' ? '⚠️ Подтвердите удаление всех' : '🗑 Удалить все'}
        </button>
      </div>

      {/* Список карточек */}
      <div className="space-y-2">
        {filteredCards.length === 0 ? (
          <p className="text-center py-8 text-gray-400">
            Ничего не найдено по запросу «{searchQuery}»
          </p>
        ) : (
          filteredCards.map((card, index) => (
            <div
              key={card.id}
              className="flex items-center gap-4 p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow"
            >
              {/* Номер */}
              <span className="text-sm text-gray-400 w-6 text-center font-mono">
                {index + 1}
              </span>

              {/* Иконка типа */}
              <span className="text-xl">{TYPE_ICONS[card.type]}</span>

              {/* Контент */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${TYPE_COLORS[card.type]}`}>
                    {TYPE_LABELS[card.type]}
                  </span>
                </div>
                <p className="font-medium text-gray-900 dark:text-white truncate">
                  {card.front_text}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                  → {card.back_text}
                </p>
                {card.hint && (
                  <p className="text-xs text-gray-400 mt-1 italic">💡 {card.hint}</p>
                )}
              </div>

              {/* Действия */}
              <div className="flex gap-2 shrink-0">
                <button
                  onClick={() => onEdit(card)}
                  className="p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                  title="Редактировать"
                >
                  ✏️
                </button>
                <button
                  onClick={() => handleDelete(card.id)}
                  className={`p-2 transition-colors ${
                    deleteConfirm === card.id
                      ? 'text-red-600 bg-red-100 dark:bg-red-900/30 rounded-lg'
                      : 'text-gray-400 hover:text-red-600 dark:hover:text-red-400'
                  }`}
                  title={deleteConfirm === card.id ? 'Нажмите ещё раз для подтверждения' : 'Удалить'}
                >
                  {deleteConfirm === card.id ? '⚠️' : '🗑️'}
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
