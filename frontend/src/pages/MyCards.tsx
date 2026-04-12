import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import type { CustomCard } from '../types';
import { userCardsService } from '../services/userCardsService';
import { CardEditor } from '../components/learning/CardEditor';
import { CardList } from '../components/learning/CardList';
import { Button } from '../components/common/Button';
import { Card } from '../components/common/Card';

type ViewMode = 'list' | 'create' | 'edit';

export const MyCards: React.FC = () => {
  const navigate = useNavigate();
  const [cards, setCards] = useState<CustomCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [editingCard, setEditingCard] = useState<CustomCard | null>(null);

  const refreshCards = useCallback(async () => {
    setLoading(true);
    const loaded = await userCardsService.getAll();
    setCards(loaded);
    setLoading(false);
  }, []);

  useEffect(() => {
    refreshCards();
  }, [refreshCards]);

  const handleCreate = async () => {
    setEditingCard(null);
    setViewMode('create');
  };

  const handleEdit = async (card: CustomCard) => {
    setEditingCard(card);
    setViewMode('edit');
  };

  const handleSave = async () => {
    await refreshCards();
    setEditingCard(null);
    setViewMode('list');
  };

  const handleCancel = () => {
    setEditingCard(null);
    setViewMode('list');
  };

  const handleStartSession = () => {
    if (cards.length === 0) return;
    // Store custom cards in session storage for the learning page
    sessionStorage.setItem('learning_session_custom_cards', JSON.stringify(cards));
    sessionStorage.setItem('learning_session_mode', 'custom');
    navigate('/learning');
  };

  const handleExport = () => {
    if (cards.length === 0) return;
    const data = JSON.stringify(cards, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `english-master-cards-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (ev) => {
      try {
        const imported: CustomCard[] = JSON.parse(ev.target?.result as string);
        if (Array.isArray(imported)) {
          for (const card of imported) {
            await userCardsService.addCard({
              type: card.type,
              front_text: card.front_text,
              back_text: card.back_text,
              hint: card.hint,
            });
          }
          await refreshCards();
        }
      } catch {
        alert('Ошибка: неверный формат файла');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const totalCards = cards.length;
  const translationCount = cards.filter(c => c.type === 'translation').length;
  const sentenceCount = cards.filter(c => c.type === 'sentence').length;

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto text-center py-16">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-500 dark:text-gray-400">Загрузка карточек...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Заголовок */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          📝 Мои карточки
        </h1>
        <p className="text-gray-500 dark:text-gray-400">
          Создавайте свои собственные карточки для изучения слов и фраз
        </p>
      </div>

      {/* Кнопки действий */}
      <div className="flex gap-3 justify-center flex-wrap">
        <button
          onClick={handleCreate}
          className="px-6 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-sm"
        >
          ➕ Добавить карточку
        </button>
        <button
          onClick={handleExport}
          disabled={totalCards === 0}
          className="px-6 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          📥 Экспорт
        </button>
        <label className="px-6 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer">
          📤 Импорт
          <input
            type="file"
            accept=".json"
            onChange={handleImport}
            className="hidden"
          />
        </label>
      </div>

      {/* Статистика */}
      {totalCards > 0 && (
        <div className="grid grid-cols-3 gap-4">
          <Card className="text-center bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800">
            <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{totalCards}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">📚 Всего</p>
          </Card>
          <Card className="text-center bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
            <p className="text-3xl font-bold text-green-600 dark:text-green-400">{translationCount}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">🔄 Переводы</p>
          </Card>
          <Card className="text-center bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800">
            <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">{sentenceCount}</p>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">💬 Фразы</p>
          </Card>
        </div>
      )}

      {/* Форма создания/редактирования */}
      {viewMode === 'create' && (
        <Card>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            ➕ Новая карточка
          </h2>
          <CardEditor onSave={handleSave} onCancel={handleCancel} />
        </Card>
      )}

      {viewMode === 'edit' && editingCard && (
        <Card>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            ✏️ Редактирование карточки
          </h2>
          <CardEditor card={editingCard} onSave={handleSave} onCancel={handleCancel} />
        </Card>
      )}

      {/* Список карточек */}
      {viewMode === 'list' && (
        <>
          <Card>
            <CardList
              cards={cards}
              onEdit={handleEdit}
              onRefresh={refreshCards}
              onStartSession={handleStartSession}
            />
          </Card>

          {/* Если карточек нет */}
          {totalCards === 0 && (
            <div className="text-center">
              <Button variant="primary" size="lg" onClick={handleCreate}>
                🎨 Создать первую карточку
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
};
